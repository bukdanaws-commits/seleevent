package main

import (
        "context"
        "log"
        "os"
        "os/signal"
        "syscall"
        "time"

        "github.com/bukdanaws-commits/seleevent/backend/internal/config"
        "github.com/bukdanaws-commits/seleevent/backend/internal/database"
        "github.com/bukdanaws-commits/seleevent/backend/internal/routes"
        "github.com/bukdanaws-commits/seleevent/backend/internal/services"
        "github.com/gofiber/fiber/v2"
        "github.com/gofiber/fiber/v2/middleware/recover"
)

var version = "dev" // overridden via -ldflags at build time

func main() {
        // Load configuration
        config.Load()

        // ── Cloud Run PORT fallback ────────────────────────────────────────────
        // Cloud Run injects the PORT env var directly (not APP_PORT).
        // This ensures we respect Cloud Run's port assignment.
        if port := os.Getenv("PORT"); port != "" {
                config.Cfg.App.Port = port
        }

        log.Printf("SeleEvent API v%s starting...", version)
        log.Printf("Environment: %s", config.Cfg.App.Env)
        log.Printf("Database driver: %s", config.Cfg.DB.Driver)
        log.Printf("Database host: %s", config.Cfg.DB.Host)
        log.Printf("Database name: %s", config.Cfg.DB.Name)
        log.Printf("Database user: %s", config.Cfg.DB.User)

        // Connect to database (auto-migrates models inside Connect)
        // In staging/production, this retries with exponential backoff up to 10 times.
        db, err := database.Connect(config.Cfg)
        if err != nil {
                log.Printf("⚠️  FAILED to connect to database: %v", err)
                log.Printf("⚠️  Starting server in DEGRADED MODE — API endpoints will return 503")
                log.Printf("⚠️  Diagnostic info:")
                log.Printf("     DB_HOST=%s  DB_USER=%s  DB_NAME=%s  DB_SSLMODE=%s",
                        config.Cfg.DB.Host, config.Cfg.DB.User, config.Cfg.DB.Name, config.Cfg.DB.SSLMode)
                log.Printf("     DB_PASSWORD is set: %v  (length: %d)",
                        config.Cfg.DB.Password != "", len(config.Cfg.DB.Password))
                log.Printf("⚠️  Check: 1) Database exists  2) User exists  3) Password matches  4) Cloud SQL instance is reachable  5) --add-cloudsql-instances is set on Cloud Run")
        }

        // Start SSE Hub
        services.Hub = services.NewSSEHub()
        go services.Hub.Run()

        // Create Fiber app
        app := fiber.New(fiber.Config{
                AppName:          "SeleEvent API v1",
                ReadTimeout:      30 * time.Second,
                WriteTimeout:     0, // Disabled — SSE connections are long-lived
                IdleTimeout:      120 * time.Second,
                DisableKeepalive: false,
        })

        // Recovery middleware (catch panics)
        app.Use(recover.New())

        // Setup routes — pass db and hub as explicit dependencies
        routes.Setup(app, db, services.Hub)

        // ── Start server in goroutine ─────────────────────────────────────────
        port := config.Cfg.App.Port
        log.Printf("Server listening on port %s", port)

        go func() {
                if err := app.Listen(":" + port); err != nil {
                        log.Fatalf("Failed to start server: %v", err)
                }
        }()

        // ── Graceful shutdown — Cloud Run sends SIGTERM ───────────────────────
        // Cloud Run gives containers up to 3600s (configurable) to finish
        // in-flight requests before sending SIGKILL.
        quit := make(chan os.Signal, 1)
        signal.Notify(quit, syscall.SIGTERM, syscall.SIGINT)

        sig := <-quit
        log.Printf("Received %s, shutting down gracefully...", sig)

        // Give in-flight requests 15 seconds to finish
        ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
        defer cancel()

        if err := app.ShutdownWithContext(ctx); err != nil {
                log.Printf("Forced shutdown: %v", err)
        }

        // Close SSE hub (notifies all connected clients)
        services.Hub.Close()

        // Close database connections (guard against nil db)
        if db != nil {
                sqlDB, _ := db.DB()
                if sqlDB != nil {
                        if err := sqlDB.Close(); err != nil {
                                log.Printf("Error closing database: %v", err)
                        }
                }
        }

        log.Println("Server stopped gracefully")
}
