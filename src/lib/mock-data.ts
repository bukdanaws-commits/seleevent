export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  mapUrl: string;
  image: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  quota: number;
  sold: number;
  benefits: string[];
  emoji: string;
  tier: 'floor' | 'tribun';
  zone?: string;
}

export interface EventData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  date: string;
  day: string;
  month: string;
  year: number;
  time: string;
  doorsOpen: string;
  venue: Venue;
  ticketTypes: TicketType[];
  lineup: string[];
  highlights: string[];
  terms: string[];
  status: "published" | "draft" | "sold_out";
  posterUrl: string;
  bannerUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
}

export interface Attendee {
  name: string;
  email: string;
  phone: string;
  ticketTypeId: string;
}

export interface OrderItem {
  ticketTypeId: string;
  ticketTypeName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderCode: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventCity: string;
  items: OrderItem[];
  attendees: Attendee[];
  totalAmount: number;
  status: "pending" | "paid" | "rejected" | "cancelled" | "expired";
  paymentMethod: string;
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  proofUploadedAt?: string;
  rejectionReason?: string;
  tickets: Ticket[];
}

export interface Ticket {
  id: string;
  ticketCode: string;
  orderItemId: string;
  ticketTypeName: string;
  attendeeName: string;
  attendeeEmail: string;
  status: "active" | "redeemed" | "used" | "cancelled";
  qrData: string;
  redeemedAt?: string;
  wristbandCode?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: "pembelian" | "pembayaran" | "hari-h" | "umum";
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

export const mockUser: User = {
  id: "user-001",
  name: "Budi Santoso",
  email: "budi.santoso@gmail.com",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Budi",
  phone: "081234567890",
};

export const mockVenue: Venue = {
  id: "venue-jkt",
  name: "GBK Madya Stadium",
  city: "Jakarta",
  address: "Jl. Gatot Subroto, Senayan, Kebayoran Baru, Jakarta Pusat 10270",
  capacity: 18800,
  mapUrl: "https://maps.google.com/?q=GBK+Madya+Stadium+Jakarta",
  image: "/images/concert/venue-layout.png",
};

export const mockEvent: EventData = {
  id: "event-jkt-001",
  slug: "sheila-on7-jakarta",
  title: "Sheila On 7 — JAKARTA",
  subtitle: "Melompat Lebih Tinggi Tour 2025",
  tagline: "Melompat Lebih Tinggi",
  date: "2025-05-24",
  day: "Sabtu",
  month: "Mei",
  year: 2025,
  time: "19:00 WIB",
  doorsOpen: "16:00 WIB",
  venue: mockVenue,
  ticketTypes: [
    {
      id: "tt-vvip",
      eventId: "event-jkt-001",
      name: "VVIP PIT",
      description: "Standing paling depan — barisan depan panggung",
      price: 3500000,
      priceLabel: "3,5 Juta",
      quota: 300,
      sold: 247,
      benefits: [
        "Standing paling depan (barrier VVIP)",
        "Welcome drink + F&B gratis sepuasnya",
        "Exclusive merchandise pack (T-shirt + Poster)",
        "Early entry 30 menit sebelum gate buka",
        "Wristband premium (gold embossed)",
        "Meet & Greet session sebelum konser",
        "Photobooth area eksklusif",
        "Lounge area dengan sofa dan AC",
      ],
      emoji: "👑",
      tier: "floor",
      zone: "VVIP Pit",
    },
    {
      id: "tt-vip",
      eventId: "event-jkt-001",
      name: "VIP ZONE",
      description: "Standing VIP — di belakang VVIP Pit",
      price: 2800000,
      priceLabel: "2,8 Juta",
      quota: 500,
      sold: 412,
      benefits: [
        "Standing zone VIP (di belakang VVIP)",
        "Dedicated bar & food stall",
        "Merchandise discount 20%",
        "Early entry 15 menit",
        "Wristband VIP (teal embossed)",
      ],
      emoji: "⭐",
      tier: "floor",
      zone: "VIP Zone",
    },
    {
      id: "tt-festival",
      eventId: "event-jkt-001",
      name: "FESTIVAL",
      description: "General admission standing — bebas pilih posisi",
      price: 2200000,
      priceLabel: "2,2 Juta",
      quota: 3000,
      sold: 2150,
      benefits: [
        "General admission standing area",
        "Bebas pilih posisi dalam area festival",
        "Akses food court & merchandise area",
      ],
      emoji: "🎵",
      tier: "floor",
      zone: "Festival Zone",
    },
    {
      id: "tt-cat1",
      eventId: "event-jkt-001",
      name: "CAT 1",
      description: "Tribun Bawah Kiri — kursi bernomor",
      price: 1750000,
      priceLabel: "1,75 Juta",
      quota: 2000,
      sold: 1780,
      benefits: [
        "Kursi bernomor (assigned seating)",
        "Tribun bawah kiri — view premium",
        "Pemandangan stage jelas",
        "Akses food court & merchandise",
      ],
      emoji: "🎟️",
      tier: "tribun",
      zone: "Tribun Bawah Kiri",
    },
    {
      id: "tt-cat2",
      eventId: "event-jkt-001",
      name: "CAT 2",
      description: "Tribun Tengah Kiri — kursi bernomor",
      price: 1400000,
      priceLabel: "1,4 Juta",
      quota: 3000,
      sold: 2410,
      benefits: [
        "Kursi bernomor (assigned seating)",
        "Tribun tengah kiri — view baik",
        "Akses food court & merchandise",
      ],
      emoji: "🎫",
      tier: "tribun",
      zone: "Tribun Tengah Kiri",
    },
    {
      id: "tt-cat3",
      eventId: "event-jkt-001",
      name: "CAT 3",
      description: "Tribun Tengah Kanan — kursi bernomor",
      price: 1100000,
      priceLabel: "1,1 Juta",
      quota: 3000,
      sold: 1950,
      benefits: [
        "Kursi bernomor (assigned seating)",
        "Tribun tengah kanan — view baik",
        "Akses food court & merchandise",
      ],
      emoji: "🎫",
      tier: "tribun",
      zone: "Tribun Tengah Kanan",
    },
    {
      id: "tt-cat4",
      eventId: "event-jkt-001",
      name: "CAT 4",
      description: "Tribun Atas Kanan — kursi bernomor",
      price: 850000,
      priceLabel: "850 Ribu",
      quota: 4000,
      sold: 2680,
      benefits: [
        "Kursi bernomor (assigned seating)",
        "Tribun atas kanan",
        "Akses food court & merchandise",
      ],
      emoji: "🎟️",
      tier: "tribun",
      zone: "Tribun Atas Kanan",
    },
    {
      id: "tt-cat5",
      eventId: "event-jkt-001",
      name: "CAT 5",
      description: "Tribun Ujung Belakang — kursi bernomor",
      price: 550000,
      priceLabel: "550 Ribu",
      quota: 3000,
      sold: 1520,
      benefits: [
        "Kursi bernomor (assigned seating)",
        "Tribun ujung belakang",
        "Akses food court & merchandise",
      ],
      emoji: "🎟️",
      tier: "tribun",
      zone: "Tribun Ujung",
    },
  ],
  lineup: [
    "Sheila On 7",
    "Duta (Vocal)",
    "Adam (Keyboard)",
    "Eross (Guitar)",
    "Brian (Drums)",
    "Special Guest TBA",
  ],
  highlights: [
    "Konser terbesar Sheila On 7 tahun 2025",
    "18.800 kapasitas penonton — GBK Madya Stadium",
    "Setlist spesial 25+ lagu hits sepanjang masa",
    "Stage production kelas internasional",
    "Pyrotechnic, laser & LED wall spectacular",
    "Meet & Greet eksklusif untuk VVIP",
  ],
  terms: [
    "Tiket yang sudah dibeli tidak dapat dikembalikan (no refund).",
    "Pembelian maksimal 5 tiket per transaksi.",
    "Peserta wajib membawa e-tiket (QR Code) dan identitas yang sesuai.",
    "Penukaran e-tiket dengan gelang wajib dilakukan di booth redeem sebelum masuk venue.",
    "Gelang yang sudah dipasangkan tidak dapat dipindahkan ke orang lain.",
    "Dilarang membawa makanan dan minuman dari luar.",
    "Dilarang membawa senjata tajam, bahan mudah terbakar, dan benda berbahaya lainnya.",
    "Panitia berhak menolak penonton yang melanggar syarat dan ketentuan.",
  ],
  status: "published",
  posterUrl: "/images/concert/hero-banner.png",
  bannerUrl: "/images/concert/hero-banner.png",
};

export const mockOrders: Order[] = [
  {
    id: "order-001",
    orderCode: "SHL-JKT-20250524-A1B2C",
    userId: "user-001",
    eventId: "event-jkt-001",
    eventTitle: "Sheila On 7 — JAKARTA",
    eventDate: "24 Mei 2025",
    eventCity: "Jakarta",
    items: [
      {
        ticketTypeId: "tt-cat1",
        ticketTypeName: "CAT 1",
        quantity: 2,
        price: 1750000,
        subtotal: 3500000,
      },
    ],
    attendees: [
      {
        name: "Budi Santoso",
        email: "budi.santoso@gmail.com",
        phone: "081234567890",
        ticketTypeId: "tt-cat1",
      },
      {
        name: "Sari Dewi",
        email: "sari.dewi@gmail.com",
        phone: "081298765432",
        ticketTypeId: "tt-cat1",
      },
    ],
    totalAmount: 3500000,
    status: "paid",
    paymentMethod: "QRIS - BSI",
    createdAt: "2025-05-23T14:20:00+07:00",
    expiresAt: "2025-05-23T16:20:00+07:00",
    paidAt: "2025-05-23T14:35:00+07:00",
    proofUploadedAt: "2025-05-23T14:23:00+07:00",
    tickets: [
      {
        id: "tkt-001",
        ticketCode: "SHL-JKT-CAT1-0001",
        orderItemId: "tt-cat1",
        ticketTypeName: "CAT 1",
        attendeeName: "Budi Santoso",
        attendeeEmail: "budi.santoso@gmail.com",
        status: "active",
        qrData: "SHL-JKT-CAT1-0001|budi.santoso@gmail.com|active",
      },
      {
        id: "tkt-002",
        ticketCode: "SHL-JKT-CAT1-0002",
        orderItemId: "tt-cat1",
        ticketTypeName: "CAT 1",
        attendeeName: "Sari Dewi",
        attendeeEmail: "sari.dewi@gmail.com",
        status: "active",
        qrData: "SHL-JKT-CAT1-0002|sari.dewi@gmail.com|active",
      },
    ],
  },
  {
    id: "order-002",
    orderCode: "SHL-JKT-20250524-D4E5F",
    userId: "user-001",
    eventId: "event-jkt-001",
    eventTitle: "Sheila On 7 — JAKARTA",
    eventDate: "24 Mei 2025",
    eventCity: "Jakarta",
    items: [
      {
        ticketTypeId: "tt-vvip",
        ticketTypeName: "VVIP PIT",
        quantity: 1,
        price: 3500000,
        subtotal: 3500000,
      },
    ],
    attendees: [
      {
        name: "Budi Santoso",
        email: "budi.santoso@gmail.com",
        phone: "081234567890",
        ticketTypeId: "tt-vvip",
      },
    ],
    totalAmount: 3500000,
    status: "pending",
    paymentMethod: "QRIS - BSI",
    createdAt: "2025-05-24T10:00:00+07:00",
    expiresAt: "2025-05-24T12:00:00+07:00",
    tickets: [],
  },
];

export const mockFAQs: FAQ[] = [
  {
    id: "faq-1",
    question: "Bagaimana cara membeli tiket?",
    answer:
      "Klik tombol 'Beli Tiket' di halaman utama, login dengan akun Google, pilih kategori dan jumlah tiket, isi data peserta, lalu lakukan pembayaran melalui QRIS. Setelah pembayaran diverifikasi, e-tiket akan otomatis tersedia di halaman 'Tiket Saya'.",
    category: "pembelian",
  },
  {
    id: "faq-2",
    question: "Berapa batas maksimal pembelian tiket?",
    answer:
      "Maksimal 5 tiket per transaksi. Jika Anda ingin membeli lebih dari 5 tiket, silakan lakukan transaksi terpisah.",
    category: "pembelian",
  },
  {
    id: "faq-3",
    question: "Apa metode pembayaran yang diterima?",
    answer:
      "Kami menerima pembayaran melalui QRIS (GoPay, OVO, Dana, ShopeePay, LinkAja) dan transfer bank melalui QR code. Pastikan nominal transfer sesuai dengan total yang tertera.",
    category: "pembayaran",
  },
  {
    id: "faq-4",
    question: "Berapa lama proses verifikasi pembayaran?",
    answer:
      "Verifikasi pembayaran dilakukan secara manual oleh tim kami. Estimasi waktu verifikasi adalah 5-30 menit pada jam kerja (09:00-21:00 WIB). Pada peak hours, verifikasi bisa memakan waktu lebih lama.",
    category: "pembayaran",
  },
  {
    id: "faq-5",
    question: "Bagaimana jika pembayaran saya ditolak?",
    answer:
      "Jika pembayaran ditolak, Anda akan menerima notifikasi berisi alasan penolakan. Anda dapat mengupload ulang bukti pembayaran yang benar melalui halaman detail pesanan.",
    category: "pembayaran",
  },
  {
    id: "faq-6",
    question: "Apa yang harus dibawa ke venue pada hari H?",
    answer:
      "Bawa e-tiket (QR Code) yang ditampilkan di aplikasi, identitas (KTP/SIM/Paspor) sesuai data pemesanan, dan pastikan sudah melakukan penukaran gelang di booth redeem sebelum masuk gate.",
    category: "hari-h",
  },
  {
    id: "faq-7",
    question: "Kapan harus datang ke venue?",
    answer:
      "Pintu venue dibuka pukul 16:00 WIB. Kami menyarankan untuk datang minimal 2 jam sebelum konser dimulai (pukul 17:00 WIB) untuk menghindari antrean panjang di booth redeem dan gate.",
    category: "hari-h",
  },
  {
    id: "faq-8",
    question: "Apa itu gelang (wristband) dan bagaimana mendapatkannya?",
    answer:
      "Gelang adalah identitas masuk venue Anda. Setelah pembayaran diverifikasi, tunjukkan e-tiket (QR Code) di booth redeem yang tersedia di sekitar venue. Crew kami akan memasangkan gelang secara langsung. Gelang wajib dikenakan untuk masuk area konser.",
    category: "hari-h",
  },
  {
    id: "faq-9",
    question: "Apakah tiket bisa ditransfer ke orang lain?",
    answer:
      "Tiket bersifat personal dan tidak dapat ditransfer. Nama peserta yang tertera di tiket harus sesuai dengan identitas yang dibawa saat redeem gelang.",
    category: "umum",
  },
  {
    id: "faq-10",
    question: "Apakah ada refund jika event dibatalkan?",
    answer:
      "Jika event dibatalkan oleh penyelenggara, 100% pembayaran akan dikembalikan ke rekening asal. Jika event ditunda, tiket tetap berlaku untuk tanggal reschedule. Proses refund membutuhkan waktu 7-14 hari kerja.",
    category: "umum",
  },
];

export const venueFacilities = [
  { name: "Food Court", description: "Berbagai pilihan makanan dan minuman", icon: "🍽️" },
  { name: "Merchandise", description: "Official merchandise Sheila On 7", icon: "👕" },
  { name: "Toilet & Mushola", description: "Tersedia di berbagai titik venue", icon: "🚻" },
  { name: "Parkir", description: "Motor & Mobil dengan kapasitas luas", icon: "🅿️" },
  { name: "Medical Tent", description: "Tim medis siaga 24 jam", icon: "🏥" },
  { name: "Photo Spot", description: "Area foto Instagramable", icon: "📸" },
  { name: "Smoking Area", description: "Area khusus merokok", icon: "🚬" },
  { name: "ATM Centre", description: "ATM BCA, Mandiri, BNI, BRI, BSI", icon: "🏧" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// Accepts either a tier ID (string) or a TicketType object
export function getAvailableQuota(ttOrId: string | TicketType): number {
  if (typeof ttOrId === 'string') {
    const tt = mockEvent.ticketTypes.find((t) => t.id === ttOrId);
    return tt ? Math.max(0, tt.quota - tt.sold) : 0;
  }
  return Math.max(0, ttOrId.quota - ttOrId.sold);
}

// Accepts either a tier ID (string) or a TicketType object
export function getQuotaPercentage(ttOrId: string | TicketType): number {
  if (typeof ttOrId === 'string') {
    const tt = mockEvent.ticketTypes.find((t) => t.id === ttOrId);
    return tt ? Math.round((tt.sold / tt.quota) * 100) : 0;
  }
  return Math.round((ttOrId.sold / ttOrId.quota) * 100);
}

export function getQuotaStatus(ttOrId: string | TicketType): {
  label: string;
  color: "green" | "yellow" | "red";
} {
  const available = getAvailableQuota(ttOrId);
  const percentage = getQuotaPercentage(ttOrId);
  if (available === 0) return { label: "Habis Terjual", color: "red" };
  if (percentage >= 80) return { label: `Sisa ${available}`, color: "yellow" };
  return { label: `Sisa ${available}`, color: "green" };
}

export function generateTicketCode(eventCode: string, ticketType: string, index: number): string {
  const idx = String(index).padStart(4, "0");
  return `${eventCode}-${ticketType.toUpperCase()}-${idx}`;
}

export function generateQRData(ticketCode: string, email: string, status: string): string {
  return `${ticketCode}|${email}|${status}`;
}

// ─── LANDING PAGE EXPORTS (derived from existing data) ─────────────────────────

export const EVENT = {
  title: mockEvent.title,
  subtitle: mockEvent.subtitle,
  tagline: mockEvent.tagline,
  date: mockEvent.date,
  time: mockEvent.time.replace(' WIB', ''),
  dayOfWeek: mockEvent.day,
  venue: mockEvent.venue.name,
  address: mockEvent.venue.address,
  city: mockEvent.venue.city,
  capacity: mockEvent.venue.capacity,
  artist: 'Sheila On 7',
  fansName: 'Sobat Duta',
  sponsor: 'BSI',
  status: 'active' as const,
};

export const TICKET_TIERS = mockEvent.ticketTypes.map((tt) => ({
  id: tt.id,
  name: tt.name,
  zone: tt.tier,
  price: tt.price,
  quota: tt.quota,
  sold: tt.sold,
  benefits: tt.benefits,
  emoji: tt.emoji,
  description: tt.description,
}));

export const FAQS = mockFAQs.map((f) => ({
  question: f.question,
  answer: f.answer,
}));

export const VENUE_FACILITIES = venueFacilities.map((f) => ({
  icon: f.icon,
  name: f.name,
}));

export const BAND_MEMBERS = [
  { name: 'Duta', role: 'Vokal', emoji: '🎤', image: '/images/band/vocalist-duta-v2.jpg', description: 'Sang vokalis karismatik yang menjadi ikon Sheila On 7 selama lebih dari 2 dekade.' },
  { name: 'Adam', role: 'Keyboard', emoji: '🎹', image: '/images/band/keyboar.jpg', description: 'Maestro keyboard yang mengisi melodi dan harmoni khas Sheila On 7.' },
  { name: 'Eross', role: 'Gitar', emoji: '🎸', image: '/images/band/gitaris.jpg', description: 'Gitaris utama yang menciptakan riff-riff ikonik di setiap lagu hits.' },
  { name: 'Brian', role: 'Drum', emoji: '🥁', image: '/images/band/drumer.jpg', description: 'Drummer enerjik yang menjadi beat andalan di setiap penampilan live.' },
];

export const SPECIAL_GUEST = {
  name: 'TBA',
  role: 'Special Guest',
  emoji: '🎤',
  image: '/images/band/tba-guest-v2.jpg',
  tagline: 'Akan segera diumumkan',
  badge: 'SPECIAL GUEST',
};

export const HIGHLIGHTS = [
  { emoji: '🎵', title: '30+ Hits Legendaris', description: 'Dari Sheila On 7, Dan, Peephole, hingga single terbaru' },
  { emoji: '🤝', title: 'Meet & Greet VVIP', description: 'Kesempatan bertemu langsung Sheila On 7 (VVIP PIT)' },
  { emoji: '🎤', title: 'Sing Along', description: 'Lantangkan suara bersama ribuan Sobat Duta' },
  { emoji: '🔥', title: 'Stage Megah', description: 'Panggung spektakuler dengan efek visual terbaik' },
  { emoji: '📸', title: 'Photo Booth', description: 'Momen berkesan dengan latar konser yang ikonik' },
  { emoji: '🍜', title: 'Food Festival', description: 'Berbagai pilihan kuliner di area food court' },
];

// ─── OVERLOADED HELPERS (accept string id OR TicketType object) ───────────────
// Already defined above — getAvailableQuota and getQuotaPercentage accept both types
