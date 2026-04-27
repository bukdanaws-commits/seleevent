'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import {
  Music,
  ChevronDown,
  MapPin,
  Calendar,
  Clock,
  Users,
  Ticket,
  Sparkles,
  Shield,
  Star,
  Check,
  ArrowRight,
  Heart,
  Mic2,
  Zap,
  Camera,
  Flame,
  Utensils,
  Handshake,
  Volume2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  TICKET_TIERS,
  FAQS,
  VENUE_FACILITIES,
  BAND_MEMBERS,
  SPECIAL_GUEST,
  HIGHLIGHTS,
  getAvailableQuota,
  getQuotaPercentage,
} from '@/lib/mock-data'
import { useEvent, useTicketTypes } from '@/hooks/use-api'
import { formatRupiah as formatRupiahUtil } from '@/lib/utils'
import { SeatSelectionModal } from '@/components/seat/SeatSelectionModal'
import { AutoAssignModal } from '@/components/seat/AutoAssignModal'
import { defaultSeatConfigs, getSelectionModeLabel } from '@/lib/seat-data'
import { GoogleLoginModal } from '@/components/GoogleLoginModal'
import { useAuthStore } from '@/lib/auth-store'
import { usePageStore } from '@/lib/page-store'

// Use formatRupiah from utils (API-aware)
const formatRupiah = formatRupiahUtil

// Lazy imports for page views
import dynamic from 'next/dynamic'
const CheckoutPage = dynamic(() => import('@/components/pages/checkout-page'), { ssr: false })
const PaymentPage = dynamic(() => import('@/components/pages/payment-page'), { ssr: false })
const PaymentStatusPage = dynamic(() => import('@/components/pages/payment-status-page'), { ssr: false })
const ETicketPage = dynamic(() => import('@/components/pages/eticket-page'), { ssr: false })
const MyOrdersPage = dynamic(() => import('@/components/pages/my-orders-page'), { ssr: false })
const ProfilePage = dynamic(() => import('@/components/pages/profile-page'), { ssr: false })

// ─── Intersection Observer Hook ────────────────────────────
function useInView(threshold = 0.15) {
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

// ─── Highlight Images Map ──────────────────────────────────
const HIGHLIGHT_IMAGES: Record<string, string> = {
  '30+ Hits Legendaris': '/images/sections/highlight-crowd.png',
  'Meet & Greet VVIP': '/images/sections/highlight-vvip.png',
  'Sing Along': '/images/sections/highlight-crowd.png',
  'Stage Megah': '/images/sections/highlight-stage.png',
  'Photo Booth': '/images/sections/highlight-photobooth.png',
  'Food Festival': '/images/sections/highlight-food.png',
}

const HIGHLIGHT_ICONS: Record<string, any> = {
  '30+ Hits Legendaris': Volume2,
  'Meet & Greet VVIP': Handshake,
  'Sing Along': Mic2,
  'Stage Megah': Flame,
  'Photo Booth': Camera,
  'Food Festival': Utensils,
}

// ─────────────────────────────────────────────────────────
// Section 1 — Hero
// ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero image background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/sections/hero-banner.png"
          alt="Sheila On 7 Concert"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="hero-gradient absolute inset-0" />
      </div>

      {/* Animated teal blob */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/8 rounded-full blur-[100px] animate-blob delay-2000" />

      <div className="container mx-auto px-4 relative z-10 text-center py-32">
        {/* Pre-title */}
        <div className="animate-fade-in-down">
          <div className="inline-flex items-center gap-2 mb-6 mx-auto w-fit px-5 py-2 rounded-full text-base sm:text-lg font-bold tracking-widest uppercase text-white border border-[#00A39D]/50 bg-[#00A39D]/80">
            <Music className="h-4 w-4" />
            Sheila On 7
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-hero animate-fade-in-up text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-4">
          <span className="gradient-text-gold">MELOMPAT </span>
          <span className="gradient-text-white">LEBIH TINGGI</span>
        </h1>

        {/* Subtitle */}
        <p className="animate-fade-in-up delay-150 text-lg sm:text-2xl md:text-3xl text-white font-semibold mt-6 mb-2 tracking-wide">
          Tour 2025 — Jakarta
        </p>

        {/* Date & Venue */}
        <div className="animate-fade-in-up delay-300 flex items-center justify-center gap-3 text-sm text-white mt-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00A39D]/50 bg-[#00A39D]/80 animate-pulse-glow">
            <Calendar className="h-4 w-4 text-white" />
            <span className="font-semibold">24 MEI 2025</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#00A39D]/50 bg-[#00A39D]/80 animate-pulse-glow">
            <MapPin className="h-4 w-4 text-white" />
            <span className="font-semibold">GBK Madya Stadium</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up delay-500 flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <Button
            size="lg"
            className="btn-shine text-sm px-8 h-11 rounded-full glow-bsi-strong animate-pulse-glow"
            onClick={() => {
              const el = document.querySelector('#tickets')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Beli Tiket Sekarang
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-sm px-8 h-11 rounded-full glass animate-pulse-glow"
            onClick={() => {
              const el = document.querySelector('#venue')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Lihat Venue
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40" />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 2 — Brand Story
// ─────────────────────────────────────────────────────────
function BrandStorySection() {
  const { ref, inView } = useInView()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-section-mesh" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className={cn(inView && 'animate-fade-in-up')}>
            <div className="section-badge mb-5 mx-auto w-fit">
              <Music className="h-3 w-3" />
              Tentang Konser
            </div>
          </div>

          <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold mb-5', inView && 'animate-fade-in-up delay-100')}>
            Bersama <span className="gradient-text">Sobat Duta</span>
          </h2>

          <p className={cn('text-muted-foreground text-sm sm:text-base leading-relaxed', inView && 'animate-fade-in-up delay-200')}>
            Setelah lebih dari dua dekade mewarnai industri musik Indonesia, Sheila On 7
            kembali dengan konser spektakuler <strong className="text-foreground">Melompat Lebih Tinggi</strong>.
            Sebuah pengalaman konser yang dirancang khusus untuk Sobat Duta — dari hits legendaris
            seperti <em>Dan</em>, <em>Peephole</em>, <em>Sephia</em>, hingga <em>Anugerah Terindah</em>,
            semuanya akan dibawakan dengan penampilan panggung terbaik.
          </p>

          <p className={cn('text-muted-foreground text-sm sm:text-base leading-relaxed mt-3', inView && 'animate-fade-in-up delay-300')}>
            Malam itu bukan sekadar konser — ini adalah perayaan nostalgia, persahabatan,
            dan cinta musik yang melintasi generasi. Bersama ribuan Sobat Duta,
            kita akan melompat lebih tinggi.
          </p>

          <div className={cn('flex items-center justify-center gap-4 mt-7 text-xs text-muted-foreground flex-wrap', inView && 'animate-fade-in-up delay-400')}>
            {[
              { icon: Sparkles, label: '30+ Hits', color: 'text-gold' },
              { icon: Users, label: '18.800 Kursi', color: 'text-primary' },
              { icon: Music, label: '1 Malam', color: 'text-primary' },
              { icon: Zap, label: 'Full Production', color: 'text-gold' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 glass-teal px-3 py-1.5 rounded-full">
                <item.icon className={cn('h-3.5 w-3.5', item.color)} />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute top-10 right-10 w-32 h-32 dot-pattern opacity-30 rounded-full" />
      <div className="absolute bottom-10 left-10 w-24 h-24 dot-pattern-gold opacity-20 rounded-full" />
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 3 — Lineup
// ─────────────────────────────────────────────────────────
function LineupSection() {
  const { ref, inView } = useInView()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-section-teal" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-14">
          <div className={cn(inView && 'animate-fade-in-up')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              <Star className="h-3 w-3" />
              Artis
            </div>
          </div>
          <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', inView && 'animate-fade-in-up delay-100')}>
            <span className="gradient-text">LINEUP</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Musisi legendaris yang siap menggebrak malam ini
          </p>
        </div>

        {/* Band Members Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7 max-w-4xl mx-auto">
          {BAND_MEMBERS.map((member, idx) => (
            <div
              key={member.name}
              className={cn('group flex flex-col items-center text-center', inView && 'animate-fade-in-up')}
              style={inView ? { animationDelay: `${150 + idx * 120}ms` } : undefined}
            >
              {/* Photo Container */}
              <div className="relative mb-4">
                {/* Sonar ring */}
                <div className={cn(
                  'absolute -inset-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700',
                  idx === 0 ? 'animate-sonar bg-gold/20' : 'animate-sonar bg-primary/20'
                )} style={{ animationDelay: `${idx * 200}ms` }} />

                {/* Gradient ring */}
                <div className={cn(
                  'absolute -inset-1 rounded-full opacity-60 group-hover:opacity-100 transition-all duration-500 blur-[1px]',
                  idx === 0
                    ? 'bg-gradient-to-br from-gold via-amber-400 to-gold'
                    : 'bg-gradient-to-br from-primary via-teal-400 to-primary'
                )} />

                {/* Photo */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-card img-zoom">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 128px, 144px"
                  />
                </div>

                {/* Role badge */}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2">
                  <Badge className={cn(
                    'text-[9px] px-2 py-0.5 rounded-full font-semibold shadow-lg',
                    idx === 0
                      ? 'bg-gold text-gold-foreground'
                      : 'bg-primary text-primary-foreground'
                  )}>
                    {member.emoji} {member.role}
                  </Badge>
                </div>
              </div>

              {/* Name */}
              <h3 className={cn(
                'font-bold text-sm tracking-wide',
                idx === 0 && 'gradient-text-gold text-base'
              )}>
                {member.name}
              </h3>

              {/* Description */}
              <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed max-w-[160px]">
                {member.description}
              </p>
            </div>
          ))}
        </div>

        {/* Special Guest — Mystery Card */}
        <div className={cn('mt-12 max-w-xs mx-auto w-full', inView && 'animate-scale-in delay-700')}>
          <div className="group relative rounded-2xl border border-dashed border-gold/25 hover:border-gold/50 glass-gold transition-all duration-500 p-6 text-center overflow-hidden hover-lift">
            {/* Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(248,173,60,0.06)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
              <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden img-zoom">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-gold/50 via-amber-500/30 to-gold/50 rounded-full blur-[1px]" />
                <div className="relative w-full h-full rounded-full overflow-hidden">
                  <Image
                    src={SPECIAL_GUEST.image}
                    alt="Special Guest"
                    fill
                    className="object-cover object-center blur-md brightness-75 group-hover:blur-sm transition-all duration-700"
                    sizes="80px"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic2 className="h-7 w-7 text-gold/70 group-hover:text-gold transition-colors duration-500" />
                </div>
              </div>

              <Badge className="mb-2 bg-gold text-gold-foreground hover:bg-gold/90 text-[10px] tracking-wider">
                SPECIAL GUEST
              </Badge>
              <h3 className="font-bold text-sm text-gold tracking-wide">TBA</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Akan segera diumumkan</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 4 — Tickets Floor Zone
// ─────────────────────────────────────────────────────────
function TicketsFloorSection({ onBuy }: { onBuy: (tierId: string, tierName: string, emoji: string, price: number) => void }) {
  const { ref, inView } = useInView()
  const floorTiers = TICKET_TIERS.filter((t) => t.zone === 'floor')

  return (
    <section id="tickets" className="py-20 md:py-28 relative overflow-hidden" ref={ref}>
      {/* Floor zone image background */}
      <div className="absolute inset-0 z-0 opacity-[0.08]">
        <Image src="/images/sections/floor-zone.png" alt="" fill className="object-cover" sizes="100vw" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-[1]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className={cn(inView && 'animate-fade-in-up')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              <Ticket className="h-3 w-3" />
              Tiket
            </div>
          </div>
          <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', inView && 'animate-fade-in-up delay-100')}>
            <span className="gradient-text-gold">PILIHKAN</span> TIKETMU
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Floor Zone</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 max-w-4xl mx-auto">
          {floorTiers.map((tier, idx) => {
            const isVVIP = tier.id === 'vvip-pit'
            const pct = getQuotaPercentage(tier.id)
            const available = getAvailableQuota(tier.id)

            return (
              <Card
                key={tier.id}
                className={cn(
                  'card-modern group relative overflow-hidden',
                  isVVIP ? 'border-gold/30 animate-pulse-glow-gold' : 'border-border',
                  inView && 'animate-fade-in-up'
                )}
                style={inView ? { animationDelay: `${200 + idx * 150}ms` } : undefined}
              >
                {/* Exclusive badge */}
                {isVVIP && (
                  <div className="absolute top-0 right-0 z-10">
                    <div className="bg-gold text-gold-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                      EXCLUSIVE
                    </div>
                  </div>
                )}

                <CardHeader className="text-center pb-0">
                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-500">{tier.emoji}</div>
                  <CardTitle className={cn('text-base', isVVIP && 'gradient-text-gold')}>
                    {tier.name}
                  </CardTitle>
                  <CardDescription className="text-xs">{tier.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-4 pb-5">
                  {/* Price */}
                  <div className="text-center mb-3">
                    <span className={cn(
                      'text-2xl font-black',
                      isVVIP ? 'gradient-text-gold' : 'gradient-text-white'
                    )}>
                      {formatRupiah(tier.price)}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-1">/orang</span>
                  </div>

                  {/* Quota progress */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Sisa {available} kursi</span>
                      <span className={cn(pct >= 90 ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
                        {pct}% terjual
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className={cn('h-1.5', isVVIP && '[&>div]:bg-gold')}
                    />
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-1.5 mb-5">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs">
                        <Check className={cn('h-3 w-3 shrink-0 mt-0.5', isVVIP ? 'text-gold' : 'text-primary')} />
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button
                    className={cn(
                      'w-full rounded-full h-10 text-xs btn-shine glow-gold-strong',
                    )}
                    variant="default"
                    disabled={available === 0}
                    onClick={() => {
                      if (available === 0) { toast.error('Maaf, tiket sudah habis!'); return }
                      onBuy(tier.id, tier.name, tier.emoji, tier.price)
                    }}
                  >
                    {available === 0 ? 'Habis Terjual' : 'Pilih Kursi'}
                    {available > 0 && <ArrowRight className="ml-1.5 h-3.5 w-3.5" />}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 5 — Tickets Tribun Zone
// ─────────────────────────────────────────────────────────
function TicketsTribunSection({ onBuy }: { onBuy: (tierId: string, tierName: string, emoji: string, price: number) => void }) {
  const { ref, inView } = useInView()
  const tribunTiers = TICKET_TIERS.filter((t) => t.zone === 'tribun')

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-section-diagonal" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className={cn('text-xl sm:text-2xl font-bold', inView && 'animate-fade-in-up')}>
            <span className="gradient-text">Tribun</span> Zone
          </h2>
          <p className="text-muted-foreground mt-1.5 text-xs">Pilihan kursi tribun untuk semua Sobat Duta</p>
        </div>

        {/* Scrollable on mobile */}
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible md:pb-0 scrollbar-hide">
          {tribunTiers.map((tier, idx) => {
            const pct = getQuotaPercentage(tier.id)
            const available = getAvailableQuota(tier.id)

            return (
              <Card
                key={tier.id}
                className={cn(
                  'min-w-[180px] md:min-w-0 flex-shrink-0 snap-start card-modern',
                  inView && 'animate-fade-in-up'
                )}
                style={inView ? { animationDelay: `${100 + idx * 100}ms` } : undefined}
              >
                <CardContent className="pt-5 pb-5 px-4 flex flex-col h-full">
                  <div className="text-2xl mb-1.5">{tier.emoji}</div>
                  <h3 className="font-bold text-xs mb-1">{tier.name}</h3>

                  <div className="text-lg font-black gradient-text-white mb-1">
                    {formatRupiah(tier.price)}
                  </div>

                  <div className="text-[10px] text-muted-foreground mb-2">
                    {tier.sold.toLocaleString()} / {tier.quota.toLocaleString()}
                  </div>

                  <Progress value={pct} className="h-1 mb-3" />

                  <ul className="space-y-1 mb-3 flex-1">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="sm"
                    className="w-full rounded-full text-[11px] btn-shine"
                    disabled={available === 0}
                    onClick={() => {
                      if (available === 0) { toast.error('Maaf, tiket sudah habis!'); return }
                      onBuy(tier.id, tier.name, tier.emoji, tier.price)
                    }}
                  >
                    {available === 0 ? 'Habis' : getSelectionModeLabel(defaultSeatConfigs.find(c => c.tierId === tier.id)?.seatSelectionMode || 'seat_selection')}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 6 — Venue
// ─────────────────────────────────────────────────────────
function VenueSection() {
  const { ref, inView } = useInView()

  return (
    <section id="venue" className="py-20 md:py-28 relative overflow-hidden bg-section-dark" ref={ref}>
      {/* Header - above image */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 relative z-10 text-center mb-8">
        <div className={cn(inView && 'animate-fade-in-up')}>
          <div className="section-badge mb-4 mx-auto w-fit">
            <MapPin className="h-3 w-3" />
            Lokasi
          </div>
        </div>
        <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', inView && 'animate-fade-in-up delay-100')}>
          <span className="gradient-text">VENUE</span>
        </h2>
      </div>

      {/* Full-width image */}
      <div className={cn('relative w-full h-64 sm:h-80 md:h-96 img-zoom', inView && 'animate-fade-in-up delay-150')}>
        <Image
          src="/images/sections/venue.png"
          alt="GBK Madya Stadium"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        <div className="absolute bottom-8 left-6 sm:left-10 z-10">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">GBK Madya Stadium</h3>
          <p className="text-sm text-white/80 mt-1">Gelora Bung Karno, Jakarta Pusat</p>
        </div>
      </div>

      {/* Info grid - full width */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 relative z-10">
        <div className={cn('w-full', inView && 'animate-fade-in-up delay-200')}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: MapPin, label: 'Lokasi', value: 'Jakarta Pusat' },
              { icon: Users, label: 'Kapasitas', value: '18.800 Kursi' },
              { icon: Calendar, label: 'Tanggal', value: '24 Mei 2025' },
              { icon: Clock, label: 'Waktu', value: '19:00 WIB' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 glass-teal rounded-xl p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="divider-gradient my-8" />

          <h4 className="font-semibold text-sm mb-4 text-muted-foreground uppercase tracking-wider">Fasilitas Venue</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 pb-6">
            {VENUE_FACILITIES.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-2 p-3 rounded-lg glass text-xs hover:bg-primary/10 transition-colors duration-300"
              >
                <span className="text-base">{f.icon}</span>
                <span className="text-muted-foreground text-[11px]">{f.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 7 — Highlights
// ─────────────────────────────────────────────────────────
function HighlightsSection() {
  const { ref, inView } = useInView()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-section-mesh" ref={ref}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className={cn(inView && 'animate-fade-in-up')}>
            <div className="section-badge section-badge-gold mb-4 mx-auto w-fit">
              <Sparkles className="h-3 w-3" />
              Highlights
            </div>
          </div>
          <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', inView && 'animate-fade-in-up delay-100')}>
            Yang Menanti <span className="gradient-text-gold">Sobat Duta</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Pengalaman konser yang tak terlupakan</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {HIGHLIGHTS.map((item, idx) => {
            const ImgComp = HIGHLIGHT_ICONS[item.title] || Sparkles
            const imgSrc = HIGHLIGHT_IMAGES[item.title]

            return (
              <Card
                key={idx}
                className={cn(
                  'card-modern group overflow-hidden',
                  inView && 'animate-fade-in-up'
                )}
                style={inView ? { animationDelay: `${150 + idx * 120}ms` } : undefined}
              >
                {/* Image header */}
                {imgSrc && (
                  <div className="h-36 relative img-zoom">
                    <Image
                      src={imgSrc}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                    {/* Icon overlay */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="h-8 w-8 rounded-lg bg-primary/80 backdrop-blur-sm flex items-center justify-center">
                        <ImgComp className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  </div>
                )}
                <CardContent className="pt-4 pb-4">
                  {!imgSrc && (
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-2.5 group-hover:bg-primary/20 transition-colors">
                      <ImgComp className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <h3 className="font-bold text-xs mb-1 group-hover:text-primary transition-colors">
                    {item.title || item.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 8 — VVIP Showcase
// ─────────────────────────────────────────────────────────
function VVIPShowcaseSection({ onBuy }: { onBuy: (tierId: string, tierName: string, emoji: string, price: number) => void }) {
  const { ref, inView } = useInView()
  const vvip = TICKET_TIERS[0]
  const pct = getQuotaPercentage(vvip.id)
  const available = getAvailableQuota(vvip.id)

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-section-gold" />

      {/* Gold particles */}
      <div className="absolute top-10 right-20 w-40 h-40 dot-pattern-gold opacity-20 rounded-full animate-float-slow" />
      <div className="absolute bottom-20 left-10 w-28 h-28 dot-pattern-gold opacity-15 rounded-full animate-float delay-1000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={cn('max-w-4xl mx-auto', inView && 'animate-fade-in-up')}>
          <Card className="border-gold/25 overflow-hidden animate-pulse-glow-gold card-modern-gold">
            <CardContent className="py-0 px-0">
              <div className="grid md:grid-cols-2">
                {/* Left: Visual */}
                <div className="p-7 md:p-10 bg-gradient-to-br from-gold/15 via-gold/8 to-transparent flex flex-col justify-center">
                  <Badge className="w-fit bg-gold text-gold-foreground hover:bg-gold/90 text-[10px] mb-3 tracking-wider">
                    👑 VVIP PIT
                  </Badge>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
                    Pengalaman <span className="gradient-text-gold">Eksklusif</span>
                  </h2>
                  <p className="text-muted-foreground text-xs mb-5 leading-relaxed">
                    {vvip.description}
                  </p>
                  <div className="space-y-1 mb-5">
                    <div className="text-xs text-muted-foreground">
                      Hanya tersisa <strong className="text-gold">{available}</strong> kursi dari {vvip.quota}
                    </div>
                    <Progress value={pct} className="h-1.5 [&>div]:bg-gold" />
                  </div>
                  <Button
                    className="rounded-full w-fit text-xs btn-shine glow-gold-strong"
                    disabled={available === 0}
                    onClick={() => {
                      if (available === 0) { toast.error('Maaf, VVIP PIT sudah habis!'); return }
                      onBuy(vvip.id, vvip.name, vvip.emoji, vvip.price)
                    }}
                  >
                    Dapatkan VVIP PIT
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Right: Benefits */}
                <div className="p-7 md:p-10">
                  <h3 className="font-semibold text-[10px] text-muted-foreground uppercase tracking-widest mb-3">
                    Semua Keistimewaan
                  </h3>
                  <ul className="space-y-2.5">
                    {vvip.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <div className="h-4 w-4 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-2.5 w-2.5 text-gold" />
                        </div>
                        <span className="text-xs">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 9 — FAQ
// ─────────────────────────────────────────────────────────
function FAQSection() {
  const { ref, inView } = useInView()

  return (
    <section id="faq" className="py-20 md:py-28 relative overflow-hidden bg-section-dark" ref={ref}>
      <div className="absolute inset-0 dot-pattern opacity-[0.03]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className={cn(inView && 'animate-fade-in-up')}>
            <div className="section-badge mb-4 mx-auto w-fit">
              FAQ
            </div>
          </div>
          <h2 className={cn('text-2xl sm:text-3xl md:text-4xl font-bold', inView && 'animate-fade-in-up delay-100')}>
            Pertanyaan <span className="gradient-text">Umum</span>
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">Jawaban untuk pertanyaan yang sering ditanyakan</p>
        </div>

        <div className={cn('max-w-2xl mx-auto', inView && 'animate-fade-in-up delay-200')}>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`} className="border-border/50">
                <AccordionTrigger className="text-left text-xs sm:text-sm hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Section 10 — Trust + Final CTA
// ─────────────────────────────────────────────────────────
function TrustCTASection() {
  const { ref, inView } = useInView()

  const trustBadges = [
    { icon: Shield, label: 'Tiket Resmi & Aman' },
    { icon: Users, label: '18.800+ Sobat Duta' },
    { icon: Star, label: '30+ Hits Legendaris' },
    { icon: Heart, label: '2 Dekade Karir' },
  ]

  return (
    <section className="py-20 md:py-28 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-section-radial" />
      <div className="absolute inset-0 bg-section-radial-gold" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Trust badges */}
        <div className={cn('flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-14', inView && 'animate-fade-in-up')}>
          {trustBadges.map((badge, idx) => (
            <div
              key={badge.label}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-full glass-teal text-xs text-muted-foreground hover-lift',
                inView && 'animate-fade-in-up'
              )}
              style={inView ? { animationDelay: `${idx * 80}ms` } : undefined}
            >
              <badge.icon className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className={cn('text-center', inView && 'animate-fade-in-up delay-300')}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Jangan Sampai <span className="gradient-text-gold">Kehabisan!</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto mb-7 leading-relaxed">
            Kuota terbatas! Pastikan kamu menjadi bagian dari malam bersejarah ini
            bersama Sheila On 7 dan ribuan Sobat Duta lainnya.
          </p>
          <Button
            size="lg"
            className="text-sm px-10 h-12 rounded-full btn-shine glow-bsi-strong"
            onClick={() => {
              const el = document.querySelector('#tickets')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <Ticket className="mr-2 h-4 w-4" />
            Beli Tiket Sekarang
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Sponsor banner */}
        <div className={cn('flex items-center justify-center mt-14', inView && 'animate-fade-in-up delay-500')}>
          <div className="glass-gold rounded-xl px-6 py-3 flex items-center gap-3 hover-lift">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Presented by</span>
            <Separator orientation="vertical" className="h-4 bg-gold/30" />
            <span className="font-bold text-gold text-sm tracking-wider">BSI</span>
            <span className="text-[9px] text-muted-foreground/60">Bank Syariah Indonesia</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────
export default function Page() {
  const { isAuthenticated, isLoading, login } = useAuthStore()
  const { currentPage, navigateTo } = usePageStore()

  // Fetch event and ticket types from API
  const { data: eventData } = useEvent('sheila-on-7-melompat-lebih-tinggi')
  const eventDetail = eventData as { event: Record<string, unknown> } | undefined
  const eventObj = eventDetail?.event as Record<string, unknown> | undefined
  const eventId = String(eventObj?.id ?? '')

  const { data: ticketTypesData } = useTicketTypes(eventId)

  const [seatModal, setSeatModal] = useState({
    open: false,
    tierId: '',
    tierName: '',
    emoji: '',
    price: 0,
  })
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [pendingBuyAction, setPendingBuyAction] = useState<{
    tierId: string
    tierName: string
    emoji: string
    price: number
  } | null>(null)

  useEffect(() => {
    const handleOpenLogin = () => setLoginModalOpen(true)
    window.addEventListener('open-login-modal', handleOpenLogin)
    return () => window.removeEventListener('open-login-modal', handleOpenLogin)
  }, [])

  const handleGoogleLogin = async () => {
    await login()
    setLoginModalOpen(false)
    toast.success(`Selamat datang, Sobat Duta! 🎉`)
    if (pendingBuyAction) {
      setTimeout(() => {
        executeBuy(pendingBuyAction.tierId, pendingBuyAction.tierName, pendingBuyAction.emoji, pendingBuyAction.price)
        setPendingBuyAction(null)
      }, 500)
    }
  }

  const executeBuy = (tierId: string, tierName: string, emoji: string, price: number) => {
    const config = defaultSeatConfigs.find(c => c.tierId === tierId)
    if (config?.zoneType === 'free') { navigateTo('checkout'); return }
    if (config?.seatSelectionMode === 'auto_assign') { navigateTo('checkout'); return }
    setSeatModal({ open: true, tierId, tierName, emoji, price })
  }

  const handleBuy = (tierId: string, tierName: string, emoji: string, price: number) => {
    if (!isAuthenticated) {
      setPendingBuyAction({ tierId, tierName, emoji, price })
      setLoginModalOpen(true)
      return
    }
    executeBuy(tierId, tierName, emoji, price)
  }

  // ─── Page Router ────────────────────────────────────────
  if (currentPage !== 'home') {
    const pageMap: Record<string, React.ReactNode> = {
      checkout: <CheckoutPage />,
      payment: <PaymentPage />,
      'payment-status': <PaymentStatusPage />,
      eticket: <ETicketPage />,
      'my-orders': <MyOrdersPage />,
      profile: <ProfilePage />,
    }

    const pageContent = pageMap[currentPage]
    if (pageContent) {
      return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          {pageContent}
          <GoogleLoginModal
            open={loginModalOpen}
            onOpenChange={setLoginModalOpen}
            onLogin={handleGoogleLogin}
            isLoading={isLoading}
          />
        </div>
      )
    }
  }

  // ─── Landing Page (default) ────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <BrandStorySection />
        <LineupSection />
        <TicketsFloorSection onBuy={handleBuy} />
        <TicketsTribunSection onBuy={handleBuy} />
        <VenueSection />
        <HighlightsSection />
        <VVIPShowcaseSection onBuy={handleBuy} />
        <FAQSection />
        <TrustCTASection />
      </main>

      <Footer />

      <GoogleLoginModal
        open={loginModalOpen}
        onOpenChange={setLoginModalOpen}
        onLogin={handleGoogleLogin}
        isLoading={isLoading}
      />

      <SeatSelectionModal
        open={seatModal.open}
        onOpenChange={(open) => setSeatModal(prev => ({ ...prev, open }))}
        tierId={seatModal.tierId}
        tierName={seatModal.tierName}
        tierEmoji={seatModal.emoji}
        price={seatModal.price}
      />
    </div>
  )
}
