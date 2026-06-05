'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProductTable from '@/components/admin/ProductTable';
import { getAllProducts } from '@/lib/products';
import { Plus, Search } from 'lucide-react';

export default function AdminProductsPage() {
  const allProducts = getAllProducts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = allProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'instock' && p.inStock) ||
      (filter === 'outofstock' && !p.inStock);
    return matchSearch && matchFilter;
  });

  const handleDelete = (id: string) => {
    if (confirm(`Delete product ${id}?`)) {
      alert('Product would be deleted (connect your API).');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-3xl text-[#1a1410] mb-1">Products</h1>
          <p className="text-sm text-[#6b5d4c]">{filtered.length} of {allProducts.length} products</p>
        </div>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={14} className="text-[#9a8c75]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-[rgba(184,137,58,0.32)] px-3 py-1.5 text-xs outline-none cursor-pointer"
        >
          <option value="all">All Products</option>
          <option value="instock">In Stock</option>
          <option value="outofstock">Out of Stock</option>
        </select>
      </div>

      <ProductTable products={filtered} onDelete={handleDelete} />
    </div>
  );
}