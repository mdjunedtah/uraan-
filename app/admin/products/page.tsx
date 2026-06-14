'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ProductTable from '@/components/admin/ProductTable';
import { Plus, Search, Database, HardDrive, DownloadCloud } from 'lucide-react';
import type { Product } from '@/data/jewelleryData';

export default function AdminProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setConfigured(Boolean(data.configured));
      setAllProducts((data.products || []) as Product[]);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = allProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'instock' && p.inStock) ||
      (filter === 'outofstock' && !p.inStock);
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id: string) => {
    if (!configured) {
      alert('Connect a database (Supabase) to manage products. See DEPLOYMENT.md.');
      return;
    }
    if (!confirm(`Delete product ${id}?`)) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    load();
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch('/api/products/import', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        await load();
        alert(`Imported ${data.imported} products into the database.`);
      } else {
        alert(data.error || 'Import failed.');
      }
    } catch {
      alert('Import failed.');
    }
    setImporting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-3xl text-[#1a1410] mb-1">Products</h1>
          <p className="text-sm text-[#6b5d4c] flex items-center gap-2 flex-wrap">
            {filtered.length} of {allProducts.length} products
            <span
              className={`inline-flex items-center gap-1 text-[10px] tracking-[1px] uppercase px-2 py-0.5 ${
                configured ? 'bg-[#3d6b5a]/10 text-[#3d6b5a]' : 'bg-[#b8893a]/10 text-[#b8893a]'
              }`}
              title={configured ? 'Live catalogue from your database' : 'Bundled catalogue — connect a database to manage products'}
            >
              {configured ? <Database size={11} /> : <HardDrive size={11} />}
              {configured ? 'Database' : 'Bundled'}
            </span>
          </p>
        </div>
        <Link
          href="/admin/products/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {/* When the DB is connected but empty, offer a one-click import. */}
      {configured && !loading && allProducts.length === 0 && (
        <div className="bg-[#f8f2e6] border border-[rgba(184,137,58,0.3)] p-5 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="serif text-lg text-[#1a1410]">Your catalogue is empty</div>
            <p className="text-sm text-[#6b5d4c]">Import the bundled demo catalogue to get started, then edit freely.</p>
          </div>
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-5 py-2.5 bg-[#b8893a] text-white text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#1a1410] hover:text-[#e8d49b] inline-flex items-center gap-2 disabled:opacity-60"
          >
            <DownloadCloud size={14} /> {importing ? 'Importing…' : 'Import catalogue'}
          </button>
        </div>
      )}

      {!configured && !loading && (
        <div className="bg-[#b8893a]/8 border border-[rgba(184,137,58,0.3)] p-4 mb-5 text-sm text-[#6b5d4c]">
          You&apos;re viewing the bundled catalogue. Connect a database (Supabase) so that products you add or edit here show on the live website. See <span className="font-semibold text-[#1a1410]">DEPLOYMENT.md</span>.
        </div>
      )}

      <div className="bg-white border border-[rgba(184,137,58,0.18)] p-4 mb-5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search size={14} className="text-[#9a8c75]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm min-w-0"
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
