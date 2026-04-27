'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  mockStaffUsers,
  getRoleBadgeColor,
  getRoleLabel,
  getStatusBadgeColor,
  type StaffUser,
  type UserRole,
} from '@/lib/operational-mock-data';
import { formatDateTimeShort } from '@/lib/operational-mock-data';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  UserCog,
  Plus,
  Pencil,
  Search,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Activity,
  Users,
  Filter,
} from 'lucide-react';

// ─── ROLE TABS ───────────────────────────────────────────────────────────────

const roleTabs: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'COUNTER_STAFF', label: 'Counter Staff' },
  { value: 'GATE_STAFF', label: 'Gate Staff' },
  { value: 'ORGANIZER', label: 'Organizer' },
  { value: 'PARTICIPANT', label: 'Peserta' },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function StaffManagement() {
  const [staff] = useState<StaffUser[]>([...mockStaffUsers]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Add form
  const [addForm, setAddForm] = useState({
    email: '',
    role: 'COUNTER_STAFF' as UserRole,
    assignedLocation: '',
    shift: 'pagi',
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    role: '' as UserRole,
    assignedLocation: '',
    status: '' as 'active' | 'inactive',
  });

  // ── Filtered data ──
  const filteredStaff = useMemo(() => {
    let result = [...staff];
    if (roleFilter !== 'all') {
      result = result.filter((s) => s.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }
    return result;
  }, [staff, roleFilter, statusFilter, searchQuery]);

  // ── Stats ──
  const stats = useMemo(
    () => ({
      total: staff.length,
      active: staff.filter((s) => s.status === 'active').length,
      inactive: staff.filter((s) => s.status === 'inactive').length,
      counterStaff: staff.filter((s) => s.role === 'COUNTER_STAFF').length,
      gateStaff: staff.filter((s) => s.role === 'GATE_STAFF').length,
    }),
    [staff]
  );

  // ── Helpers ──
  const allLocations = useMemo(() => {
    const counterLocations = [...new Set(mockStaffUsers.filter(s => s.role === 'COUNTER_STAFF' && s.assignedLocation).map(s => s.assignedLocation!))];
    const gateLocations = [...new Set(mockStaffUsers.filter(s => s.role === 'GATE_STAFF' && s.assignedLocation).map(s => s.assignedLocation!))];
    return { counterLocations, gateLocations };
  }, []);

  const isSuperAdmin = (role: UserRole) => role === 'SUPER_ADMIN';

  const handleAddStaff = () => {
    if (!addForm.email.trim()) {
      toast.error('Email wajib diisi');
      return;
    }
    toast.success(`Staff baru berhasil ditambahkan`);
    setAddForm({ email: '', role: 'COUNTER_STAFF', assignedLocation: '', shift: 'pagi' });
    setAddDialogOpen(false);
  };

  const handleEditStaff = (s: StaffUser) => {
    setSelectedStaff(s);
    setEditForm({
      role: s.role,
      assignedLocation: s.assignedLocation || '',
      status: s.status,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedStaff) return;
    setEditDialogOpen(false);
    toast.success(`Data "${selectedStaff.name}" berhasil diperbarui`);
  };

  return (
    <div className="space-y-6">
      {/* ═══════════ PAGE HEADER ═══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-6 h-6 text-[#00A39D]" />
            Kelola Staff &amp; Role
          </h2>
          <p className="text-[#7FB3AE] text-sm mt-1">
            Manajemen staff, role, shift, dan assignment lokasi
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddDialogOpen(true)}
          className="bg-[#00A39D] text-white hover:bg-[#00A39D]/90"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Staff
        </Button>
      </div>

      {/* ═══════════ STATS ROW ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Staff', value: stats.total, icon: Users, color: 'text-white' },
          { label: 'Aktif', value: stats.active, icon: Activity, color: 'text-emerald-400' },
          { label: 'Nonaktif', value: stats.inactive, icon: Users, color: 'text-gray-400' },
          { label: 'Counter Staff', value: stats.counterStaff, icon: MapPin, color: 'text-emerald-400' },
          { label: 'Gate Staff', value: stats.gateStaff, icon: MapPin, color: 'text-blue-400' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#111918] border-[rgba(0,163,157,0.1)] py-4">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[rgba(0,163,157,0.08)] flex items-center justify-center shrink-0">
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <div className="min-w-0">
                <p className={cn('text-lg font-bold leading-tight', stat.color)}>
                  {stat.value.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-[#7FB3AE] truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ═══════════ FILTER ROW ═══════════ */}
      <div className="space-y-3">
        {/* Role tabs */}
        <div className="flex flex-wrap gap-1.5">
          {roleTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={roleFilter === tab.value ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRoleFilter(tab.value)}
              className={cn(
                'text-xs h-8',
                roleFilter === tab.value
                  ? 'bg-[#00A39D] text-white hover:bg-[#00A39D]'
                  : 'text-[#7FB3AE] hover:text-white hover:bg-[rgba(0,163,157,0.1)]'
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search + status filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7FB3AE]" />
            <Input
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#111918] border-[rgba(0,163,157,0.1)] text-white placeholder:text-[#7FB3AE]/60 h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#7FB3AE]" />
            {['all', 'active', 'inactive'].map((val) => (
              <Button
                key={val}
                variant={statusFilter === val ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(val)}
                className={cn(
                  'text-xs h-8',
                  statusFilter === val
                    ? 'bg-[#00A39D] text-white hover:bg-[#00A39D]'
                    : 'text-[#7FB3AE] hover:text-white hover:bg-[rgba(0,163,157,0.1)]'
                )}
              >
                {val === 'all' ? 'Semua' : val === 'active' ? 'Aktif' : 'Nonaktif'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════ STAFF TABLE ═══════════ */}
      <Card className="bg-[#111918] border-[rgba(0,163,157,0.1)] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(0,163,157,0.1)] hover:bg-transparent">
                  <TableHead className="text-[#7FB3AE] text-xs font-medium">Nama</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium">Email</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium">Role</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium hidden lg:table-cell">Lokasi</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium hidden lg:table-cell">Shift</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium">Status</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium hidden xl:table-cell">Terakhir Aktif</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium hidden xl:table-cell">Total Scan</TableHead>
                  <TableHead className="text-[#7FB3AE] text-xs font-medium">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={10} className="text-center py-12 text-[#7FB3AE]">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Tidak ada staff ditemukan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((s) => {
                    const roleColor = getRoleBadgeColor(s.role);
                    const statusColor = getStatusBadgeColor(s.status);
                    const sa = isSuperAdmin(s.role);
                    return (
                      <TableRow
                        key={s.id}
                        className="border-[rgba(0,163,157,0.06)] hover:bg-[rgba(0,163,157,0.04)]"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                              s.role === 'COUNTER_STAFF' ? 'bg-emerald-500/10 text-emerald-400' :
                              s.role === 'GATE_STAFF' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-[rgba(0,163,157,0.1)] text-[#00A39D]'
                            )}>
                              {s.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm text-white font-medium">{s.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-[#7FB3AE] flex items-center gap-1">
                          <Mail className="w-3 h-3 shrink-0" />
                          {s.email}
                        </TableCell>
                        <TableCell className="text-xs text-[#7FB3AE] hidden md:table-cell flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          {s.phone}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px] font-semibold', roleColor)}>
                            {getRoleLabel(s.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#7FB3AE] hidden lg:table-cell flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {s.assignedLocation || '—'}
                        </TableCell>
                        <TableCell className="text-xs text-[#7FB3AE] hidden lg:table-cell flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {s.shift || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-[10px]', statusColor)}>
                            {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-[#7FB3AE] hidden xl:table-cell">
                          {formatDateTimeShort(s.lastActive)}
                        </TableCell>
                        <TableCell className="text-xs text-white font-medium hidden xl:table-cell">
                          {s.totalScans.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-7 w-7',
                              sa
                                ? 'text-[#7FB3AE]/30 cursor-not-allowed'
                                : 'text-[#7FB3AE] hover:text-white hover:bg-[rgba(0,163,157,0.1)]'
                            )}
                            disabled={sa}
                            onClick={() => handleEditStaff(s)}
                            title={sa ? 'Super Admin tidak bisa diedit' : 'Edit staff'}
                          >
                            {sa ? <Lock className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer count */}
          <div className="px-4 py-3 border-t border-[rgba(0,163,157,0.1)]">
            <p className="text-xs text-[#7FB3AE]">
              Menampilkan {filteredStaff.length} dari {staff.length} staff
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══════════ ADD STAFF DIALOG ═══════════ */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-[#111918] border-[rgba(0,163,157,0.2)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Tambah Staff Baru</DialogTitle>
            <DialogDescription className="text-[#7FB3AE]">
              Masukkan Google email dan role untuk staff baru
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[#7FB3AE] text-sm">Google Email</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                placeholder="staff@gmail.com"
                className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white placeholder:text-[#7FB3AE]/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#7FB3AE] text-sm">Role</Label>
              <Select
                value={addForm.role}
                onValueChange={(v) => setAddForm({ ...addForm, role: v as UserRole, assignedLocation: '' })}
              >
                <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                  <SelectItem value="COUNTER_STAFF">Counter Staff</SelectItem>
                  <SelectItem value="GATE_STAFF">Gate Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#7FB3AE] text-sm">
                Assign ke {addForm.role === 'COUNTER_STAFF' ? 'Counter' : 'Gate'}
              </Label>
              <Select
                value={addForm.assignedLocation}
                onValueChange={(v) => setAddForm({ ...addForm, assignedLocation: v })}
              >
                <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white">
                  <SelectValue placeholder="Pilih lokasi..." />
                </SelectTrigger>
                <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                  {(addForm.role === 'COUNTER_STAFF' ? allLocations.counterLocations : allLocations.gateLocations).map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#7FB3AE] text-sm">Shift</Label>
              <Select
                value={addForm.shift}
                onValueChange={(v) => setAddForm({ ...addForm, shift: v })}
              >
                <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                  <SelectItem value="pagi">Pagi (08:00 – 15:00)</SelectItem>
                  <SelectItem value="malam">Malam (15:00 – 22:00)</SelectItem>
                  <SelectItem value="full">Full Day (08:00 – 22:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setAddDialogOpen(false)}
              className="text-[#7FB3AE] hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
            >
              Batal
            </Button>
            <Button
              onClick={handleAddStaff}
              className="bg-[#00A39D] text-white hover:bg-[#00A39D]/90"
            >
              Tambah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ EDIT STAFF DIALOG ═══════════ */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#111918] border-[rgba(0,163,157,0.2)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Staff — {selectedStaff?.name}</DialogTitle>
            <DialogDescription className="text-[#7FB3AE]">
              {selectedStaff?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedStaff && (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0A0F0E] border border-[rgba(0,163,157,0.08)]">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                    selectedStaff.role === 'COUNTER_STAFF' ? 'bg-emerald-500/10 text-emerald-400' :
                    selectedStaff.role === 'GATE_STAFF' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-[rgba(0,163,157,0.1)] text-[#00A39D]'
                  )}>
                    {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{selectedStaff.name}</p>
                    <Badge variant="outline" className={cn('text-[10px] font-semibold mt-1', getRoleBadgeColor(selectedStaff.role))}>
                      {getRoleLabel(selectedStaff.role)}
                    </Badge>
                  </div>
                </div>

                {!isSuperAdmin(selectedStaff.role) && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-[#7FB3AE] text-sm">Role</Label>
                      <Select
                        value={editForm.role}
                        onValueChange={(v) => setEditForm({ ...editForm, role: v as UserRole })}
                      >
                        <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                          <SelectItem value="COUNTER_STAFF">Counter Staff</SelectItem>
                          <SelectItem value="GATE_STAFF">Gate Staff</SelectItem>
                          <SelectItem value="ORGANIZER">Organizer</SelectItem>
                          <SelectItem value="PARTICIPANT">Peserta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#7FB3AE] text-sm">Assign Lokasi</Label>
                      <Select
                        value={editForm.assignedLocation}
                        onValueChange={(v) => setEditForm({ ...editForm, assignedLocation: v })}
                      >
                        <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white">
                          <SelectValue placeholder="Kosongkan = unassign" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                          <SelectItem value="__none__">— Tidak Assign —</SelectItem>
                          {allLocations.counterLocations.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                          {allLocations.gateLocations.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[#7FB3AE] text-sm">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(v) => setEditForm({ ...editForm, status: v as 'active' | 'inactive' })}
                      >
                        <SelectTrigger className="bg-[#0A0F0E] border-[rgba(0,163,157,0.15)] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111918] border-[rgba(0,163,157,0.2)]">
                          <SelectItem value="active">Aktif</SelectItem>
                          <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditDialogOpen(false)}
              className="text-[#7FB3AE] hover:text-white hover:bg-[rgba(0,163,157,0.1)]"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSuperAdmin(selectedStaff?.role || 'PARTICIPANT')}
              className="bg-[#00A39D] text-white hover:bg-[#00A39D]/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StaffManagement;
