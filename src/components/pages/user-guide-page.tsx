'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { usePageStore } from '@/lib/page-store'
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Crown,
  Users,
  ScanLine,
  DoorOpen,
  Ticket,
  LayoutDashboard,
  Settings,
  BarChart3,
  UserCog,
  Building2,
  QrCode,
  CircleDot as Wristband,
  ClipboardCheck,
  Activity,
  Scan,
  LogOut,
  LogIn,
  History,
  Eye,
  CreditCard,
  ShoppingCart,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Monitor,
  Database,
  Bell,
  Lock,
  Globe,
  Zap,
  Heart,
  Sparkles,
  BookOpen,
  Target,
  Layers,
  MousePointerClick,
  Smartphone,
  ShieldCheck,
  FileText,
  Clock,
  HelpCircle,
  Music,
} from 'lucide-react'

// ─── ROLE CONFIG ──────────────────────────────────────────

type GuideRole = 'SUPER_ADMIN' | 'ADMIN' | 'ORGANIZER' | 'COUNTER_STAFF' | 'GATE_STAFF' | 'PARTICIPANT'

interface RoleConfig {
  id: GuideRole
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  bgGlow: string
  badgeClass: string
  description: string
  dashboard: string
  accessScope: string
  color: string
}

const ROLES: RoleConfig[] = [
  {
    id: 'SUPER_ADMIN',
    title: 'Super Admin',
    subtitle: 'Penguasa Penuh Sistem',
    icon: Crown,
    gradient: 'from-red-500 via-rose-500 to-red-600',
    bgGlow: 'rgba(239,68,68,0.15)',
    badgeClass: 'bg-red-500/20 text-red-400 border-red-500/30',
    description: 'Akses tanpa batas ke seluruh sistem SeleEvent. Mengelola tenant, konfigurasi global, audit log, dan kesehatan sistem.',
    dashboard: '/admin',
    accessScope: 'Full System Access',
    color: '#EF4444',
  },
  {
    id: 'ADMIN',
    title: 'Admin',
    subtitle: 'Pengelola Event Utama',
    icon: Shield,
    gradient: 'from-orange-500 via-amber-500 to-orange-600',
    bgGlow: 'rgba(249,115,22,0.15)',
    badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    description: 'Mengelola event, tiket, gate, counter, staff, dan monitoring real-time. Bertanggung jawab atas operasional konser.',
    dashboard: '/admin',
    accessScope: 'Event Operations',
    color: '#F97316',
  },
  {
    id: 'ORGANIZER',
    title: 'Organizer',
    subtitle: 'Supervisi Redeem & Verifikasi',
    icon: Users,
    gradient: 'from-purple-500 via-violet-500 to-purple-600',
    bgGlow: 'rgba(168,85,247,0.15)',
    badgeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    description: 'Mengawasi proses penukaran gelang, verifikasi tiket, dan monitoring real-time dari sisi penyelenggara.',
    dashboard: '/organizer',
    accessScope: 'Redemption & Monitoring',
    color: '#A855F7',
  },
  {
    id: 'COUNTER_STAFF',
    title: 'Counter Staff',
    subtitle: 'Operator Penukaran Gelang',
    icon: ScanLine,
    gradient: 'from-emerald-500 via-green-500 to-emerald-600',
    bgGlow: 'rgba(16,185,129,0.15)',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    description: 'Memindai QR code tiket dan menukarkan gelang (wristband) sesuai kategori. Garda terdepan di booth redeem.',
    dashboard: '/counter',
    accessScope: 'Redemption Booth',
    color: '#10B981',
  },
  {
    id: 'GATE_STAFF',
    title: 'Gate Staff',
    subtitle: 'Pengendali Akses Gerbang',
    icon: DoorOpen,
    gradient: 'from-blue-500 via-cyan-500 to-blue-600',
    bgGlow: 'rgba(59,130,246,0.15)',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    description: 'Memindai gelang di gerbang masuk/keluar, memvalidasi akses, dan mencatat log entry/exit peserta.',
    dashboard: '/gate',
    accessScope: 'Gate Access Control',
    color: '#3B82F6',
  },
  {
    id: 'PARTICIPANT',
    title: 'Participant',
    subtitle: 'Pembeli & Peserta Konser',
    icon: Ticket,
    gradient: 'from-gray-400 via-slate-400 to-gray-500',
    bgGlow: 'rgba(156,163,175,0.15)',
    badgeClass: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    description: 'Membeli tiket, melakukan pembayaran, menerima e-tiket, menukar gelang, dan masuk ke venue konser.',
    dashboard: '/',
    accessScope: 'Public Purchase & Entry',
    color: '#9CA3AF',
  },
]

// ─── GUIDE CONTENT ────────────────────────────────────────

interface GuideFeature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

interface GuideStep {
  step: number
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  tip?: string
}

interface GuideFAQ {
  question: string
  answer: string
}

interface RoleGuideContent {
  overview: string
  features: GuideFeature[]
  steps: GuideStep[]
  faqs: GuideFAQ[]
  tips: string[]
  warnings: string[]
}

const GUIDE_CONTENT: Record<GuideRole, RoleGuideContent> = {
  SUPER_ADMIN: {
    overview: 'Sebagai Super Admin, Anda memiliki kendali penuh atas seluruh platform SeleEvent. Dari manajemen multi-tenant hingga monitoring kesehatan sistem, semua ada di tangan Anda.',
    features: [
      { icon: Building2, title: 'Multi-Tenant Management', description: 'Membuat, mengedit, dan mengelola tenant (penyelenggara) di platform' },
      { icon: Database, title: 'System Health Monitor', description: 'Memantau status database, koneksi aktif, SSE connections, dan resource usage' },
      { icon: UserCog, title: 'Full User Management', description: 'CRUD semua user, assign role, suspend/ban akun, dan lihat audit trail' },
      { icon: Lock, title: 'Role & Permission Config', description: 'Mengkonfigurasi akses level setiap role dan permission matrix' },
      { icon: FileText, title: 'Audit Log Explorer', description: 'Melihat seluruh aktivitas sistem: login, perubahan data, aksi staff' },
      { icon: Bell, title: 'Global Notification', description: 'Mengirim notifikasi system-wide dan mengelola template notifikasi' },
      { icon: Globe, title: 'Tenant Provisioning', description: 'Setup database shard, custom domain, dan branding per tenant' },
      { icon: BarChart3, title: 'Cross-Tenant Analytics', description: 'Dashboard analitik yang menggabungkan data dari semua tenant' },
    ],
    steps: [
      { step: 1, icon: LayoutDashboard, title: 'Buka Dashboard Admin', description: 'Login via Google OAuth, otomatis redirect ke /admin dashboard', tip: 'Pastikan akun Google Anda sudah terdaftar sebagai SUPER_ADMIN di sistem' },
      { step: 2, icon: Building2, title: 'Kelola Tenant', description: 'Navigasi ke menu Tenant → Buat tenant baru atau kelola yang sudah ada', tip: 'Setiap tenant mendapat shard database terpisah untuk isolasi data' },
      { step: 3, icon: UserCog, title: 'Assign Admin per Tenant', description: 'Pilih user → Assign role ADMIN ke tenant tertentu', tip: 'Gunakan audit log untuk memantau semua perubahan role' },
      { step: 4, icon: Monitor, title: 'Monitor System Health', description: 'Cek halaman Settings → System Health untuk memantau DB, SSE, CPU, Memory', tip: 'SSE connections di atas 500 bisa menandakan memory leak — restart service jika perlu' },
      { step: 5, icon: FileText, title: 'Review Audit Log', description: 'Buka menu Verifications → Audit Log untuk melihat semua aktivitas', tip: 'Filter berdasarkan module (auth, ticket, gate) untuk analisis cepat' },
      { step: 6, icon: Settings, title: 'Konfigurasi Global', description: 'Atur Midtrans keys, Google OAuth, dan pengaturan sistem lainnya', tip: 'Selalu test di sandbox mode sebelum menggunakan production keys' },
    ],
    faqs: [
      { question: 'Bagaimana cara menambah tenant baru?', answer: 'Navigasi ke menu Tenant → klik "Add Tenant" → isi nama, slug, dan branding → sistem akan otomatis membuat database shard terpisah. Assign ADMIN ke tenant tersebut untuk mulai mengelola event.' },
      { question: 'Apa yang harus dilakukan jika sistem lambat?', answer: 'Cek System Health di Settings — perhatikan CPU usage, memory usage, dan active DB connections. Jika SSE connections tinggi, pertimbangkan restart. Cek juga query yang lambat di Audit Log.' },
      { question: 'Bagaimana mengubah role seorang user?', answer: 'Buka menu Users → cari user → klik Edit → ubah role → simpan. Semua perubahan role tercatat di Audit Log untuk transparansi.' },
      { question: 'Apakah bisa memban user secara permanen?', answer: 'Ya, ubah status user menjadi "banned". User yang di-ban tidak bisa login sama sekali. Untuk suspend sementara, gunakan status "suspended".' },
    ],
    tips: [
      'Selalu backup database sebelum melakukan perubahan besar di production',
      'Gunakan filter Audit Log untuk memantau aktivitas mencurigakan',
      'Set up notifikasi untuk alert otomatis ketika system health di bawah threshold',
      'Review user permissions secara berkala untuk keamanan',
    ],
    warnings: [
      'SUPER_ADMIN memiliki akses ke SEMUA data tenant — hati-hati dengan privasi',
      'Jangan pernah share akun SUPER_ADMIN — setiap orang harus punya akun sendiri',
      'Perubahan konfigurasi Midtrans/Google OAuth berdampak ke seluruh sistem',
    ],
  },

  ADMIN: {
    overview: 'Sebagai Admin, Anda mengelola seluruh operasional event — dari pembuatan tiket hingga monitoring real-time di hari H. Anda adalah komando utama yang memastikan konser berjalan lancar.',
    features: [
      { icon: LayoutDashboard, title: 'Dashboard & KPI', description: 'Overview real-time: revenue, tiket terjual, occupancy rate, dan statistik penting' },
      { icon: Ticket, title: 'Ticket Management', description: 'Buat kategori tiket, atur harga, quota, benefits, dan seat configuration' },
      { icon: DoorOpen, title: 'Gate Management', description: 'Setup gate (entry/exit/both), assign staff, atur kapasitas per menit' },
      { icon: ScanLine, title: 'Counter Management', description: 'Kelola booth redeem, assign counter staff, atur shift dan jam operasional' },
      { icon: UserCog, title: 'Staff Management', description: 'Assign staff ke gate/counter, atur shift (pagi/siang/malam/full)' },
      { icon: Activity, title: 'Live Monitor', description: 'Pantau real-time: scan activity, redemption rate, gate throughput via SSE' },
      { icon: BarChart3, title: 'Analytics', description: 'Grafik penjualan, revenue per tier, peak hours, dan attendance heatmap' },
      { icon: CreditCard, title: 'Orders & Payments', description: 'Lihat semua order, status pembayaran, refund, dan Midtrans transaction logs' },
    ],
    steps: [
      { step: 1, icon: LayoutDashboard, title: 'Login & Dashboard', description: 'Akses /admin → lihat overview KPI: total revenue, tiket terjual, occupancy rate' },
      { step: 2, icon: Ticket, title: 'Konfigurasi Tiket', description: 'Buat ticket types (VVIP, VIP, Festival, CAT 1-6), atur harga, quota, dan benefits', tip: 'Setiap tier memiliki warna gelang berbeda — pastikan mapping sudah benar' },
      { step: 3, icon: Building2, title: 'Setup Seat Map', description: 'Untuk tribun (CAT 1-6): konfigurasi seat map dengan section, row, dan numbering', tip: 'Gunakan auto-assign untuk Festival/VVIP (free standing, tidak perlu seat map)' },
      { step: 4, icon: DoorOpen, title: 'Konfigurasi Gate', description: 'Buat gate (Gate A, B, C...), set tipe (entry/exit/both), dan assign gate staff', tip: 'Gate dengan minAccessLevel hanya mengizinkan tier tertentu masuk' },
      { step: 5, icon: ScanLine, title: 'Setup Counter', description: 'Buat booth redeem (Counter 1, 2, 3...), assign staff, atur jam operasional' },
      { step: 6, icon: Activity, title: 'Monitor Hari-H', description: 'Buka Live Monitor → pantau real-time scan, redemption, dan occupancy', tip: 'SSE auto-refresh — tidak perlu reload halaman' },
    ],
    faqs: [
      { question: 'Bagaimana cara membuat tiket baru?', answer: 'Menu Tickets → "Add Ticket Type" → isi nama, harga, quota, tier (floor/tribun), benefits → Simpan. Untuk tribun, lanjutkan dengan konfigurasi seat map.' },
      { question: 'Bagaimana assign staff ke gate?', answer: 'Menu Staff → pilih user → klik "Assign to Gate" → pilih gate dan shift → Konfirmasi. Staff yang sudah di-assign akan otomatis melihat gate mereka saat login.' },
      { question: 'Bisa melihat riwayat scan di gate tertentu?', answer: 'Ya, buka Gate Monitoring → pilih gate → lihat log real-time. Bisa filter berdasarkan waktu, aksi (entry/exit), dan status.' },
      { question: 'Bagaimana jika ada tiket yang perlu di-cancel?', answer: 'Menu Tickets → cari tiket → klik "Cancel" → konfirmasi. Tiket yang di-cancel akan otomatis membebaskan seat (jika tribun) dan menghentikan akses di gate.' },
    ],
    tips: [
      'Test scan flow end-to-end sebelum hari H: beli tiket → redeem → scan gate',
      'Siapkan minimal 2 counter staff per booth untuk menghindari antrean panjang',
      'Monitor occupancy rate — jika mendekati 90%, pertimbangkan membuka gate tambahan',
      'Assign staff dengan shift pagi untuk persiapan dan shift malam untuk closing',
    ],
    warnings: [
      'Jangan ubah konfigurasi gate/counter saat event sedang berjalan',
      'Pastikan semua staff sudah di-assign SEBELUM hari H',
      'Cancel tiket hanya jika benar-benar diperlukan — semua aksi tercatat di audit log',
    ],
  },

  ORGANIZER: {
    overview: 'Sebagai Organizer, Anda mengawasi proses penukaran gelang (redemption) dan verifikasi tiket. Anda memastikan setiap peserta mendapat gelang yang benar sebelum memasuki venue.',
    features: [
      { icon: LayoutDashboard, title: 'Dashboard Overview', description: 'Statistik redemption: jumlah redeemed, pending, dan wristband inventory' },
      { icon: ClipboardCheck, title: 'Redeem Scanner', description: 'Scan QR code tiket → validasi → pasangkan gelang sesuai kategori' },
      { icon: Eye, title: 'Ticket Verification', description: 'Cek detail tiket: status, kategori, nama peserta, dan riwayat redeem' },
      { icon: History, title: 'Redemption History', description: 'Riwayat semua penukaran gelang, termasuk waktu, counter, dan staff' },
      { icon: Activity, title: 'Live Monitor', description: 'Pantau real-time redemption progress dan gate activity' },
      { icon: Wristband, title: 'Wristband Guide', description: 'Referensi warna gelang per kategori tiket' },
    ],
    steps: [
      { step: 1, icon: LayoutDashboard, title: 'Login ke Dashboard', description: 'Akses /organizer → lihat statistik redemption hari ini' },
      { step: 2, icon: Eye, title: 'Verifikasi Tiket', description: 'Masukkan ticket code → lihat detail tiket (nama, kategori, status)', tip: 'Cek apakah status tiket "active" sebelum melakukan redeem' },
      { step: 3, icon: ClipboardCheck, title: 'Proses Redeem', description: 'Scan QR code → konfirmasi data peserta → pasangkan gelang → Submit', tip: 'Pastikan warna gelang sesuai kategori: VVIP=Gold, VIP=Teal, Festival=Orange' },
      { step: 4, icon: Wristband, title: 'Pasang Gelang', description: 'Ambil gelang sesuai warna kategori → pasang ke tangan peserta → pastikan tidak longgar', tip: 'Gelang yang sudah dipasang TIDAK BISA ditukar — pastikan benar sebelum memasang' },
      { step: 5, icon: History, title: 'Cek Riwayat', description: 'Buka Redemption History untuk melihat semua transaksi redeem', tip: 'Jika ada kesalahan, catat di notes dan laporkan ke Admin' },
      { step: 6, icon: Activity, title: 'Monitor Progress', description: 'Pantau Live Monitor untuk melihat progress redemption secara real-time' },
    ],
    faqs: [
      { question: 'Apa yang harus dilakukan jika gelang salah warna?', answer: 'Jangan lanjutkan redeem. Catat ticket code, beri tahu peserta untuk menunggu, dan segera hubungi Admin untuk koreksi. Kesalahan gelang bisa menyebabkan peserta ditolak di gate.' },
      { question: 'Bagaimana jika QR code tidak bisa di-scan?', answer: 'Coba manual input ticket code di field yang tersedia. Jika masih gagal, cek apakah tiket sudah expired atau cancelled. Hubungi Admin jika masalah berlanjut.' },
      { question: 'Apakah bisa me-redeem tiket yang sudah di-redeem?', answer: 'Tidak. Sistem akan menolak redeem kedua dengan pesan "Ticket already redeemed". Jika ada laporan gelang hilang, hubungi Admin untuk investigasi.' },
      { question: 'Bagaimana cek stok gelang tersisa?', answer: 'Buka Dashboard → lihat Wristband Inventory. Setiap kategori menampilkan total stock, used, dan remaining.' },
    ],
    tips: [
      'Hafalkan mapping warna gelang: VVIP=Gold, VIP=Teal, Festival=Orange, CAT1=Merah, CAT2=Biru, CAT3=Hijau, CAT4=Ungu, CAT5=Putih',
      'Siapkan gelang per kategori dalam wadah terpisah untuk kecepatan',
      'Selalu tanya nama peserta sebelum memasang gelang — konfirmasi identitas',
      'Catat nomor awal gelang per kategori untuk tracking yang lebih mudah',
    ],
    warnings: [
      'Gelang yang sudah dipasang TIDAK BISA ditukar — double check sebelum memasang',
      'Jangan pernah memasang gelang tanpa proses redeem yang valid di sistem',
      'Laporkan segera jika stok gelang hampir habis ke Admin',
    ],
  },

  COUNTER_STAFF: {
    overview: 'Sebagai Counter Staff, Anda adalah garda terdepan di booth redemption. Tugas utama Anda adalah memindai QR code tiket peserta dan menukarkannya dengan gelang (wristband) sesuai kategori.',
    features: [
      { icon: Scan, title: 'QR Scanner', description: 'Scan QR code tiket peserta menggunakan kamera device' },
      { icon: Wristband, title: 'Wristband Assignment', description: 'Sistem otomatis menentukan warna gelang berdasarkan kategori tiket' },
      { icon: CheckCircle2, title: 'Status Check', description: 'Lihat status tiket: active, redeemed, cancelled, atau expired' },
      { icon: History, title: 'Scan History', description: 'Riwayat scan dan redeem yang telah dilakukan' },
      { icon: HelpCircle, title: 'Quick Reference', description: 'Panduan warna gelang dan FAQ di dalam aplikasi' },
      { icon: AlertTriangle, title: 'Error Handling', description: 'Penanganan scan gagal: QR tidak valid, tiket sudah di-redeem, dll' },
    ],
    steps: [
      { step: 1, icon: Smartphone, title: 'Login & Buka Scanner', description: 'Login ke /counter → Scanner akan otomatis aktif', tip: 'Pastikan kamera device diizinkan untuk akses browser' },
      { step: 2, icon: Scan, title: 'Scan QR Code Tiket', description: 'Arahkan kamera ke QR code di e-tiket peserta → tunggu konfirmasi', tip: 'Pastikan pencahayaan cukup dan QR code tidak terlipat/blur' },
      { step: 3, icon: Eye, title: 'Verifikasi Data', description: 'Sistem menampilkan: nama peserta, kategori tiket, dan warna gelang → konfirmasi dengan peserta', tip: 'TANYA nama peserta — pastikan sesuai dengan yang tertera di layar' },
      { step: 4, icon: Wristband, title: 'Pasang Gelang', description: 'Ambil gelang sesuai warna yang ditampilkan → pasang ke tangan peserta', tip: 'VVIP=Gold, VIP=Teal, Festival=Orange, CAT1=Merah, CAT2=Biru, dst.' },
      { step: 5, icon: CheckCircle2, title: 'Konfirmasi Redeem', description: 'Klik "Confirm Redeem" → sistem akan update status tiket menjadi "redeemed"', tip: 'Konfirmasi hanya setelah gelang BENAR-BENAR terpasang di tangan peserta' },
      { step: 6, icon: QrCode, title: 'Peserta Siap Masuk', description: 'Tiket sudah redeemed → peserta bisa menuju gate untuk scan masuk venue', tip: 'Ingatkan peserta untuk TIDAK melepas gelang sampai event selesai' },
    ],
    faqs: [
      { question: 'Apa yang harus dilakukan jika scan gagal?', answer: '1) Coba arahkan ulang kamera dengan pencahayaan lebih baik. 2) Jika tetap gagal, input manual ticket code di field yang tersedia. 3) Jika masih error, hubungi supervisor.' },
      { question: 'Bagaimana jika tiket sudah di-redeem?', answer: 'Sistem akan menampilkan pesan "Ticket already redeemed" dengan detail waktu dan counter. Jika peserta mengaku belum menerima gelang, hubungi supervisor untuk investigasi.' },
      { question: 'Apa arti setiap warna gelang?', answer: 'VVIP PIT = Gold, VIP ZONE = Teal, FESTIVAL = Orange, CAT 1 = Merah, CAT 2 = Biru, CAT 3 = Hijau, CAT 4 = Ungu, CAT 5 = Putih, CAT 6 = Kuning.' },
      { question: 'Bagaimana jika stok gelang habis?', answer: 'Segera hubungi supervisor atau Admin. Minta peserta untuk menunggu di area tunggu sambil stok di-restock. Jangan mengganti dengan warna gelang yang berbeda.' },
      { question: 'Bisa melihat riwayat scan saya?', answer: 'Ya, buka tab "Riwayat" di aplikasi counter. Semua scan dan redeem yang Anda lakukan tercatat dengan timestamp.' },
    ],
    tips: [
      'Selalu konfirmasi NAMA PESERTA sebelum memasang gelang',
      'Siapkan gelang per warna dalam wadah terpisah — percepat proses',
      'Jika antrian panjang, fokus pada akurasi bukan kecepatan',
      'Jaga device tetap charging — scanner butuh kamera terus-menerus',
      'Refresh halaman jika scanner freeze — data tidak akan hilang',
    ],
    warnings: [
      'JANGAN pernah memasang gelang TANPA proses scan yang valid',
      'JANGAN menukar warna gelang meskipun peserta meminta',
      'Gelang yang salah = peserta ditolak di gate = masalah besar',
      'Laporkan segera jika menemukan QR code yang mencurigakan',
    ],
  },

  GATE_STAFF: {
    overview: 'Sebagai Gate Staff, Anda menjaga pintu masuk dan keluar venue. Tugas Anda adalah memindai gelang peserta, memvalidasi akses, dan memastikan hanya peserta yang berhak yang masuk ke area konser.',
    features: [
      { icon: Scan, title: 'Gate Scanner', description: 'Scan gelang peserta untuk validasi entry/exit' },
      { icon: LogIn, title: 'Entry Validation', description: 'Konfirmasi peserta boleh masuk: gelang valid, belum inside, akses sesuai gate' },
      { icon: LogOut, title: 'Exit & Re-entry', description: 'Proses keluar venue dan validasi kembali masuk (re-entry)' },
      { icon: History, title: 'Gate Log', description: 'Riwayat semua scan di gate Anda: entry, exit, denied' },
      { icon: Activity, title: 'Live Status', description: 'Status gate: aktif/tidak, jumlah peserta inside, throughput rate' },
      { icon: AlertTriangle, title: 'Denial Handling', description: 'Tangani penolakan: gelang tidak valid, wrong gate, sudah inside, dll' },
    ],
    steps: [
      { step: 1, icon: Smartphone, title: 'Login & Pilih Gate', description: 'Login ke /gate → pilih gate yang Anda jaga → Scanner aktif', tip: 'Pastikan Anda memilih gate yang BENAR — Gate A, B, C, dll' },
      { step: 2, icon: Scan, title: 'Scan Gelang Peserta', description: 'Arahkan scanner ke QR code pada gelang → tunggu respons sistem', tip: 'QR code ada di bagian dalam gelang — minta peserta melipat pergelangan tangan' },
      { step: 3, icon: CheckCircle2, title: 'Entry Berhasil', description: 'Sistem menampilkan: nama, kategori, aksi ENTRY → peserta boleh masuk', tip: 'Layar hijau = boleh masuk. Perhatikan juga jumlah re-entry jika ada' },
      { step: 4, icon: LogOut, title: 'Proses Exit', description: 'Untuk keluar: scan gelang → sistem catat EXIT → peserta boleh keluar', tip: 'Peserta yang keluar bisa MASUK KEMBALI (re-entry) — status berubah ke "outside"' },
      { step: 5, icon: AlertTriangle, title: 'Tangani Penolakan', description: 'Jika DENIED: baca alasan (wrong gate, already inside, invalid band) → arahkan peserta', tip: 'Jangan biarkan peserta masuk jika status DENIED — selalu ikuti aturan' },
      { step: 6, icon: History, title: 'Review Log', description: 'Buka tab Log untuk melihat riwayat scan di gate Anda hari ini', tip: 'Log berguna jika ada dispute — catat waktu dan detail setiap kejadian' },
    ],
    faqs: [
      { question: 'Apa yang harus dilakukan jika scan DENIED?', answer: 'Baca alasan di layar: "Already inside" = peserta sudah di dalam (kemungkinan duplikat), "Wrong gate" = peserta harus ke gate lain, "Invalid band" = hubungi supervisor. JANGAN biarkan masuk jika DENIED.' },
      { question: 'Bagaimana proses re-entry?', answer: 'Peserta yang keluar (EXIT) bisa masuk kembali. Scan gelang mereka lagi → sistem akan menampilkan "Re-entry #X" → klik konfirmasi → peserta boleh masuk. Jumlah re-entry tercatat.' },
      { question: 'Apa jika peserta tidak punya gelang?', answer: 'Tolak dengan sopan dan arahkan ke booth redeem terdekat. Peserta HARUS punya gelang yang valid untuk masuk venue. Tidak ada pengecualian.' },
      { question: 'Bagaimana jika scanner error?', answer: 'Refresh halaman browser. Jika masih error, hubungi supervisor untuk manual override. Catat semua entry/exit manual di log kertas sebagai backup.' },
      { question: 'Bisa melihat berapa orang sudah masuk?', answer: 'Ya, di tab Status terdapat counter real-time: total entry, total exit, dan current inside di gate Anda.' },
    ],
    tips: [
      'Kenali tipe gate Anda: entry-only, exit-only, atau both',
      'Untuk gate entry: pastikan peserta masuk sesuai arah yang benar',
      'Jika antrian panjang, minta peserta menyiapkan gelang sebelum sampai scanner',
      'Perhatikan re-entry count — jika >3, beri perhatian ekstra',
      'Komunikasi dengan gate staff lain via radio jika ada masalah',
    ],
    warnings: [
      'JANGAN PERNAH membiarkan peserta masuk jika status DENIED',
      'Jangan biarkan peserta masuk tanpa scan — semua harus tercatat',
      'Jika ada peserta mencoba masuk tanpa gelang, hubungi security',
      'Re-entry tanpa scan EXIT sebelumnya = indikasi kecurangan — laporkan',
    ],
  },

  PARTICIPANT: {
    overview: 'Sebagai Participant, Anda adalah Sobat Duta yang akan menikmati konser Sheila On 7! Dari pembelian tiket hingga masuk venue, semua bisa dilakukan langsung dari platform SeleEvent.',
    features: [
      { icon: Ticket, title: 'Browse & Beli Tiket', description: 'Pilih kategori tiket (VVIP hingga CAT 6), lihat benefits, dan pilih kursi' },
      { icon: CreditCard, title: 'Pembayaran Aman', description: 'Bayar via Midtrans: QRIS, Bank Transfer, GoPay, Kartu Kredit/Debit' },
      { icon: QrCode, title: 'E-Tiket Digital', description: 'QR Code digital yang bisa ditampilkan kapan saja dari device Anda' },
      { icon: ShoppingCart, title: 'Order History', description: 'Lihat semua pesanan, status pembayaran, dan riwayat transaksi' },
      { icon: MapPin, title: 'Seat Selection', description: 'Pilih kursi spesifik untuk tribun (CAT 1-6) — assigned seating' },
      { icon: Heart, title: 'Konser Experience', description: 'Masuk venue, nikmati konser, dan buat kenangan tak terlupakan!' },
    ],
    steps: [
      { step: 1, icon: Globe, title: 'Buka Platform SeleEvent', description: 'Akses website SeleEvent → lihat info konser, lineup, dan harga tiket', tip: 'Login dengan akun Google untuk mulai membeli tiket' },
      { step: 2, icon: Ticket, title: 'Pilih Kategori Tiket', description: 'Klik "Beli Tiket" → pilih kategori (VVIP, VIP, Festival, CAT 1-6)', tip: 'Cek sisa kuota — tiket VVIP dan VIP biasanya cepat habis!' },
      { step: 3, icon: MapPin, title: 'Pilih Kursi (Tribun)', description: 'Untuk tribun: pilih section, row, dan nomor kursi. Festival: langsung lanjut', tip: 'Seat map real-time — kursi yang sudah terjual ditandai merah' },
      { step: 4, icon: CreditCard, title: 'Isi Data & Bayar', description: 'Isi data peserta → pilih metode pembayaran → bayar via Midtrans', tip: 'QRIS paling cepat — scan dan langsung lunas. Bank transfer: 1-24 jam konfirmasi.' },
      { step: 5, icon: QrCode, title: 'Terima E-Tiket', description: 'Setelah pembayaran berhasil → e-tiket tersedia di "Tiket Saya"', tip: 'Screenshot QR code sebagai backup, tapi selalu tunjukkan dari aplikasi untuk keamanan' },
      { step: 6, icon: Wristband, title: 'Redeem Gelang & Masuk', description: 'Di hari H: tunjukkan e-tiket di booth redeem → dapat gelang → scan di gate → masuk!', tip: 'Datang 2 jam sebelum konser untuk menghindari antrean panjang' },
    ],
    faqs: [
      { question: 'Bagaimana cara membeli tiket?', answer: 'Klik "Beli Tiket" → login Google → pilih kategori → isi data peserta → bayar via Midtrans → e-tiket otomatis tersedia di "Tiket Saya". Maksimal 5 tiket per transaksi.' },
      { question: 'Apa metode pembayaran yang diterima?', answer: 'QRIS (GoPay, OVO, Dana, ShopeePay, LinkAja), Bank Transfer (BCA, BNI, BRI, Mandiri, Permata), GoPay, dan Kartu Kredit/Debit. Semua diproses melalui Midtrans.' },
      { question: 'Apa yang harus dibawa ke venue?', answer: 'E-tiket (QR Code) dari aplikasi, identitas (KTP/SIM/Paspor) sesuai data pemesanan. Setelah redeem gelang di booth, gelang menjadi akses masuk Anda.' },
      { question: 'Apakah tiket bisa ditransfer?', answer: 'Tidak. Tiket bersifat personal dan nama peserta harus sesuai dengan identitas yang dibawa saat redeem gelang.' },
      { question: 'Bagaimana jika pembayaran gagal?', answer: 'Coba lagi dengan metode pembayaran berbeda. Jika uang sudah terpotong tapi tiket belum terbit, tunggu 15 menit atau hubungi customer service. Semua transaksi Midtrans terproteksi.' },
      { question: 'Bisa keluar dan masuk lagi?', answer: 'Ya, re-entry diperbolehkan. Scan gelang saat keluar (EXIT) dan scan lagi saat kembali (re-entry). Jumlah re-entry terbatas, jadi gunakan dengan bijak.' },
    ],
    tips: [
      'Beli tiket SEGERA — VVIP dan VIP biasanya sold out dalam hitungan jam',
      'Gunakan QRIS untuk pembayaran tercepat (instan)',
      'Screenshot e-tiket sebagai backup, tapi utamakan tampilan dari aplikasi',
      'Datang 2 jam sebelum konser — antrean redeem dan gate bisa panjang',
      'Jangan lepas gelang sampai event selesai — gelang = akses Anda',
    ],
    warnings: [
      'Jangan membeli tiket dari pihak ketiga / scalper — risiko penipuan tinggi',
      'Jangan share QR code tiket Anda ke siapapun — bisa disalahgunakan',
      'Gelang yang hilang TIDAK bisa diganti — jaga selalu di tangan Anda',
      'Tiket bersifat personal — nama harus sesuai identitas saat redeem',
    ],
  },
}

// ─── INTERSECTION OBSERVER HOOK ────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}

// ─── ANIMATED COUNTER ──────────────────────────────────────

function AnimatedStep({ step, icon: Icon, title, description, tip, totalSteps, roleColor }: GuideStep & { totalSteps: number; roleColor: string }) {
  const { ref, inView } = useInView(0.2)

  return (
    <div ref={ref} className={cn('relative flex gap-4 md:gap-6', inView && 'animate-fade-in-up')} style={inView ? { animationDelay: `${step * 80}ms` } : { opacity: 0 }}>
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${roleColor}10`,
            borderColor: `${roleColor}25`,
            boxShadow: inView ? `0 0 20px ${roleColor}20` : 'none',
          }}
        >
          <Icon className="h-5 w-5 md:h-6 md:w-6" style={{ color: roleColor }} />
          <div
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: roleColor }}
          >
            {step}
          </div>
        </div>
        {step < totalSteps && (
          <div
            className="w-0.5 flex-1 min-h-[40px] mt-2"
            style={{ background: `linear-gradient(to bottom, ${roleColor}40, transparent)` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-8 flex-1">
        <h4 className="font-bold text-sm md:text-base text-white mb-1">{title}</h4>
        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed">{description}</p>
        {tip && (
          <div className="mt-2.5 flex items-start gap-2 p-2.5 rounded-lg glass-teal">
            <Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <span className="text-[11px] text-primary/90 leading-relaxed">{tip}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── FLOW DIAGRAM ──────────────────────────────────────────

function FlowDiagram({ steps, roleColor }: { steps: GuideStep[]; roleColor: string }) {
  return (
    <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
      <div className="flex items-center gap-2 min-w-max md:min-w-0 md:flex-wrap md:justify-center">
        {steps.map((s, idx) => (
          <div key={s.step} className="flex items-center gap-2">
            <div
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border min-w-[90px] md:min-w-[100px] text-center"
              style={{ backgroundColor: `${roleColor}08`, borderColor: `${roleColor}15` }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${roleColor}15` }}
              >
                <s.icon className="h-4 w-4" style={{ color: roleColor }} />
              </div>
              <span className="text-[10px] font-semibold text-white leading-tight">{s.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: `${roleColor}50` }} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ROLE GUIDE DETAIL ─────────────────────────────────────

function RoleGuideDetail({ role, onBack }: { role: RoleConfig; onBack: () => void }) {
  const content = GUIDE_CONTENT[role.id]
  const { ref: heroRef, inView: heroInView } = useInView()
  const { ref: featureRef, inView: featureInView } = useInView()
  const { ref: stepRef, inView: stepInView } = useInView()
  const { ref: tipRef, inView: tipInView } = useInView()
  const { ref: faqRef, inView: faqInView } = useInView()

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section ref={heroRef} className="relative py-16 md:py-24 overflow-hidden" style={{ background: `radial-gradient(ellipse at 50% 0%, ${role.bgGlow} 0%, transparent 60%)` }}>
        {/* Decorative blobs */}
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full blur-[100px] animate-blob" style={{ backgroundColor: `${role.color}08` }} />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full blur-[80px] animate-blob delay-2000" style={{ backgroundColor: `${role.color}05` }} />

        <div className="container mx-auto px-4 relative z-10">
          <Button
            variant="ghost"
            className="mb-8 text-muted-foreground hover:text-foreground gap-2 group"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Panduan
          </Button>

          <div className={cn('max-w-3xl', heroInView && 'animate-fade-in-up')}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border"
                style={{
                  background: `linear-gradient(135deg, ${role.color}20, ${role.color}08)`,
                  borderColor: `${role.color}30`,
                  boxShadow: `0 0 30px ${role.color}15`
                }}
              >
                <role.icon className="h-7 w-7 md:h-8 md:w-8" style={{ color: role.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white">{role.title}</h1>
                  <Badge className={cn('text-[10px] border', role.badgeClass)}>{role.id}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">{role.subtitle}</p>
              </div>
            </div>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">{content.overview}</p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <LayoutDashboard className="h-3.5 w-3.5" style={{ color: role.color }} />
                <span className="text-xs font-medium">{role.dashboard}</span>
              </div>
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-full">
                <Target className="h-3.5 w-3.5" style={{ color: role.color }} />
                <span className="text-xs font-medium">{role.accessScope}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Diagram */}
      <section className="py-8 bg-section-dark">
        <div className="container mx-auto px-4">
          <div className={cn('mb-4', heroInView && 'animate-fade-in-up delay-300')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              <MousePointerClick className="h-3 w-3" />
              Alur Kerja
            </div>
          </div>
          <FlowDiagram steps={content.steps} roleColor={role.color} />
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featureRef} className="py-16 md:py-20 bg-section-mesh">
        <div className="container mx-auto px-4">
          <div className={cn('text-center mb-10', featureInView && 'animate-fade-in-up')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              <Layers className="h-3 w-3" />
              Fitur
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Fitur <span className="gradient-text">yang Tersedia</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {content.features.map((feat, idx) => (
              <Card
                key={feat.title}
                className={cn(
                  'card-modern border-border/50 hover:border-border',
                  featureInView && 'animate-fade-in-up'
                )}
                style={featureInView ? { animationDelay: `${idx * 80}ms` } : { opacity: 0 }}
              >
                <CardContent className="p-5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 border"
                    style={{ backgroundColor: `${role.color}10`, borderColor: `${role.color}20` }}
                  >
                    <feat.icon className="h-5 w-5" style={{ color: role.color }} />
                  </div>
                  <h3 className="font-semibold text-sm text-white mb-1">{feat.title}</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{feat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section ref={stepRef} className="py-16 md:py-20 bg-section-dark">
        <div className="container mx-auto px-4">
          <div className={cn('text-center mb-12', stepInView && 'animate-fade-in-up')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              <BookOpen className="h-3 w-3" />
              Panduan Langkah
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Langkah demi <span className="gradient-text-gold">Langkah</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            {content.steps.map((step) => (
              <AnimatedStep
                key={step.step}
                {...step}
                totalSteps={content.steps.length}
                roleColor={role.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tips & Warnings */}
      <section ref={tipRef} className="py-16 md:py-20 bg-section-mesh">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Tips */}
            <div className={cn('space-y-4', tipInView && 'animate-fade-in-left')}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm gradient-text">Tips & Best Practices</h3>
              </div>
              {content.tips.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl glass-teal hover-lift">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>

            {/* Warnings */}
            <div className={cn('space-y-4', tipInView && 'animate-fade-in-right')}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-destructive/15 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <h3 className="font-bold text-sm text-destructive">Perhatian!</h3>
              </div>
              {content.warnings.map((warn, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 hover-lift">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span className="text-xs text-muted-foreground leading-relaxed">{warn}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section ref={faqRef} className="py-16 md:py-20 bg-section-dark">
        <div className="container mx-auto px-4">
          <div className={cn('text-center mb-10', faqInView && 'animate-fade-in-up')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              <HelpCircle className="h-3 w-3" />
              FAQ
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Pertanyaan <span className="gradient-text">Umum</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-2">
              {content.faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className={cn(
                    'border rounded-xl px-4 data-[state=open]:border-primary/30 data-[state=open]:glow-bsi transition-all',
                    'border-border/50 bg-card/50',
                    faqInView && 'animate-fade-in-up'
                  )}
                  style={faqInView ? { animationDelay: `${idx * 80}ms` } : { opacity: 0 }}
                >
                  <AccordionTrigger className="text-sm font-semibold text-left hover:no-underline hover:text-primary py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── MAIN USER GUIDE PAGE ──────────────────────────────────

export default function UserGuidePage() {
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null)
  const { goHome } = usePageStore()

  if (selectedRole) {
    return <RoleGuideDetail role={selectedRole} onBack={() => setSelectedRole(null)} />
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-section-radial">
        {/* Decorative */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/8 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/6 rounded-full blur-[100px] animate-blob delay-2000" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-fade-in-down">
            <div className="section-badge mb-5 mx-auto w-fit">
              <BookOpen className="h-3 w-3" />
              Panduan Pengguna
            </div>
          </div>

          <h1 className="animate-fade-in-up text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[0.95] mb-4">
            <span className="gradient-text">PANDUAN </span>
            <span className="gradient-text-white">PENGGUNA</span>
          </h1>

          <p className="animate-fade-in-up delay-150 text-muted-foreground text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-6">
            Pelajari cara menggunakan SeleEvent sesuai peran Anda. Dari pembelian tiket hingga pengelolaan event — semua ada di sini.
          </p>

          <div className="animate-fade-in-up delay-300 flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5 glass-teal px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">6 Peran</span>
            </div>
            <div className="flex items-center gap-1.5 glass-teal px-3 py-1.5 rounded-full">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">Step-by-step</span>
            </div>
            <div className="flex items-center gap-1.5 glass-teal px-3 py-1.5 rounded-full">
              <Lightbulb className="h-3.5 w-3.5 text-gold" />
              <span className="font-medium">Tips & FAQ</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selector */}
      <section className="py-16 md:py-20 bg-section-mesh">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge mb-4 mx-auto w-fit">
              <Users className="h-3 w-3" />
              Pilih Peran
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Pilih <span className="gradient-text-gold">Peran</span> Anda
            </h2>
            <p className="text-muted-foreground text-xs mt-2">Klik kartu untuk melihat panduan lengkap</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {ROLES.map((role, idx) => (
              <Card
                key={role.id}
                className={cn(
                  'card-modern cursor-pointer group border-border/50',
                  'hover:border-transparent'
                )}
                style={{
                  animationDelay: `${idx * 100}ms`,
                }}
                onClick={() => setSelectedRole(role)}
              >
                <CardContent className="p-6 relative overflow-hidden">
                  {/* Hover glow overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${role.bgGlow} 0%, transparent 70%)`
                    }}
                  />

                  <div className="relative z-10">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${role.color}20, ${role.color}08)`,
                          borderColor: `${role.color}25`,
                        }}
                      >
                        <role.icon className="h-7 w-7" style={{ color: role.color }} />
                      </div>
                      <Badge className={cn('text-[9px] border', role.badgeClass)}>
                        {role.accessScope}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-base text-white mb-1 group-hover:gradient-text transition-all">
                      {role.title}
                    </h3>
                    <p className="text-muted-foreground text-[11px] mb-3">{role.subtitle}</p>

                    {/* Description */}
                    <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">
                      {role.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{GUIDE_CONTENT[role.id].steps.length} langkah</span>
                      </div>
                      <div
                        className="flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
                        style={{ color: role.color }}
                      >
                        <span>Baca Panduan</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Reference - Wristband Colors */}
      <section className="py-16 md:py-20 bg-section-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge mb-4 mx-auto w-fit section-badge-gold">
              <Wristband className="h-3 w-3" />
              Referensi Cepat
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Warna <span className="gradient-text-gold">Gelang</span>
            </h2>
            <p className="text-muted-foreground text-xs mt-2">Mapping warna gelang per kategori tiket</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3 max-w-4xl mx-auto">
            {[
              { tier: 'VVIP PIT', color: 'Gold', hex: '#FFD700' },
              { tier: 'VIP ZONE', color: 'Teal', hex: '#00A39D' },
              { tier: 'FESTIVAL', color: 'Orange', hex: '#F8AD3C' },
              { tier: 'CAT 1', color: 'Merah', hex: '#EF4444' },
              { tier: 'CAT 2', color: 'Biru', hex: '#3B82F6' },
              { tier: 'CAT 3', color: 'Hijau', hex: '#22C55E' },
              { tier: 'CAT 4', color: 'Ungu', hex: '#A855F7' },
              { tier: 'CAT 5', color: 'Putih', hex: '#F8FAFC' },
              { tier: 'CAT 6', color: 'Kuning', hex: '#EAB308' },
            ].map((item, idx) => (
              <div
                key={item.tier}
                className="flex flex-col items-center gap-2 p-3 rounded-xl glass hover-lift text-center animate-fade-in-up"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white/10 shadow-lg"
                  style={{ backgroundColor: item.hex, boxShadow: `0 0 15px ${item.hex}40` }}
                />
                <span className="text-[10px] font-bold">{item.tier}</span>
                <span className="text-[9px] text-muted-foreground">{item.color}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture Overview */}
      <section className="py-16 md:py-20 bg-section-teal">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="section-badge mb-4 mx-auto w-fit">
              <Zap className="h-3 w-3" />
              Arsitektur
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              Cara <span className="gradient-text">Kerja Sistem</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-2">
              {/* Participant */}
              <div className="flex flex-col items-center text-center p-4 glass rounded-xl hover-lift w-full md:w-auto">
                <div className="w-12 h-12 rounded-xl bg-gray-500/15 flex items-center justify-center mb-2">
                  <Smartphone className="h-5 w-5 text-gray-400" />
                </div>
                <span className="text-xs font-bold text-white">Participant</span>
                <span className="text-[9px] text-muted-foreground">Beli & E-Tiket</span>
              </div>

              <ChevronRight className="h-5 w-5 text-primary/50 hidden md:block" />
              <ArrowRight className="h-5 w-5 text-primary/50 md:hidden" />

              {/* Counter */}
              <div className="flex flex-col items-center text-center p-4 glass-teal rounded-xl hover-lift w-full md:w-auto">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-2">
                  <ScanLine className="h-5 w-5 text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-white">Counter</span>
                <span className="text-[9px] text-muted-foreground">Redeem Gelang</span>
              </div>

              <ChevronRight className="h-5 w-5 text-primary/50 hidden md:block" />
              <ArrowRight className="h-5 w-5 text-primary/50 md:hidden" />

              {/* Gate */}
              <div className="flex flex-col items-center text-center p-4 glass-teal rounded-xl hover-lift w-full md:w-auto">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-2">
                  <DoorOpen className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-white">Gate</span>
                <span className="text-[9px] text-muted-foreground">Entry / Exit</span>
              </div>

              <ChevronRight className="h-5 w-5 text-gold/50 hidden md:block" />
              <ArrowRight className="h-5 w-5 text-gold/50 md:hidden" />

              {/* Venue */}
              <div className="flex flex-col items-center text-center p-4 glass-gold rounded-xl hover-lift w-full md:w-auto">
                <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center mb-2">
                  <Music className="h-5 w-5 text-gold" />
                </div>
                <span className="text-xs font-bold text-white">Venue</span>
                <span className="text-[9px] text-muted-foreground">Nikmati Konser!</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed max-w-md mx-auto">
              Alur: Peserta membeli tiket → menukar gelang di Counter → scan masuk di Gate → menikmati konser di Venue. Organizer & Admin memantau seluruh proses secara real-time.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 md:py-20 bg-section-dark">
        <div className="container mx-auto px-4 text-center">
          <Sparkles className="h-8 w-8 text-gold mx-auto mb-4 animate-float" />
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Siap Memulai?
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Kembali ke halaman utama untuk mulai membeli tiket atau login ke dashboard Anda.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              className="btn-shine rounded-full px-8 glow-gold-strong"
              onClick={goHome}
            >
              <Ticket className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
