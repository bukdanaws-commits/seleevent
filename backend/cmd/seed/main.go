package main

import (
	"fmt"
	"log"
	"time"

	"github.com/bukdanaws-commits/seleevent/backend/internal/config"
	"github.com/bukdanaws-commits/seleevent/backend/internal/database"
	"github.com/bukdanaws-commits/seleevent/backend/internal/models"
	"github.com/bukdanaws-commits/seleevent/backend/pkg/utils"
	"gorm.io/gorm"
)

// ============================================================================
// SeleEvent — Comprehensive Database Seeder
//
// Run locally:    go run ./cmd/seed
// Run on Cloud:   Cloud Build step or gcloud sql connect + seed-data.sql
//
// This seeder is idempotent — it checks for existing data before inserting.
// ============================================================================

func main() {
	config.Load()

	if port := getConfigPort(); port != "" {
		_ = port // just read it to confirm
	}

	log.Println("🌱 SeleEvent Database Seeder starting...")
	log.Printf("   Environment: %s", config.Cfg.App.Env)
	log.Printf("   Database: %s@%s/%s", config.Cfg.DB.User, config.Cfg.DB.Host, config.Cfg.DB.Name)

	db, err := database.Connect(config.Cfg)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// Seed in dependency order
	tenantID := seedTenant(db)
	seedSubscription(db, tenantID)
	userIDs := seedUsers(db, tenantID)
	seedTenantUsers(db, tenantID, userIDs)
	eventID := seedEvent(db, tenantID)
	ttIDs := seedTicketTypes(db, tenantID, eventID)
	seedSeats(db, tenantID, eventID, ttIDs)
	counterIDs := seedCounters(db, tenantID, eventID)
	gateIDs := seedGates(db, tenantID, eventID)
	seedCounterStaff(db, tenantID, userIDs, counterIDs)
	seedGateStaff(db, tenantID, userIDs, gateIDs)
	seedWristbandInventory(db, tenantID, eventID)
	seedDemoOrders(db, tenantID, eventID, userIDs, ttIDs)
	seedNotifications(db, tenantID, eventID, userIDs)

	fmt.Println()
	log.Println("✅ ==========================================")
	log.Println("✅ Seeding completed successfully!")
	log.Println("✅ ==========================================")
	log.Println("   You can now test the API with these accounts:")
	log.Println("   ─────────────────────────────────────────")
	log.Println("   SUPER_ADMIN:  admin@seleevent.id")
	log.Println("   ORGANIZER:    organizer@sheilaon7.id")
	log.Println("   COUNTER_STAFF: counter1@seleevent.id")
	log.Println("   GATE_STAFF:   gate1@seleevent.id")
	log.Println("   ─────────────────────────────────────────")
	log.Println("   Note: Mock Google IDs won't work with real OAuth.")
	log.Println("   Use real Google accounts for authentication testing.")
}

func getConfigPort() string {
	return config.Cfg.App.Port
}

// ─── TENANT ───────────────────────────────────────────────────────────────

func seedTenant(db *gorm.DB) string {
	var tenant models.Tenant
	if err := db.Where("slug = ?", "seleevent").First(&tenant).Error; err == nil {
		log.Println("⏭️  Tenant 'SeleEvent' already exists")
		return tenant.ID
	}

	tenant = models.Tenant{
		Name:           "SeleEvent",
		Slug:           "seleevent",
		PrimaryColor:   "#00A39D",
		SecondaryColor: "#F8AD3C",
		IsActive:       true,
		MaxEvents:      10,
		MaxTickets:     50000,
		Plan:           "enterprise",
	}
	mustCreate(db, &tenant, "tenant")
	log.Println("✅ Tenant: SeleEvent")
	return tenant.ID
}

// ─── SUBSCRIPTION ─────────────────────────────────────────────────────────

func seedSubscription(db *gorm.DB, tenantID string) {
	var count int64
	db.Model(&models.Subscription{}).Where("tenant_id = ?", tenantID).Count(&count)
	if count > 0 {
		log.Println("⏭️  Subscription exists")
		return
	}

	now := time.Now()
	sub := models.Subscription{
		TenantID:           tenantID,
		Plan:               "enterprise",
		Status:             "active",
		CurrentPeriodStart: now,
		CurrentPeriodEnd:   now.AddDate(1, 0, 0),
	}
	mustCreate(db, &sub, "subscription")
	log.Println("✅ Subscription: enterprise (active)")
}

// ─── USERS ────────────────────────────────────────────────────────────────

func seedUsers(db *gorm.DB, tenantID string) map[string]string {
	// Return map: role → userID
	result := make(map[string]string)

	userDefs := []struct {
		Role     string
		Name     string
		Email    string
		GoogleID string
	}{
		{"SUPER_ADMIN", "SeleEvent Admin", "admin@seleevent.id", "mock-superadmin-001"},
		{"ADMIN", "Rizky Pratama", "admin2@seleevent.id", "mock-admin-001"},
		{"ORGANIZER", "Ahmad Rizki (Organizer)", "organizer@sheilaon7.id", "mock-organizer-001"},
		{"COUNTER_STAFF", "Siti Nurhaliza (Counter 1)", "counter1@seleevent.id", "mock-counter-001"},
		{"COUNTER_STAFF", "Budi Santoso (Counter 2)", "counter2@seleevent.id", "mock-counter-002"},
		{"COUNTER_STAFF", "Dewi Lestari (Counter 3)", "counter3@seleevent.id", "mock-counter-003"},
		{"GATE_STAFF", "Rudi Hartono (Gate 1)", "gate1@seleevent.id", "mock-gate-001"},
		{"GATE_STAFF", "Maya Sari (Gate 2)", "gate2@seleevent.id", "mock-gate-002"},
		{"GATE_STAFF", "Joko Widodo (Gate 3)", "gate3@seleevent.id", "mock-gate-003"},
		{"GATE_STAFF", "Rina Wati (Gate 4)", "gate4@seleevent.id", "mock-gate-004"},
		{"PARTICIPANT", "Dian Pratama", "fan1@gmail.com", "mock-participant-001"},
		{"PARTICIPANT", "Raka Putra", "fan2@gmail.com", "mock-participant-002"},
		{"PARTICIPANT", "Nisa Azkia", "fan3@gmail.com", "mock-participant-003"},
		{"PARTICIPANT", "Fajar Nugroho", "fan4@gmail.com", "mock-participant-004"},
		{"PARTICIPANT", "Ayu Rahmawati", "fan5@gmail.com", "mock-participant-005"},
	}

	var created int
	for _, def := range userDefs {
		var user models.User
		if err := db.Where("email = ?", def.Email).First(&user).Error; err == nil {
			result[def.Role+"_"+def.Email] = user.ID
			continue
		}

		user = models.User{
			Name:     def.Name,
			Email:    def.Email,
			GoogleID: def.GoogleID,
			Role:     def.Role,
			Status:   "active",
		}
		mustCreate(db, &user, "user "+def.Email)
		result[def.Role+"_"+def.Email] = user.ID
		created++
	}
	log.Printf("✅ Users: %d created, %d total", created, len(userDefs))
	return result
}

// ─── TENANT USERS ─────────────────────────────────────────────────────────

func seedTenantUsers(db *gorm.DB, tenantID string, userIDs map[string]string) {
	var count int64
	db.Model(&models.TenantUser{}).Where("tenant_id = ?", tenantID).Count(&count)
	if count > 0 {
		log.Println("⏭️  TenantUsers exist")
		return
	}

	for key, uid := range userIDs {
		role := ""
		for _, def := range []string{"SUPER_ADMIN", "ADMIN", "ORGANIZER", "COUNTER_STAFF", "GATE_STAFF"} {
			if len(key) > len(def) && key[:len(def)+1] == def+"_" {
				role = def
				break
			}
		}
		if role == "" {
			role = "PARTICIPANT"
		}
		tu := models.TenantUser{
			UserID:   uid,
			TenantID: tenantID,
			Role:     role,
			IsActive: true,
		}
		if err := db.Create(&tu).Error; err != nil {
			log.Printf("   Skip TenantUser for %s: %v", key, err)
		}
	}
	log.Println("✅ TenantUsers linked")
}

// ─── EVENT ────────────────────────────────────────────────────────────────

func seedEvent(db *gorm.DB, tenantID string) string {
	var event models.Event
	if err := db.Where("slug = ?", "sheila-on-7-live-in-jakarta").First(&event).Error; err == nil {
		log.Println("⏭️  Event exists")
		return event.ID
	}

	// May 30, 2026 — 19:00 WIB (UTC+7)
	eventDate := time.Date(2026, 5, 30, 12, 0, 0, 0, time.UTC)
	doorsOpen := time.Date(2026, 5, 30, 10, 0, 0, 0, time.UTC)
	subtitle := "Tunggu Aku di Jakarta"
	address := "Jl. Pintu 1, Senayan, Jakarta Pusat"

	event = models.Event{
		TenantID:  tenantID,
		Slug:      "sheila-on-7-live-in-jakarta",
		Title:     "Sheila On 7 — Live in Jakarta",
		Subtitle:  &subtitle,
		Date:      eventDate,
		DoorsOpen: &doorsOpen,
		Venue:     "GBK Madya Stadium",
		City:      "Jakarta",
		Address:   &address,
		Capacity:  15000,
		Status:    "published",
	}
	mustCreate(db, &event, "event")
	log.Println("✅ Event: Sheila On 7 — Live in Jakarta")
	return event.ID
}

// ─── TICKET TYPES ─────────────────────────────────────────────────────────

func seedTicketTypes(db *gorm.DB, tenantID, eventID string) map[string]string {
	var count int64
	db.Model(&models.TicketType{}).Where("event_id = ?", eventID).Count(&count)
	if count > 0 {
		log.Println("⏭️  TicketTypes exist")
		// Return existing IDs
		result := make(map[string]string)
		var tts []models.TicketType
		db.Where("event_id = ?", eventID).Find(&tts)
		for _, tt := range tts {
			result[tt.Name] = tt.ID
		}
		return result
	}

	ttDefs := []struct {
		Name        string
		Description string
		Price       int
		Quota       int
		Tier        string
		Zone        string
		Emoji       string
		Benefits    string
	}{
		{"VVIP", "Barisan terdepan, meet & greet eksklusif", 3500000, 200, "premium", "A", "👑",
			`["Meet & Greet","Exclusive Merchandise","Priority Entry","Complimentary Drink"]`},
		{"VIP", "Barisan premium, merchandise eksklusif", 2500000, 500, "premium", "B", "⭐",
			`["Exclusive Merchandise","Priority Entry","Complimentary Drink"]`},
		{"CAT 1", "Tribun barisan depan", 1500000, 1500, "seated", "C", "🎵",
			`["Souvenir Lanyard","Standard Entry"]`},
		{"CAT 2", "Tribun barisan tengah", 1000000, 2300, "seated", "D", "🎶",
			`["Standard Entry"]`},
		{"CAT 3", "Tribun barisan belakang", 750000, 3000, "seated", "E", "🎤",
			`["Standard Entry"]`},
		{"Festival", "Area berdiri, free standing", 500000, 7500, "floor", "F", "🎉",
			`["Standard Entry","Festival Zone Access"]`},
	}

	result := make(map[string]string)
	for _, def := range ttDefs {
		tt := models.TicketType{
			TenantID:    tenantID,
			EventID:     eventID,
			Name:        def.Name,
			Description: &def.Description,
			Price:       def.Price,
			Quota:       def.Quota,
			Tier:        def.Tier,
			Zone:        &def.Zone,
			Emoji:       &def.Emoji,
			Benefits:    &def.Benefits,
		}
		mustCreate(db, &tt, "ticket type "+def.Name)
		result[def.Name] = tt.ID
	}
	log.Printf("✅ TicketTypes: %d created", len(ttDefs))
	return result
}

// ─── SEATS ────────────────────────────────────────────────────────────────

func seedSeats(db *gorm.DB, tenantID, eventID string, ttIDs map[string]string) {
	var count int64
	db.Model(&models.Seat{}).Where("event_id = ?", eventID).Count(&count)
	if count > 0 {
		log.Println("⏭️  Seats exist")
		return
	}

	// VVIP: 10 rows × 20 = 200 seats
	seats := generateSeats(tenantID, eventID, ttIDs["VVIP"], "A", 10, 20)
	// VIP: 10 rows × 50 = 500 seats
	seats = append(seats, generateSeats(tenantID, eventID, ttIDs["VIP"], "B", 10, 50)...)
	// CAT 1: 15 rows × 100 = 1500 seats
	seats = append(seats, generateSeats(tenantID, eventID, ttIDs["CAT 1"], "C", 15, 100)...)

	if err := db.CreateInBatches(seats, 500).Error; err != nil {
		log.Fatalf("Failed to seed seats: %v", err)
	}
	log.Printf("✅ Seats: %d created", len(seats))
}

func generateSeats(tenantID, eventID, ttID, section string, rows, cols int) []models.Seat {
	var seats []models.Seat
	for r := 1; r <= rows; r++ {
		for c := 1; c <= cols; c++ {
			status := "available"
			if r <= rows/2 {
				status = "sold" // Front half sold
			}
			seats = append(seats, models.Seat{
				TenantID:     tenantID,
				EventID:      eventID,
				TicketTypeID: ttID,
				Section:      section,
				Row:          fmt.Sprintf("%d", r),
				Number:       fmt.Sprintf("%d", c),
				Label:        fmt.Sprintf("%s-%d-%d", section, r, c),
				Status:       status,
			})
		}
	}
	return seats
}

// ─── COUNTERS ─────────────────────────────────────────────────────────────

func seedCounters(db *gorm.DB, tenantID, eventID string) []string {
	var count int64
	db.Model(&models.Counter{}).Where("event_id = ?", eventID).Count(&count)
	if count > 0 {
		log.Println("⏭️  Counters exist")
		var counters []models.Counter
		db.Where("event_id = ?", eventID).Find(&counters)
		var ids []string
		for _, c := range counters {
			ids = append(ids, c.ID)
		}
		return ids
	}

	openAt := time.Date(2026, 5, 30, 8, 0, 0, 0, time.UTC) // 15:00 WIB
	closeAt := time.Date(2026, 5, 30, 14, 0, 0, 0, time.UTC) // 21:00 WIB
	vipOpen := time.Date(2026, 5, 30, 9, 0, 0, 0, time.UTC)  // 16:00 WIB

	counterDefs := []struct {
		Name     string
		Location string
		Capacity int
		OpenAt   time.Time
		CloseAt  time.Time
	}{
		{"Counter Gate A", "Lobby Utara", 500, openAt, closeAt},
		{"Counter Gate B", "Lobby Selatan", 500, openAt, closeAt},
		{"Counter VVIP", "VIP Lounge", 100, vipOpen, closeAt},
	}

	var ids []string
	for _, def := range counterDefs {
		c := models.Counter{
			TenantID: tenantID,
			EventID:  eventID,
			Name:     def.Name,
			Location: &def.Location,
			Capacity: def.Capacity,
			Status:   "active",
			OpenAt:   &def.OpenAt,
			CloseAt:  &def.CloseAt,
		}
		mustCreate(db, &c, "counter "+def.Name)
		ids = append(ids, c.ID)
	}
	log.Printf("✅ Counters: %d created", len(counterDefs))
	return ids
}

// ─── GATES ────────────────────────────────────────────────────────────────

func seedGates(db *gorm.DB, tenantID, eventID string) []string {
	var count int64
	db.Model(&models.Gate{}).Where("event_id = ?", eventID).Count(&count)
	if count > 0 {
		log.Println("⏭️  Gates exist")
		var gates []models.Gate
		db.Where("event_id = ?", eventID).Find(&gates)
		var ids []string
		for _, g := range gates {
			ids = append(ids, g.ID)
		}
		return ids
	}

	gateDefs := []struct {
		Name           string
		Type           string
		Location       string
		MinAccessLevel *string
		CapPerMin      int
	}{
		{"Gate 1 - VVIP", "entry", "Lobby Utara", strPtr("VVIP"), 30},
		{"Gate 2 - VIP", "entry", "Lobby Utara", strPtr("VIP"), 30},
		{"Gate 3 - General", "both", "Lobby Selatan", nil, 60},
		{"Gate 4 - General", "both", "Lobby Timur", nil, 60},
		{"Exit Gate", "exit", "Lobby Barat", nil, 80},
	}

	var ids []string
	for _, def := range gateDefs {
		g := models.Gate{
			TenantID:       tenantID,
			EventID:        eventID,
			Name:           def.Name,
			Type:           def.Type,
			Location:       &def.Location,
			MinAccessLevel: def.MinAccessLevel,
			CapacityPerMin: def.CapPerMin,
			Status:         "active",
		}
		mustCreate(db, &g, "gate "+def.Name)
		ids = append(ids, g.ID)
	}
	log.Printf("✅ Gates: %d created", len(gateDefs))
	return ids
}

// ─── COUNTER STAFF ────────────────────────────────────────────────────────

func seedCounterStaff(db *gorm.DB, tenantID string, userIDs map[string]string, counterIDs []string) {
	var count int64
	db.Model(&models.CounterStaff{}).Count(&count)
	if count > 0 {
		log.Println("⏭️  CounterStaff exists")
		return
	}

	assignments := []struct {
		UserKey    string
		CounterIdx int
	}{
		{"COUNTER_STAFF_counter1@seleevent.id", 0},
		{"COUNTER_STAFF_counter2@seleevent.id", 1},
		{"COUNTER_STAFF_counter3@seleevent.id", 2},
	}

	for _, a := range assignments {
		uid, ok := userIDs[a.UserKey]
		if !ok || a.CounterIdx >= len(counterIDs) {
			continue
		}
		cs := models.CounterStaff{
			TenantID:  tenantID,
			UserID:    uid,
			CounterID: counterIDs[a.CounterIdx],
			Status:    "active",
		}
		if err := db.Create(&cs).Error; err != nil {
			log.Printf("   Skip CounterStaff %s: %v", a.UserKey, err)
		}
	}
	log.Println("✅ CounterStaff: assigned")
}

// ─── GATE STAFF ───────────────────────────────────────────────────────────

func seedGateStaff(db *gorm.DB, tenantID string, userIDs map[string]string, gateIDs []string) {
	var count int64
	db.Model(&models.GateStaff{}).Count(&count)
	if count > 0 {
		log.Println("⏭️  GateStaff exists")
		return
	}

	assignments := []struct {
		UserKey  string
		GateIdx  int
	}{
		{"GATE_STAFF_gate1@seleevent.id", 0},
		{"GATE_STAFF_gate2@seleevent.id", 1},
		{"GATE_STAFF_gate3@seleevent.id", 2},
		{"GATE_STAFF_gate4@seleevent.id", 3},
	}

	for _, a := range assignments {
		uid, ok := userIDs[a.UserKey]
		if !ok || a.GateIdx >= len(gateIDs) {
			continue
		}
		gs := models.GateStaff{
			TenantID: tenantID,
			UserID:   uid,
			GateID:   gateIDs[a.GateIdx],
			Status:   "active",
		}
		if err := db.Create(&gs).Error; err != nil {
			log.Printf("   Skip GateStaff %s: %v", a.UserKey, err)
		}
	}
	log.Println("✅ GateStaff: assigned")
}

// ─── WRISTBAND INVENTORY ─────────────────────────────────────────────────

func seedWristbandInventory(db *gorm.DB, tenantID, eventID string) {
	var count int64
	db.Model(&models.WristbandInventory{}).Where("event_id = ?", eventID).Count(&count)
	if count > 0 {
		log.Println("⏭️  WristbandInventory exists")
		return
	}

	defs := []struct {
		Color    string
		ColorHex string
		Type     string
		Stock    int
	}{
		{"Gold", "#FFD700", "VVIP", 200},
		{"Silver", "#C0C0C0", "VIP", 500},
		{"Blue", "#1E90FF", "CAT 1", 1500},
		{"Green", "#32CD32", "CAT 2", 2300},
		{"Orange", "#FF8C00", "CAT 3", 3000},
		{"Red", "#DC143C", "Festival", 7500},
	}

	for _, def := range defs {
		wi := models.WristbandInventory{
			TenantID:       tenantID,
			EventID:        eventID,
			Color:          def.Color,
			ColorHex:       def.ColorHex,
			Type:           def.Type,
			TotalStock:     def.Stock,
			UsedStock:      0,
			RemainingStock: def.Stock,
		}
		mustCreate(db, &wi, "wristband "+def.Color)
	}
	log.Printf("✅ WristbandInventory: %d entries", len(defs))
}

// ─── DEMO ORDERS + TICKETS ────────────────────────────────────────────────

func seedDemoOrders(db *gorm.DB, tenantID, eventID string, userIDs map[string]string, ttIDs map[string]string) {
	var count int64
	db.Model(&models.Order{}).Count(&count)
	if count > 0 {
		log.Println("⏭️  Orders exist, skipping demo data")
		return
	}

	// Get participant user IDs
	fan1 := userIDs["PARTICIPANT_fan1@gmail.com"]
	fan2 := userIDs["PARTICIPANT_fan2@gmail.com"]
	fan3 := userIDs["PARTICIPANT_fan3@gmail.com"]
	fan4 := userIDs["PARTICIPANT_fan4@gmail.com"]
	fan5 := userIDs["PARTICIPANT_fan5@gmail.com"]

	vvipTT := ttIDs["VVIP"]
	vipTT := ttIDs["VIP"]
	cat1TT := ttIDs["CAT 1"]
	cat2TT := ttIDs["CAT 2"]
	cat3TT := ttIDs["CAT 3"]
	festivalTT := ttIDs["Festival"]

	eventTitle := "Sheila On 7 — Live in Jakarta"
	now := time.Now()

	// ── Order 1: fan1 buys 1x VVIP (PAID) ──────────────────────────────
	order1 := createDemoOrder(db, tenantID, fan1, eventID, "paid", 3500000,
		[]orderItemDef{{ttID: vvipTT, qty: 1, price: 3500000}}, &now)

	// Ticket for order 1
	createDemoTicket(db, tenantID, order1.ID, vvipTT, eventID, fan1,
		"Dian Pratama", "fan1@gmail.com", "VVIP-A-3-7", eventTitle, "VVIP", "active", nil, "")

	// ── Order 2: fan2 buys 2x VIP (PAID, 1 redeemed) ──────────────────
	order2 := createDemoOrder(db, tenantID, fan2, eventID, "paid", 5000000,
		[]orderItemDef{{ttID: vipTT, qty: 2, price: 2500000}}, &now)

	redeemedAt := now.Add(-1 * time.Hour)
	createDemoTicket(db, tenantID, order2.ID, vipTT, eventID, fan2,
		"Raka Putra", "fan2@gmail.com", "VIP-B-2-15", eventTitle, "VIP", "redeemed", &redeemedAt, "WB-SLVR1")
	createDemoTicket(db, tenantID, order2.ID, vipTT, eventID, fan2,
		"Raka Putra", "fan2@gmail.com", "VIP-B-3-22", eventTitle, "VIP", "active", nil, "")

	// ── Order 3: fan3 buys 1x CAT 2 (PAID) ────────────────────────────
	order3 := createDemoOrder(db, tenantID, fan3, eventID, "paid", 1000000,
		[]orderItemDef{{ttID: cat2TT, qty: 1, price: 1000000}}, &now)
	createDemoTicket(db, tenantID, order3.ID, cat2TT, eventID, fan3,
		"Nisa Azkia", "fan3@gmail.com", "CAT2-D-5-33", eventTitle, "CAT 2", "active", nil, "")

	// ── Order 4: fan4 buys 1x CAT 1 (PAID, inside) ────────────────────
	order4 := createDemoOrder(db, tenantID, fan4, eventID, "paid", 1500000,
		[]orderItemDef{{ttID: cat1TT, qty: 1, price: 1500000}}, &now)
	createDemoTicket(db, tenantID, order4.ID, cat1TT, eventID, fan4,
		"Fajar Nugroho", "fan4@gmail.com", "CAT1-C-8-45", eventTitle, "CAT 1", "inside", &redeemedAt, "WB-BLUE1")

	// ── Order 5: fan5 buys 1x Festival (PAID) ──────────────────────────
	order5 := createDemoOrder(db, tenantID, fan5, eventID, "paid", 500000,
		[]orderItemDef{{ttID: festivalTT, qty: 1, price: 500000}}, &now)
	createDemoTicket(db, tenantID, order5.ID, festivalTT, eventID, fan5,
		"Ayu Rahmawati", "fan5@gmail.com", "Festival", eventTitle, "Festival", "active", nil, "")

	// ── Update sold counts ─────────────────────────────────────────────
	db.Model(&models.TicketType{}).Where("id = ?", vvipTT).Update("sold", 1)
	db.Model(&models.TicketType{}).Where("id = ?", vipTT).Update("sold", 2)
	db.Model(&models.TicketType{}).Where("id = ?", cat1TT).Update("sold", 1)
	db.Model(&models.TicketType{}).Where("id = ?", cat2TT).Update("sold", 1)
	db.Model(&models.TicketType{}).Where("id = ?", festivalTT).Update("sold", 1)

	log.Println("✅ Demo Orders & Tickets: 5 orders, 6 tickets created")

	// Create redemptions for redeemed tickets
	_ = order2 // Already has wristband codes
	_ = order4

	log.Println("✅ Demo data ready for simulation!")
}

type orderItemDef struct {
	ttID  string
	qty   int
	price int
}

func createDemoOrder(db *gorm.DB, tenantID, userID, eventID, status string, total int, items []orderItemDef, paidAt *time.Time) models.Order {
	expiresAt := time.Now().Add(30 * time.Minute)
	order := models.Order{
		TenantID:  tenantID,
		OrderCode: utils.GenerateOrderCode(),
		UserID:    userID,
		EventID:   eventID,
		TotalAmount: total,
		Status:    status,
		ExpiresAt: &expiresAt,
		PaidAt:    paidAt,
	}
	if status == "paid" {
		paymentType := "qris"
		paymentMethod := "gopay"
		order.PaymentType = &paymentType
		order.PaymentMethod = &paymentMethod
		midtransTrx := "MID-DEMO-" + order.OrderCode
		order.MidtransTransactionID = &midtransTrx
	}
	mustCreate(db, &order, "order "+order.OrderCode)

	for _, item := range items {
		oi := models.OrderItem{
			TenantID:       tenantID,
			OrderID:        order.ID,
			TicketTypeID:   item.ttID,
			Quantity:       item.qty,
			PricePerTicket: item.price,
			Subtotal:       item.qty * item.price,
		}
		mustCreate(db, &oi, "order item")
	}
	return order
}

func createDemoTicket(db *gorm.DB, tenantID, orderID, ttID, eventID, userID string,
	attendeeName, attendeeEmail, seatLabel, eventTitle, ticketTypeName, status string,
	redeemedAt *time.Time, wristbandCode string) models.Ticket {

	ticketCode := utils.GenerateTicketCode()
	qrData := ticketCode

	ticket := models.Ticket{
		TenantID:       tenantID,
		OrderID:        orderID,
		TicketTypeID:   ttID,
		EventID:        eventID,
		TicketCode:     ticketCode,
		AttendeeName:   attendeeName,
		AttendeeEmail:  attendeeEmail,
		SeatLabel:      &seatLabel,
		QrData:         qrData,
		EventTitle:     eventTitle,
		TicketTypeName: ticketTypeName,
		Status:         status,
		RedeemedAt:     redeemedAt,
		RedeemedBy:     &userID,
	}
	if wristbandCode != "" {
		ticket.WristbandCode = &wristbandCode
	}
	mustCreate(db, &ticket, "ticket "+ticketCode)
	return ticket
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────

func seedNotifications(db *gorm.DB, tenantID, eventID string, userIDs map[string]string) {
	var count int64
	db.Model(&models.Notification{}).Count(&count)
	if count > 0 {
		log.Println("⏭️  Notifications exist")
		return
	}

	fan1 := userIDs["PARTICIPANT_fan1@gmail.com"]
	fan3 := userIDs["PARTICIPANT_fan3@gmail.com"]
	fan4 := userIDs["PARTICIPANT_fan4@gmail.com"]

	notifs := []models.Notification{
		{
			TenantID: tenantID, UserID: fan1, EventID: eventID,
			Title:   "Pembayaran Berhasil! 🎉",
			Message: "Tiket VVIP Anda untuk Sheila On 7 — Live in Jakarta sudah aktif. Selamat menikmati!",
			Type:    "success", Category: "payment", IsRead: false,
		},
		{
			TenantID: tenantID, UserID: fan3, EventID: eventID,
			Title:   "Tiket Anda Sudah Aktif",
			Message: "Tiket CAT 2 Anda sudah aktif. Jangan lupa tukar dengan wristband di counter!",
			Type:    "info", Category: "order", IsRead: true,
		},
		{
			TenantID: tenantID, UserID: fan4, EventID: eventID,
			Title:   "Wristband Tersedia",
			Message: "Tiket CAT 1 Anda sudah bisa ditukar dengan wristband di Counter Gate A atau B.",
			Type:    "info", Category: "redemption", IsRead: false,
		},
	}

	for _, n := range notifs {
		if err := db.Create(&n).Error; err != nil {
			log.Printf("   Skip notification: %v", err)
		}
	}
	log.Printf("✅ Notifications: %d created", len(notifs))
}

// ─── HELPERS ──────────────────────────────────────────────────────────────

func mustCreate(db *gorm.DB, value interface{}, name string) {
	if err := db.Create(value).Error; err != nil {
		log.Fatalf("❌ Failed to create %s: %v", name, err)
	}
}

func strPtr(s string) *string {
	return &s
}
