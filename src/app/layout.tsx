import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { Navigation } from '@/components/layout/Navigation';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'EventWise AI — Plan • Organize • Celebrate',
  description: 'EventWise AI turns your ideas into complete, actionable event plans with smart budgets, timelines, vendor options, and adaptive recovery when plans change.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="bg-[#FFF5F8] text-[#1e1b4b] min-h-screen antialiased flex flex-col font-sans">
        <AuthProvider>
          <EventProvider>
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
