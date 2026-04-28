---
Task ID: 1
Agent: Main Agent
Task: Create User Guide Pages for All 6 Roles (SUPER_ADMIN, ADMIN, ORGANIZER, COUNTER_STAFF, GATE_STAFF, PARTICIPANT)

Work Log:
- Explored full project structure: 48 shadcn/ui components, dark theme with Gold (#F8AD3C) + Teal (#00A39D) accents, glassmorphism, glow effects
- Created comprehensive user guide page component at `src/components/pages/user-guide-page.tsx` (~980 lines)
- Added "user-guide" PageView to `src/lib/page-store.ts`
- Integrated UserGuidePage into `src/app/page.tsx` with lazy loading
- Added "Panduan" navigation link to navbar (both desktop and mobile)
- Fixed lint errors: replaced `WristbandAmulet` (non-existent) with `CircleDot`, added missing `Music` import
- Verified: 0 ESLint errors, dev server running on port 3000

Stage Summary:
- User Guide page with 6 role-specific guides accessible via "Panduan" in navbar
- Each role guide includes: hero header, flow diagram, features grid, step-by-step timeline, tips & warnings, FAQ accordion
- Role-specific color coding: SUPER_ADMIN=Red, ADMIN=Orange, ORGANIZER=Purple, COUNTER_STAFF=Emerald, GATE_STAFF=Blue, PARTICIPANT=Gray
- Quick reference section with wristband color mapping
- System architecture diagram (Participant → Counter → Gate → Venue)
- All animations matching existing design: fade-in-up, scale-in, hover-lift, glassmorphism, glow effects
