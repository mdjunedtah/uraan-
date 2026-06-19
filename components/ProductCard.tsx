'use client';

import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { Product } from '@/data/jewelleryData';
import { useWishlist } from '@/context/wishlistContext';
import AddToCartButton from '@/components/AddToCartButton';

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const badgeLabel: Record<string, string> = {
    new: 'NEW',
    bestseller: 'BESTSELLER',
    sale: 'SALE',
    soldout: 'SOLD OUT',
  };

  const badgeClass: Record<string, string> = {
    new: 'bg-[#1a1410] text-[#e8d49b]',
    bestseller: 'bg-[#b8893a] text-white',
    sale: 'bg-[#7a2e2e] text-white',
    soldout: 'bg-gray-500 text-white',
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block bg-white border border-[rgba(184,137,58,0.18)] overflow-hidden hover:shadow-[0_12px_40px_rgba(122,90,31,0.12)] hover:-translate-y-1 hover:border-[rgba(184,137,58,0.32)] transition-all duration-300"
    >
      {/* Image */}
      <div className="aspect-square relative bg-[#f8f2e6] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
          style={{ backgroundImage: `url(${product.image})` }}
        />

        {/* Badge */}
        {product.tag && (
          <div className={`absolute top-2 left-2 z-10 ${badgeClass[product.tag]} text-[9px] font-semibold tracking-[1.5px] uppercase px-2 py-1`}>
            {badgeLabel[product.tag]}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/95 grid place-items-center hover:bg-white hover:scale-110 active:scale-90 transition-all duration-200"
        >
          <Heart
            size={14}
            className={`transition-all duration-300 ${
              inWishlist ? 'text-[#7a2e2e] fill-[#7a2e2e] scale-110' : 'text-[#6b5d4c] scale-100'
            }`}
          />
        </button>

        {/* Hover actions (desktop) */}
        <div className="hidden md:flex absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/95 backdrop-blur-sm border-t border-[rgba(184,137,58,0.18)] py-2 px-3 gap-2 z-10">
          <AddToCartButton
            product={product}
            inStock={product.inStock}
            stopPropagation
            iconSize={12}
            className="flex-1 flex items-center justify-center gap-1 text-[10px] tracking-[1.5px] uppercase font-semibold text-[#1a1410] hover:text-[#b8893a] disabled:opacity-40"
          />
          <span className="border-l border-[rgba(184,137,58,0.18)]" />
          <span className="flex-1 flex items-center justify-center gap-1 text-[10px] tracking-[1.5px] uppercase font-semibold text-[#1a1410]">
            <Eye size={12} /> Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 md:p-4">
        <h3 className="serif text-sm md:text-base text-[#1a1410] font-medium leading-tight mb-1 truncate">
          {product.name}
        </h3>
        {product.material && (
          <p className="text-[10px] text-[#9a8c75] tracking-[0.5px] mb-2 uppercase">
            {product.material}
          </p>
        )}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-sm md:text-base text-[#1a1410] font-semibold">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.oldPrice && (
            <span className="text-[11px] text-[#9a8c75] line-through">
              ₹{product.oldPrice.toLocaleString('en-IN')}
            </span>
          )}
          {discount > 0 && (
            <span className="text-[10px] text-[#7a2e2e] font-semibold">
              ({discount}% OFF)
            </span>
          )}
        </div>
        {/* Mobile add to cart */}
        <AddToCartButton
          product={product}
          inStock={product.inStock}
          stopPropagation
          label="Add to Cart"
          soldOutLabel="Sold Out"
          className="md:hidden w-full mt-3 py-2.5 bg-[#b8893a] text-[#1a1410] text-[10px] tracking-[1.5px] uppercase font-semibold hover:bg-[#1a1410] hover:text-[#e8d49b] transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
        />
      </div>
    </Link>
  );
}