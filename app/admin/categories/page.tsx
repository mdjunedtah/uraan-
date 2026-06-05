'use client';

import { useState } from 'react';
import { categories } from '@/data/jewelleryData';
import { Plus, Edit2, Trash2, Grid3x3 } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Category "${newCategory.name}" would be added.`);
    setNewCategory({ name: '', description: '' });
    setShowAddForm(false);
  };

  const handleDelete = (slug: string) => {
    if (confirm(`Delete category "${slug}"?`)) {
      alert('Category would be deleted.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-3xl text-[#1a1410] mb-1">Categories</h1>
          <p className="text-sm text-[#6b5d4c]">{categories.length} active categories</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]"
        >
          <Plus size={14} /> Add Category
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white border border-[rgba(184,137,58,0.18)] p-5 mb-5">
          <h3 className="display text-sm tracking-[3px] uppercase text-[#1a1410] mb-4">New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="luxury-label">Name *</label>
              <input
                type="text"
                required
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="luxury-input"
              />
            </div>
            <div>
              <label className="luxury-label">Description</label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                className="luxury-input"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="px-6 py-2 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a]">
              Save Category
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-[#1a1410] text-[11px] tracking-[2px] uppercase font-semibold">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.slug} className="bg-white border border-[rgba(184,137,58,0.18)] p-5 group hover:shadow-[0_12px_40px_rgba(122,90,31,0.12)] transition-all">
            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-full bg-cover bg-center bg-[#f8f2e6] flex-shrink-0"
                style={{
                  backgroundImage: `url(${c.image})`,
                  boxShadow: 'inset 0 0 0 1px rgba(184,137,58,0.32)',
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="serif text-lg text-[#1a1410] font-semibold truncate">{c.name}</div>
                <div className="text-[10px] text-[#9a8c75] tracking-[0.5px] mb-1">/{c.slug}</div>
                <div className="text-xs text-[#6b5d4c] mb-2">{c.description}</div>
                <div className="text-[10px] text-[#b8893a] font-semibold tracking-[1px]">
                  {c.count} Products
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[rgba(184,137,58,0.18)] flex justify-end gap-3">
              <button aria-label="Edit" className="text-[#6b5d4c] hover:text-[#b8893a]">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(c.slug)} aria-label="Delete" className="text-[#6b5d4c] hover:text-[#7a2e2e]">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}