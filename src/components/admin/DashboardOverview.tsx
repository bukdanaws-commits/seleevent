'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Ticket, ShoppingCart, Users, TrendingUp, AlertTriangle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { formatRupiah } from '@/lib/mock-data';
import { dashboardKPIs, salesByTier, revenueChartData, mockAdminOrders, mockVerifications, paymentMethodBreakdown } from '@/lib/admin-mock-data';
import { StatCard } from './StatCard';
import { LiveIndicator } from './LiveIndicator';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const PIE_COLORS = ['#00A39D', '#F8AD3C', '#00BFB8', '#D4922A', '#7FB3AE', '#EF4444', '#6366F1'];

export function DashboardOverview() {
  const recentOrders = mockAdminOrders.slice(0, 8);
  const pendingVerifications = mockVerifications.filter(v => v.status === 'queued').slice(0, 5);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Lunas';
      case 'pending': return 'Menunggu';
      case 'rejected': return 'Ditolak';
      case 'cancelled': return 'Batal';
      case 'expired': return 'Kadaluarsa';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Live indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-xs text-muted-foreground">Sheila On 7 — JAKARTA | 24 Mei 2025</p>
        </div>
        <LiveIndicator />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatRupiah(dashboardKPIs.totalRevenue)} icon={<DollarSign className="h-4 w-4" />} trend={{ value: 12, isPositive: true }} description="vs minggu lalu" variant="teal" />
        <StatCard title="Tiket Terjual" value={dashboardKPIs.totalTicketsSold.toLocaleString('id-ID')} icon={<Ticket className="h-4 w-4" />} description={`dari ${dashboardKPIs.totalQuota.toLocaleString('id-ID')} quota`} variant="gold" />
        <StatCard title="Total Orders" value={dashboardKPIs.totalOrders} icon={<ShoppingCart className="h-4 w-4" />} description={`${dashboardKPIs.paidOrders} lunas, ${dashboardKPIs.pendingOrders} pending`} variant="green" />
        <StatCard title="Total Users" value={dashboardKPIs.totalUsers} icon={<Users className="h-4 w-4" />} trend={{ value: 8, isPositive: true }} description="peserta terdaftar" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tiket Diredeem</p>
                <p className="text-lg font-bold text-foreground">{dashboardKPIs.ticketsRedeemed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Inside Venue</p>
                <p className="text-lg font-bold text-foreground">{dashboardKPIs.ticketsInside}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Verifikasi Pending</p>
                <p className="text-lg font-bold text-foreground">{dashboardKPIs.pendingVerifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Occupancy</p>
                <p className="text-lg font-bold text-foreground">{dashboardKPIs.occupancyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Revenue 7 Hari Terakhir</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Total {formatRupiah(dashboardKPIs.totalRevenue)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,179,174,0.1)" />
                  <XAxis dataKey="date" tick={{ fill: '#7FB3AE', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7FB3AE', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#111918', border: '1px solid rgba(0,163,157,0.15)', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#F0FDF9' }} formatter={(value: number) => [formatRupiah(value), 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#00A39D" strokeWidth={2} dot={{ fill: '#00A39D', r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Tier */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Penjualan per Kategori</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Tiket terjual vs quota</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByTier} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,179,174,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: '#7FB3AE', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#7FB3AE', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#111918', border: '1px solid rgba(0,163,157,0.15)', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: '#F0FDF9' }} />
                  <Bar dataKey="terjual" name="Terjual" fill="#00A39D" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="quota" name="Quota" fill="rgba(0,163,157,0.15)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Order Terbaru</CardTitle>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30">{dashboardKPIs.totalOrders} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[10px] text-muted-foreground">Kode</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground">Nama</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground">Tiket</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground">Total</TableHead>
                    <TableHead className="text-[10px] text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map(order => (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="text-xs font-mono text-foreground">{order.orderCode.slice(-8)}</TableCell>
                      <TableCell className="text-xs text-foreground">{order.userName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{order.ticketType} x{order.quantity}</TableCell>
                      <TableCell className="text-xs font-medium text-foreground">{formatRupiah(order.totalAmount)}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${statusColor(order.status)}`}>{statusLabel(order.status)}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodBreakdown} dataKey="count" nameKey="method" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2}>
                    {paymentMethodBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111918', border: '1px solid rgba(0,163,157,0.15)', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {paymentMethodBreakdown.slice(0, 5).map(pm => (
                <div key={pm.method} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[paymentMethodBreakdown.indexOf(pm)] }} />
                    <span className="text-muted-foreground">{pm.method}</span>
                  </div>
                  <span className="text-foreground font-medium">{pm.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
