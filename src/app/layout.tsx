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
        {/* WCAG 2.2 Skip to main content link for screen readers & keyboard navigation */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-pink-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <EventProvider>
            <Navigation />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
