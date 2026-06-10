import type { Metadata } from 'next';
import './globals.css';
import '../styles/luxury.css';
import '../styles/animations.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/wishlistContext';
import MobileBottomNav from '@/components/MobileBottomNav';

export const metadata: Metadata = {
  title: 'Om Gauri Pulta — Gems, Jewellery & Rudraksh',
  description:
    'Exquisite handcrafted gold, silver, gems and authentic Rudraksh jewellery. Three generations of trust and craftsmanship.',
  keywords: [
    'gold jewellery',
    'silver jewellery',
    'rudraksh',
    'gems',
    'diamond necklace',
    'bridal jewellery',
    'om gauri pulta',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Cinzel:wght@400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="pb-14 md:pb-0">
        <CartProvider>
          <WishlistProvider>
            {children}
            <MobileBottomNav />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}