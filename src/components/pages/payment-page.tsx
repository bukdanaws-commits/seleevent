"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  QrCode,
  Building2,
  Copy,
  CheckCircle2,
  Send,
  Camera,
  Loader2,
} from "lucide-react";
import { formatRupiah, formatDateTime } from "@/lib/utils";
import { useCreatePayment, usePaymentStatus, useOrderDetail } from "@/hooks/use-api";
import { loadMidtransSnap } from "@/lib/midtrans";
import { usePageStore } from "@/lib/page-store";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { IOrder } from "@/lib/types";

export default function PaymentPage() {
  const { currentOrderId, navigateTo } = usePageStore();
  const { toast } = useToast();
  const createPayment = useCreatePayment();

  // ─── Fetch order detail from API ───────────────────────────
  const { data: orderData, isLoading: orderLoading } = useOrderDetail(currentOrderId || "");
  const order = orderData as IOrder | null;

  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [timePercentage, setTimePercentage] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (!order?.expiresAt) return;

    const expiresAt = new Date(order.expiresAt).getTime();
    const createdAt = new Date(order.createdAt).getTime();
    const totalDuration = expiresAt - createdAt || (2 * 60 * 60 * 1000); // fallback 2 hours

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, expiresAt - now);

      if (diff <= 0) {
        navigateTo("home");
        toast({ title: "Waktu pembayaran habis", variant: "destructive" });
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });

      const elapsed = totalDuration - diff;
      setTimePercentage(Math.max(0, 100 - (elapsed / totalDuration) * 100));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [order, navigateTo, toast]);

  // ─── File upload handlers ──────────────────────────────────
  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Format file harus gambar", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Ukuran file maksimal 5MB", variant: "destructive" });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!order) return;

    try {
      // Use Midtrans Snap for payment
      const result = await createPayment.mutateAsync({
        orderId: order.id,
        paymentType: 'qris',
      }) as { token: string; redirectUrl?: string };

      await loadMidtransSnap();

      if (window.snap && result.token) {
        window.snap.pay(result.token, {
          onSuccess: () => {
            toast({ title: "Pembayaran berhasil!" });
            navigateTo("payment-status", order.id);
          },
          onPending: () => {
            toast({ title: "Pembayaran menunggu konfirmasi" });
            navigateTo("payment-status", order.id);
          },
          onError: () => {
            toast({ title: "Pembayaran gagal", variant: "destructive" });
          },
          onClose: () => {
            toast({ title: "Pembayaran dibatalkan" });
          },
        });
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memproses pembayaran';
      toast({ title: message, variant: "destructive" });
    }
  };

  // ─── Loading state ─────────────────────────────────────────
  if (orderLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        <span className="ml-3 text-gray-400">Memuat pesanan...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <p className="text-gray-500">Order tidak ditemukan</p>
      </div>
    );
  }

  const isUrgent = timeLeft.hours < 0 && timeLeft.minutes < 30;
  const eventTitle = order.event?.title || "Event";
  const eventDate = order.event?.date || "";
  const totalTickets = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0B0F]/95 backdrop-blur-md border-b border-[#2A2A35]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#16161D]"
            onClick={() => navigateTo("home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-white font-semibold text-lg flex-1">
            Pembayaran
          </h1>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              isUrgent
                ? "text-red-400 border-red-500/50 animate-pulse"
                : "text-yellow-400 border-yellow-500/50"
            )}
          >
            <Clock className="w-3 h-3 mr-1" />
            {String(timeLeft.hours).padStart(2, "0")}:
            {String(timeLeft.minutes).padStart(2, "0")}:
            {String(timeLeft.seconds).padStart(2, "0")}
          </Badge>
        </div>
        <Progress
          value={timePercentage}
          className={cn(
            "h-0.5 rounded-none",
            isUrgent ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"
          )}
        />
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-28 space-y-4">
        {/* Order summary */}
        <Card className="bg-[#16161D] border-[#2A2A35]">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Kode Pesanan</span>
              <div className="flex items-center gap-1">
                <span className="text-white font-mono text-sm">
                  {order.orderCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-white"
                  onClick={() => {
                    navigator.clipboard.writeText(order.orderCode);
                    toast({ title: "Kode disalin!" });
                  }}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <Separator className="bg-[#2A2A35]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{eventTitle}</p>
                <p className="text-gray-400 text-xs">{eventDate}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-bold text-xl">
                  {formatRupiah(order.totalAmount)}
                </p>
                <p className="text-gray-500 text-xs">
                  {totalTickets} tiket
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QRIS Section */}
        <Card className="bg-[#16161D] border-[#2A2A35]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <QrCode className="w-4 h-4 text-green-400" />
              Pembayaran QRIS
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Scan QR code menggunakan aplikasi e-wallet atau mobile banking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR placeholder */}
            <div className="flex justify-center">
              <div className="relative bg-white p-4 rounded-xl">
                <div className="w-48 h-48 bg-[#0B0B0F] rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simulated QR pattern */}
                  <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-0.5 opacity-80">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-[1px]",
                          Math.random() > 0.4
                            ? "bg-white"
                            : "bg-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <div className="relative z-10 bg-white rounded-md px-2 py-1">
                    <QrCode className="w-6 h-6 text-[#0B0B0F]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer details */}
            <div className="space-y-2">
              <div className="bg-[#0B0B0F] rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Bank</span>
                  <span className="text-white font-medium text-sm flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    BCA Virtual Account
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">No. Rekening</span>
                  <div className="flex items-center gap-1">
                    <span className="text-white font-mono text-sm">
                      8800 1234 5678 9012
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-500 hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText("8800123456789012");
                        toast({ title: "Nomor rekening disalin!" });
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">Atas Nama</span>
                  <span className="text-white text-sm">
                    PT SELA ENTERTAINMENT
                  </span>
                </div>
                <Separator className="bg-[#2A2A35]" />
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm font-medium">
                    Total Bayar
                  </span>
                  <span className="text-green-400 font-bold text-lg">
                    {formatRupiah(order.totalAmount)}
                  </span>
                </div>
              </div>

              <Alert className="border-yellow-500/30 bg-yellow-500/5">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400/80 text-xs">
                  Pastikan nominal transfer <strong>TEPAT</strong> sesuai total
                  di atas. Transfer kurang atau lebih akan menyebabkan
                  verifikasi gagal.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="bg-[#16161D] border-[#2A2A35]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Upload className="w-4 h-4 text-green-400" />
              Upload Bukti Pembayaran
            </CardTitle>
            <CardDescription className="text-gray-400 text-xs">
              Upload screenshot atau foto bukti transfer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {uploadedFile ? (
              <div className="relative rounded-lg overflow-hidden border border-[#2A2A35]">
                <img
                  src={uploadedFile}
                  alt="Bukti pembayaran"
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-500"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-green-500/80 text-white text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    File terpilih
                  </Badge>
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragging
                    ? "border-green-500 bg-green-500/5"
                    : "border-[#2A2A35] hover:border-gray-500"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-medium mb-1">
                  Drag & drop atau klik untuk upload
                </p>
                <p className="text-gray-600 text-xs">
                  JPG, PNG, JPEG • Maks 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0B0F]/95 backdrop-blur-md border-t border-[#2A2A35] p-4 z-50">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold h-12"
            onClick={handleSubmit}
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Upload Bukti & Kirim
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
