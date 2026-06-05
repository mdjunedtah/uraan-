'use client';

import Link from 'next/link';
import { Eye, Edit2, Trash2, Package } from 'lucide-react';
import { Product } from '@/data/jewelleryData';

type ProductTableProps = {
  products: Product[];
  onDelete?: (id: string) => void;
};

export default function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <div className="bg-white border border-[rgba(184,137,58,0.18)] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] tracking-[1.5px] uppercase text-[#9a8c75] border-b border-[rgba(184,137,58,0.18)] bg-[#fbf8f1]">
            <th className="text-left py-3 px-4 font-semibold">Product</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-left py-3 px-4 font-semibold">Price</th>
            <th className="text-left py-3 px-4 font-semibold">Stock</th>
            <th className="text-left py-3 px-4 font-semibold">Rating</th>
            <th className="text-right py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-[rgba(184,137,58,0.1)] hover:bg-[#fbf8f1]/40">
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 bg-[#f8f2e6] bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${p.image})` }}
                  />
                  <div>
                    <div className="font-medium text-[#1a1410]">{p.name}</div>
                    <div className="text-[10px] text-[#9a8c75]">ID: {p.id}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 capitalize text-[#6b5d4c]">{p.category}</td>
              <td className="py-3 px-4">
                <div className="font-semibold text-[#1a1410]">₹{p.price.toLocaleString('en-IN')}</div>
                {p.oldPrice && (
                  <div className="text-[10px] line-through text-[#9a8c75]">
                    ₹{p.oldPrice.toLocaleString('en-IN')}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-semibold ${
                    p.inStock
                      ? 'bg-[#3d6b5a]/10 text-[#3d6b5a]'
                      : 'bg-[#7a2e2e]/10 text-[#7a2e2e]'
                  }`}
                >
                  {p.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </td>
              <td className="py-3 px-4 text-[#6b5d4c]">
                {p.rating} ★ ({p.reviewCount})
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <Link href={`/product/${p.id}`} aria-label="View" className="text-[#6b5d4c] hover:text-[#b8893a]">
                    <Eye size={14} />
                  </Link>
                  <Link href={`/admin/products/edit/${p.id}`} aria-label="Edit" className="text-[#6b5d4c] hover:text-[#b8893a]">
                    <Edit2 size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete && onDelete(p.id)}
                    aria-label="Delete"
                    className="text-[#6b5d4c] hover:text-[#7a2e2e]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="text-[#9a8c75] mx-auto mb-2" size={32} />
          <p className="text-sm text-[#6b5d4c]">No products found.</p>
        </div>
      )}
    </div>
  );
}