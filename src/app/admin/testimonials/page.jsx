'use client';

import { useEffect, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { testimonialsAPI } from '@/lib/api';

const emptyForm = { customerName: '', rating: 5, review: '', isActive: true };

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchTestimonials(); }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await testimonialsAPI.getAll();
      setTestimonials(res.data);
    } catch { setTestimonials([]); }
    finally { setLoading(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await testimonialsAPI.create(form);
      setTestimonials([res.data, ...testimonials]);
      setShowModal(false);
      setForm(emptyForm);
    } catch { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteTestimonial = async (id) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await testimonialsAPI.delete(id);
      setTestimonials(testimonials.filter((t) => t._id !== id));
    } catch { alert('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-700">Testimonials Management</h1>
          <p className="text-brown-400">Manage client reviews and testimonials</p>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors">
          <Plus className="w-5 h-5" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <p className="text-brown-400">Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t._id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-gold-400 fill-current' : 'text-beige-200'}`} />
                  ))}
                </div>
                <button onClick={() => deleteTestimonial(t._id)} className="p-2 text-olive-700 hover:bg-olive-100 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-brown-600 mb-4 italic text-sm">&ldquo;{t.review}&rdquo;</p>
              <div className="flex items-center gap-3 pt-4 border-t border-beige-100">
                <div className="w-10 h-10 bg-olive-100 rounded-full flex items-center justify-center text-olive-600 font-semibold">
                  {t.customerName.charAt(0)}
                </div>
                <p className="font-medium text-brown-700">{t.customerName}</p>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && <p className="text-brown-400 col-span-3">No testimonials yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-serif font-bold text-brown-700 mb-6">Add New Testimonial</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-brown-600 font-medium mb-2">Client Name *</label>
                <input type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required
                  className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500"
                  placeholder="e.g., Priya Sharma" />
              </div>
              <div>
                <label className="block text-brown-600 font-medium mb-2">Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}
                      className={`p-1 transition-colors ${form.rating >= star ? 'text-gold-400' : 'text-beige-300'}`}>
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-brown-600 font-medium mb-2">Review *</label>
                <textarea rows={4} value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} required
                  className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 resize-none"
                  placeholder="Write the testimonial review..." />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-beige-200 text-brown-600 rounded-xl font-medium hover:bg-beige-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-olive-500 text-white rounded-xl font-medium hover:bg-olive-600 transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
