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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-500 mt-1">View and manage customer inquiries</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-adminGreen-500 text-white shadow-md shadow-adminGreen-500/20">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {unreadCount} Unread
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-white border border-gray-200 text-gray-600">
            <CheckCircle className="w-4 h-4 text-gray-400" />
            {readCount} Read
          </div>
        </div>
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
          <div className="w-10 h-10 border-2 border-adminGreen-100 border-t-adminGreen-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading messages...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => handleOpen(msg)}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-px overflow-hidden relative group"
            >
              <div className="flex items-stretch">
                {/* Left accent bar */}
                <div className={`w-1.5 shrink-0 ${!msg.isRead ? 'bg-adminGreen-500' : 'bg-transparent'}`} />

                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0
                        ${!msg.isRead ? 'bg-adminGreen-500 text-white shadow-md shadow-adminGreen-500/20' : 'bg-gray-100 text-gray-500'}`}>
                        {msg.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + date row */}
                        <div className="flex items-center gap-3 mb-1.5">
                          {!msg.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-adminGreen-500 shrink-0" />
                          )}
                          <h3 className={`font-bold text-lg ${!msg.isRead ? 'text-gray-900' : 'text-gray-600'}`}>{msg.name}</h3>
                          <span className="text-sm font-medium text-gray-400 shrink-0 ml-auto">
                            {new Date(msg.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                        </div>

                        {/* Contact info */}
                        <div className="flex items-center gap-4 mb-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400" />{msg.email}</span>
                          {msg.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gray-400" />{msg.phone}</span>}
                        </div>

                        {/* Full message */}
                        <div className={`rounded-2xl px-5 py-4 border ${!msg.isRead ? 'border-adminGreen-100 bg-adminGreen-50/50' : 'border-gray-100 bg-gray-50'}`}>
                          <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${!msg.isRead ? 'text-adminGreen-600' : 'text-gray-500'}`}>
                            Message / Special Request
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed font-medium">{msg.message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteMessage(msg._id); }}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 font-medium">Customer inquiries will appear here.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg flex flex-col animate-scale-in overflow-hidden shadow-2xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

            {/* Modal header */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-5 shrink-0 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold bg-adminGreen-500 text-white shadow-sm shadow-adminGreen-500/20">
                  {selectedMessage.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold text-xl">{selectedMessage.name}</h2>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1 ${selectedMessage.isRead ? 'text-gray-500' : 'text-adminGreen-600'}`}>
                    {!selectedMessage.isRead && <span className="w-1.5 h-1.5 rounded-full bg-adminGreen-500" />}
                    {selectedMessage.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors p-2 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</p>
                    <p className="font-bold text-gray-900 truncate">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Phone</p>
                      <p className="font-bold text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 col-span-full">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</p>
                    <p className="font-bold text-gray-900">
                      {new Date(selectedMessage.createdAt).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl p-5 border border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Message / Special Request</p>
                  <p className="text-gray-900 text-sm leading-relaxed font-medium">{selectedMessage.message}</p>
                </div>
              </div>

              <div className="px-6 pb-6 flex gap-3">
                <a href={`mailto:${selectedMessage.email}?subject=Re: Zuniii Creation Inquiry`}
                  className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100">
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
                {selectedMessage.phone && (
                  <a href={`https://wa.me/${selectedMessage.phone.replace(/\D/g, '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-adminGreen-500 hover:bg-adminGreen-600 text-white shadow-sm shadow-adminGreen-500/20">
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                )}
              </div>
              <div className="px-6 pb-6 pt-2">
                <button onClick={() => setSelectedMessage(null)}
                  className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors text-sm">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
