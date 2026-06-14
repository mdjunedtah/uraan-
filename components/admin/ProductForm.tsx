'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, Upload } from 'lucide-react';
import { Product, categories } from '@/data/jewelleryData';

type ProductFormProps = {
  initialProduct?: Product;
  mode?: 'add' | 'edit';
};

export default function ProductForm({ initialProduct, mode = 'add' }: ProductFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: initialProduct?.name || '',
    slug: initialProduct?.slug || '',
    category: initialProduct?.category || 'necklaces',
    price: initialProduct?.price || 0,
    oldPrice: initialProduct?.oldPrice || 0,
    image: initialProduct?.image || '',
    description: initialProduct?.description || '',
    tag: initialProduct?.tag || '',
    material: initialProduct?.material || '',
    weight: initialProduct?.weight || '',
    purity: initialProduct?.purity || '',
    inStock: initialProduct?.inStock ?? true,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    try {
      const url = mode === 'add' ? '/api/products' : `/api/products/${initialProduct?.id}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        alert(data.error || 'Could not save. Connect a database (Supabase) — see DEPLOYMENT.md.');
        setSubmitted(false);
      }
    } catch {
      alert('Network error. Please try again.');
      setSubmitted(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[rgba(184,137,58,0.18)] p-5 md:p-6">
      <h2 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-5 pb-3 border-b border-[rgba(184,137,58,0.18)]">
        {mode === 'add' ? 'Add New Product' : 'Edit Product'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="luxury-label">Product Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="luxury-input"
            placeholder="e.g., Diamond Floral Necklace"
          />
        </div>

        <div>
          <label className="luxury-label">Slug</label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="luxury-input"
            placeholder="e.g., diamond-floral-necklace"
          />
        </div>

        <div>
          <label className="luxury-label">Category *</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="luxury-input"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="luxury-label">Price (₹) *</label>
          <input
            type="number"
            required
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="luxury-input"
          />
        </div>

        <div>
          <label className="luxury-label">Old Price (₹)</label>
          <input
            type="number"
            min={0}
            value={form.oldPrice}
            onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })}
            className="luxury-input"
            placeholder="For discount display"
          />
        </div>

        <div>
          <label className="luxury-label">Material</label>
          <input
            type="text"
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            className="luxury-input"
            placeholder="e.g., 22K Gold"
          />
        </div>

        <div>
          <label className="luxury-label">Weight</label>
          <input
            type="text"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="luxury-input"
            placeholder="e.g., 24g"
          />
        </div>

        <div>
          <label className="luxury-label">Purity</label>
          <input
            type="text"
            value={form.purity}
            onChange={(e) => setForm({ ...form, purity: e.target.value })}
            className="luxury-input"
            placeholder="e.g., 916"
          />
        </div>

        <div>
          <label className="luxury-label">Tag</label>
          <select
            value={form.tag}
            onChange={(e) => setForm({ ...form, tag: e.target.value })}
            className="luxury-input"
          >
            <option value="">No tag</option>
            <option value="new">New</option>
            <option value="bestseller">Bestseller</option>
            <option value="sale">Sale</option>
            <option value="soldout">Sold Out</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="luxury-label">Image Path</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="luxury-input flex-1"
              placeholder="/images/product.jpg"
            />
            <button
              type="button"
              className="px-4 py-2 border border-[rgba(184,137,58,0.32)] text-[10px] tracking-[1.5px] uppercase font-semibold hover:bg-[#fbf8f1] flex items-center gap-2"
            >
              <Upload size={12} /> Upload
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="luxury-label">Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="luxury-input"
            placeholder="Detailed product description..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              className="accent-[#b8893a]"
            />
            <span className="text-[#1a1410]">In Stock</span>
          </label>
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-[rgba(184,137,58,0.18)] flex flex-col sm:flex-row gap-3 justify-end">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-3 border border-[#1a1410] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#1a1410] hover:text-[#e8d49b] inline-flex items-center justify-center gap-2"
        >
          <X size={14} /> Cancel
        </button>
        <button
          type="submit"
          disabled={submitted}
          className="px-6 py-3 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410] inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={14} /> {submitted ? 'Saving...' : mode === 'add' ? 'Save Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}