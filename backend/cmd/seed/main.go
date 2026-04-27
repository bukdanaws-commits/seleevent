package main

import (
        "log"
        "time"

        "github.com/bukdanaws-commits/seleevent/backend/internal/config"
        "github.com/bukdanaws-commits/seleevent/backend/internal/database"
        "github.com/bukdanaws-commits/seleevent/backend/internal/models"
        "gorm.io/gorm"
)

func main() {
        // Load configuration (same as main app)
        config.Load()

        // Connect to database (auto-migrates models)
        db, err := database.Connect(config.Cfg)
        if err != nil {
                log.Fatalf("Failed to connect to database: %v", err)
        }

        log.Println("Seeder starting...")
        log.Printf("Database driver: %s", config.Cfg.DB.Driver)

        // Seed all data
        seedTenant(db)
        tenantID := getTenantID(db)

        users := seedUsers(db)
        seedTenantUsers(db, tenantID, users)
        seedSubscription(db, tenantID)
        eventID := seedEvent(db, tenantID)
        seedTicketTypes(db, tenantID, eventID)
        counters := seedCounters(db, tenantID, eventID)
        gates := seedGates(db, tenantID, eventID)
        seedCounterStaff(db, tenantID, users, counters)
        seedGateStaff(db, tenantID, users, gates)
        seedWristbandInventory(db, tenantID, eventID)

        log.Println("✅ Seeding completed successfully!")
}

// ─── TENANT ───────────────────────────────────────────────────────────────

func seedTenant(db *gorm.DB) {
        var count int64
        db.Model(&models.Tenant{}).Where("slug = ?", "seleevent").Count(&count)
        if count > 0 {
                log.Println("⏭️  Tenant 'SeleEvent' already exists, skipping")
                return
        }

        tenant := models.Tenant{
                Name:           "SeleEvent",
                Slug:           "seleevent",
                PrimaryColor:   "#00A39D",
                SecondaryColor: "#F8AD3C",
                IsActive:       true,
                MaxEvents:      10,
                MaxTickets:     50000,
        }

        if err := db.Create(&tenant).Error; err != nil {
                log.Fatalf("Failed to seed tenant: %v", err)
        }
        log.Println("✅ Seeded tenant: SeleEvent")
}

func getTenantID(db *gorm.DB) string {
        var tenant models.Tenant
        if err := db.Where("slug = ?", "seleevent").First(&tenant).Error; err != nil {
                log.Fatalf("Failed to find tenant: %v", err)
        }
        return tenant.ID
}

// ─── USERS ────────────────────────────────────────────────────────────────

type seedUser struct {
        Role     string
        GoogleID string
}

func seedUsers(db *gorm.DB) map[string]seedUser {
        // Check if users already exist
        var count int64
        db.Model(&models.User{}).Where("email LIKE ?", "%@seleevent.id%").Count(&count)
        if count > 0 {
                log.Println("⏭️  Users already exist, skipping")
                // Still return the map for other seeders to use
                existing := make(map[string]seedUser)
                var users []models.User
                db.Where("google_id LIKE ?", "google-%").Find(&users)
                for _, u := range users {
                        existing[u.Email] = seedUser{Role: u.Role, GoogleID: u.GoogleID}
                }
                return existing
        }

        userDefs := []struct {
                Name     string
                Email    string
                GoogleID string
                Role     string
                Status   string
        }{
                {"Bukdan Admin", "bukdan@seleevent.id", "google-superadmin", "SUPER_ADMIN", "active"},
                {"Rizky Pratama", "rizky@seleevent.id", "google-admin", "ADMIN", "active"},
                {"Andi Wijaya", "andi.wijaya@gmail.com", "google-organizer", "ORGANIZER", "active"},
                {"Rina Wulandari", "rina.w@gmail.com", "google-counter", "COUNTER_STAFF", "active"},
                {"Bayu Aditya", "bayu.a@gmail.com", "google-gate", "GATE_STAFF", "active"},
                {"Budi Santoso", "budi.santoso@gmail.com", "google-participant", "PARTICIPANT", "active"},
        }

        result := make(map[string]seedUser)
        for _, def := range userDefs {
                user := models.User{
                        Name:     def.Name,
                        Email:    def.Email,
                        GoogleID: def.GoogleID,
                        Role:     def.Role,
                        Status:   def.Status,
                }
                if err := db.Create(&user).Error; err != nil {
                        log.Fatalf("Failed to seed user %s: %v", def.Email, err)
                }
                result[def.Email] = seedUser{Role: def.Role, GoogleID: def.GoogleID}
        }
        log.Printf("✅ Seeded %d users", len(userDefs))
        return result
}

// ─── TENANT USERS ─────────────────────────────────────────────────────────

func seedTenantUsers(db *gorm.DB, tenantID string, users map[string]seedUser) {
        var count int64
        db.Model(&models.TenantUser{}).Where("tenant_id = ?", tenantID).Count(&count)
        if count > 0 {
                log.Println("⏭️  TenantUsers already exist, skipping")
                return
        }

        for email, info := range users {
                // Find the user by email to get their ID
                var user models.User
                if err := db.Where("email = ?", email).First(&user).Error; err != nil {
                        log.Fatalf("Failed to find user %s: %v", email, err)
                }

                tu := models.TenantUser{
                        UserID:   user.ID,
                        TenantID: tenantID,
                        Role:     info.Role,
                        IsActive: true,
                }
                if err := db.Create(&tu).Error; err != nil {
                        log.Fatalf("Failed to seed TenantUser for %s: %v", email, err)
                }
        }
        log.Printf("✅ Seeded %d tenant_users", len(users))
}

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────

func seedSubscription(db *gorm.DB, tenantID string) {
        var count int64
        db.Model(&models.Subscription{}).Where("tenant_id = ?", tenantID).Count(&count)
        if count > 0 {
                log.Println("⏭️  Subscription already exists, skipping")
                return
        }

        now := time.Now()
        oneYear := now.AddDate(1, 0, 0)

        sub := models.Subscription{
                TenantID:           tenantID,
                Plan:               "enterprise",
                Status:             "active",
                CurrentPeriodStart: now,
                CurrentPeriodEnd:   oneYear,
        }

        if err := db.Create(&sub).Error; err != nil {
                log.Fatalf("Failed to seed subscription: %v", err)
        }
        log.Println("✅ Seeded subscription: enterprise (active)")
}

// ─── EVENT ────────────────────────────────────────────────────────────────

func seedEvent(db *gorm.DB, tenantID string) string {
        var count int64
        db.Model(&models.Event{}).Where("slug = ?", "sheila-on-7-melompat-lebih-tinggi").Count(&count)
        if count > 0 {
                log.Println("⏭️  Event already exists, skipping")
                var event models.Event
                db.Where("slug = ?", "sheila-on-7-melompat-lebih-tinggi").First(&event)
                return event.ID
        }

        // 2026-04-25 19:00 WIB (UTC+7)
        eventDate := time.Date(2026, 4, 25, 12, 0, 0, 0, time.UTC) // 19:00 WIB = 12:00 UTC
        doorsOpen := time.Date(2026, 4, 25, 9, 0, 0, 0, time.UTC)  // 16:00 WIB = 09:00 UTC
        subtitle := "Konser Tour Indonesia 2026"
        address := "Jl. Pintu 1 Senayan, Jakarta Pusat"

        event := models.Event{
                TenantID:  tenantID,
                Slug:      "sheila-on-7-melompat-lebih-tinggi",
                Title:     "Sheila On 7 — Melompat Lebih Tinggi",
                Subtitle:  &subtitle,
                Date:      eventDate,
                DoorsOpen: &doorsOpen,
                Venue:     "GBK Madya Stadium",
                City:      "Jakarta",
                Address:   &address,
                Capacity:  30000,
                Status:    "published",
        }

        if err := db.Create(&event).Error; err != nil {
                log.Fatalf("Failed to seed event: %v", err)
        }
        log.Println("✅ Seeded event: Sheila On 7 — Melompat Lebih Tinggi")
        return event.ID
}

// ─── TICKET TYPES ─────────────────────────────────────────────────────────

func seedTicketTypes(db *gorm.DB, tenantID, eventID string) {
        var count int64
        db.Model(&models.TicketType{}).Where("event_id = ?", eventID).Count(&count)
        if count > 0 {
                log.Println("⏭️  TicketTypes already exist, skipping")
                return
        }

        ticketDefs := []struct {
                Name        string
                Price       int
                Quota       int
                Tier        string
                Zone        string
                Emoji       string
                Description string
        }{
                {"VVIP", 3500000, 500, "premium", "A", "👑", "Pengalaman terbaik dengan akses eksklusif, meet & greet, dan merchandise premium"},
                {"VIP", 2500000, 1000, "premium", "B", "⭐", "Posisi terdepan dengan fasilitas VIP lounge dan merchandise eksklusif"},
                {"Festival", 1500000, 10000, "floor", "Floor", "🎵", "Area berdiri terbuka di lantai dasar, langsung di depan panggung"},
                {"CAT 1", 1250000, 3000, "tribun", "West", "🔴", "Tribun Barat dengan pemandangan panggung yang jelas"},
                {"CAT 2", 1000000, 4000, "tribun", "East", "🔵", "Tribun Timur dengan pemandangan panggung yang baik"},
                {"CAT 3", 800000, 4000, "tribun", "North", "🟢", "Tribun Utara dengan akses mudah ke fasilitas"},
                {"CAT 4", 650000, 3000, "tribun", "South", "🟣", "Tribun Selatan dengan suasana yang meriah"},
                {"CAT 5", 500000, 2500, "tribun", "Corner-NW", "⚪", "Sudut Barat Laut tribun, pemandangan samping panggung"},
                {"CAT 6", 350000, 2000, "tribun", "Corner-SE", "🟡", "Sudut Tenggara tribun, pemandangan samping panggung"},
        }

        for _, def := range ticketDefs {
                tt := models.TicketType{
                        TenantID:    tenantID,
                        EventID:     eventID,
                        Name:        def.Name,
                        Description: &def.Description,
                        Price:       def.Price,
                        Quota:       def.Quota,
                        Sold:        0,
                        Tier:        def.Tier,
                        Zone:        &def.Zone,
                        Emoji:       &def.Emoji,
                }
                if err := db.Create(&tt).Error; err != nil {
                        log.Fatalf("Failed to seed ticket type %s: %v", def.Name, err)
                }
        }
        log.Printf("✅ Seeded %d ticket types", len(ticketDefs))
}

// ─── COUNTERS ─────────────────────────────────────────────────────────────

func seedCounters(db *gorm.DB, tenantID, eventID string) []models.Counter {
        var count int64
        db.Model(&models.Counter{}).Where("event_id = ?", eventID).Count(&count)
        if count > 0 {
                log.Println("⏭️  Counters already exist, skipping")
                var counters []models.Counter
                db.Where("event_id = ?", eventID).Find(&counters)
                return counters
        }

        counterDefs := []struct {
                Name     string
                Location string
        }{
                {"Counter A", "Gate 1"},
                {"Counter B", "Gate 3"},
                {"Counter C", "Gate 5"},
        }

        var counters []models.Counter
        for _, def := range counterDefs {
                counter := models.Counter{
                        TenantID: tenantID,
                        EventID:  eventID,
                        Name:     def.Name,
                        Location: &def.Location,
                        Capacity: 500,
                        Status:   "active",
                }
                if err := db.Create(&counter).Error; err != nil {
                        log.Fatalf("Failed to seed counter %s: %v", def.Name, err)
                }
                counters = append(counters, counter)
        }
        log.Printf("✅ Seeded %d counters", len(counterDefs))
        return counters
}

// ─── GATES ────────────────────────────────────────────────────────────────

func seedGates(db *gorm.DB, tenantID, eventID string) []models.Gate {
        var count int64
        db.Model(&models.Gate{}).Where("event_id = ?", eventID).Count(&count)
        if count > 0 {
                log.Println("⏭️  Gates already exist, skipping")
                var gates []models.Gate
                db.Where("event_id = ?", eventID).Find(&gates)
                return gates
        }

        gateDefs := []struct {
                Name           string
                Type           string
                Location       string
                MinAccessLevel *string
        }{
                {"Gate 1", "entry", "North Entrance", nil},
                {"Gate 2", "entry", "South Entrance", nil},
                {"Gate 3", "exit", "North Exit", nil},
                {"Gate 4", "both", "VIP Entrance/Exit", strPtr("VIP")},
        }

        var gates []models.Gate
        for _, def := range gateDefs {
                gate := models.Gate{
                        TenantID:       tenantID,
                        EventID:        eventID,
                        Name:           def.Name,
                        Type:           def.Type,
                        Location:       &def.Location,
                        MinAccessLevel: def.MinAccessLevel,
                        CapacityPerMin: 30,
                        Status:         "active",
                }
                if err := db.Create(&gate).Error; err != nil {
                        log.Fatalf("Failed to seed gate %s: %v", def.Name, err)
                }
                gates = append(gates, gate)
        }
        log.Printf("✅ Seeded %d gates", len(gateDefs))
        return gates
}

// ─── COUNTER STAFF ────────────────────────────────────────────────────────

func seedCounterStaff(db *gorm.DB, tenantID string, users map[string]seedUser, counters []models.Counter) {
        var count int64
        db.Model(&models.CounterStaff{}).Count(&count)
        if count > 0 {
                log.Println("⏭️  CounterStaff already exists, skipping")
                return
        }

        // Assign Rina (COUNTER_STAFF) to Counter A
        var rina models.User
        if err := db.Where("google_id = ?", "google-counter").First(&rina).Error; err != nil {
                log.Fatalf("Failed to find Rina: %v", err)
        }

        // Find Counter A
        var counterA models.Counter
        if err := db.Where("name = ? AND event_id IN (SELECT id FROM events WHERE slug = ?)", "Counter A", "sheila-on-7-melompat-lebih-tinggi").First(&counterA).Error; err != nil {
                log.Fatalf("Failed to find Counter A: %v", err)
        }

        cs := models.CounterStaff{
                TenantID:  tenantID,
                UserID:    rina.ID,
                CounterID: counterA.ID,
                Status:    "active",
        }
        if err := db.Create(&cs).Error; err != nil {
                log.Fatalf("Failed to seed CounterStaff: %v", err)
        }
        log.Println("✅ Seeded CounterStaff: Rina → Counter A")
}

// ─── GATE STAFF ───────────────────────────────────────────────────────────

func seedGateStaff(db *gorm.DB, tenantID string, users map[string]seedUser, gates []models.Gate) {
        var count int64
        db.Model(&models.GateStaff{}).Count(&count)
        if count > 0 {
                log.Println("⏭️  GateStaff already exists, skipping")
                return
        }

        // Assign Bayu (GATE_STAFF) to Gate 1
        var bayu models.User
        if err := db.Where("google_id = ?", "google-gate").First(&bayu).Error; err != nil {
                log.Fatalf("Failed to find Bayu: %v", err)
        }

        // Find Gate 1
        var gate1 models.Gate
        if err := db.Where("name = ? AND event_id IN (SELECT id FROM events WHERE slug = ?)", "Gate 1", "sheila-on-7-melompat-lebih-tinggi").First(&gate1).Error; err != nil {
                log.Fatalf("Failed to find Gate 1: %v", err)
        }

        gs := models.GateStaff{
                TenantID: tenantID,
                UserID:   bayu.ID,
                GateID:   gate1.ID,
                Status:   "active",
        }
        if err := db.Create(&gs).Error; err != nil {
                log.Fatalf("Failed to seed GateStaff: %v", err)
        }
        log.Println("✅ Seeded GateStaff: Bayu → Gate 1")
}

// ─── WRISTBAND INVENTORY ─────────────────────────────────────────────────

func seedWristbandInventory(db *gorm.DB, tenantID, eventID string) {
        var count int64
        db.Model(&models.WristbandInventory{}).Where("event_id = ?", eventID).Count(&count)
        if count > 0 {
                log.Println("⏭️  WristbandInventory already exists, skipping")
                return
        }

        wristbandDefs := []struct {
                Color      string
                ColorHex   string
                Type       string
                TotalStock int
        }{
                {"Gold", "#FFD700", "VVIP", 500},
                {"Teal", "#00A39D", "VIP", 1000},
                {"Orange", "#F8AD3C", "Festival", 10000},
                {"Merah", "#EF4444", "CAT1", 3000},
                {"Biru", "#3B82F6", "CAT2", 4000},
                {"Hijau", "#22C55E", "CAT3", 4000},
                {"Ungu", "#A855F7", "CAT4", 3000},
                {"Putih", "#F8FAFC", "CAT5", 2500},
                {"Kuning", "#EAB308", "CAT6", 2000},
        }

        for _, def := range wristbandDefs {
                wi := models.WristbandInventory{
                        TenantID:       tenantID,
                        EventID:        eventID,
                        Color:          def.Color,
                        ColorHex:       def.ColorHex,
                        Type:           def.Type,
                        TotalStock:     def.TotalStock,
                        UsedStock:      0,
                        RemainingStock: def.TotalStock,
                }
                if err := db.Create(&wi).Error; err != nil {
                        log.Fatalf("Failed to seed wristband inventory %s: %v", def.Color, err)
                }
        }
        log.Printf("✅ Seeded %d wristband inventory entries", len(wristbandDefs))
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

func strPtr(s string) *string {
        return &s
}

// Unused users map suppression
var _ = func() map[string]seedUser { return nil }
