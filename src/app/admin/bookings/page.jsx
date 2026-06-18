'use client';

import { useEffect, useState } from 'react';
import {
  Search, Eye, CheckCircle, XCircle, Clock, Trash2,
  Mail, MessageCircle, X, Calendar, Filter,
} from 'lucide-react';
import { bookingsAPI } from '@/lib/api';

const statusConfig = {
  pending:   { cls: 'bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold',   icon: Clock,         dot: '#4bc58c' },
  confirmed: { cls: 'bg-adminGreen-50 text-adminGreen-700 border border-adminGreen-100 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold', icon: CheckCircle,   dot: '#158c52' },
  completed: { cls: 'bg-gray-50 text-gray-600 border border-gray-200 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold', icon: CheckCircle,   dot: '#6b7280' },
  cancelled: { cls: 'bg-red-50 text-red-600 border border-red-100 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold', icon: XCircle,       dot: '#ef4444' },
};

// ── Reusable Modal Wrapper ─────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col animate-scale-in shadow-2xl overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}>
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-5 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-gray-900 font-bold text-xl">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors p-2 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Notification Modal ─────────────────────────────────────────────────────
function NotificationModal({ data, type, onClose }) {
  const isCompleted = type === 'completed';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full flex flex-col animate-scale-in overflow-y-auto"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: 'calc(100vh - 2rem)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl"
            style={{ background: isCompleted ? '#f3f4f6' : '#eefcf5' }}>
            {isCompleted ? '🌸' : '🎉'}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isCompleted ? 'Session Complete!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isCompleted
              ? `${data.customerName}'s mehndi is done. Thank-you messages sent!`
              : `${data.customerName}'s mehndi appointment is all set.`}
          </p>
        </div>

        {/* Email row */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-3 bg-gray-50 border border-gray-100">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white shadow-sm border border-gray-100">
            <Mail className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">
              {isCompleted ? 'Thank-you email sent' : 'Confirmation email sent'}
            </p>
            <p className="text-xs truncate text-gray-500">{data.email}</p>
          </div>
          <CheckCircle className="w-4 h-4 shrink-0 text-adminGreen-500" />
        </div>

        {/* WhatsApp */}
        {data.whatsappLink ? (
          <a href={data.whatsappLink} target="_blank" rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 transition-all duration-200 group bg-adminGreen-50 border border-adminGreen-100 hover:bg-adminGreen-100">
            <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-adminGreen-100 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-adminGreen-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-adminGreen-700">
                {isCompleted ? 'Send Thank-You on WhatsApp' : 'Send WhatsApp Message'}
              </p>
              <p className="text-xs text-adminGreen-600/80">Opens WhatsApp with pre-filled message</p>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 bg-gray-50 border border-gray-200">
            <MessageCircle className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-500">No phone number on this booking</p>
          </div>
        )}

        <button onClick={onClose}
          className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm">
          {isCompleted ? 'Done, close' : 'Got it, close'}
        </button>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [fetchError, setFetchError]             = useState('');
  const [searchTerm, setSearchTerm]             = useState('');
  const [statusFilter, setStatusFilter]         = useState('all');
  const [selectedBooking, setSelectedBooking]   = useState(null);
  const [confirmedNotification, setConfirmedNotification] = useState(null);
  const [completedNotification, setCompletedNotification] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingsAPI.getAll();
      setBookings(res.data); setFetchError('');
    } catch (err) {
      const status = err?.response?.status;
      setFetchError(status === 401 || status === 403
        ? 'Session expired. Please log out and log in again.'
        : 'Failed to load bookings. Make sure the backend server is running.');
      setBookings([]);
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await bookingsAPI.update(id, { status });
      const updated = res.data;
      setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      if (selectedBooking?._id === id) setSelectedBooking({ ...selectedBooking, status });
      if (status === 'confirmed') {
        setConfirmedNotification({ customerName: updated.customerName, email: updated.email, whatsappLink: updated.whatsappLink || null });
        setSelectedBooking(null);
      }
      if (status === 'completed') {
        setCompletedNotification({ customerName: updated.customerName, email: updated.email, whatsappLink: updated.whatsappLink || null });
        setSelectedBooking(null);
      }
    } catch { alert('Failed to update status'); }
  };

  const deleteBooking = async (id) => {
    if (!confirm('Delete this booking?')) return;
    try {
      await bookingsAPI.delete(id);
      setBookings(bookings.filter(b => b._id !== id));
      setSelectedBooking(null);
    } catch { alert('Failed to delete booking'); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
      || b.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-500 mt-1">Manage and track all booking requests</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
              statusFilter === key
                ? 'bg-adminGreen-500 text-white shadow-md shadow-adminGreen-500/20'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <span className="capitalize">{key}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
              statusFilter === key ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + table */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-adminGreen-400 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            <div className="w-8 h-8 border-2 border-adminGreen-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading bookings...
          </div>
        ) : fetchError ? (
          <div className="p-10 text-center">
            <p className="text-red-500 font-bold mb-2">{fetchError}</p>
            <button onClick={fetchBookings} className="text-sm text-adminGreen-600 underline font-semibold">Retry</button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Customer', 'Date', 'People', 'City', 'Special Requests', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((booking) => {
                    const cfg = statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-adminGreen-700 bg-adminGreen-50 shrink-0">
                              {booking.customerName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{booking.customerName}</p>
                              <p className="text-xs text-gray-500 font-medium mt-0.5">{booking.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm font-medium">
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm font-medium">{booking.numberOfPeople}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm font-medium">{booking.city}</td>
                        <td className="px-6 py-4 text-sm max-w-[200px]">
                          {booking.specialRequests
                            ? <span className="text-gray-600 font-medium line-clamp-2">{booking.specialRequests}</span>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cfg.cls}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedBooking(booking)}
                              className="p-2 rounded-xl transition-colors bg-gray-50 hover:bg-gray-100 text-gray-600" title="View details">
                              <Eye className="w-4 h-4" />
                            </button>
                            {booking.status === 'pending' && (
                              <button onClick={() => updateStatus(booking._id, 'confirmed')}
                                className="p-2 rounded-xl transition-colors bg-adminGreen-50 hover:bg-adminGreen-100 text-adminGreen-600" title="Accept booking">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteBooking(booking._id)}
                              className="p-2 rounded-xl transition-colors bg-red-50 hover:bg-red-100 text-red-500" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map((booking) => {
                const cfg = statusConfig[booking.status] || statusConfig.pending;
                return (
                  <div key={booking._id} className="p-5 space-y-4 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-adminGreen-700 bg-adminGreen-50 shrink-0">
                          {booking.customerName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{booking.customerName}</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">{booking.email}</p>
                        </div>
                      </div>
                      <span className={cfg.cls}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3 text-xs border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 block font-bold mb-0.5">Preferred Date</span>
                        <span className="font-bold text-gray-900">
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold mb-0.5">People &amp; Location</span>
                        <span className="font-bold text-gray-900">
                          {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'} • {booking.city || 'Mumbai'}
                        </span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                        <span className="text-gray-400 block font-bold uppercase tracking-wider text-[10px] mb-1.5">Special Requests</span>
                        <p className="text-gray-700 font-medium leading-relaxed">"{booking.specialRequests}"</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => setSelectedBooking(booking)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      {booking.status === 'pending' && (
                        <button onClick={() => updateStatus(booking._id, 'confirmed')}
                          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-adminGreen-500 hover:bg-adminGreen-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shadow-adminGreen-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm
                        </button>
                      )}
                      <button onClick={() => deleteBooking(booking._id)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-14 text-center border-t border-gray-100 bg-white">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No bookings found.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedBooking && (
        <Modal
          title="Booking Details"
          subtitle={`#${selectedBooking._id?.slice(-6)?.toUpperCase()}`}
          onClose={() => setSelectedBooking(null)}
        >
          <div className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <p className="text-xs text-gray-500 font-bold mb-1">Customer</p>
                <p className="font-bold text-gray-900">{selectedBooking.customerName}</p>
              </div>
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <p className="text-xs text-gray-500 font-bold mb-1">Phone</p>
                <p className="font-bold text-gray-900">{selectedBooking.phone}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
              <p className="text-xs text-gray-500 font-bold mb-1">Email</p>
              <p className="font-bold text-gray-900">{selectedBooking.email}</p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
              <p className="text-xs text-gray-500 font-bold mb-1">Address</p>
              <p className="font-bold text-gray-900">{selectedBooking.address}, {selectedBooking.city} {selectedBooking.zipCode}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <p className="text-xs text-gray-500 font-bold mb-1">Date</p>
                <p className="font-bold text-gray-900">{new Date(selectedBooking.preferredDate).toLocaleDateString()}</p>
              </div>
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <p className="text-xs text-gray-500 font-bold mb-1">People</p>
                <p className="font-bold text-gray-900">{selectedBooking.numberOfPeople}</p>
              </div>
            </div>
            {(selectedBooking.occasion || selectedBooking.designStyle) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedBooking.occasion && <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4"><p className="text-xs text-gray-500 font-bold mb-1">Occasion</p><p className="font-bold text-gray-900">{selectedBooking.occasion}</p></div>}
                {selectedBooking.designStyle && <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4"><p className="text-xs text-gray-500 font-bold mb-1">Design Style</p><p className="font-bold text-gray-900">{selectedBooking.designStyle}</p></div>}
              </div>
            )}
            {selectedBooking.specialRequests && (
              <div className="rounded-2xl p-4 border border-gray-200 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Special Requests</p>
                <p className="font-medium text-gray-900 leading-relaxed">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 mt-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => updateStatus(selectedBooking._id, s)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 capitalize ${
                      selectedBooking.status === s
                        ? 'bg-adminGreen-500 text-white border-transparent shadow-md shadow-adminGreen-500/20'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 pt-2">
            <button onClick={() => setSelectedBooking(null)}
              className="w-full py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm">
              Close
            </button>
          </div>
        </Modal>
      )}

      {confirmedNotification && (
        <NotificationModal data={confirmedNotification} type="confirmed" onClose={() => setConfirmedNotification(null)} />
      )}
      {completedNotification && (
        <NotificationModal data={completedNotification} type="completed" onClose={() => setCompletedNotification(null)} />
      )}
    </div>
  );
}
