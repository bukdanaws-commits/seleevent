package database

import (
        "fmt"
        "log"
        "strings"
        "time"

        "github.com/bukdanaws-commits/seleevent/backend/internal/config"
        "github.com/bukdanaws-commits/seleevent/backend/internal/models"
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
// Supports TCP connections (local development) and Unix socket (Cloud Run + Cloud SQL).
// In production (APP_ENV=production), retries with exponential backoff to handle
// transient Cloud SQL connection issues during Cloud Run cold starts.
func Connect(cfg config.Config) (*gorm.DB, error) {
        var dsn string
        sslmode := cfg.DB.SSLMode
        if sslmode == "" {
                sslmode = "disable"
        }

        if strings.HasPrefix(cfg.DB.Host, "/") {
                // Unix socket connection (Cloud Run + Cloud SQL proxy)
                dsn = fmt.Sprintf(
                        "host=%s user=%s password=%s dbname=%s sslmode=%s",
                        cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, sslmode,
                )
                log.Printf("Database: connecting via Unix socket at %s", cfg.DB.Host)
        } else {
                // TCP connection (local development)
                dsn = fmt.Sprintf(
                        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
                        cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, sslmode,
                )
                log.Printf("Database: connecting via TCP to %s:%s", cfg.DB.Host, cfg.DB.Port)
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
