import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../styles/luxury.css';
import '../styles/animations.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/wishlistContext';
import MobileBottomNav from '@/components/MobileBottomNav';
import { SITE_URL } from '@/lib/site';
import { BUSINESS_NAME, BUSINESS_ADDRESS } from '@/lib/business';

const siteUrl = SITE_URL;

// LocalBusiness structured data (JSON-LD) — powers the Google Maps /
// local-pack knowledge panel and rich search results. Rendered once, site
// -wide, so every crawled page carries the same store identity + address.
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: BUSINESS_NAME,
  image: `${siteUrl}/images/hero.jpg`,
  url: siteUrl,
  telephone: '+91-88519-11653',
  priceRange: '₹₹',
  address: {
    '@type': 'PostalAddress',
    streetAddress: `${BUSINESS_ADDRESS.line1}, ${BUSINESS_ADDRESS.line2}`,
    addressLocality: BUSINESS_ADDRESS.locality,
    addressRegion: BUSINESS_ADDRESS.region,
    postalCode: BUSINESS_ADDRESS.postalCode,
    addressCountry: BUSINESS_ADDRESS.countryCode,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday'],
      opens: '11:00',
      closes: '18:00',
    },
  ],
  sameAs: [process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/omgauriputra'],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Set NEXT_PUBLIC_GOOGLE_VERIFICATION (the content value Google Search
  // Console gives you) to verify ownership via the meta-tag method.
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
    : undefined,
  title: {
    default: 'Om Gauri Putra — Gold, Silver, Diamond & Rudraksh Jewellery Online',
    template: '%s | Om Gauri Putra Jewellers',
  },
  description:
    'Buy certified gold, 92.5 silver, diamond and authentic Nepal Rudraksh jewellery online at Om Gauri Putra. BIS hallmarked, bridal sets, necklaces, earrings & rings with free shipping above ₹1999. Three generations of trust in New Delhi.',
  keywords: [
    'gold jewellery online',
    'silver jewellery',
    'diamond necklace',
    'bridal jewellery',
    'rudraksh online',
    'certified rudraksh nepal',
    'BIS hallmarked gold',
    '925 silver jewellery',
    'temple jewellery',
    'kundan necklace',
    'jhumka earrings',
    'gold rings india',
    'jewellery shop Rohini Delhi',
    'jewellery shop Budh Vihar',
    'jewellery shop Sector 24 Delhi',
    'Om Gauri Putra',
    'OMGP gems',
  ],
  authors: [{ name: 'Om Gauri Putra Jewellers' }],
  creator: 'Om Gauri Putra',
  applicationName: 'Om Gauri Putra',
  category: 'shopping',
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Om Gauri Putra',
    title: 'Om Gauri Putra — Gold, Silver, Diamond & Rudraksh Jewellery',
    description:
      'Certified gold, silver, diamond and authentic Rudraksh jewellery. BIS hallmarked, bridal collections, free shipping above ₹1999.',
    images: [{ url: '/images/hero.jpg', width: 1200, height: 630, alt: 'Om Gauri Putra Jewellery' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Om Gauri Putra — Fine Jewellery & Rudraksh',
    description: 'Certified gold, silver, diamond & authentic Rudraksh jewellery online.',
    images: ['/images/hero.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#1a1410',
  width: 'device-width',
  initialScale: 1,
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
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
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