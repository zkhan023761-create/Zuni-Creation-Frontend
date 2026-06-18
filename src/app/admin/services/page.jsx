'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Scissors, X, Clock, IndianRupee } from 'lucide-react';
import { servicesAPI } from '@/lib/api';

const emptyForm = { title: '', description: '', price: '', duration: '', isActive: true };

export default function AdminServicesPage() {
  const [services, setServices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [saving, setSaving]             = useState(false);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await servicesAPI.getAllAdmin();
      setServices(res.data);
    } catch { setServices([]); } finally { setLoading(false); }
  };

  const openAdd  = () => { setEditingService(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = s => { setEditingService(s); setForm({ title: s.title, description: s.description, price: s.price, duration: s.duration, isActive: s.isActive }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editingService) {
        const res = await servicesAPI.update(editingService._id, form);
        setServices(services.map(s => s._id === editingService._id ? res.data : s));
      } else {
        const res = await servicesAPI.create(form);
        setServices([res.data, ...services]);
      }
      setShowModal(false);
    } catch { alert('Failed to save service'); } finally { setSaving(false); }
  };

  const toggleActive = async (service) => {
    try {
      const res = await servicesAPI.update(service._id, { isActive: !service.isActive });
      setServices(services.map(s => s._id === service._id ? res.data : s));
    } catch { alert('Failed to update'); }
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await servicesAPI.delete(id);
      setServices(services.filter(s => s._id !== id));
    } catch { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brown-700">Services Management</h1>
          <p className="text-brown-400 mt-0.5">Add, edit, and manage your service offerings</p>
        </div>
        <button onClick={openAdd} className="admin-btn-primary">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="admin-card p-10 text-center">
          <div className="w-8 h-8 border-2 border-olive-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brown-400">Loading services...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div key={service._id} className="admin-card p-6 flex flex-col group transition-all duration-200 hover:-translate-y-1">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  service.isActive
                    ? 'text-olive-600'
                    : 'text-brown-400'
                }`} style={service.isActive ? { background: 'linear-gradient(135deg,#E4ECCC,#C8D99A)' } : { background: '#F2EDE3' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: service.isActive ? '#6B7A3E' : '#B8A07A' }} />
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleActive(service)}
                    className="p-2 rounded-xl hover:bg-beige-50 transition-colors text-brown-400 hover:text-brown-600" title="Toggle active">
                    {service.isActive ? <ToggleRight className="w-4 h-4 text-olive-500" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(service)}
                    className="p-2 rounded-xl hover:bg-beige-50 transition-colors text-olive-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteService(service._id)}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gradient icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #6B7A3E, #4A5529)' }}>
                <Scissors className="w-6 h-6 text-brown-700" />
              </div>

              <h3 className="text-lg font-serif font-bold text-brown-700 mb-2">{service.title}</h3>
              <p className="text-brown-500 text-sm leading-relaxed flex-1 mb-5">{service.description}</p>

              {/* Price + Duration */}
              <div className="flex items-center justify-between pt-4 border-t border-beige-100">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xs text-brown-400 font-medium">₹</span>
                  <span className="text-3xl font-bold text-brown-700 font-serif leading-none">{service.price}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: '#F9F7F2', border: '1px solid #E4D9C8' }}>
                  <Clock className="w-3 h-3 text-brown-400" />
                  <span className="text-xs font-semibold text-brown-500">{service.duration}</span>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="admin-card p-14 text-center col-span-3">
              <Scissors className="w-14 h-14 mx-auto mb-4 text-brown-200" />
              <h3 className="text-lg font-serif font-bold text-brown-400 mb-1">No services yet</h3>
              <p className="text-brown-300 text-sm mb-4">Add your first service to get started.</p>
              <button onClick={openAdd} className="admin-btn-primary mx-auto">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg animate-scale-in overflow-hidden"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div className="admin-modal-header rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Scissors size={18} className="text-brown-700" />
                </div>
                <div>
                  <h2 className="text-brown-700 font-serif font-bold text-xl">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    {editingService ? 'Update service details' : 'Create a new mehndi service'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-brown-500 hover:text-brown-700 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-brown-600 font-semibold mb-2 text-sm">Service Title *</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                  className="admin-input" placeholder="e.g., Bridal Mehndi" />
              </div>
              <div>
                <label className="block text-brown-600 font-semibold mb-2 text-sm">Description *</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required
                  className="admin-input resize-none" placeholder="Describe the service..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brown-600 font-semibold mb-2 text-sm">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
                    className="admin-input" placeholder="2999" />
                </div>
                <div>
                  <label className="block text-brown-600 font-semibold mb-2 text-sm">Duration *</label>
                  <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required
                    className="admin-input" placeholder="2-4 hours" />
                </div>
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
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 text-brown-700 rounded-2xl font-bold transition-all disabled:opacity-50 text-sm"
                  style={{ background: 'linear-gradient(135deg, #6B7A3E, #4A5529)', boxShadow: '0 4px 14px rgba(107,122,62,0.35)' }}>
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
