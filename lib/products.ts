import { products, Product } from '@/data/jewelleryData';

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByTag(tag: Product['tag']): Product[] {
  return products.filter((p) => p.tag === tag);
}

export function getNewArrivals(limit: number = 8): Product[] {
  return products.filter((p) => p.tag === 'new').slice(0, limit);
}

export function getBestsellers(limit: number = 8): Product[] {
  return products.filter((p) => p.tag === 'bestseller').slice(0, limit);
}

export function getSaleProducts(limit: number = 8): Product[] {
  return products.filter((p) => p.tag === 'sale').slice(0, limit);
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = getProductById(productId);
  if (!product) return [];
  return products
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export function filterByPriceRange(
  productList: Product[],
  min: number,
  max: number
): Product[] {
  return productList.filter((p) => p.price >= min && p.price <= max);
}

export function sortProducts(
  productList: Product[],
  sortBy: 'newest' | 'price-low' | 'price-high' | 'rating'
): Product[] {
  const sorted = [...productList];
  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
    default:
      return sorted;
  }
}