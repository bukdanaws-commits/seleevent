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

// Connect initializes the PostgreSQL database connection.
// Supports TCP connections (local development) and Unix socket (Cloud Run + Cloud SQL).
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
        } else {
                // TCP connection (local development)
                dsn = fmt.Sprintf(
                        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
                        cfg.DB.Host, cfg.DB.Port, cfg.DB.User, cfg.DB.Password, cfg.DB.Name, sslmode,
                )
        }

        db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
        if err != nil {
                return nil, fmt.Errorf("failed to connect to PostgreSQL: %w", err)
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

        log.Println("PostgreSQL connected and migrated successfully")
        return db, nil
}
