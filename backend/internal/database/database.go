package database

import (
        "fmt"
        "log"
        "strings"

        "github.com/bukdanaws-commits/seleevent/backend/internal/config"
        "github.com/bukdanaws-commits/seleevent/backend/internal/models"
        "gorm.io/driver/postgres"
        "gorm.io/driver/sqlite"
        "gorm.io/gorm"
        "gorm.io/gorm/logger"
)

// Connect initializes the database connection based on the driver configuration.
// It supports SQLite (development) and PostgreSQL (production).
func Connect(cfg config.Config) (*gorm.DB, error) {
        var db *gorm.DB
        var err error

        switch cfg.DB.Driver {
        case "postgres":
                // Detect Cloud Run Cloud SQL Unix socket vs TCP connection.
                // Unix socket: host starts with "/" (e.g. /cloudsql/PROJECT:REGION:INSTANCE)
                // TCP: host is a hostname or IP (e.g. localhost, 10.0.0.1)
                var dsn string
                if strings.HasPrefix(cfg.DB.Host, "/") {
                        // Unix socket connection (Cloud Run + Cloud SQL proxy)
                        dsn = fmt.Sprintf(
                                "host=%s user=%s password=%s dbname=%s sslmode=disable",
                                cfg.DB.Host, cfg.DB.User, cfg.DB.Password, cfg.DB.Name,
                        )
                } else {
                        // TCP connection (local development)
                        dsn = fmt.Sprintf(
                                "host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
                                cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Password, cfg.DB.Name,
                        )
                }
                db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
                if err != nil {
                        return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
                }

                // Configure connection pool for PostgreSQL
                sqlDB, err := db.DB()
                if err != nil {
                        return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
                }
                sqlDB.SetMaxOpenConns(25)
                sqlDB.SetMaxIdleConns(10)
                sqlDB.SetConnMaxLifetime(300) // 5 minutes

        case "sqlite":
                db, err = gorm.Open(sqlite.Open(cfg.DB.SQLitePath), &gorm.Config{})
                if err != nil {
                        return nil, fmt.Errorf("failed to connect to SQLite: %w", err)
                }

                // Enable WAL mode for better concurrent read performance in SQLite
                sqlDB, err := db.DB()
                if err != nil {
                        return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
                }
                sqlDB.Exec("PRAGMA journal_mode=WAL")
                sqlDB.Exec("PRAGMA busy_timeout=5000")
                sqlDB.SetMaxOpenConns(1) // SQLite only supports one writer at a time

        default:
                return nil, fmt.Errorf("unsupported database driver: %s", cfg.DB.Driver)
        }

        // Set log level based on environment
        if cfg.App.Env == "development" {
                db.Logger = logger.Default.LogMode(logger.Info)
        } else {
                db.Logger = logger.Default.LogMode(logger.Warn)
        }

        // Auto-migrate all models
        if err := db.AutoMigrate(models.AllModels()...); err != nil {
                return nil, fmt.Errorf("failed to auto-migrate: %w", err)
        }

        log.Println("Database connected and migrated successfully")
        return db, nil
}
