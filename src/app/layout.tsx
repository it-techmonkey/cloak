import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavigationProgress from "@/components/shared/NavigationProgress";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloak | Digital Cloakroom",
  description: "Venue-approved digital cloakroom tickets, QR scanning, and operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <Suspense>
            <NavigationProgress />
          </Suspense>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
