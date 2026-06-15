'use client';

import { useEffect, useState } from 'react';
import BannerForm from '@/components/admin/BannerForm';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  type Banner,
  getBanners,
  addBanner,
  updateBanner,
  toggleBanner,
  deleteBanner,
} from '@/lib/banners';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();

  useEffect(() => {
    setBanners(getBanners());
  }, []);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(`Delete banner ${id}?`)) {
      deleteBanner(id);
      setBanners(getBanners());
    }
  };

  const handleToggle = (id: string) => {
    toggleBanner(id);
    setBanners(getBanners());
  };

  const handleSave = (data: Omit<Banner, 'id'>) => {
    if (editingBanner) {
      updateBanner(editingBanner.id, data);
    } else {
      addBanner(data);
    }
    setBanners(getBanners());
    setShowForm(false);
    setEditingBanner(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBanner(undefined);
  };

  if (showForm) {
    return (
      <div>
        <BannerForm
          initialBanner={editingBanner}
          mode={editingBanner ? 'edit' : 'add'}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="serif text-3xl text-[#1a1410] mb-1">Banners</h1>
          <p className="text-sm text-[#6b5d4c]">
            {banners.length} banners · {banners.filter((b) => b.active).length} active
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBanner(undefined);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1410] text-[#e8d49b] text-[11px] tracking-[2px] uppercase font-semibold hover:bg-[#b8893a] hover:text-[#1a1410]"
        >
          <Plus size={14} /> Add Banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border border-[rgba(184,137,58,0.18)] overflow-hidden">
            <div
              className="aspect-video bg-[#f8f2e6] bg-cover bg-center relative"
              style={{ backgroundImage: `url(${b.image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                <p className="text-[10px] tracking-[2px] uppercase text-[#e8d49b]">{b.position}</p>
                <div className="serif text-2xl mt-1">{b.title}</div>
                <div className="text-xs opacity-80 mt-1">{b.subtitle}</div>
              </div>
              <div className={`absolute top-3 right-3 px-2 py-1 text-[10px] font-semibold ${
                b.active ? 'bg-[#3d6b5a] text-white' : 'bg-gray-500 text-white'
              }`}>
                {b.active ? 'ACTIVE' : 'HIDDEN'}
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="text-xs text-[#6b5d4c]">
                <span className="font-semibold text-[#1a1410]">{b.ctaText}</span> → {b.ctaLink}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggle(b.id)}
                  aria-label={b.active ? 'Hide' : 'Show'}
                  className="text-[#6b5d4c] hover:text-[#b8893a] p-1"
                >
                  {b.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => handleEdit(b)}
                  aria-label="Edit"
                  className="text-[#6b5d4c] hover:text-[#b8893a] p-1"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  aria-label="Delete"
                  className="text-[#6b5d4c] hover:text-[#7a2e2e] p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="bg-white border border-[rgba(184,137,58,0.18)] text-center py-12 text-sm text-[#6b5d4c]">
          No banners yet. Add your first one.
        </div>
      )}
    </div>
  );
}
