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
          <h1 className="text-2xl font-bold text-gray-900">Services Management</h1>
          <p className="text-gray-500 mt-1">Add, edit, and manage your service offerings</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-adminGreen-500 hover:bg-adminGreen-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-adminGreen-500/20">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-10 text-center">
          <div className="w-8 h-8 border-2 border-adminGreen-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading services...</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <div key={service._id} className="bg-white border border-gray-100 shadow-sm p-6 rounded-2xl flex flex-col group transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  service.isActive
                    ? 'bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-adminGreen-500' : 'bg-gray-400'}`} />
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleActive(service)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" title="Toggle active">
                    {service.isActive ? <ToggleRight className="w-5 h-5 text-adminGreen-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(service)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-adminGreen-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteService(service._id)}
                    className="p-2 rounded-xl hover:bg-red-50 transition-colors text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Gradient icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-adminGreen-50">
                <Scissors className="w-6 h-6 text-adminGreen-600" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">{service.description}</p>

              {/* Price + Duration */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-gray-400 font-semibold">₹</span>
                  <span className="text-2xl font-bold text-gray-900 leading-none">{service.price}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600">{service.duration}</span>
                </div>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-14 text-center col-span-3">
              <Scissors className="w-14 h-14 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No services yet</h3>
              <p className="text-gray-500 text-sm mb-6">Add your first service to get started.</p>
              <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-adminGreen-500 hover:bg-adminGreen-600 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-adminGreen-500/20 mx-auto">
                <Plus className="w-4 h-4" /> Add Service
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col animate-scale-in overflow-hidden shadow-2xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-5 shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                  <Scissors size={20} className="text-adminGreen-600" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-xl">
                    {editingService ? 'Edit Service' : 'Add New Service'}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">
                    {editingService ? 'Update service details' : 'Create a new mehndi service'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100 shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0">
              <div className="overflow-y-auto p-6 space-y-5 flex-1">
                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">Service Title *</label>
                  <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-adminGreen-400 focus:bg-white transition-all" placeholder="e.g., Bridal Mehndi" />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">Description *</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-adminGreen-400 focus:bg-white transition-all resize-none" placeholder="Describe the service..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 text-sm">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-adminGreen-400 focus:bg-white transition-all" placeholder="2999" />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 text-sm">Duration *</label>
                    <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-adminGreen-400 focus:bg-white transition-all" placeholder="2-4 hours" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-1">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-adminGreen-500 rounded" />
                  <span className="text-gray-700 font-bold text-sm">Active (visible to clients)</span>
                </label>
              </div>
              <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-adminGreen-500 hover:bg-adminGreen-600 text-white rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-md shadow-adminGreen-500/20">
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
