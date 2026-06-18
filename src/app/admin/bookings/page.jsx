'use client';

import { useEffect, useState } from 'react';
import {
  Search, Eye, CheckCircle, XCircle, Clock, Trash2,
  Mail, MessageCircle, X, Calendar, Filter,
} from 'lucide-react';
import { bookingsAPI } from '@/lib/api';

const statusConfig = {
  pending:   { cls: 'admin-badge-pending',   icon: Clock,         dot: '#D4920A' },
  confirmed: { cls: 'admin-badge-confirmed', icon: CheckCircle,   dot: '#6B7A3E' },
  completed: { cls: 'admin-badge-completed', icon: CheckCircle,   dot: '#8B6914' },
  cancelled: { cls: 'admin-badge-cancelled', icon: XCircle,       dot: '#B8A07A' },
};

// ── Reusable Modal Wrapper ─────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div className="admin-modal-header rounded-t-3xl">
          <div>
            <h2 className="text-brown-700 font-serif font-bold text-xl">{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.50)' }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-brown-500 hover:text-brown-700 transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Notification Modal ─────────────────────────────────────────────────────
function NotificationModal({ data, type, onClose }) {
  const isCompleted = type === 'completed';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full animate-scale-in"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-brown-300 hover:text-brown-500 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 text-4xl"
            style={{ background: isCompleted ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : 'linear-gradient(135deg,#E4ECCC,#C8D99A)' }}>
            {isCompleted ? '🌸' : '🎉'}
          </div>
          <h2 className="text-2xl font-serif font-bold text-brown-700 mb-1">
            {isCompleted ? 'Session Complete!' : 'Booking Confirmed!'}
          </h2>
          <p className="text-brown-400 text-sm">
            {isCompleted
              ? `${data.customerName}'s mehndi is done. Thank-you messages sent!`
              : `${data.customerName}'s mehndi appointment is all set.`}
          </p>
        </div>

        {/* Email row */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-3"
          style={{ background: isCompleted ? '#FFFBEB' : '#F4F7EE', border: `1px solid ${isCompleted ? '#FDE68A' : '#C8D99A'}` }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: isCompleted ? '#FEF3C7' : '#E4ECCC' }}>
            <Mail className="w-4 h-4" style={{ color: isCompleted ? '#A97208' : '#6B7A3E' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: isCompleted ? '#7E5406' : '#556130' }}>
              {isCompleted ? 'Thank-you email sent' : 'Confirmation email sent'}
            </p>
            <p className="text-xs truncate" style={{ color: isCompleted ? '#A97208' : '#6B7A3E' }}>{data.email}</p>
          </div>
          <CheckCircle className="w-4 h-4 shrink-0" style={{ color: isCompleted ? '#D4920A' : '#6B7A3E' }} />
        </div>

        {/* WhatsApp */}
        {data.whatsappLink ? (
          <a href={data.whatsappLink} target="_blank" rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 transition-all duration-200 group"
            style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37,211,102,0.35)' }}>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-brown-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-brown-700">
                {isCompleted ? 'Send Thank-You on WhatsApp' : 'Send WhatsApp Message'}
              </p>
              <p className="text-xs text-brown-700/70">Opens WhatsApp with pre-filled message</p>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4 bg-beige-50 border border-beige-200">
            <MessageCircle className="w-4 h-4 text-brown-300" />
            <p className="text-sm text-brown-400">No phone number on this booking</p>
          </div>
        )}

        <button onClick={onClose}
          className="w-full py-3 border border-beige-200 text-brown-500 rounded-2xl font-medium hover:bg-beige-50 transition-colors text-sm">
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
          <h1 className="text-3xl font-serif font-bold text-brown-700">Booking Management</h1>
          <p className="text-brown-400 mt-0.5">Manage and track all booking requests</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={statusFilter === key ? {
              background: 'linear-gradient(135deg, #6B7A3E, #4A5529)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(107,122,62,0.35)',
            } : {
              background: '#fff',
              color: '#8B6914',
              border: '1px solid #E4D9C8',
            }}>
            <span className="capitalize">{key}</span>
            <span className="px-1.5 py-0.5 rounded-full text-xs"
              style={statusFilter === key ? { background: 'rgba(255,255,255,0.25)' } : { background: '#F2EDE3' }}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + table */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-beige-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-300" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-beige-200 rounded-2xl bg-beige-50 text-sm text-brown-700 placeholder:text-brown-300 focus:outline-none focus:ring-2 focus:ring-olive-400/50 focus:bg-white transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-brown-400">
            <div className="w-8 h-8 border-2 border-olive-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading bookings...
          </div>
        ) : fetchError ? (
          <div className="p-8 text-center">
            <p className="text-olive-600 font-medium mb-2">{fetchError}</p>
            <button onClick={fetchBookings} className="text-sm text-olive-500 underline">Retry</button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr style={{ background: '#F9F7F2' }}>
                    {['Customer', 'Date', 'People', 'City', 'Special Requests', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-brown-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => {
                    const cfg = statusConfig[booking.status] || statusConfig.pending;
                    return (
                      <tr key={booking._id} style={{ borderBottom: '1px solid #F2EDE3' }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-brown-700 shrink-0"
                              style={{ background: 'linear-gradient(135deg, #6B7A3E, #4A5529)' }}>
                              {booking.customerName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-brown-700 text-sm">{booking.customerName}</p>
                              <p className="text-xs text-brown-400">{booking.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-brown-600 text-sm">
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-brown-600 text-sm">{booking.numberOfPeople}</td>
                        <td className="px-5 py-4 text-brown-600 text-sm">{booking.city}</td>
                        <td className="px-5 py-4 text-sm max-w-[200px]">
                          {booking.specialRequests
                            ? <span className="text-brown-600 line-clamp-2">{booking.specialRequests}</span>
                            : <span className="text-brown-300">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span className={cfg.cls}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            <button onClick={() => setSelectedBooking(booking)}
                              className="p-2 rounded-xl transition-colors hover:bg-beige-50 text-olive-500" title="View details">
                              <Eye className="w-4 h-4" />
                            </button>
                            {booking.status === 'pending' && (
                              <button onClick={() => updateStatus(booking._id, 'confirmed')}
                                className="p-2 rounded-xl transition-colors hover:bg-beige-50 text-olive-600" title="Accept booking">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => deleteBooking(booking._id)}
                              className="p-2 rounded-xl transition-colors hover:bg-red-50 text-red-400" title="Delete">
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
            <div className="md:hidden divide-y divide-beige-100">
              {filtered.map((booking) => {
                const cfg = statusConfig[booking.status] || statusConfig.pending;
                return (
                  <div key={booking._id} className="p-4 space-y-3 bg-white">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-brown-700 shrink-0"
                          style={{ background: 'linear-gradient(135deg, #6B7A3E, #4A5529)' }}>
                          {booking.customerName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-brown-700 text-sm">{booking.customerName}</p>
                          <p className="text-xs text-brown-400">{booking.email}</p>
                        </div>
                      </div>
                      <span className={cfg.cls}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-beige-100">
                      <div>
                        <span className="text-brown-400 block font-medium">Preferred Date</span>
                        <span className="font-semibold text-brown-700">
                          {new Date(booking.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-brown-400 block font-medium">People &amp; Location</span>
                        <span className="font-semibold text-brown-700">
                          {booking.numberOfPeople} {booking.numberOfPeople === 1 ? 'person' : 'people'} • {booking.city || 'Mumbai'}
                        </span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="bg-beige-50 p-3 rounded-xl border border-beige-200/50 text-xs">
                        <span className="text-brown-400 block font-bold uppercase tracking-wider text-[10px] mb-1">Special Requests</span>
                        <p className="text-brown-600 italic leading-relaxed">"{booking.specialRequests}"</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-beige-100">
                      <button onClick={() => setSelectedBooking(booking)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-beige-50 hover:bg-beige-50 border border-beige-200 text-brown-600 rounded-xl text-xs font-semibold transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                      {booking.status === 'pending' && (
                        <button onClick={() => updateStatus(booking._id, 'confirmed')}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-beige-500 hover:bg-olive-600 text-white rounded-xl text-xs font-semibold transition-colors">
                          <CheckCircle className="w-3.5 h-3.5" /> Confirm
                        </button>
                      )}
                      <button onClick={() => deleteBooking(booking._id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-semibold transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="p-10 text-center border-t border-beige-100 bg-white">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-brown-200" />
                <p className="text-brown-400">No bookings found.</p>
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
              <div className="admin-card p-3">
                <p className="text-xs text-brown-400 mb-1">Customer</p>
                <p className="font-semibold text-brown-700">{selectedBooking.customerName}</p>
              </div>
              <div className="admin-card p-3">
                <p className="text-xs text-brown-400 mb-1">Phone</p>
                <p className="font-semibold text-brown-700">{selectedBooking.phone}</p>
              </div>
            </div>
            <div className="admin-card p-3">
              <p className="text-xs text-brown-400 mb-1">Email</p>
              <p className="font-semibold text-brown-700">{selectedBooking.email}</p>
            </div>
            <div className="admin-card p-3">
              <p className="text-xs text-brown-400 mb-1">Address</p>
              <p className="font-semibold text-brown-700">{selectedBooking.address}, {selectedBooking.city} {selectedBooking.zipCode}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="admin-card p-3">
                <p className="text-xs text-brown-400 mb-1">Date</p>
                <p className="font-semibold text-brown-700">{new Date(selectedBooking.preferredDate).toLocaleDateString()}</p>
              </div>
              <div className="admin-card p-3">
                <p className="text-xs text-brown-400 mb-1">People</p>
                <p className="font-semibold text-brown-700">{selectedBooking.numberOfPeople}</p>
              </div>
            </div>
            {(selectedBooking.occasion || selectedBooking.designStyle) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedBooking.occasion && <div className="admin-card p-3"><p className="text-xs text-brown-400 mb-1">Occasion</p><p className="font-semibold text-brown-700">{selectedBooking.occasion}</p></div>}
                {selectedBooking.designStyle && <div className="admin-card p-3"><p className="text-xs text-brown-400 mb-1">Design Style</p><p className="font-semibold text-brown-700">{selectedBooking.designStyle}</p></div>}
              </div>
            )}
            {selectedBooking.specialRequests && (
              <div className="rounded-2xl p-4 border border-beige-200" style={{ background: '#FAFAF5' }}>
                <p className="text-xs font-bold text-brown-400 uppercase tracking-wide mb-2">Special Requests</p>
                <p className="font-medium text-brown-700 leading-relaxed">{selectedBooking.specialRequests}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-bold text-brown-400 uppercase tracking-wide mb-3">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                  <button key={s} onClick={() => updateStatus(selectedBooking._id, s)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 capitalize ${
                      selectedBooking.status === s
                        ? 'text-brown-700 border-transparent'
                        : 'border-beige-200 text-brown-500 hover:border-olive-300 hover:text-olive-600'
                    }`}
                    style={selectedBooking.status === s ? {
                      background: 'linear-gradient(135deg, #6B7A3E, #4A5529)',
                      boxShadow: '0 2px 8px rgba(107,122,62,0.35)',
                    } : {}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <button onClick={() => setSelectedBooking(null)}
              className="w-full py-3 border border-beige-200 text-brown-500 rounded-2xl font-medium hover:bg-beige-50 transition-colors text-sm">
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
