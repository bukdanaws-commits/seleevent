package main

import (
	"log"
	"time"

	"github.com/bukdanaws-commits/seleevent/backend/internal/config"
	"github.com/bukdanaws-commits/seleevent/backend/internal/database"
	"github.com/bukdanaws-commits/seleevent/backend/internal/routes"
	"github.com/bukdanaws-commits/seleevent/backend/internal/services"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	config.Load()

	// Connect to database (auto-migrates models inside Connect)
	db, err := database.Connect(config.Cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Start SSE Hub (initialized via init() in sse_hub.go)
	go services.Hub.Run()

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "SeleEvent API v1",
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	})

	// Recovery middleware (catch panics)
	app.Use(recover.New())

	// Setup routes
	routes.Setup(app, db)

	// Start server
	port := config.Cfg.App.Port
	log.Printf("SeleEvent API starting on port %s", port)
	log.Printf("Environment: %s", config.Cfg.App.Env)
	log.Printf("Database: %s", config.Cfg.DB.Driver)

	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
