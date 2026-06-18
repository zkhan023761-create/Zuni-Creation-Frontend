'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Image, X, Upload, Eye } from 'lucide-react';
import { galleryAPI } from '@/lib/api';

const CATEGORIES = ['Bridal', 'Arabic', 'Minimal', 'Eid', 'Engagement', 'Party', 'Feet Mehndi', 'Other'];
const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23F5E6D3" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="48" fill="%236B7A3E" text-anchor="middle" dy=".3em"%3E🌸%3C/text%3E%3C/svg%3E';
const emptyForm = { title: '', imageUrl: '', category: '', description: '', isActive: true };

export default function AdminGalleryPage() {
  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal]       = useState(false);
  const [editingItem, setEditingItem]   = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [preview, setPreview]           = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await galleryAPI.upload(formData);
      setForm(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
    } catch {
      alert('Failed to upload image. Please try again.');
    } finally { setUploading(false); }
  };

  useEffect(() => { fetchGallery(); }, []);

  const fetchGallery = async () => {
    try {
      const res = await galleryAPI.getAllAdmin();
      setItems(res.data);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  const openAdd  = () => { setEditingItem(null); setForm(emptyForm); setPreview(null); setShowModal(true); };
  const openEdit = item => {
    setEditingItem(item);
    setForm({ title: item.title, imageUrl: item.imageUrl, category: item.category, description: item.description || '', isActive: item.isActive });
    setPreview(item.imageUrl);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingItem) {
        const res = await galleryAPI.update(editingItem._id, form);
        setItems(items.map(i => i._id === editingItem._id ? res.data : i));
      } else {
        const res = await galleryAPI.create(form);
        setItems([res.data, ...items]);
      }
      setShowModal(false);
    } catch { alert('Failed to save'); } finally { setSaving(false); }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this image?')) return;
    try {
      await galleryAPI.delete(id);
      setItems(items.filter(i => i._id !== id));
    } catch { alert('Failed to delete'); }
  };

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category === activeCategory);

  const categoryCounts = ['All', ...CATEGORIES].reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? items.length : items.filter(i => i.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brown-700">Gallery Management</h1>
          <p className="text-brown-400 mt-0.5">Upload and manage your mehndi design portfolio</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus className="w-4 h-4" /> Add Design
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {['All', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-olive-500 text-white shadow-md'
                : 'bg-white text-brown-500 border border-beige-200 hover:bg-beige-50'
            }`}
          >
            {cat}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeCategory === cat ? 'bg-white/25 text-white' : 'bg-beige-100 text-brown-400'
            }`}>
              {categoryCounts[cat]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-card p-10 text-center">
          <div className="w-8 h-8 border-2 border-olive-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brown-400">Loading gallery...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="group relative rounded-3xl overflow-hidden admin-card"
              style={{ aspectRatio: '1', padding: 0 }}>
              <img src={item.imageUrl} alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={e => { e.target.src = FALLBACK; }} />

              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to top, rgba(28,17,8,0.85) 0%, rgba(28,17,8,0.3) 50%, transparent 100%)' }}>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-brown-700 font-semibold text-sm leading-tight">{item.title}</p>
                  <p className="text-brown-600 text-xs mt-0.5">{item.category}</p>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => openEdit(item)}
                    className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-brown-700 hover:bg-olive-600/30 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => deleteItem(item._id)}
                    className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-brown-700 hover:bg-red-500/70 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status badge */}
              <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                item.isActive ? 'bg-olive-600/85 text-white' : 'bg-black/75 text-white/70'
              }`}>
                {item.isActive ? 'Active' : 'Hidden'}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="admin-card p-14 text-center col-span-4">
              <Image className="w-14 h-14 mx-auto mb-4 text-brown-200" />
              <h3 className="text-lg font-serif font-bold text-brown-400 mb-1">No designs in this category</h3>
              <p className="text-brown-300 text-sm mb-4">Upload your first design to get started.</p>
              <button onClick={openAdd} className="admin-btn-primary mx-auto">
                <Plus className="w-4 h-4" /> Add Design
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div className="flex items-start justify-between px-6 py-5 border-b border-beige-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-beige-50 flex items-center justify-center border border-beige-200">
                  <Image size={20} className="text-brown-600" />
                </div>
                <div>
                  <h2 className="text-brown-700 font-serif font-bold text-xl leading-tight">
                    {editingItem ? 'Edit Design' : 'Add New Design'}
                  </h2>
                  <p className="text-xs text-brown-400 mt-0.5">
                    {editingItem ? 'Update design details' : 'Upload a new mehndi design'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-brown-400 hover:text-brown-700 hover:bg-beige-50 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-brown-600 font-semibold mb-2 text-sm">Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  className="admin-input" placeholder="e.g., Bridal Elegance" />
              </div>

              {/* Image upload with preview */}
              <div>
                <label className="block text-brown-600 font-semibold mb-2 text-sm">Design Image *</label>
                {preview && (
                  <div className="mb-3 w-full h-40 rounded-2xl overflow-hidden relative"
                    style={{ background: '#F2EDE3' }}>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
                <label className={`flex flex-col items-center justify-center gap-2 w-full py-6 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
                  uploading ? 'border-olive-300 bg-beige-50/50' : 'border-beige-200 hover:border-olive-300 hover:bg-beige-50/30'
                }`}>
                  <Upload className={`w-6 h-6 ${uploading ? 'text-olive-500 animate-bounce' : 'text-brown-300'}`} />
                  <span className="text-sm font-medium text-brown-400">
                    {uploading ? 'Uploading...' : preview ? 'Click to change image' : 'Click to upload image'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange}
                    required={!form.imageUrl} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-brown-600 font-semibold mb-2 text-sm">Category *</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required
                  className="admin-input">
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-brown-600 font-semibold mb-2 text-sm">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="admin-input resize-none" placeholder="Optional description..." />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 accent-olive-500" />
                <span className="text-brown-600 font-medium text-sm">Active (visible to clients)</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-beige-200 text-brown-500 rounded-2xl font-medium hover:bg-beige-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 py-3 bg-olive-500 hover:bg-olive-600 text-white rounded-2xl font-bold transition-all disabled:opacity-50 text-sm shadow-md">
                  {saving ? 'Saving...' : editingItem ? 'Update Design' : 'Add Design'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
