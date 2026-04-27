'use client';

import React, { useState, useMemo } from 'react';
import {
  mockAdminOrders,
  type AdminOrder,
  paymentMethodBreakdown,
} from '@/lib/admin-mock-data';
import { formatRupiah } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ShoppingCart,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  TimerReset,
  DollarSign,
  QrCode,
  Building2,
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  User,
  Mail,
  CreditCard,
  Calendar,
  TrendingUp,
  CircleDot,
} from 'lucide-react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

const TICKET_TYPES = [
  'VVIP PIT',
  'VIP ZONE',
  'FESTIVAL',
  'CAT 1',
  'CAT 2',
  'CAT 3',
  'CAT 4',
  'CAT 5',
];

// ─── STATUS HELPERS ─────────────────────────────────────────────────────────

function getStatusBadge(status: AdminOrder['status']) {
  const config: Record<
    AdminOrder['status'],
    { label: string; className: string }
  > = {
    paid: {
      label: 'Paid',
      className:
        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
    },
    pending: {
      label: 'Pending',
      className:
        'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
    },
    rejected: {
      label: 'Rejected',
      className:
        'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25',
    },
    cancelled: {
      label: 'Cancelled',
      className:
        'bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/25',
    },
    expired: {
      label: 'Expired',
      className:
        'bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/25',
    },
  };
  const c = config[status];
  return <Badge variant="outline" className={cn('text-xs font-semibold', c.className)}>{c.label}</Badge>;
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── ORDER DETAIL DIALOG ───────────────────────────────────────────────────

function OrderDetailDialog({ order }: { order: AdminOrder }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-[#00A39D] hover:text-[#00BFB8] hover:bg-[rgba(0,163,157,0.1)] h-8 px-2">
          <Eye className="w-4 h-4 mr-1" />
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111918] border-[rgba(0,163,157,0.15)] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00A39D]" />
            Detail Pesanan
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Informasi lengkap pesanan {order.orderCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Order Info Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Kode Pesanan</p>
              <p className="text-base font-mono font-bold text-[#00A39D]">{order.orderCode}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
              {getStatusBadge(order.status)}
            </div>
          </div>

          {/* Order Items */}
          <Card className="bg-[#0A0F0E] border-[rgba(0,163,157,0.08)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#00A39D]" />
                Item Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-center justify-between rounded-lg bg-[rgba(0,163,157,0.05)] p-3">
                <div>
                  <p className="text-white font-medium text-sm">{order.ticketType}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{formatRupiah(order.pricePerTicket)} / tiket</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">x{order.quantity}</p>
                  <p className="text-[#F8AD3C] font-bold text-sm mt-0.5">{formatRupiah(order.totalAmount)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <p className="text-muted-foreground text-sm font-medium">Total Pembayaran</p>
                <p className="text-white font-bold text-lg">{formatRupiah(order.totalAmount)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Buyer Details */}
          <Card className="bg-[#0A0F0E] border-[rgba(0,163,157,0.08)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#00A39D]" />
                Data Pembeli
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="text-white text-sm font-medium">{order.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-white text-sm font-medium">{order.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Tanggal Order</p>
                  <p className="text-white text-sm font-medium">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="bg-[#0A0F0E] border-[rgba(0,163,157,0.08)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#00A39D]" />
                Informasi Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <div className="flex items-center gap-3">
                <CreditCard className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Metode Pembayaran</p>
                  <p className="text-white text-sm font-medium">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Bukti Transfer</p>
                  <p className="text-sm font-medium">
                    {order.proofUploaded ? (
                      <span className="text-emerald-400">✓ Uploaded</span>
                    ) : (
                      <span className="text-red-400">✗ Belum upload</span>
                    )}
                  </p>
                </div>
              </div>
              {order.verifiedBy && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Diverifikasi oleh</p>
                    <p className="text-white text-sm font-medium">{order.verifiedBy}</p>
                  </div>
                </div>
              )}
              {order.paidAt && (
                <div className="flex items-center gap-3">
                  <CircleDot className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Bayar</p>
                    <p className="text-white text-sm font-medium">{formatDateTime(order.paidAt)}</p>
                  </div>
                </div>
              )}
              {order.rejectionReason && (
                <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-xs text-red-400 font-medium mb-0.5">Alasan Penolakan:</p>
                  <p className="text-red-300 text-sm">{order.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-[#0A0F0E] border-[rgba(0,163,157,0.08)]">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00A39D]" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="relative space-y-3 ml-1">
                {/* Vertical line */}
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10" />

                <TimelineItem
                  label="Pesanan dibuat"
                  time={order.createdAt}
                  active
                />
                <TimelineItem
                  label="Batas waktu pembayaran"
                  time={order.expiresAt}
                  icon={<TimerReset className="w-3 h-3" />}
                  active={order.status === 'pending'}
                />
                {order.proofUploaded && (
                  <TimelineItem
                    label="Bukti transfer diupload"
                    time={order.createdAt}
                    icon={<FileText className="w-3 h-3" />}
                    active={order.status === 'pending'}
                  />
                )}
                {order.status === 'paid' && (
                  <>
                    <TimelineItem
                      label="Pembayaran diverifikasi"
                      time={order.verifiedAt || order.createdAt}
                      icon={<CheckCircle2 className="w-3 h-3" />}
                      active
                      color="text-emerald-400"
                    />
                    <TimelineItem
                      label="Tiket diterbitkan"
                      time={order.paidAt || order.createdAt}
                      icon={<CheckCircle2 className="w-3 h-3" />}
                      active
                      color="text-emerald-400"
                    />
                  </>
                )}
                {order.status === 'rejected' && (
                  <TimelineItem
                    label="Pembayaran ditolak"
                    time={order.verifiedAt || order.createdAt}
                    icon={<XCircle className="w-3 h-3" />}
                    active
                    color="text-red-400"
                  />
                )}
                {(order.status === 'cancelled' || order.status === 'expired') && (
                  <TimelineItem
                    label={`Pesanan ${order.status === 'expired' ? 'kadaluarsa' : 'dibatalkan'}`}
                    time={order.expiresAt}
                    icon={<Ban className="w-3 h-3" />}
                    active
                    color="text-gray-400"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="border-[rgba(0,163,157,0.2)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
            onClick={() => toast.info('Fitur export sedang dalam pengembangan')}
          >
            Export PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TimelineItem({
  label,
  time,
  icon,
  active,
  color,
}: {
  label: string;
  time: string;
  icon?: React.ReactNode;
  active?: boolean;
  color?: string;
}) {
  const dotColor = color || (active ? 'bg-[#00A39D]' : 'bg-gray-600');
  const textColor = color || (active ? 'text-white' : 'text-muted-foreground');

  return (
    <div className="relative flex items-start gap-3 pl-3">
      <div className={cn('absolute -left-3 top-1.5 w-3 h-3 rounded-full border-2 border-[#111918]', dotColor)} />
      <div className="flex-1">
        <p className={cn('text-xs font-medium', textColor)}>{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(time)}</p>
      </div>
      {icon && (
        <div className={cn('mt-0.5', color || 'text-muted-foreground')}>{icon}</div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filtered orders ──
  const filteredOrders = useMemo(() => {
    return mockAdminOrders.filter((order) => {
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchTicket = ticketFilter === 'all' || order.ticketType === ticketFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        order.orderCode.toLowerCase().includes(q) ||
        order.userName.toLowerCase().includes(q);
      return matchStatus && matchTicket && matchSearch;
    });
  }, [statusFilter, ticketFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedOrders = filteredOrders.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // ── Stats ──
  const totalRevenue = mockAdminOrders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const paidCount = mockAdminOrders.filter((o) => o.status === 'paid').length;
  const pendingCount = mockAdminOrders.filter((o) => o.status === 'pending').length;
  const rejectedCount = mockAdminOrders.filter((o) => o.status === 'rejected').length;

  // ── Payment breakdown ──
  const qrisTotal = paymentMethodBreakdown
    .filter((p) => p.method.startsWith('QRIS'))
    .reduce((s, p) => s + p.count, 0);
  const transferTotal = paymentMethodBreakdown
    .filter((p) => p.method.startsWith('Transfer'))
    .reduce((s, p) => s + p.count, 0);
  const totalPayments = qrisTotal + transferTotal;
  const qrisPct = totalPayments > 0 ? Math.round((qrisTotal / totalPayments) * 100) : 0;
  const transferPct = totalPayments > 0 ? Math.round((transferTotal / totalPayments) * 100) : 0;

  const stats = [
    {
      label: 'Total Orders',
      value: mockAdminOrders.length,
      icon: ShoppingCart,
      color: 'text-[#00A39D]',
      bg: 'bg-[rgba(0,163,157,0.1)]',
    },
    {
      label: 'Paid',
      value: paidCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Rejected',
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      label: 'Total Revenue',
      value: formatRupiah(totalRevenue),
      icon: DollarSign,
      color: 'text-[#F8AD3C]',
      bg: 'bg-[rgba(248,173,60,0.1)]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ═══ PAGE HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-[#00A39D]" />
          Orders & Payments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kelola semua pesanan dan pembayaran tiket Sheila On 7 — Jakarta
        </p>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="bg-[#111918] border-[rgba(0,163,157,0.1)] hover:border-[rgba(0,163,157,0.25)] transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', stat.bg)}>
                  <stat.icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className={cn('text-lg font-bold truncate', stat.color)}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ PAYMENT SUMMARY ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(0,163,157,0.1)] flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-[#00A39D]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">QRIS</p>
              <p className="text-white font-bold text-lg">{qrisTotal}</p>
              <p className="text-[10px] text-muted-foreground">{qrisPct}% dari total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[rgba(248,173,60,0.1)] flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[#F8AD3C]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transfer Bank</p>
              <p className="text-white font-bold text-lg">{transferTotal}</p>
              <p className="text-[10px] text-muted-foreground">{transferPct}% dari total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-emerald-400 font-bold text-lg">
                {mockAdminOrders.length > 0
                  ? Math.round((paidCount / mockAdminOrders.length) * 100)
                  : 0}
                %
              </p>
              <p className="text-[10px] text-muted-foreground">{paidCount} dari {mockAdminOrders.length} order</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ FILTER ROW ═══ */}
      <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-muted-foreground mb-1.5 block">
                Cari (Kode / Nama)
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari kode pesanan atau nama pembeli..."
                  className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white placeholder:text-muted-foreground/50 pl-9 h-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="w-full sm:w-44">
              <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white h-9">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.15)]">
                  <SelectItem value="all" className="text-white">Semua Status</SelectItem>
                  <SelectItem value="paid" className="text-white">Paid</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
                  <SelectItem value="cancelled" className="text-white">Cancelled</SelectItem>
                  <SelectItem value="expired" className="text-white">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-44">
              <label className="text-xs text-muted-foreground mb-1.5 block">Tipe Tiket</label>
              <Select
                value={ticketFilter}
                onValueChange={(v) => {
                  setTicketFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white h-9">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.15)]">
                  <SelectItem value="all" className="text-white">Semua Tipe</SelectItem>
                  {TICKET_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ ORDERS TABLE ═══ */}
      <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-base flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#00A39D]" />
                Daftar Pesanan
              </CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-1">
                Menampilkan {filteredOrders.length} pesanan (Halaman {safePage} dari {totalPages})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(0,163,157,0.08)] hover:bg-transparent">
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                    Kode Order
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                    Pembeli
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                    Tipe Tiket
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4 text-center">
                    Qty
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4 text-right">
                    Total
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                    Metode
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                    Tanggal
                  </TableHead>
                  <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4 text-center">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedOrders.length === 0 ? (
                  <TableRow className="border-[rgba(0,163,157,0.05)]">
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Tidak ada pesanan ditemukan</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Coba ubah filter atau kata kunci pencarian
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-[rgba(0,163,157,0.05)] hover:bg-[rgba(0,163,157,0.04)] transition-colors"
                    >
                      <TableCell className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-[#00A39D]">
                          {order.orderCode.slice(-8)}
                        </span>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          ...{order.orderCode.slice(0, 16)}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <p className="text-sm text-white font-medium truncate max-w-[140px]">
                          {order.userName}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                          {order.userEmail}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-[rgba(0,163,157,0.06)] border-[rgba(0,163,157,0.2)] text-[#7FB3AE]"
                        >
                          {order.ticketType}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="text-sm text-white font-semibold">{order.quantity}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span className="text-sm text-white font-semibold">
                          {formatRupiah(order.totalAmount)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                      </TableCell>
                      <TableCell className="px-4 py-3">{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <OrderDetailDialog order={order} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ═══ PAGINATION ═══ */}
          {filteredOrders.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,163,157,0.08)]">
              <p className="text-xs text-muted-foreground">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredOrders.length)} dari{' '}
                {filteredOrders.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Prev
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (safePage <= 4) {
                    pageNum = i + 1;
                  } else if (safePage >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = safePage - 3 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={safePage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0 text-xs font-semibold',
                        safePage === pageNum
                          ? 'bg-[#00A39D] text-[#0A0F0E] hover:bg-[#00BFB8]'
                          : 'border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]'
                      )}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
