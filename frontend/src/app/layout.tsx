import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n';
import { CartProvider } from '@/lib/cart';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'MUKANA',
  description:
    'Mukana is a Hong Kong design studio (est. 2018) making notebooks, tote bags, keyrings and postcards to ease everyday loneliness.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'MUKANA',
    description: 'Companionship, designed in Hong Kong.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="flex min-h-screen flex-col bg-mukana-paper font-sans antialiased">
        <LanguageProvider>
          <CartProvider>
            <Header />
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
