'use client';

import { useEffect, useState } from 'react';
import { Trash2, Mail, Phone, MessageSquare, X, CheckCircle } from 'lucide-react';
import { contactAPI } from '@/lib/api';

export default function AdminContactPage() {
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      const res = await contactAPI.getAll();
      setMessages(res.data);
    } catch { setMessages([]); } finally { setLoading(false); }
  };

  const markAsRead = async (id) => {
    try {
      await contactAPI.markRead(id);
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch {}
  };

  const deleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await contactAPI.delete(id);
      setMessages(messages.filter(m => m._id !== id));
      setSelectedMessage(null);
    } catch { alert('Failed to delete'); }
  };

  const handleOpen = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) markAsRead(msg._id);
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const readCount   = messages.filter(m => m.isRead).length;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brown-700">Contact Messages</h1>
          <p className="text-brown-400 mt-0.5">View and manage customer inquiries</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #6B7A3E, #4A5529)', color: '#fff', boxShadow: '0 4px 12px rgba(107,122,62,0.35)' }}>
              <span className="w-2 h-2 rounded-full bg-white" />
              {unreadCount} Unread
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white border border-beige-200 text-brown-500">
            <CheckCircle className="w-4 h-4 text-brown-300" />
            {readCount} Read
          </div>
        </div>
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="admin-card p-10 text-center">
          <div className="w-8 h-8 border-2 border-olive-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brown-400">Loading messages...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => handleOpen(msg)}
              className="admin-card cursor-pointer transition-all duration-200 hover:-translate-y-px overflow-hidden"
              style={!msg.isRead ? { boxShadow: '0 2px 16px rgba(107,122,62,0.12), 0 0 0 2px rgba(107,122,62,0.15)' } : {}}
            >
              <div className="flex items-stretch">
                {/* Left accent bar */}
                <div className="w-1 shrink-0 rounded-l-3xl"
                  style={{ background: !msg.isRead ? 'linear-gradient(180deg, #6B7A3E, #4A5529)' : '#E4D9C8' }} />

                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold text-brown-700 shrink-0"
                        style={{ background: !msg.isRead
                          ? 'linear-gradient(135deg, #6B7A3E, #4A5529)'
                          : 'linear-gradient(135deg, #B8A07A, #8B6914)' }}>
                        {msg.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + date row */}
                        <div className="flex items-center gap-2 mb-1">
                          {!msg.isRead && (
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#6B7A3E' }} />
                          )}
                          <h3 className="font-bold text-brown-700">{msg.name}</h3>
                          <span className="text-xs text-brown-400 shrink-0 ml-auto">
                            {new Date(msg.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                        </div>

                        {/* Contact info */}
                        <div className="flex items-center gap-4 mb-3 text-xs text-brown-400">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{msg.email}</span>
                          {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{msg.phone}</span>}
                        </div>

                        {/* Full message */}
                        <div className="rounded-2xl px-4 py-3 border border-beige-200"
                          style={{ background: !msg.isRead ? '#F4F7EE' : '#FAFAF5' }}>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1.5"
                            style={{ color: !msg.isRead ? '#6B7A3E' : '#B8A07A' }}>
                            Message / Special Request
                          </p>
                          <p className="text-brown-600 text-sm leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteMessage(msg._id); }}
                      className="p-2 rounded-xl text-brown-300 hover:text-red-400 hover:bg-red-50 transition-all shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="admin-card p-14 text-center">
              <MessageSquare className="w-14 h-14 mx-auto mb-4 text-brown-200" />
              <h3 className="text-lg font-serif font-bold text-brown-400 mb-1">No messages yet</h3>
              <p className="text-brown-300 text-sm">Customer inquiries will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg animate-scale-in overflow-hidden"
            style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>

            {/* Modal header */}
            <div className="admin-modal-header rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold text-brown-700"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {selectedMessage.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-brown-700 font-serif font-bold text-xl">{selectedMessage.name}</h2>
                  <span className={`text-xs font-bold uppercase tracking-wide ${selectedMessage.isRead ? 'text-brown-400' : 'text-green-300'}`}>
                    {selectedMessage.isRead ? 'Read' : '● Unread'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-brown-500 hover:text-brown-700 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="admin-card p-3">
                  <p className="text-xs text-brown-400 mb-1">Email</p>
                  <p className="font-semibold text-brown-700 truncate">{selectedMessage.email}</p>
                </div>
                {selectedMessage.phone && (
                  <div className="admin-card p-3">
                    <p className="text-xs text-brown-400 mb-1">Phone</p>
                    <p className="font-semibold text-brown-700">{selectedMessage.phone}</p>
                  </div>
                )}
                <div className="admin-card p-3 col-span-full">
                  <p className="text-xs text-brown-400 mb-1">Date</p>
                  <p className="font-semibold text-brown-700">
                    {new Date(selectedMessage.createdAt).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-4 border border-olive-200" style={{ background: '#F4F7EE' }}>
                <p className="text-xs font-bold text-olive-600 uppercase tracking-wide mb-2">Message / Special Request</p>
                <p className="text-brown-700 text-sm leading-relaxed">{selectedMessage.message}</p>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <a href={`mailto:${selectedMessage.email}?subject=Re: Zuniii Creation Inquiry`}
                className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-beige-200 text-brown-600 hover:bg-beige-50">
                <Mail className="w-4 h-4" /> Reply via Email
              </a>
              {selectedMessage.phone && (
                <a href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, '')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all text-brown-700"
                  style={{ background: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.35)' }}>
                  <Phone className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setSelectedMessage(null)}
                className="w-full py-2.5 text-brown-400 hover:text-brown-600 transition-colors text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
