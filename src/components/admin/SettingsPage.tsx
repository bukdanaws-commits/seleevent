'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Settings,
  Shield,
  HeartPulse,
  ScrollText,
  Sliders,
  Search,
  Server,
  Cpu,
  HardDrive,
  Database,
  Gauge,
  Timer,
  AlertTriangle,
  Activity,
  Clock,
  Save,
  Pencil,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSettings } from '@/hooks/use-api';
import { Skeleton } from '@/components/ui/skeleton';
import type { IAuditLogDisplay, ISystemHealth } from '@/lib/types';

// ─── LOCAL TYPES ──────────────────────────────────────────────────────────────

// AuditLog and SystemHealth now imported from @/lib/types
// IAuditLogDisplay extends IAuditLog with userName
// ISystemHealth includes cpuUsage?, memoryUsage?, diskUsage?, etc.

// ─── RBAC MATRIX DATA ────────────────────────────────────────────────────

const rbacRoles = [
  'SUPER_ADMIN',
  'ORGANIZER',
  'VERIFICATION_ADMIN',
  'REDEEM_CREW',
  'SCANNER_CREW',
  'PARTICIPANT',
] as const;

const rbacFeatures = [
  'Events',
  'Tickets',
  'Payments',
  'Verification',
  'Redeem',
  'Scan',
  'Analytics',
  'Settings',
  'Users',
] as const;

const rbacMatrix: Record<string, Record<string, boolean>> = {
  SUPER_ADMIN: {
    Events: true,
    Tickets: true,
    Payments: true,
    Verification: true,
    Redeem: true,
    Scan: true,
    Analytics: true,
    Settings: true,
    Users: true,
  },
  ORGANIZER: {
    Events: true,
    Tickets: true,
    Payments: true,
    Verification: true,
    Redeem: true,
    Scan: true,
    Analytics: true,
    Settings: false,
    Users: true,
  },
  VERIFICATION_ADMIN: {
    Events: false,
    Tickets: false,
    Payments: false,
    Verification: true,
    Redeem: false,
    Scan: false,
    Analytics: false,
    Settings: false,
    Users: false,
  },
  REDEEM_CREW: {
    Events: false,
    Tickets: false,
    Payments: false,
    Verification: false,
    Redeem: true,
    Scan: false,
    Analytics: false,
    Settings: false,
    Users: false,
  },
  SCANNER_CREW: {
    Events: false,
    Tickets: false,
    Payments: false,
    Verification: false,
    Redeem: false,
    Scan: true,
    Analytics: false,
    Settings: false,
    Users: false,
  },
  PARTICIPANT: {
    Events: false,
    Tickets: false,
    Payments: false,
    Verification: false,
    Redeem: false,
    Scan: false,
    Analytics: false,
    Settings: false,
    Users: false,
  },
};

// ─── ACTION BADGE COLORS ─────────────────────────────────────────────────

function getActionBadgeStyle(action: string) {
  switch (action) {
    case 'APPROVE':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'REJECT':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'CREATE':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'UPDATE':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'LOGIN':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    case 'ASSIGN':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'REDEEM':
      return 'bg-teal-500/20 text-teal-400 border border-teal-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

// ─── SYSTEM HEALTH CARD ──────────────────────────────────────────────────

function HealthCard({
  title,
  value,
  icon: Icon,
  status,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  status: 'healthy' | 'warning' | 'error';
}) {
  const statusColor =
    status === 'healthy'
      ? '#22c55e'
      : status === 'warning'
        ? '#F8AD3C'
        : '#ef4444';

  const statusLabel =
    status === 'healthy' ? 'Healthy' : status === 'warning' ? 'Warning' : 'Error';

  return (
    <Card className="bg-[#111918] border border-[rgba(0,163,157,0.1)] hover:border-[rgba(0,163,157,0.3)] transition-all card-hover">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-[rgba(0,163,157,0.1)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#7FB3AE]" />
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-[10px] font-medium" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div>
          <p className="text-white text-lg font-bold">{value}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SETTINGS PAGE ───────────────────────────────────────────────────────

export function SettingsPage() {
  const { data: settingsData, isLoading, error } = useAdminSettings();

  const systemHealth: ISystemHealth = (settingsData as { systemHealth?: ISystemHealth } | undefined)?.systemHealth ?? {
    dbStatus: 'connected',
    activeConnections: 0,
    sseConnections: 0,
    tableCounts: {},
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    queueDepth: 0,
    avgResponseTime: 0,
    errorRate: 0,
  };
  const mockAuditLogs: IAuditLogDisplay[] = (settingsData as { auditLogs?: IAuditLogDisplay[] } | undefined)?.auditLogs ?? [];

  const [actionFilter, setActionFilter] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);

  // Global config state
  const [config, setConfig] = useState({
    paymentTimeout: '2',
    maxTicketsPerUser: '5',
    maxTicketsPerTransaction: '5',
    verificationSLA: '30',
    eventStatus: 'Published',
    twoFARequired: true,
    autoCancelExpired: true,
  });

  const filteredLogs =
    actionFilter === 'all'
      ? mockAuditLogs
      : mockAuditLogs.filter((log) => log.action === actionFilter);

  const uniqueActions = Array.from(new Set(mockAuditLogs.map((l) => l.action)));

  const handleSaveConfig = () => {
    setIsEditing(false);
    toast.success('Konfigurasi berhasil disimpan', {
      description: 'Perubahan konfigurasi telah diterapkan.',
    });
  };

  if (isLoading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>;
  if (error) return <div className="p-6 text-red-500">Failed to load data: {error.message}</div>;

  return (
    <div className="space-y-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(0,163,157,0.1)] flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#00A39D]" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Settings & Audit</h2>
          <p className="text-muted-foreground text-xs">
            Kelola role, pantau sistem, dan lihat audit log
          </p>
        </div>
      </div>

      <Separator className="bg-[rgba(0,163,157,0.1)]" />

      {/* ═══ MAIN TABS ═══ */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="bg-[#111918] border border-[rgba(0,163,157,0.15)] p-1">
          <TabsTrigger
            value="roles"
            className="text-xs data-[state=active]:bg-[#00A39D] data-[state=active]:text-[#0A0F0E] data-[state=active]:font-bold"
          >
            <Shield className="w-3 h-3 mr-1" />
            Role & Permissions
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="text-xs data-[state=active]:bg-[#00A39D] data-[state=active]:text-[#0A0F0E] data-[state=active]:font-bold"
          >
            <HeartPulse className="w-3 h-3 mr-1" />
            System Health
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="text-xs data-[state=active]:bg-[#00A39D] data-[state=active]:text-[#0A0F0E] data-[state=active]:font-bold"
          >
            <ScrollText className="w-3 h-3 mr-1" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="text-xs data-[state=active]:bg-[#00A39D] data-[state=active]:text-[#0A0F0E] data-[state=active]:font-bold"
          >
            <Sliders className="w-3 h-3 mr-1" />
            Global Config
          </TabsTrigger>
        </TabsList>

        {/* ─── ROLE & PERMISSIONS TAB ─── */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="bg-[#111918] border border-[rgba(0,163,157,0.1)]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00A39D]" />
                <CardTitle className="text-white text-sm font-bold">
                  RBAC Matrix — Role-Based Access Control
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground text-xs">
                Matriks akses fitur berdasarkan role pengguna
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-[rgba(0,163,157,0.08)]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(0,163,157,0.15)] hover:bg-transparent">
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider min-w-[160px]">
                        Role
                      </TableHead>
                      {rbacFeatures.map((f) => (
                        <TableHead
                          key={f}
                          className="text-[10px] text-muted-foreground uppercase tracking-wider text-center min-w-[70px]"
                        >
                          {f}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rbacRoles.map((role) => (
                      <TableRow
                        key={role}
                        className="border-b border-[rgba(0,163,157,0.08)] hover:bg-[rgba(0,163,157,0.04)]"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] font-medium',
                              role === 'SUPER_ADMIN'
                                ? 'border-[rgba(248,173,60,0.5)] text-[#F8AD3C]'
                                : role === 'ORGANIZER'
                                  ? 'border-[rgba(0,163,157,0.5)] text-[#00A39D]'
                                  : 'border-[rgba(127,179,174,0.3)] text-[#7FB3AE]'
                            )}
                          >
                            {role}
                          </Badge>
                        </TableCell>
                        {rbacFeatures.map((feature) => {
                          const hasAccess = rbacMatrix[role]?.[feature] ?? false;
                          return (
                            <TableCell key={feature} className="text-center">
                              {hasAccess ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400/50 mx-auto" />
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>Allowed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-400/50" />
                  <span>Denied</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── SYSTEM HEALTH TAB ─── */}
        <TabsContent value="health" className="space-y-4">
          <Card className="bg-[#111918] border border-[rgba(0,163,157,0.1)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-green-400" />
                  <CardTitle className="text-white text-sm font-bold">
                    System Health
                  </CardTitle>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold">
                  ● All Systems Operational
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground text-xs">
                Status real-time infrastruktur dan performa sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <HealthCard
                  title="Server Status"
                  value="Healthy"
                  icon={Server}
                  status="healthy"
                />
                <HealthCard
                  title="CPU Usage"
                  value={`${systemHealth.cpuUsage ?? 0}%`}
                  icon={Cpu}
                  status={(systemHealth.cpuUsage ?? 0) > 70 ? 'warning' : 'healthy'}
                />
                <HealthCard
                  title="Memory Usage"
                  value={`${systemHealth.memoryUsage ?? 0}%`}
                  icon={Gauge}
                  status={(systemHealth.memoryUsage ?? 0) > 75 ? 'warning' : 'healthy'}
                />
                <HealthCard
                  title="Disk Usage"
                  value={`${systemHealth.diskUsage ?? 0}%`}
                  icon={HardDrive}
                  status={(systemHealth.diskUsage ?? 0) > 80 ? 'warning' : 'healthy'}
                />
                <HealthCard
                  title="Database"
                  value="Connected"
                  icon={Database}
                  status={systemHealth.dbStatus === 'connected' ? 'healthy' : 'error'}
                />
                <HealthCard
                  title="Queue Depth"
                  value={`${systemHealth.queueDepth ?? 0}`}
                  icon={Activity}
                  status={(systemHealth.queueDepth ?? 0) > 10 ? 'warning' : 'healthy'}
                />
                <HealthCard
                  title="Avg Response"
                  value={`${systemHealth.avgResponseTime ?? 0}ms`}
                  icon={Timer}
                  status={(systemHealth.avgResponseTime ?? 0) > 300 ? 'warning' : 'healthy'}
                />
                <HealthCard
                  title="Error Rate"
                  value={`${systemHealth.errorRate ?? 0}%`}
                  icon={AlertTriangle}
                  status={(systemHealth.errorRate ?? 0) > 1 ? 'error' : (systemHealth.errorRate ?? 0) > 0.5 ? 'warning' : 'healthy'}
                />
                <HealthCard
                  title="Uptime"
                  value={systemHealth.uptime ? `${systemHealth.uptime}` : '0'}
                  icon={Clock}
                  status="healthy"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── AUDIT LOGS TAB ─── */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="bg-[#111918] border border-[rgba(0,163,157,0.1)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-[#F8AD3C]" />
                  <CardTitle className="text-white text-sm font-bold">
                    Audit Logs
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] border-[rgba(0,163,157,0.3)] text-[#7FB3AE]">
                  {mockAuditLogs.length} records
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground text-xs">
                Riwayat aktivitas seluruh admin dan crew sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter by action type..."
                    className="pl-8 h-8 bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-xs text-white"
                    value={actionFilter === 'all' ? '' : actionFilter}
                    onChange={(e) => setActionFilter(e.target.value || 'all')}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      'h-7 text-[10px] px-2',
                      actionFilter === 'all'
                        ? 'bg-[#00A39D] text-[#0A0F0E] border-[#00A39D]'
                        : 'border-[rgba(0,163,157,0.2)] text-muted-foreground hover:text-white'
                    )}
                    onClick={() => setActionFilter('all')}
                  >
                    All
                  </Button>
                  {uniqueActions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-7 text-[10px] px-2',
                        actionFilter === action
                          ? 'bg-[#00A39D] text-[#0A0F0E] border-[#00A39D]'
                          : 'border-[rgba(0,163,157,0.2)] text-muted-foreground hover:text-white'
                      )}
                      onClick={() => setActionFilter(action)}
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Logs Table */}
              <div className="max-h-96 overflow-y-auto rounded-lg border border-[rgba(0,163,157,0.08)]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-[rgba(0,163,157,0.15)] hover:bg-transparent">
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Timestamp
                      </TableHead>
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        User
                      </TableHead>
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Action
                      </TableHead>
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Module
                      </TableHead>
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Details
                      </TableHead>
                      <TableHead className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        IP
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-b border-[rgba(0,163,157,0.08)] hover:bg-[rgba(0,163,157,0.04)]"
                      >
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.createdAt), 'dd MMM, HH:mm')}
                        </TableCell>
                        <TableCell className="text-xs text-white font-medium whitespace-nowrap">
                          {log.userName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn('text-[10px] font-bold', getActionBadgeStyle(log.action))}
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#7FB3AE]">
                          {log.module}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                          {log.details}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {log.ip}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8 text-sm">
                          No audit logs found for this filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── GLOBAL CONFIG TAB ─── */}
        <TabsContent value="config" className="space-y-4">
          <Card className="bg-[#111918] border border-[rgba(0,163,157,0.1)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00A39D]" />
                  <CardTitle className="text-white text-sm font-bold">
                    Global Configuration
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant={isEditing ? 'default' : 'outline'}
                  className={cn(
                    'text-xs',
                    isEditing
                      ? 'bg-[#00A39D] hover:bg-[#00BFB8] text-[#0A0F0E] font-semibold'
                      : 'border-[rgba(0,163,157,0.3)] text-[#00A39D] hover:bg-[rgba(0,163,157,0.1)]'
                  )}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
              <CardDescription className="text-muted-foreground text-xs">
                Konfigurasi global sistem ticketing — hanya SUPER_ADMIN yang dapat mengubah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium">
                    Payment Timeout (jam)
                  </label>
                  <Input
                    type="number"
                    value={config.paymentTimeout}
                    onChange={(e) => setConfig({ ...config, paymentTimeout: e.target.value })}
                    disabled={!isEditing}
                    className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white text-sm h-10 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium">
                    Max Tickets per User
                  </label>
                  <Input
                    type="number"
                    value={config.maxTicketsPerUser}
                    onChange={(e) => setConfig({ ...config, maxTicketsPerUser: e.target.value })}
                    disabled={!isEditing}
                    className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white text-sm h-10 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium">
                    Max Tickets per Transaction
                  </label>
                  <Input
                    type="number"
                    value={config.maxTicketsPerTransaction}
                    onChange={(e) => setConfig({ ...config, maxTicketsPerTransaction: e.target.value })}
                    disabled={!isEditing}
                    className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white text-sm h-10 disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground font-medium">
                    Verification SLA (menit)
                  </label>
                  <Input
                    type="number"
                    value={config.verificationSLA}
                    onChange={(e) => setConfig({ ...config, verificationSLA: e.target.value })}
                    disabled={!isEditing}
                    className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white text-sm h-10 disabled:opacity-60"
                  />
                </div>
              </div>

              <Separator className="bg-[rgba(0,163,157,0.1)]" />

              {/* Select Field */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">
                  Event Status
                </label>
                <Select
                  value={config.eventStatus}
                  onValueChange={(value) => setConfig({ ...config, eventStatus: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white text-sm h-10 disabled:opacity-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                    <SelectItem value="Published" className="text-white">
                      Published
                    </SelectItem>
                    <SelectItem value="Draft" className="text-white">
                      Draft
                    </SelectItem>
                    <SelectItem value="Sold Out" className="text-white">
                      Sold Out
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator className="bg-[rgba(0,163,157,0.1)]" />

              {/* Switch Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm text-white font-medium">
                      2FA Required for Admin
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Wajibkan autentikasi dua faktor untuk akses admin panel
                    </p>
                  </div>
                  <Switch
                    checked={config.twoFARequired}
                    onCheckedChange={(checked) => setConfig({ ...config, twoFARequired: checked })}
                    disabled={!isEditing}
                  />
                </div>
                <Separator className="bg-[rgba(0,163,157,0.06)]" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm text-white font-medium">
                      Auto-cancel Expired Orders
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Batalkan pesanan secara otomatis jika melewati batas waktu pembayaran
                    </p>
                  </div>
                  <Switch
                    checked={config.autoCancelExpired}
                    onCheckedChange={(checked) => setConfig({ ...config, autoCancelExpired: checked })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <Separator className="bg-[rgba(0,163,157,0.1)]" />

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[rgba(0,163,157,0.2)] text-muted-foreground text-xs"
                  onClick={() => {
                    setConfig({
                      paymentTimeout: '2',
                      maxTicketsPerUser: '5',
                      maxTicketsPerTransaction: '5',
                      verificationSLA: '30',
                      eventStatus: 'Published',
                      twoFARequired: true,
                      autoCancelExpired: true,
                    });
                    setIsEditing(false);
                    toast.info('Perubahan dibatalkan');
                  }}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="bg-[#00A39D] hover:bg-[#00BFB8] text-[#0A0F0E] text-xs font-semibold disabled:opacity-40"
                  disabled={!isEditing}
                  onClick={handleSaveConfig}
                >
                  <Save className="w-3 h-3 mr-1" />
                  Simpan Konfigurasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
