package database

import (
        "context"
        "fmt"
        "log"
        "net"
        "strings"
        "time"

        "cloud.google.com/go/cloudsqlconn"
        "github.com/bukdanaws-commits/seleevent/backend/internal/config"
        "github.com/bukdanaws-commits/seleevent/backend/internal/models"
        "github.com/jackc/pgx/v5"
        pgxstdlib "github.com/jackc/pgx/v5/stdlib"
        "gorm.io/driver/postgres"
        "gorm.io/gorm"
        "gorm.io/gorm/logger"
)

const (
        maxRetries     = 10
        initialBackoff = 2 * time.Second
        maxBackoff     = 30 * time.Second
)

// Connect initializes the PostgreSQL database connection.
// Supports three connection modes:
//  1. Cloud SQL Go Connector (DB_HOST starts with "/cloudsql/") — for Cloud Run
//     Connects via Public IP using the Cloud SQL Admin API, no VPC connector needed.
//  2. Unix socket (DB_HOST starts with "/" but not "/cloudsql/") — for manual proxy
//  3. TCP (DB_HOST is hostname/IP) — for local development
func Connect(cfg config.Config) (*gorm.DB, error) {
        sslmode := cfg.DB.SSLMode
        if sslmode == "" {
                sslmode = "disable"
        }

        // ── Retry logic for Cloud Run cold starts ──────────────────────────
        // Both staging and production run on Cloud Run and need retries.
        // Only skip retries for local development.
        retries := maxRetries
        if cfg.App.Env == "development" || cfg.App.Env == "testing" {
                retries = 1 // No retry in local development/testing
        }

        var db *gorm.DB
        var err error

        if strings.HasPrefix(cfg.DB.Host, "/cloudsql/") {
                // ── Cloud SQL Go Connector (Cloud Run) ────────────────────────────
                // Uses the Cloud SQL Admin API to discover instance IP and connect
                // directly via Public IP. No VPC connector or Unix socket needed.
                instanceConnName := strings.TrimPrefix(cfg.DB.Host, "/cloudsql/")
                log.Printf("Database: connecting via Cloud SQL Go Connector to %s", instanceConnName)

                db, err = connectWithCloudSQLConnector(cfg, instanceConnName, retries)
        } else if strings.HasPrefix(cfg.DB.Host, "/") {
                // ── Unix socket (manual cloud-sql-proxy) ──────────────────────────
                dsn := fmt.Sprintf(
                        "host=%s user=%s password=%s dbname=%s sslmode=%s",
                        cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, sslmode,
                )
                log.Printf("Database: connecting via Unix socket at %s", cfg.DB.Host)
                db, err = connectWithDSN(dsn, retries)
        } else {
                // ── TCP connection (local development) ────────────────────────────
                dsn := fmt.Sprintf(
                        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
                        cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, sslmode,
                )
                log.Printf("Database: connecting via TCP to %s:%s", cfg.DB.Host, cfg.DB.Port)
                db, err = connectWithDSN(dsn, retries)
        }

        if err != nil {
                return nil, err
        }

        // Configure connection pool for PostgreSQL
        // Cloud Run: reduced pool size to avoid connection exhaustion
        // (pool × max_instances must not exceed Cloud SQL max_connections)
        sqlDB, err := db.DB()
        if err != nil {
                return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
        }
        sqlDB.SetMaxOpenConns(10)
        sqlDB.SetMaxIdleConns(5)
        sqlDB.SetConnMaxLifetime(3 * time.Minute)

        // Set log level based on environment
        if cfg.App.Env == "development" {
                db.Logger = logger.Default.LogMode(logger.Info)
        } else {
                db.Logger = logger.Default.LogMode(logger.Warn)
        }

        // Auto-migrate all models EXCEPT GateLog (partitioned table managed via SQL DDL)
        var modelsToMigrate []interface{}
        for _, m := range models.AllModels() {
                if _, ok := m.(*models.GateLog); !ok {
                        modelsToMigrate = append(modelsToMigrate, m)
                }
        }
        if err := db.AutoMigrate(modelsToMigrate...); err != nil {
                return nil, fmt.Errorf("failed to auto-migrate: %w", err)
        }

        // ── Ensure gate_logs partitioned table exists ───────────────────────────
        // GORM cannot create partitioned tables, so we do it via raw SQL.
        // If the table already exists (from schema.sql), this is a no-op.
        if err := ensureGateLogsTable(db); err != nil {
                return nil, fmt.Errorf("failed to ensure gate_logs table: %w", err)
        }

        // ── Enable pgcrypto extension (needed for gen_random_uuid in seed SQL) ──
        sqlDB.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto")

        log.Println("PostgreSQL connected and migrated successfully")
        return db, nil
}

// connectWithCloudSQLConnector uses the Cloud SQL Go Connector to connect
// directly via Public IP without needing a Unix socket or VPC connector.
func connectWithCloudSQLConnector(cfg config.Config, instanceConnName string, retries int) (*gorm.DB, error) {
        ctx := context.Background()

        // Create the Cloud SQL dialer
        // This uses the Cloud SQL Admin API to discover the instance's IP address
        // and establishes a direct TLS-encrypted connection via Public IP.
        // No VPC connector needed — this bypasses the built-in Unix socket proxy.
        dialer, err := cloudsqlconn.NewDialer(ctx)
        if err != nil {
                return nil, fmt.Errorf("failed to create Cloud SQL dialer: %w", err)
        }

        // Build pgx config with custom dialer that routes through Cloud SQL connector
        pgxConfig, err := pgx.ParseConfig(fmt.Sprintf(
                "user=%s password=%s dbname=%s sslmode=disable",
                cfg.DB.User, cfg.DB.Password, cfg.DB.Name,
        ))
        if err != nil {
                dialer.Close()
                return nil, fmt.Errorf("failed to parse pgx config: %w", err)
        }

        // Override the dial function to use Cloud SQL connector
        pgxConfig.DialFunc = func(ctx context.Context, network, addr string) (net.Conn, error) {
                conn, err := dialer.Dial(ctx, instanceConnName)
                if err != nil {
                        log.Printf("Cloud SQL Connector: dial failed: %v", err)
                }
                return conn, err
        }

        var db *gorm.DB

        for attempt := 1; attempt <= retries; attempt++ {
                // Create a new *sql.DB from pgx config for each attempt
                sqlDB := pgxstdlib.OpenDB(*pgxConfig)

                // Test the connection
                if pingErr := sqlDB.PingContext(ctx); pingErr != nil {
                        sqlDB.Close()
                        if attempt < retries {
                                backoff := initialBackoff * time.Duration(1<<(attempt-1))
                                if backoff > maxBackoff {
                                        backoff = maxBackoff
                                }
                                log.Printf("Database: Cloud SQL Connector attempt %d/%d failed: %v", attempt, retries, pingErr)
                                log.Printf("Database: retrying in %v...", backoff)
                                time.Sleep(backoff)
                                continue
                        }
                        dialer.Close()
                        return nil, fmt.Errorf("failed to connect via Cloud SQL Connector after %d attempts: %w", retries, pingErr)
                }

                // Connection successful — open GORM with existing *sql.DB
                gormDB, gormErr := gorm.Open(postgres.New(postgres.Config{
                        Conn: sqlDB,
                }), &gorm.Config{})

                if gormErr != nil {
                        sqlDB.Close()
                        if attempt < retries {
                                backoff := initialBackoff * time.Duration(1<<(attempt-1))
                                if backoff > maxBackoff {
                                        backoff = maxBackoff
                                }
                                log.Printf("Database: GORM open attempt %d/%d failed: %v", attempt, retries, gormErr)
                                log.Printf("Database: retrying in %v...", backoff)
                                time.Sleep(backoff)
                                continue
                        }
                        dialer.Close()
                        return nil, fmt.Errorf("failed to open GORM after %d attempts: %w", retries, gormErr)
                }

                db = gormDB
                break
        }

        // Note: we don't close the dialer here because it's used for the lifetime
        // of the application. It will be cleaned up when the process exits.
        // The dialer maintains a connection pool internally.

        log.Printf("Database: Cloud SQL Connector connected successfully to %s", instanceConnName)
        return db, nil
}

// connectWithDSN connects using a standard DSN string with retry logic.
func connectWithDSN(dsn string, retries int) (*gorm.DB, error) {
        var db *gorm.DB
        var err error

        for attempt := 1; attempt <= retries; attempt++ {
                db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
                if err == nil {
                        break
                }

                if attempt < retries {
                        backoff := initialBackoff * time.Duration(1<<(attempt-1))
                        if backoff > maxBackoff {
                                backoff = maxBackoff
                        }
                        log.Printf("Database: connection attempt %d/%d failed: %v", attempt, retries, err)
                        log.Printf("Database: retrying in %v...", backoff)
                        time.Sleep(backoff)
                }
        }

        if err != nil {
                return nil, fmt.Errorf("failed to connect to PostgreSQL after %d attempts: %w", retries, err)
        }

        return db, nil
}

// ensureGateLogsTable creates the gate_logs partitioned table if it doesn't exist.
// GORM's AutoMigrate cannot handle partitioned tables, so we create it manually.
func ensureGateLogsTable(db *gorm.DB) error {
        // Check if gate_logs table already exists
        var exists bool
        if err := db.Raw("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'gate_logs')").Scan(&exists).Error; err != nil {
                return fmt.Errorf("failed to check gate_logs existence: %w", err)
        }

        if exists {
                log.Println("gate_logs table already exists, skipping partitioned table creation")
                return nil
        }

        log.Println("Creating gate_logs partitioned table...")

        // Create the partitioned table
        sqls := []string{
                `CREATE TABLE gate_logs (
                        id          UUID            NOT NULL,
                        tenant_id   UUID            NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
                        ticket_id   UUID            NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
                        gate_id     UUID            NOT NULL REFERENCES gates(id) ON DELETE CASCADE,
                        staff_id    UUID            REFERENCES users(id) ON DELETE SET NULL,
                        event_id    UUID            NOT NULL REFERENCES events(id) ON DELETE CASCADE,
                        action      TEXT            NOT NULL,
                        notes       TEXT,
                        scanned_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
                        created_at  TIMESTAMPTZ     NOT NULL DEFAULT now(),
                        PRIMARY KEY (id, scanned_at)
                ) PARTITION BY RANGE (scanned_at)`,
                `CREATE TABLE gate_logs_2026_04 PARTITION OF gate_logs
                        FOR VALUES FROM ('2026-04-01') TO ('2026-05-01')`,
                `CREATE TABLE gate_logs_2026_05 PARTITION OF gate_logs
                        FOR VALUES FROM ('2026-05-01') TO ('2026-06-01')`,
                `CREATE TABLE gate_logs_default PARTITION OF gate_logs DEFAULT`,
                `CREATE INDEX idx_gate_logs_ticket_id  ON gate_logs (ticket_id)`,
                `CREATE INDEX idx_gate_logs_gate_id    ON gate_logs (gate_id)`,
                `CREATE INDEX idx_gate_logs_staff_id   ON gate_logs (staff_id)`,
                `CREATE INDEX idx_gate_logs_tenant_id  ON gate_logs (tenant_id)`,
                `CREATE INDEX idx_gate_logs_event_id   ON gate_logs (event_id)`,
                `CREATE INDEX idx_gate_logs_action     ON gate_logs (action)`,
                `CREATE INDEX idx_gate_logs_scanned_at ON gate_logs (scanned_at)`,
        }

        for _, sql := range sqls {
                if err := db.Exec(sql).Error; err != nil {
                        // If partition already exists, skip
                        if strings.Contains(err.Error(), "already exists") {
                                log.Printf("Skipping (already exists): %s", sql[:60])
                                continue
                        }
                        return fmt.Errorf("failed to execute: %s: %w", sql[:80], err)
                }
        }

        log.Println("gate_logs partitioned table created successfully")
        return nil
}
