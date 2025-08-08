import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/layout';
import { ThemeProvider } from '@/components/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Game Arena - Ultimate Gaming Platform',
  description: 'The ultimate gaming platform where strategy meets competition. Challenge players worldwide in classic games like Chess, Checkers, Solitaire, and Belot.',
  icons: {
    icon: '/images/logoGarena-transp.png',
    shortcut: '/images/logoGarena-transp.png',
    apple: '/images/logoGarena-transp.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <NavBar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
