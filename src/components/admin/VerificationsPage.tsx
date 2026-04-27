'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  useAdminVerifications,
} from '@/hooks/use-api';
import { formatRupiah } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

// ─── LOCAL TYPES ──────────────────────────────────────────────────────────────

type VerificationItem = {
  id: string;
  orderCode: string;
  userName: string;
  userEmail: string;
  ticketType: string;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'queued' | 'in_review' | 'approved' | 'rejected' | 'expired';
  slaMinutesLeft: number;
  createdAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
};

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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  ShieldCheck,
  ListChecks,
  AlertTriangle,
  Search,
  User,
  Mail,
  CreditCard,
  FileText,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

// ─── STAT BADGE HELPERS ─────────────────────────────────────────────────────

function getVerificationStatusBadge(status: VerificationItem['status']) {
  const config: Record<
    VerificationItem['status'],
    { label: string; className: string }
  > = {
    queued: {
      label: 'Queued',
      className:
        'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25',
    },
    in_review: {
      label: 'In Review',
      className:
        'bg-blue-500/15 text-blue-400 border-blue-500/30 hover:bg-blue-500/25',
    },
    approved: {
      label: 'Approved',
      className:
        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25',
    },
    rejected: {
      label: 'Rejected',
      className:
        'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25',
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

// ─── SLA COUNTDOWN DISPLAY ─────────────────────────────────────────────────

function SLATimer({ minutes }: { minutes: number }) {
  const isUrgent = minutes <= 5;
  const isExpired = minutes <= 0;

  if (isExpired) {
    return (
      <div className="flex items-center gap-1.5 text-red-400">
        <Timer className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Expired</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5',
        isUrgent ? 'text-red-400' : 'text-amber-400'
      )}
    >
      <Timer className="w-3.5 h-3.5" />
      <span className="text-xs font-semibold tabular-nums">
        {minutes}m tersisa
      </span>
      {isUrgent && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
      )}
    </div>
  );
}

// ─── REJECT DIALOG ─────────────────────────────────────────────────────────

function RejectDialog({
  item,
  onReject,
}: {
  item: VerificationItem;
  onReject: (id: string) => void;
}) {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    onReject(item.id);
    toast.success(`Pembayaran ${item.orderCode} ditolak`);
    setReason('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:text-red-300 h-8 px-3 text-xs font-semibold"
        >
          <XCircle className="w-3.5 h-3.5 mr-1" />
          REJECT
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111918] border-[rgba(0,163,157,0.15)] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Tolak Pembayaran
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Tolak pembayaran untuk pesanan <span className="font-mono text-[#00A39D]">{item.orderCode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          <div className="p-3 rounded-lg bg-[#0A0F0E] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-white font-medium">{item.userName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{item.userEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {item.paymentMethod} — <span className="text-white font-semibold">{formatRupiah(item.totalAmount)}</span>
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1.5 block">
              Alasan Penolakan <span className="text-red-400">*</span>
            </label>
            <Textarea
              placeholder="Contoh: Nominal transfer tidak sesuai dengan total tagihan..."
              className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white placeholder:text-muted-foreground/50 min-h-[100px] resize-none text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {[
                'Nominal tidak sesuai',
                'Bukti tidak terbaca',
                'Transfer dari rekening berbeda',
                'Batas waktu habis',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className="text-[10px] px-2 py-1 rounded-full bg-[rgba(0,163,157,0.08)] border border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.15)] transition-colors"
                  onClick={() => setReason(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[rgba(0,163,157,0.2)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            className="flex-1 bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:text-red-300"
            onClick={handleSubmit}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Tolak Pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── VERIFICATION DETAIL DIALOG ────────────────────────────────────────────

function VerificationDetailDialog({ item }: { item: VerificationItem }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#00A39D] hover:text-[#00BFB8] hover:bg-[rgba(0,163,157,0.1)] h-8 px-2"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#111918] border-[rgba(0,163,157,0.15)] text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00A39D]" />
            Detail Verifikasi
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {item.orderCode}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="space-y-2">
            <DetailRow icon={<User className="w-3.5 h-3.5" />} label="Nama" value={item.userName} />
            <DetailRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={item.userEmail} />
            <DetailRow icon={<Calendar className="w-3.5 h-3.5" />} label="Tanggal Upload" value={formatDateTime(item.createdAt)} />
            <DetailRow icon={<CreditCard className="w-3.5 h-3.5" />} label="Metode Bayar" value={item.paymentMethod} />
            <div className="flex items-center gap-3">
              <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Tipe Tiket</p>
                <p className="text-white text-sm font-medium">{item.ticketType} × {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-[#F8AD3C] text-sm font-bold">{formatRupiah(item.totalAmount)}</p>
              </div>
            </div>
            {item.reviewedBy && (
              <DetailRow icon={<ShieldCheck className="w-3.5 h-3.5" />} label="Ditinjau oleh" value={item.reviewedBy} />
            )}
            {item.rejectionReason && (
              <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-400 font-medium mb-0.5">Alasan Penolakan:</p>
                <p className="text-red-300 text-sm">{item.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export function VerificationsPage() {
  const { data: verificationsData, isLoading, error } = useAdminVerifications();
  const verifications: any[] = (verificationsData as any)?.data ?? (verificationsData as any) ?? [];

  // ── State ──
  const pendingItems: VerificationItem[] = verifications.filter((v: any) => v.status === 'queued' || v.status === 'in_review');
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historyPage, setHistoryPage] = useState(1);

  // ── History items (approved + rejected + expired) ──
  const historyItems = verifications.filter(
    (v: any) => v.status === 'approved' || v.status === 'rejected' || v.status === 'expired'
  );

  const filteredHistory = historyFilter === 'all' 
    ? historyItems 
    : historyItems.filter((v) => v.status === historyFilter);

  const historyTotalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const safeHistoryPage = Math.min(historyPage, historyTotalPages);
  const pagedHistory = filteredHistory.slice(
    (safeHistoryPage - 1) * PAGE_SIZE,
    safeHistoryPage * PAGE_SIZE
  );

  // ── Stats ──
  const approvedToday = verifications.filter((v: any) => v.status === 'approved').length;
  const rejectedToday = verifications.filter((v: any) => v.status === 'rejected').length;

  const stats = [
    {
      label: 'Pending Queue',
      value: pendingItems.length,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      description: 'Menunggu review',
    },
    {
      label: 'Approved Today',
      value: approvedToday,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      description: 'Berhasil diverifikasi',
    },
    {
      label: 'Rejected Today',
      value: rejectedToday,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      description: 'Ditolak admin',
    },
    {
      label: 'Avg SLA',
      value: '12 min',
      icon: Timer,
      color: 'text-[#00A39D]',
      bg: 'bg-[rgba(0,163,157,0.1)]',
      description: 'Rata-rata waktu review',
    },
  ];

  // ── Handlers ──
  const handleApprove = (id: string) => {
    setPendingItems((prev) => prev.filter((v) => v.id !== id));
    toast.success('Pembayaran berhasil diverifikasi');
  };

  const handleReject = (id: string) => {
    setPendingItems((prev) => prev.filter((v) => v.id !== id));
  };

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;
  if (error) return <div className="p-6 text-red-500">Failed to load data: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* ═══ PAGE HEADER ═══ */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#00A39D]" />
          Verification Queue
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Verifikasi bukti pembayaran dan kelola antrian pesanan
        </p>
      </div>

      {/* ═══ STATS ROW ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  <p className={cn('text-xl font-bold truncate', stat.color)}>{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground/60">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══ TABS ═══ */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-[#111918] border border-[rgba(0,163,157,0.1)] p-1 h-auto">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-[#00A39D] data-[state=active]:text-[#0A0F0E] text-muted-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <Clock className="w-4 h-4 mr-1.5" />
            Pending Queue
            {pendingItems.length > 0 && (
              <Badge className="ml-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] px-1.5 py-0 h-4 min-w-[20px] justify-center">
                {pendingItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-[#00A39D] data-[state=active]:text-[#0A0F0E] text-muted-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <ListChecks className="w-4 h-4 mr-1.5" />
            History
          </TabsTrigger>
        </TabsList>

        {/* ═══ PENDING QUEUE TAB ═══ */}
        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingItems.length === 0 ? (
            <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
              <CardContent className="py-16 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400/30 mx-auto mb-3" />
                <p className="text-white font-medium">Antrian Kosong</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Semua pembayaran sudah diverifikasi. Kerja bagus! 🎉
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingItems.map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    'bg-[#111918] border transition-all',
                    item.slaMinutesLeft <= 5
                      ? 'border-red-500/30 hover:border-red-500/50'
                      : 'border-[rgba(0,163,157,0.1)] hover:border-[rgba(0,163,157,0.3)]'
                  )}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-bold text-[#00A39D]">
                          {item.orderCode}
                        </p>
                        <p className="text-white font-medium text-sm mt-0.5">
                          {item.userName}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.userEmail}</p>
                      </div>
                      <div className="shrink-0 ml-3">
                        {getVerificationStatusBadge(item.status)}
                      </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E] border border-white/5">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Tipe Tiket</p>
                        <p className="text-white text-sm font-semibold truncate">
                          {item.ticketType}
                        </p>
                      </div>
                      <div className="text-center px-3 border-l border-r border-white/5">
                        <p className="text-xs text-muted-foreground">Qty</p>
                        <p className="text-white text-sm font-bold">{item.quantity}</p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-[#F8AD3C] text-sm font-bold">
                          {formatRupiah(item.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Payment Method & SLA */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {item.paymentMethod}
                        </span>
                      </div>
                      <SLATimer minutes={item.slaMinutesLeft} />
                    </div>

                    {/* Upload Time */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Upload: {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 hover:text-emerald-300 h-9 text-xs font-semibold"
                        onClick={() => handleApprove(item.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        APPROVE
                      </Button>
                      <RejectDialog item={item} onReject={handleReject} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ HISTORY TAB ═══ */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {/* History Filter */}
          <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <label className="text-xs text-muted-foreground shrink-0">Filter Status:</label>
                <Select
                  value={historyFilter}
                  onValueChange={(v) => {
                    setHistoryFilter(v);
                    setHistoryPage(1);
                  }}
                >
                  <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white h-9 w-44">
                    <SelectValue placeholder="Semua" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.15)]">
                    <SelectItem value="all" className="text-white">Semua</SelectItem>
                    <SelectItem value="approved" className="text-white">Approved</SelectItem>
                    <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
                    <SelectItem value="expired" className="text-white">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <div className="ml-auto text-xs text-muted-foreground">
                  {filteredHistory.length} record
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)]">
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
                      <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4 text-right">
                        Amount
                      </TableHead>
                      <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                        Status
                      </TableHead>
                      <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                        Ditinjau oleh
                      </TableHead>
                      <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                        Tanggal
                      </TableHead>
                      <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4">
                        Catatan
                      </TableHead>
                      <TableHead className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold h-10 px-4 text-center">
                        Detail
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedHistory.length === 0 ? (
                      <TableRow className="border-[rgba(0,163,157,0.05)]">
                        <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Tidak ada data history</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedHistory.map((item) => (
                        <TableRow
                          key={item.id}
                          className="border-[rgba(0,163,157,0.05)] hover:bg-[rgba(0,163,157,0.04)] transition-colors"
                        >
                          <TableCell className="px-4 py-3">
                            <span className="font-mono text-xs font-semibold text-[#00A39D]">
                              {item.orderCode.slice(-8)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <p className="text-sm text-white font-medium truncate max-w-[130px]">
                              {item.userName}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-[rgba(0,163,157,0.06)] border-[rgba(0,163,157,0.2)] text-[#7FB3AE]"
                            >
                              {item.ticketType}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-right">
                            <span className="text-sm text-white font-semibold">
                              {formatRupiah(item.totalAmount)}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {getVerificationStatusBadge(item.status)}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                              {item.reviewedBy || '—'}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <p className="text-xs text-muted-foreground">
                              {item.reviewedAt ? formatDateTime(item.reviewedAt) : formatDateTime(item.createdAt)}
                            </p>
                          </TableCell>
                          <TableCell className="px-4 py-3 max-w-[150px]">
                            {item.rejectionReason ? (
                              <div className="flex items-start gap-1">
                                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                <span className="text-xs text-red-300 truncate">
                                  {item.rejectionReason}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-center">
                            <VerificationDetailDialog item={item} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* ═══ HISTORY PAGINATION ═══ */}
              {filteredHistory.length > PAGE_SIZE && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,163,157,0.08)]">
                  <p className="text-xs text-muted-foreground">
                    {(safeHistoryPage - 1) * PAGE_SIZE + 1}–{Math.min(safeHistoryPage * PAGE_SIZE, filteredHistory.length)} dari{' '}
                    {filteredHistory.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
                      disabled={safeHistoryPage <= 1}
                      onClick={() => setHistoryPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    {Array.from({ length: Math.min(historyTotalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (historyTotalPages <= 7) {
                        pageNum = i + 1;
                      } else if (safeHistoryPage <= 4) {
                        pageNum = i + 1;
                      } else if (safeHistoryPage >= historyTotalPages - 3) {
                        pageNum = historyTotalPages - 6 + i;
                      } else {
                        pageNum = safeHistoryPage - 3 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={safeHistoryPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'h-8 w-8 p-0 text-xs font-semibold',
                            safeHistoryPage === pageNum
                              ? 'bg-[#00A39D] text-[#0A0F0E] hover:bg-[#00BFB8]'
                              : 'border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]'
                          )}
                          onClick={() => setHistoryPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border-[rgba(0,163,157,0.15)] text-muted-foreground hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
                      disabled={safeHistoryPage >= historyTotalPages}
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
