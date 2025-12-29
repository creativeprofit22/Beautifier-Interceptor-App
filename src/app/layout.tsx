import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TRPCProvider } from "@/trpc/client";
import { NavHeader } from "@/components/NavHeader";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Boilerplate",
  description: "Production-ready Next.js boilerplate with Auth, tRPC, Prisma, and shadcn/ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-zinc-950 antialiased`}>
        <TRPCProvider>
          <ToastProvider>
            <NavHeader />
            {children}
          </ToastProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
