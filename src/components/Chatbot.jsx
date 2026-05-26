'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, ChevronRight, Bot } from 'lucide-react';

// ─── Chatbot Logic (if/else based) ───────────────────────────────────────────

function getBotReply(input) {
  const msg = input.toLowerCase().trim();

  // ── Exact suggestion chip matches first (prevent keyword false-positives) ──
  if (msg === 'service areas') {
    return {
      text: '📍 We provide home service across:\n\n• Mumbai (all areas)\n• Navi Mumbai\n• Thane\n• Andheri\n• Bandra\n• Juhu\n• Powai\n• South Mumbai\n\n📌 Our address:\nA/23-04 Deonar Municipal Colony,\nGovandi, Mumbai – 400043\n\nAdditional travel charges may apply for distant areas. Contact us to confirm!',
      suggestions: ['Book Home Visit', 'Pricing', 'Contact Info'],
    };
  }

  if (msg === 'services & pricing' || msg === 'pricing') {
    return {
      text: '💰 Here are our services:\n\n• Bridal Mehndi — from ₹2,999\n• Arabic Mehndi — from ₹999\n• Engagement Mehndi — from ₹1,499\n• Festival Mehndi — from ₹499\n• Kids Mehndi — from ₹299\n• Group Bookings — contact for quote\n\nAll prices include home service!',
      suggestions: ['Book Now', 'Bridal Mehndi Details', 'Arabic Mehndi Details', 'Group Booking'],
    };
  }

  if (msg === 'contact info') {
    return {
      text: '📞 Contact Zunaira:\n\n• WhatsApp / Phone: +91 99670 01963\n• Email: zuniicreation@gmail.com\n• Instagram: @Zuniii_creation\n• Response time: Within 24 hours\n• Available: 7 days a week\n\nWhatsApp is the fastest way to reach us!',
      suggestions: ['WhatsApp Us', 'Book Now', 'Service Areas'],
    };
  }

  if (msg === 'design styles') {
    return {
      text: '🎨 We specialize in these design styles:\n\n• Arabic\n• Indian Traditional\n• Dubai Style\n• Pakistani\n• Doha\n• Floral\n• Indo Dubai\n• Patch Work\n• Bridal\n• Modern Minimalist\n\nCustom designs are also available!',
      suggestions: ['View Gallery', 'Book Now', 'Pricing'],
    };
  }

  if (msg === 'book an appointment' || msg === 'book now' || msg === 'book home visit' || msg === 'book bridal mehndi' || msg === 'book arabic mehndi') {
    return {
      text: "📅 To book an appointment:\n\n1. Visit our Contact/Book page\n2. Fill in your details & preferred date\n3. We'll confirm within 24 hours\n\nOr WhatsApp us directly for instant response! We're available 7 days a week.",
      suggestions: ['Go to Booking Page', 'WhatsApp Us', 'Service Areas', 'Pricing'],
    };
  }

  if (msg === 'about zunaira') {
    return {
      text: "👩‍🎨 About Zunaira:\n\n• 7+ years of professional experience\n• 1000+ happy clients\n• 5+ certificates & awards\n• Specialist in Bridal, Arabic & Modern designs\n• Home service across Mumbai\n\nEvery design is crafted with love and precision! 🌸",
      suggestions: ['View Gallery', 'Pricing', 'Book Now'],
    };
  }

  if (msg === 'other services') {
    return {
      text: '💰 Here are our services:\n\n• Bridal Mehndi — from ₹2,999\n• Arabic Mehndi — from ₹999\n• Engagement Mehndi — from ₹1,499\n• Festival Mehndi — from ₹499\n• Kids Mehndi — from ₹299\n• Group Bookings — contact for quote\n\nAll prices include home service!',
      suggestions: ['Book Now', 'Bridal Mehndi Details', 'Arabic Mehndi Details', 'Group Booking'],
    };
  }

  if (msg === 'group booking' || msg === 'contact for quote') {
    return {
      text: '🎉 Group Booking:\n\n• Special rates for 5+ people\n• Perfect for mehndi parties, weddings & events\n• Multiple design styles available\n• Flexible timing\n• Coordination support included\n\nContact us for a custom group quote!',
      suggestions: ['Contact for Quote', 'WhatsApp Us', 'Pricing'],
    };
  }

  if (msg === 'stain tips') {
    return {
      text: '🌿 Tips for darker mehndi stain:\n\n1. Keep paste on for 4-6 hours\n2. Avoid washing for 12 hours after removal\n3. Apply lemon + sugar mix on dried paste\n4. Keep hands warm (avoid AC)\n5. Apply mustard oil after removing paste\n\nWe use 100% organic, chemical-free henna!',
      suggestions: ['Book Now', 'Pricing', 'Contact Info'],
    };
  }

  // ── Greetings ──────────────────────────────────────────────────────────────
  if (msg === 'hi' || msg === 'hello' || msg === 'hey' || msg === 'hii') {
    return {
      text: "Hi there! 👋 Welcome to Zuniii Creation. I'm here to help you with mehndi bookings and queries. What would you like to know?",
      suggestions: ['Services & Pricing', 'Book an Appointment', 'Design Styles', 'Service Areas', 'Contact Info'],
    };
  }

  // Services & Pricing (keyword)
  else if (msg.includes('price') || msg.includes('pricing') || msg.includes('cost') || msg.includes('rate') || msg.includes('charge') || msg.includes('service')) {
    return {
      text: '💰 Here are our services:\n\n• Bridal Mehndi — from ₹2,999\n• Arabic Mehndi — from ₹999\n• Engagement Mehndi — from ₹1,499\n• Festival Mehndi — from ₹499\n• Kids Mehndi — from ₹299\n• Group Bookings — contact for quote\n\nAll prices include home service!',
      suggestions: ['Book Now', 'Bridal Mehndi Details', 'Arabic Mehndi Details', 'Group Booking'],
    };
  }

  // Bridal Mehndi
  else if (msg.includes('bridal')) {
    return {
      text: '👰 Bridal Mehndi Package:\n\n• Full hand & feet coverage\n• Intricate traditional + modern designs\n• Duration: 2-4 hours\n• Starting from ₹2,999\n• Touch-up service included\n• Custom design as per your preference\n\nPerfect for weddings & receptions!',
      suggestions: ['Book Bridal Mehndi', 'Other Services', 'Service Areas'],
    };
  }

  // Arabic Mehndi
  else if (msg.includes('arabic')) {
    return {
      text: '🌙 Arabic Mehndi Package:\n\n• Bold outlines with minimal filling\n• Elegant modern Arabic patterns\n• Duration: 1-2 hours\n• Starting from ₹999\n• Quick drying paste\n• Dark stain guaranteed\n\nPerfect for Eid, parties & casual occasions!',
      suggestions: ['Book Arabic Mehndi', 'Other Services', 'Pricing'],
    };
  }

  // Booking / Appointment
  else if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule') || msg.includes('reserve')) {
    return {
      text: "📅 To book an appointment:\n\n1. Visit our Contact/Book page\n2. Fill in your details & preferred date\n3. We'll confirm within 24 hours\n\nOr WhatsApp us directly for instant response! We're available 7 days a week.",
      suggestions: ['Go to Booking Page', 'WhatsApp Us', 'Service Areas', 'Pricing'],
    };
  }

  // Design Styles
  else if (msg.includes('design') || msg.includes('style') || msg.includes('pattern') || msg.includes('type')) {
    return {
      text: '🎨 We specialize in these design styles:\n\n• Arabic\n• Indian Traditional\n• Dubai Style\n• Pakistani\n• Doha\n• Floral\n• Indo Dubai\n• Patch Work\n• Bridal\n• Modern Minimalist\n\nCustom designs are also available!',
      suggestions: ['View Gallery', 'Book Now', 'Pricing'],
    };
  }

  // Service Areas / Location
  else if (msg.includes('area') || msg.includes('location') || msg.includes('where') || msg.includes('city') || msg.includes('mumbai') || msg.includes('travel') || msg.includes('come')) {
    return {
      text: '📍 We provide home service across:\n\n• Mumbai (all areas)\n• Navi Mumbai\n• Thane\n• Andheri\n• Bandra\n• Juhu\n• Powai\n• South Mumbai\n\n📌 Our address:\nA/23-04 Deonar Municipal Colony,\nGovandi, Mumbai – 400043\n\nAdditional travel charges may apply for distant areas. Contact us to confirm!',
      suggestions: ['Book Home Visit', 'Pricing', 'Contact Info'],
    };
  }

  // Duration / Time
  else if (msg.includes('how long') || msg.includes('duration') || msg.includes('time') || msg.includes('hours')) {
    return {
      text: '⏱️ Approximate durations:\n\n• Bridal Mehndi: 2-4 hours\n• Arabic Mehndi: 1-2 hours\n• Engagement Mehndi: 1-2 hours\n• Festival Mehndi: 30-60 mins\n• Kids Mehndi: 15-30 mins\n\nDrying time: 30-60 mins after application.',
      suggestions: ['Pricing', 'Book Now', 'Stain Tips'],
    };
  }

  // Stain / Dark color tips
  else if (msg.includes('stain') || msg.includes('dark') || msg.includes('color') || msg.includes('tip') || msg.includes('darker')) {
    return {
      text: '🌿 Tips for darker mehndi stain:\n\n1. Keep paste on for 4-6 hours\n2. Avoid washing for 12 hours after removal\n3. Apply lemon + sugar mix on dried paste\n4. Keep hands warm (avoid AC)\n5. Apply mustard oil after removing paste\n\nWe use 100% organic, chemical-free henna!',
      suggestions: ['Book Now', 'Pricing', 'Contact Info'],
    };
  }

  // Henna / Organic / Safe
  else if (msg.includes('henna') || msg.includes('organic') || msg.includes('safe') || msg.includes('chemical') || msg.includes('natural')) {
    return {
      text: '🌱 We use 100% organic, natural henna paste:\n\n• No chemicals or artificial colors\n• Safe for all skin types\n• Safe for kids & pregnant women\n• Rich, dark stain guaranteed\n• Sourced from premium quality henna leaves\n\nYour safety is our top priority!',
      suggestions: ['Pricing', 'Book Now', 'Stain Tips'],
    };
  }

  // Contact / WhatsApp / Phone
  else if (msg.includes('contact') || msg.includes('whatsapp') || msg.includes('phone') || msg.includes('call') || msg.includes('number') || msg.includes('reach')) {
    return {
      text: '📞 Contact Zunaira:\n\n• WhatsApp / Phone: +91 99670 01963\n• Email: zuniicreation@gmail.com\n• Instagram: @Zuniii_creation\n• Response time: Within 24 hours\n• Available: 7 days a week\n\nWhatsApp is the fastest way to reach us!',
      suggestions: ['WhatsApp Us', 'Book Now', 'Service Areas'],
    };
  }

  // Experience / About
  else if (msg.includes('experience') || msg.includes('about') || msg.includes('who') || msg.includes('zunaira') || msg.includes('artist')) {
    return {
      text: "👩‍🎨 About Zunaira:\n\n• 7+ years of professional experience\n• 1000+ happy clients\n• 5+ certificates & awards\n• Specialist in Bridal, Arabic & Modern designs\n• Home service across Mumbai\n\nEvery design is crafted with love and precision! 🌸",
      suggestions: ['View Gallery', 'Pricing', 'Book Now'],
    };
  }

  // Group booking
  else if (msg.includes('group') || msg.includes('party') || msg.includes('multiple') || msg.includes('bulk')) {
    return {
      text: '🎉 Group Booking:\n\n• Special rates for 5+ people\n• Perfect for mehndi parties, weddings & events\n• Multiple design styles available\n• Flexible timing\n• Coordination support included\n\nContact us for a custom group quote!',
      suggestions: ['Contact for Quote', 'WhatsApp Us', 'Pricing'],
    };
  }

  // Gallery
  else if (msg.includes('gallery') || msg.includes('photo') || msg.includes('picture') || msg.includes('work') || msg.includes('portfolio')) {
    return {
      text: '📸 You can view our work:\n\n• Gallery page on this website\n• Instagram: @Zuniii_creation (daily updates)\n\nWe post new designs regularly. Follow us for inspiration!',
      suggestions: ['View Gallery', 'Book Now', 'Design Styles'],
    };
  }

  // Thank you
  else if (msg.includes('thank') || msg.includes('thanks') || msg.includes('great') || msg.includes('awesome') || msg.includes('perfect')) {
    return {
      text: "You're welcome! 😊 We'd love to make your occasion extra special with beautiful mehndi. Feel free to ask anything else!",
      suggestions: ['Book Now', 'Pricing', 'Contact Info'],
    };
  }

  // Bye / Goodbye
  else if (msg.includes('bye') || msg.includes('goodbye') || msg.includes('see you') || msg.includes('ok thanks')) {
    return {
      text: 'Goodbye! 🌸 Thank you for visiting Zuniii Creation. We look forward to serving you. Have a beautiful day!',
      suggestions: ['Book Now', 'View Gallery'],
    };
  }

  // Go to booking page (suggestion click)
  else if (msg === 'go to booking page') {
    return {
      text: "Great! Head over to our Contact/Book page to fill in your details. We'll confirm your booking within 24 hours! 📅",
      suggestions: ['Pricing', 'Service Areas', 'Contact Info'],
      link: { label: 'Open Booking Page', href: '/contact' },
    };
  }

  // WhatsApp Us (suggestion click)
  else if (msg === 'whatsapp us') {
    return {
      text: "Click below to chat with us on WhatsApp for instant response! 💬",
      suggestions: ['Pricing', 'Book Now'],
      link: { label: 'Open WhatsApp', href: 'https://wa.me/919967001963?text=Hi%20Zunaira!%20I%20want%20to%20book%20mehndi%20services.', external: true },
    };
  }

  // View Gallery (suggestion click)
  else if (msg === 'view gallery') {
    return {
      text: "Check out our beautiful mehndi designs in the gallery! 🎨",
      suggestions: ['Book Now', 'Pricing', 'Design Styles'],
      link: { label: 'Open Gallery', href: '/gallery' },
    };
  }

  // Default fallback
  else {
    return {
      text: "I'm not sure about that, but I'm happy to help with these topics! 😊",
      suggestions: ['Services & Pricing', 'Book an Appointment', 'Design Styles', 'Service Areas', 'Contact Info', 'About Zunaira'],
    };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const WELCOME = {
  id: 0,
  from: 'bot',
  text: "Hi! 👋 I'm Zuniii's assistant. How can I help you today?",
  suggestions: ['Services & Pricing', 'Book an Appointment', 'Design Styles', 'Service Areas', 'Contact Info', 'About Zunaira'],
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  const sendMessage = (text) => {
    const userText = text || input.trim();
    if (!userText) return;

    // Add user message
    setMessages((prev) => [...prev, { id: Date.now(), from: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const reply = getBotReply(userText);
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', ...reply }]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-olive-500 hover:bg-olive-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        aria-label="Open chatbot"
      >
        {isOpen ? <X size={22} /> : <Bot size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-[168px] right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-beige-200"
          style={{ maxHeight: '500px' }}>

          {/* Header */}
          <div className="bg-olive-500 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🌸</div>
            <div>
              <p className="text-white font-semibold text-sm">Zuniii Assistant</p>
              <p className="text-olive-100 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-gold-300 rounded-full inline-block" />
                Online
              </p>
            </div>
            <button onClick={() => setIsOpen(false)} className="ml-auto text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-beige-50" style={{ minHeight: 0 }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                {/* Message bubble */}
                <div className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.from === 'bot' && (
                    <div className="w-7 h-7 bg-olive-100 rounded-full flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🌸</div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                      msg.from === 'user'
                        ? 'bg-olive-500 text-white rounded-br-sm'
                        : 'bg-white text-brown-700 shadow-sm rounded-bl-sm border border-beige-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>

                {/* Link button */}
                {msg.link && (
                  <div className="ml-9 mt-2">
                    <a
                      href={msg.link.href}
                      target={msg.link.external ? '_blank' : '_self'}
                      rel={msg.link.external ? 'noopener noreferrer' : undefined}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-olive-500 text-white text-xs font-medium rounded-full hover:bg-olive-600 transition-colors"
                    >
                      {msg.link.label}
                      <ChevronRight size={12} />
                    </a>
                  </div>
                )}

                {/* Suggestion chips */}
                {msg.suggestions && msg.from === 'bot' && (
                  <div className="ml-9 mt-2 flex flex-wrap gap-2">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="px-3 py-1.5 bg-white border border-olive-300 text-olive-600 text-xs font-medium rounded-full hover:bg-olive-50 hover:border-olive-500 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-olive-100 rounded-full flex items-center justify-center text-sm shrink-0">🌸</div>
                <div className="bg-white border border-beige-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-olive-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-beige-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-beige-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 bg-beige-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="w-10 h-10 bg-olive-500 hover:bg-olive-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
