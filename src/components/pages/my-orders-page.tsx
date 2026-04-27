"use client";

import React from "react";
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
import {
  ArrowLeft,
  Home,
  Ticket,
  Upload,
  QrCode,
  Calendar,
  ShoppingBag,
  Clock,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { Order } from "@/lib/mock-data";
import { useAuthStore } from "@/lib/auth-store";
import { usePageStore } from "@/lib/page-store";
import { cn } from "@/lib/utils";

function getStatusBadge(status: Order["status"]) {
  switch (status) {
    case "pending":
      return (
        <Badge
          variant="outline"
          className="text-yellow-400 border-yellow-500/50 text-xs"
        >
          <Clock className="w-3 h-3 mr-1" />
          Menunggu Bayar
        </Badge>
      );
    case "paid":
      return (
        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Lunas
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Ditolak
        </Badge>
      );
    case "expired":
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-600 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-600 text-xs">
          Dibatalkan
        </Badge>
      );
  }
}

export default function MyOrdersPage() {
  const { navigateTo } = usePageStore();
  const { orders } = useAuthStore();

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
            Pesanan Saya
          </h1>
          <Badge
            variant="outline"
            className="text-gray-400 border-[#2A2A35] text-xs"
          >
            {orders.length} pesanan
          </Badge>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {orders.length === 0 ? (
          <Card className="bg-[#16161D] border-[#2A2A35]">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">
                Belum ada pesanan
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Anda belum memiliki pesanan. Mulai beli tiket sekarang!
              </p>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => navigateTo("checkout")}
              >
                <Ticket className="w-4 h-4 mr-2" />
                Beli Tiket
              </Button>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}

        {/* Back button */}
        <Button
          variant="outline"
          className="w-full border-[#2A2A35] text-gray-300 hover:bg-[#16161D] hover:text-white h-12 mt-4 mb-8"
          onClick={() => navigateTo("home")}
        >
          <Home className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Button>
      </main>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const { navigateTo } = usePageStore();
  const totalTickets = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Card
      className="bg-[#16161D] border-[#2A2A35] hover:border-[#3A3A45] transition-colors cursor-pointer"
      onClick={() => {
        if (order.status === "pending") navigateTo("payment", order.id);
        else if (order.status === "paid") navigateTo("eticket", order.id);
        else if (order.status === "rejected") navigateTo("payment", order.id);
      }}
    >
      <CardContent className="pt-4 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-semibold text-sm">
                {order.eventTitle}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {order.eventDate}
              </span>
              <span>•</span>
              <span>{order.eventCity}</span>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <Separator className="bg-[#2A2A35]" />

        {/* Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-0.5">
            <p className="text-gray-500 text-xs">Kode Pesanan</p>
            <p className="text-white font-mono text-xs">{order.orderCode}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-gray-500 text-xs">Total</p>
            <p className="text-green-400 font-bold">
              {formatRupiah(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Ticket className="w-3 h-3" />
            {totalTickets} tiket
          </span>
          <span className="text-gray-500 text-xs">
            {order.paymentMethod}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          {order.status === "pending" && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo("payment", order.id);
                }}
              >
                <Upload className="w-3 h-3 mr-1" />
                Upload Bukti
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  // cancel order could be added here
                }}
              >
                Batalkan
              </Button>
            </>
          )}
          {order.status === "paid" && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo("eticket", order.id);
                }}
              >
                <QrCode className="w-3 h-3 mr-1" />
                Lihat E-Tiket
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#2A2A35] text-gray-300 hover:bg-[#16161D] hover:text-white h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo("eticket", order.id);
                }}
              >
                <QrCode className="w-3 h-3" />
              </Button>
            </>
          )}
          {order.status === "rejected" && (
            <Button
              size="sm"
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black h-9"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo("payment", order.id);
              }}
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload Ulang
            </Button>
          )}
          {(order.status === "expired" || order.status === "cancelled") && (
            <Button
              size="sm"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white h-9"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo("checkout");
              }}
            >
              <Ticket className="w-3 h-3 mr-1" />
              Beli Ulang
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
