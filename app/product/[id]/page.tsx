import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dbGetProducts } from '@/lib/productsDb';
import { dbGetProductReviews, dbGetProductReviewSummary } from '@/lib/reviewsDb';
import { isSupabaseConfigured } from '@/lib/supabase';
import { products as seedProducts, type Product } from '@/data/jewelleryData';
import { getProductById, getRelatedProducts } from '@/lib/products';
import { SITE_URL } from '@/lib/site';
import ProductDetailClient from './ProductDetailClient';

async function loadCatalogue(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return seedProducts;
  const db = await dbGetProducts();
  return db && db.length ? db : seedProducts;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const list = await loadCatalogue();
  const product = getProductById(params.id, list);
  if (!product) return { title: 'Product Not Found' };

  const description = product.description.slice(0, 160);
  const images = product.image ? [product.image] : undefined;
  return {
    title: product.name,
    description,
    alternates: { canonical: `${SITE_URL}/product/${product.id}` },
    openGraph: { title: product.name, description, images, type: 'website' },
    twitter: { card: 'summary_large_image', title: product.name, description, images },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const list = await loadCatalogue();
  const product = getProductById(params.id, list);
  if (!product) notFound();

  const related = getRelatedProducts(product.id, 4, list);

  const configured = isSupabaseConfigured();
  const [summary, topReviews] = configured
    ? await Promise.all([
        dbGetProductReviewSummary(product.id),
        dbGetProductReviews(product.id, { sort: 'helpful', page: 1, pageSize: 5, filters: {} }),
      ])
    : [null, null];

  const rating = summary && summary.count > 0 ? summary.average : product.rating;
  const reviewCount = summary && summary.count > 0 ? summary.count : product.reviewCount;

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image ? [`${SITE_URL}${product.image}`] : undefined,
    description: product.description,
    sku: product.id,
    category: product.category,
    material: product.material,
    brand: { '@type': 'Brand', name: 'Om Gauri Putra' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  };
  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }
  if (topReviews && topReviews.reviews.length > 0) {
    jsonLd.review = topReviews.reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.anonymous ? 'Anonymous' : r.name },
      datePublished: r.date,
      name: r.title || undefined,
      reviewBody: r.text,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
    }));
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
