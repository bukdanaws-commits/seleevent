import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sheila On 7 — Melompat Lebih Tinggi Tour 2025 | Jakarta",
  description: "Konser Sheila On 7 Melompat Lebih Tinggi Tour 2025 di GBK Madya Stadium Jakarta. 24 Mei 2025. Dapatkan tiket sekarang — Sobat Duta!",
  keywords: ["Sheila On 7", "Melompat Lebih Tinggi", "Konser Jakarta", "GBK Madya", "Tiket Konser", "Sobat Duta"],
  authors: [{ name: "Sheila On 7 Tour 2025" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Sheila On 7 — Melompat Lebih Tinggi Tour 2025 | Jakarta",
    description: "Konser Sheila On 7 Melompat Lebih Tinggi Tour 2025 di GBK Madya Stadium Jakarta. 24 Mei 2025.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheila On 7 — Melompat Lebih Tinggi Tour 2025",
    description: "Konser Sheila On 7 Melompat Lebih Tinggi Tour 2025. GBK Madya, 24 Mei 2025.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="sheilaon7-theme"
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
