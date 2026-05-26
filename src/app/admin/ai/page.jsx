'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles, Send, Brain, Bot, User, CheckCircle, XCircle, Trash2, MailOpen,
  Calendar, MessageSquare, Scissors, HelpCircle, Activity, ChevronRight, ShieldAlert,
} from 'lucide-react';
import { bookingsAPI, contactAPI, servicesAPI, testimonialsAPI } from '@/lib/api';

// ── NLP Intent Parser & Live Data Handler ──────────────────────────────────
function processAIQuery(query, { bookings, messages, services, testimonials }) {
  const q = query.toLowerCase().trim();

  // 1. Help Commands
  if (q.includes('help') || q.includes('what can you do') || q.includes('guide')) {
    return {
      text: `🤖 **Welcome to the Zunii AI Manager!**

I am built to monitor and manage your business data in real time. Here are some things you can ask me:

• **Check Stats**: *"Show stats"*, *"overview"*, or *"business health"* to see dashboard metrics.
• **Manage Bookings**: *"List pending bookings"*, *"confirm booking [Name]"*, or *"cancel booking [Name]"*.
• **Handle Messages**: *"Show unread messages"*, *"summarize inquiries"*, or *"unread contacts"*.
• **Manage Services**: *"List active services"*, or *"pricing structures"*.

You can also execute updates and deletions directly through interactive panels in our chat!`,
      type: 'help',
    };
  }

  // 2. Business Health & Metrics Overview
  if (q.includes('stat') || q.includes('health') || q.includes('overview') || q.includes('check data') || q.includes('dashboard')) {
    const totalBookings = bookings.length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const unreadMsg = messages.filter(m => !m.isRead).length;

    // Basic revenue calculation: start from ₹1,499 avg price for confirmed/completed
    const estimatedRev = (confirmed + completed) * 1999;

    return {
      text: `📈 **Data & Metrics Health Check:**

• **Total Bookings**: **${totalBookings}** registered
  - ⏳ *Pending Process*: ${pending} bookings
  - ✅ *Confirmed Active*: ${confirmed} bookings
  - 🎓 *Completed Services*: ${completed} bookings
• **Inbox Status**: **${unreadMsg} unread** customer inquiries
• **Artistry Catalogue**: **${services.length} active service packages**
• **Social Proof**: **${testimonials.length} reviews** published

💰 **Estimated Revenue**: ~₹${estimatedRev.toLocaleString('en-IN')} (based on active/completed bookings)

Would you like me to show the *pending bookings list* or *unread customer messages*?`,
      type: 'stats',
      data: { pending, confirmed, unreadMsg, totalBookings }
    };
  }

  // 3. Unread Inquiries / Contact Messages
  if (q.includes('message') || q.includes('contact') || q.includes('unread') || q.includes('inquiry') || q.includes('inbox')) {
    const unread = messages.filter(m => !m.isRead);
    if (unread.length === 0) {
      return {
        text: `✉️ **Inquiries Update:**

Excellent news! You have **0 unread messages**. All client messages have been read and addressed.`,
        type: 'messages',
        items: []
      };
    }
    return {
      text: `✉️ **Found ${unread.length} unread message(s) in your inbox:**

Here are the latest messages. You can mark them as read or delete them directly below:`,
      type: 'messages',
      items: unread
    };
  }

  // 4. Pending Booking List
  if (q.includes('booking') || q.includes('appointment') || q.includes('pending')) {
    const pending = bookings.filter(b => b.status === 'pending');
    if (pending.length === 0) {
      return {
        text: `📅 **Bookings Update:**

You have **0 pending appointments**. Great job! All bookings are current and confirmed.`,
        type: 'bookings',
        items: []
      };
    }
    return {
      text: `📅 **Found ${pending.length} pending appointment request(s):**

Review them below to confirm or cancel directly:`,
      type: 'bookings',
      items: pending
    };
  }

  // 5. Confirm specific booking
  if (q.includes('confirm') || q.includes('approve') || q.includes('verify')) {
    const pending = bookings.filter(b => b.status === 'pending');
    const matched = pending.find(b => q.includes(b.customerName.toLowerCase()));

    if (matched) {
      return {
        text: `I've found a pending appointment request for **${matched.customerName}** on ${new Date(matched.preferredDate).toLocaleDateString('en-IN')}.\n\nWould you like me to confirm it?`,
        type: 'confirm_action',
        actionType: 'confirm_booking',
        targetId: matched._id,
        targetName: matched.customerName,
      };
    } else {
      if (pending.length > 0) {
        return {
          text: `Which pending booking would you like to confirm? Here is the current list:`,
          type: 'bookings',
          items: pending
        };
      } else {
        return {
          text: `There are no pending bookings available to confirm.`
        };
      }
    }
  }

  // 6. Cancel specific booking
  if (q.includes('cancel') || q.includes('reject') || q.includes('decline')) {
    const matched = bookings.find(b => q.includes(b.customerName.toLowerCase()) && b.status !== 'cancelled');

    if (matched) {
      return {
        text: `I found a booking for **${matched.customerName}** (${matched.status}).\n\nWould you like me to mark it as cancelled?`,
        type: 'confirm_action',
        actionType: 'cancel_booking',
        targetId: matched._id,
        targetName: matched.customerName,
      };
    } else {
      return {
        text: `Please specify the name of the client to cancel (e.g. *"cancel booking Arshad"*).`
      };
    }
  }

  // 7. List Services
  if (q.includes('service') || q.includes('pricing') || q.includes('price') || q.includes('offer')) {
    return {
      text: `✂️ **Artistry Service Catalogue:**

Here are the active henna packages displayed on your public booking page:`,
      type: 'services',
      items: services
    };
  }

  // 8. General AI Conversation / Fallback
  return {
    text: `🤖 **Hi, I'm your AI Business Manager!**

I have analyzed your live system database. I can check business statistics, review messages, and update appointments.

Try asking me one of the following:
• *"Check stats"*
• *"Show pending bookings"*
• *"Show unread messages"*
• *"Confirm booking [Name]"*`,
    type: 'conversation'
  };
}

export default function AIAssistant() {
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chatLog, setChatLog] = useState([
    {
      id: 0,
      from: 'ai',
      text: "🤖 **Welcome, Zunaira!** I'm your AI Business Assistant. I am linked to your database and can help you audit dashboard stats, approve appointments, and review customer emails. Ask me anything to get started!",
      type: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  // Load all database collections on mount
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [bookRes, contactRes, servRes, testRes] = await Promise.all([
        bookingsAPI.getAll().catch(() => ({ data: [] })),
        contactAPI.getAll().catch(() => ({ data: [] })),
        servicesAPI.getAll().catch(() => ({ data: [] })),
        testimonialsAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setBookings(bookRes.data || []);
      setMessages(contactRes.data || []);
      setServices(servRes.data || []);
      setTestimonials(testRes.data || []);
    } catch (err) {
      console.error('Failed to load database for AI', err);
      setChatLog(prev => [
        ...prev,
        {
          id: Date.now(),
          from: 'ai',
          text: '⚠️ **Connection Error:** Unable to reach the backend server. Please make sure the backend is running on port 5000, then refresh the page.',
          type: 'error',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const handleSendMessage = (customText) => {
    const text = customText || input.trim();
    if (!text) return;

    setChatLog(prev => [...prev, { id: Date.now(), from: 'user', text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const reply = processAIQuery(text, { bookings, messages, services, testimonials });
      setChatLog(prev => [...prev, { id: Date.now() + 1, from: 'ai', ...reply }]);
      setIsTyping(false);
    }, 850);
  };

  // ── Database Handling Actions ─────────────────────────────────────────────
  const confirmBooking = async (id, name) => {
    try {
      setIsTyping(true);
      await bookingsAPI.update(id, { status: 'confirmed' });
      // Refresh local databases
      await fetchAllData();
      setChatLog(prev => [
        ...prev,
        {
          id: Date.now(),
          from: 'ai',
          text: `✅ **Success:** Booking for **${name}** has been confirmed! An confirmation notification email was successfully dispatched to their address.`
        }
      ]);
    } catch {
      alert('Failed to update booking');
    } finally {
      setIsTyping(false);
    }
  };

  const cancelBooking = async (id, name) => {
    try {
      setIsTyping(true);
      await bookingsAPI.update(id, { status: 'cancelled' });
      await fetchAllData();
      setChatLog(prev => [
        ...prev,
        {
          id: Date.now(),
          from: 'ai',
          text: `❌ **Canceled:** Booking for **${name}** was set to *cancelled* status.`
        }
      ]);
    } catch {
      alert('Failed to cancel booking');
    } finally {
      setIsTyping(false);
    }
  };

  const markMessageRead = async (id, senderName) => {
    try {
      setIsTyping(true);
      await contactAPI.markRead(id);
      await fetchAllData();
      setChatLog(prev => [
        ...prev,
        {
          id: Date.now(),
          from: 'ai',
          text: `✉️ **Read Status:** Message from **${senderName}** has been marked as read.`
        }
      ]);
    } catch {
      alert('Failed to mark message as read');
    } finally {
      setIsTyping(false);
    }
  };

  const deleteMessage = async (id, senderName) => {
    if (!confirm(`Are you sure you want to delete the message from ${senderName}?`)) return;
    try {
      setIsTyping(true);
      await contactAPI.delete(id);
      await fetchAllData();
      setChatLog(prev => [
        ...prev,
        {
          id: Date.now(),
          from: 'ai',
          text: `🗑️ **Deleted:** Message from **${senderName}** has been removed from database.`
        }
      ]);
    } catch {
      alert('Failed to delete message');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const stats = [
    { label: 'Bookings', value: bookings.length, icon: Calendar, color: 'text-olive-600', bg: 'bg-olive-50' },
    { label: 'Unread', value: messages.filter(m => !m.isRead).length, icon: MessageSquare, color: 'text-gold-600', bg: 'bg-gold-50' },
    { label: 'Services', value: services.length, icon: Scissors, color: 'text-brown-600', bg: 'bg-beige-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-brown-700">AI Data Assistant</h1>
        <p className="text-sm text-brown-400 mt-0.5">Interact with your business database using natural language queries.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Chat Interface */}
        <div className="lg:col-span-3 bg-white border border-beige-200 rounded-[2rem] overflow-hidden flex flex-col shadow-sm h-[650px]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-olive-600 to-olive-500 px-6 py-4 flex items-center gap-3 border-b border-olive-700/10 shrink-0">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center relative">
              <Brain className="text-white w-5 h-5 animate-pulse" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-gold-300 rounded-full border-2 border-olive-600" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Zunii Database Agent</h2>
              <p className="text-olive-100 text-xs flex items-center gap-1.5 mt-0.5">
                <Activity size={10} className="text-gold-300 animate-pulse" />
                Live API &amp; DB Connection Active
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-beige-50/40" style={{ minHeight: 0 }}>
            {chatLog.map((msg, index) => (
              <div key={msg.id || index} className="space-y-2">
                
                {/* Bubble Wrapper */}
                <div className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'ai' && (
                    <div className="w-8 h-8 rounded-lg bg-olive-100 border border-olive-200/50 flex items-center justify-center text-sm mr-2.5 shrink-0 mt-0.5">
                      🌸
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm border ${
                      msg.from === 'user'
                        ? 'bg-olive-500 text-white rounded-br-sm border-olive-600'
                        : 'bg-white text-brown-700 rounded-bl-sm border-beige-200/70'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Render Interactive Database Elements based on response type */}
                {msg.from === 'ai' && (
                  <div className="ml-10">
                    
                    {/* ── Pending Bookings List Render ── */}
                    {msg.type === 'bookings' && msg.items && msg.items.length > 0 && (
                      <div className="mt-3 grid sm:grid-cols-2 gap-3 max-w-2xl">
                        {msg.items.map(b => (
                          <div key={b._id} className="bg-white border border-beige-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <p className="font-bold text-brown-700 text-sm">{b.customerName}</p>
                                <span className="text-[10px] uppercase font-bold text-gold-600 bg-gold-50 border border-gold-100 px-2 py-0.5 rounded-full">{b.status}</span>
                              </div>
                              <p className="text-xs text-brown-400 mt-1">📅 {new Date(b.preferredDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                              <p className="text-xs text-brown-400">🕒 Time: {b.preferredTime || 'Not specified'}</p>
                              <p className="text-xs text-brown-400">📞 Phone: {b.phone}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button onClick={() => confirmBooking(b._id, b.customerName)}
                                className="flex-1 py-1.5 bg-olive-500 hover:bg-olive-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors">
                                <CheckCircle size={12} /> Confirm
                              </button>
                              <button onClick={() => cancelBooking(b._id, b.customerName)}
                                className="flex-1 py-1.5 border border-beige-200 text-brown-500 hover:bg-beige-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors">
                                <XCircle size={12} /> Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Inbox Messages List Render ── */}
                    {msg.type === 'messages' && msg.items && msg.items.length > 0 && (
                      <div className="mt-3 space-y-2.5 max-w-xl">
                        {msg.items.map(m => (
                          <div key={m._id} className="bg-white border border-beige-200 rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center justify-between pb-2 border-b border-beige-100">
                              <div>
                                <p className="font-bold text-brown-700 text-sm">{m.name}</p>
                                <p className="text-[10px] text-brown-400 font-mono">{m.email}</p>
                              </div>
                              <span className="text-[10px] text-brown-400">{new Date(m.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                            <p className="text-xs text-brown-600 italic mt-2.5 bg-beige-50/70 p-2.5 rounded-xl border border-beige-100">"{m.message}"</p>
                            <div className="flex gap-2 justify-end mt-3">
                              <button onClick={() => markMessageRead(m._id, m.name)}
                                className="px-3 py-1.5 bg-olive-100 hover:bg-olive-200 text-olive-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
                                <MailOpen size={12} /> Mark Read
                              </button>
                              <button onClick={() => deleteMessage(m._id, m.name)}
                                className="px-3 py-1.5 border border-red-100 hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Services List Render ── */}
                    {msg.type === 'services' && msg.items && msg.items.length > 0 && (
                      <div className="mt-3 grid sm:grid-cols-2 gap-3 max-w-2xl">
                        {msg.items.map(s => (
                          <div key={s._id} className="bg-white border border-beige-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                            <div className="w-8 h-8 rounded-xl bg-olive-50 border border-olive-100 flex items-center justify-center shrink-0 mt-0.5">
                              <Scissors size={14} className="text-olive-600" />
                            </div>
                            <div>
                              <p className="font-bold text-brown-700 text-sm leading-tight">{s.name}</p>
                              <p className="text-xs text-olive-600 font-bold mt-1">₹{s.price}</p>
                              <p className="text-xs text-brown-400 mt-1 leading-snug line-clamp-2">{s.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Direct Confirm Action Box ── */}
                    {msg.type === 'confirm_action' && (
                      <div className="mt-3 bg-white border border-beige-200 rounded-2xl p-4 max-w-xs shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-100 flex items-center justify-center shrink-0 text-gold-600">
                          <ShieldAlert size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-brown-700">Confirm Action Required</p>
                          <div className="flex gap-2 mt-2">
                            {msg.actionType === 'confirm_booking' && (
                              <button onClick={() => confirmBooking(msg.targetId, msg.targetName)}
                                className="px-3 py-1 bg-olive-500 hover:bg-olive-600 text-white rounded-lg text-xs font-semibold">
                                Yes, Confirm
                              </button>
                            )}
                            {msg.actionType === 'cancel_booking' && (
                              <button onClick={() => cancelBooking(msg.targetId, msg.targetName)}
                                className="px-3 py-1 bg-olive-500 hover:bg-olive-600 text-white rounded-lg text-xs font-semibold">
                                Yes, Cancel
                              </button>
                            )}
                            <button onClick={() => setChatLog(prev => [...prev, { id: Date.now(), from: 'ai', text: 'Action cancelled.' }])}
                              className="px-3 py-1 border border-beige-200 text-brown-500 rounded-lg text-xs font-semibold">
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-olive-100 border border-olive-200/50 flex items-center justify-center text-sm shrink-0">
                  🌸
                </div>
                <div className="bg-white border border-beige-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2.5 h-2.5 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-4 border-t border-beige-200 bg-white flex gap-3 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me: 'Show stats', 'Pending bookings', 'Confirm booking for Arshad'..."
              className="flex-1 px-5 py-3 border border-beige-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 bg-beige-50"
              disabled={loading || isTyping}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading || isTyping}
              className="w-12 h-12 bg-olive-500 hover:bg-olive-600 text-white rounded-2xl flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-md shadow-olive-500/20"
            >
              <Send size={18} />
            </button>
          </div>

        </div>

        {/* Right Side: Data Insights & Quick Prompts */}
        <div className="space-y-4">
          
          {/* Quick Metrics */}
          <div className="bg-white border border-beige-200 rounded-[2rem] p-5 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-brown-700 text-base flex items-center gap-2 pb-2.5 border-b border-beige-100">
              <Activity size={16} className="text-olive-600" /> Database Health
            </h3>
            <div className="space-y-3">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-beige-50 border border-beige-200/50">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <s.icon size={15} className={s.color} />
                    </div>
                    <span className="text-xs font-semibold text-brown-500">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold text-brown-700 font-serif">
                    {loading ? '—' : s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt Suggestions */}
          <div className="bg-white border border-beige-200 rounded-[2rem] p-5 shadow-sm">
            <h3 className="font-serif font-bold text-brown-700 text-base flex items-center gap-2 pb-2.5 border-b border-beige-100 mb-3">
              <HelpCircle size={16} className="text-olive-600" /> Quick Prompts
            </h3>
            <div className="space-y-2 flex flex-col">
              {[
                { label: 'Check overview statistics', prompt: 'Show stats' },
                { label: 'Audit pending appointments', prompt: 'List pending bookings' },
                { label: 'Review unread inbox messages', prompt: 'Show unread messages' },
                { label: 'List public pricing list', prompt: 'Show active services' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.prompt)}
                  className="w-full text-left p-3 rounded-xl border border-beige-100 hover:border-olive-400 hover:bg-olive-50/20 text-xs text-brown-600 font-semibold flex items-center justify-between group transition-all"
                >
                  {item.label}
                  <ChevronRight size={13} className="text-brown-400 group-hover:text-olive-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
