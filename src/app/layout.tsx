import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HoardBook | Premium Outdoor Advertising Platform",
  description: "The world's first decentralized marketplace for billboards and hoardings. Book, manage, and scale your outdoor advertising with state-of-the-art 3D management tools.",
  keywords: "hoarding, billboard, advertising, marketing, outdoor advertising, booking, OOH, adtech",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
