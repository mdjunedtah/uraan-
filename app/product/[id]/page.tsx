'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import ProductGallery from '@/components/ProductGallery';
import ShareButton from '@/components/ShareButton';
import AddToCartButton from '@/components/AddToCartButton';
import { getProductById, getRelatedProducts } from '@/lib/products';
import { getGalleryImages } from '@/lib/gallery';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/wishlistContext';
import {
  Heart, Truck, ShieldCheck, RotateCw,
  Star, Plus, Minus, ChevronRight, Award,
} from 'lucide-react';

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const product = getProductById(id);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');

  const { addToCart, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) notFound();

  const inWishlist = isInWishlist(product.id);
  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;
  const related = getRelatedProducts(product.id, 4);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    openCart();
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <CartDrawer />

      <div className="max-w-7xl mx-auto px-4 py-3 text-[11px] text-[#9a8c75]">
        <Link href="/" className="text-[#b8893a] font-medium">Home</Link>
        <span className="mx-2 opacity-50">›</span>
        <Link href={`/collections?type=${product.category}`} className="text-[#b8893a] font-medium capitalize">
          {product.category}
        </Link>
        <span className="mx-2 opacity-50">›</span>
        <span className="truncate">{product.name}</span>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div>
            <ProductGallery
              images={getGalleryImages(product)}
              name={product.name}
              tag={product.tag}
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="serif text-3xl md:text-4xl text-[#1a1410] leading-tight">
                {product.name}
              </h1>
              <ShareButton
                title={product.name}
                text={`Check out ${product.name} on Uraan`}
                className="shrink-0 mt-2 text-[#9a8c75] hover:text-[#b8893a]"
              />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(product.rating)
                        ? 'text-[#b8893a] fill-[#b8893a]'
                        : 'text-[#d4cfc5]'
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-[#6b5d4c]">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-[rgba(184,137,58,0.18)]">
              <span className="serif text-3xl md:text-4xl text-[#1a1410] font-semibold">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.oldPrice && (
                <span className="text-base text-[#9a8c75] line-through">
                  ₹{product.oldPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs text-[#7a2e2e] font-bold">{discount}% OFF</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#f8f2e6] p-3 border border-[rgba(184,137,58,0.18)]">
                <div className="text-[9px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Material</div>
                <div className="text-sm text-[#1a1410] font-semibold">{product.material}</div>
              </div>
              {product.weight && (
                <div className="bg-[#f8f2e6] p-3 border border-[rgba(184,137,58,0.18)]">
                  <div className="text-[9px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Weight</div>
                  <div className="text-sm text-[#1a1410] font-semibold">{product.weight}</div>
                </div>
              )}
              {product.purity && (
                <div className="bg-[#f8f2e6] p-3 border border-[rgba(184,137,58,0.18)]">
                  <div className="text-[9px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Purity</div>
                  <div className="text-sm text-[#1a1410] font-semibold">{product.purity} Hallmarked</div>
                </div>
              )}
              <div className="bg-[#f8f2e6] p-3 border border-[rgba(184,137,58,0.18)]">
                <div className="text-[9px] tracking-[1.5px] uppercase text-[#9a8c75] mb-1">Stock</div>
                <div className={`text-sm font-semibold ${product.inStock ? 'text-[#3d6b5a]' : 'text-[#7a2e2e]'}`}>
                  {product.inStock ? 'In Stock' : 'Sold Out'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center border border-[rgba(184,137,58,0.32)]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease"
                  className="w-10 h-12 grid place-items-center hover:bg-[#f8f2e6]"
                >
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase"
                  className="w-10 h-12 grid place-items-center hover:bg-[#f8f2e6]"
                >
                  <Plus size={14} />
                </button>
              </div>
              <AddToCartButton
                product={product}
                inStock={product.inStock}
                quantity={quantity}
                className="flex-1 h-12 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] flex items-center justify-center gap-2 disabled:opacity-40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <Link
                href="/checkout"
                onClick={handleAddToCart}
                className="h-12 bg-[#b8893a] text-white text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#7a5a1f] flex items-center justify-center gap-2"
              >
                Buy Now <ChevronRight size={14} />
              </Link>
              <button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })
                }
                aria-pressed={inWishlist}
                className="h-12 border border-[#1a1410] text-[11px] tracking-[3px] uppercase font-semibold hover:bg-[#1a1410] hover:text-[#e8d49b] flex items-center justify-center gap-2 transition-transform duration-150 active:scale-95"
              >
                <Heart
                  size={14}
                  className={`transition-all duration-300 ${
                    inWishlist ? 'fill-[#7a2e2e] text-[#7a2e2e] scale-110' : 'scale-100'
                  }`}
                />
                {inWishlist ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: Truck, text: 'Free Shipping' },
                { icon: ShieldCheck, text: 'Hallmarked' },
                { icon: RotateCw, text: '7-Day Returns' },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center bg-[#f8f2e6] py-3 px-2 border border-[rgba(184,137,58,0.18)]"
                >
                  <t.icon className="text-[#b8893a] mb-1" size={16} />
                  <span className="text-[10px] tracking-[1px] uppercase text-[#6b5d4c]">{t.text}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-t border-[rgba(184,137,58,0.18)] pt-5">
              <div className="flex gap-4 mb-4 border-b border-[rgba(184,137,58,0.18)]">
                {[
                  { id: 'desc' as const, label: 'Description' },
                  { id: 'specs' as const, label: 'Specifications' },
                  { id: 'shipping' as const, label: 'Shipping & Returns' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`pb-2 text-[11px] tracking-[1.5px] uppercase font-semibold ${
                      activeTab === t.id
                        ? 'text-[#b8893a] border-b-2 border-[#b8893a]'
                        : 'text-[#6b5d4c]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="text-sm text-[#6b5d4c] leading-relaxed">
                {activeTab === 'desc' && <p>{product.description}</p>}
                {activeTab === 'specs' && (
                  <ul className="space-y-1.5">
                    <li><strong className="text-[#1a1410]">Material:</strong> {product.material}</li>
                    {product.weight && <li><strong className="text-[#1a1410]">Weight:</strong> {product.weight}</li>}
                    {product.purity && <li><strong className="text-[#1a1410]">Purity:</strong> {product.purity}</li>}
                    <li><strong className="text-[#1a1410]">Category:</strong> <span className="capitalize">{product.category}</span></li>
                    <li><strong className="text-[#1a1410]">Certification:</strong> BIS Hallmarked</li>
                  </ul>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-2">
                    <p>✦ Free shipping on orders above ₹1999 across India.</p>
                    <p>✦ Standard delivery in 3-7 business days.</p>
                    <p>✦ Express delivery available at checkout.</p>
                    <p>✦ Easy 7-day return policy.</p>
                    <p>✦ All products undergo strict quality check.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 border-t border-[rgba(184,137,58,0.18)] mt-8">
          <p className="section-tag-italic">You Might Also Like</p>
          <h2 className="section-heading">Related Products</h2>
          <div className="luxury-divider"><Award size={10} /></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}