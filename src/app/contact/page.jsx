'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { OCCASIONS, DESIGN_STYLES } from '@/lib/utils';
import { bookingsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import CalendarPicker from '@/components/CalendarPicker';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  occasion: '',
  preferredDate: '',
  city: '',
  zipCode: '',
  address: '',
  numberOfPeople: '1',
  designStyle: '',
  message: '',
};

export default function ContactPage() {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [unavailableDates, setUnavailableDates] = useState([]);
  
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/contact');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center pt-20">
        <span className="w-10 h-10 border-4 border-olive-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pre-fill user data once loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    bookingsAPI.getUnavailableDates()
      .then(res => setUnavailableDates(res.data))
      .catch(err => console.error('Failed to load unavailable dates:', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await bookingsAPI.create({
        customerName: formData.name,
        email: formData.email,
        phone: formData.phone,
        occasion: formData.occasion,
        preferredDate: formData.preferredDate,
        numberOfPeople: Number(formData.numberOfPeople),
        designStyle: formData.designStyle,
        city: formData.city,
        zipCode: formData.zipCode,
        address: formData.address,
        specialRequests: formData.message,
      });
      setSubmitted(true);
      setFormData(initialForm);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;

      if (!err?.response || err?.code === 'ERR_NETWORK') {
        setError('Cannot reach the server. Make sure the backend is running, or WhatsApp us directly.');
      } else if (status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again, or WhatsApp us directly.');
      } else if (status === 400 && serverMsg) {
        setError(`Please fix: ${serverMsg}`);
      } else {
        setError(serverMsg || 'Something went wrong. Please try again or WhatsApp us directly.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16 md:pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-b from-beige-100 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brown-700 mb-4">
            Book Your Mehndi Session
          </h1>
          <p className="text-brown-500 text-lg max-w-2xl mx-auto">
            Fill out the form below and I will get back to you within 24 hours to confirm your booking
          </p>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-olive-500" />
                  <h2 className="text-2xl font-serif font-bold text-brown-700 mb-2">
                    Booking Request Received!
                  </h2>
                  <p className="text-brown-500 mb-6">
                    Thank you! I will contact you within 24 hours to confirm the details.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2 bg-olive-500 text-white rounded-full font-medium hover:bg-olive-600 transition-colors"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-serif font-bold text-brown-700 mb-6">
                    Booking Details
                  </h2>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">Your Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all"
                        placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">Email Address *</label>
                      <input type="email" name="email" value={formData.email} readOnly required
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed transition-all"
                        placeholder="your.email@example.com" />
                      <p className="text-[10px] text-brown-400 mt-1">Bookings are tied to your account email.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">Phone Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all"
                        placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">Occasion *</label>
                      <select name="occasion" value={formData.occasion} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all">
                        <option value="">Select occasion</option>
                        {OCCASIONS.map((occ) => <option key={occ} value={occ}>{occ}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">Preferred Date *</label>
                      <CalendarPicker
                        selectedDate={formData.preferredDate}
                        onChange={(date) => setFormData({ ...formData, preferredDate: date })}
                        unavailableDates={unavailableDates}
                      />
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">Number of People *</label>
                      <input type="number" name="numberOfPeople" value={formData.numberOfPeople} onChange={handleChange} required min="1"
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-brown-600 font-medium mb-2">Design Style Preference</label>
                    <select name="designStyle" value={formData.designStyle} onChange={handleChange}
                      className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all">
                      <option value="">Select preferred style</option>
                      {DESIGN_STYLES.map((style) => <option key={style} value={style}>{style}</option>)}
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">City / Area *</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all"
                        placeholder="Mumbai, Navi Mumbai, etc." />
                    </div>
                    <div>
                      <label className="block text-brown-600 font-medium mb-2">ZIP Code</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}
                        className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all"
                        placeholder="400001" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-brown-600 font-medium mb-2">Full Address *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} required rows={3}
                      className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all resize-none"
                      placeholder="Complete address for home service" />
                  </div>

                  <div className="mb-8">
                    <label className="block text-brown-600 font-medium mb-2">Special Requests (Optional)</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} rows={3}
                      className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-olive-500 transition-all resize-none"
                      placeholder="Any specific designs, colors, or requirements..." />
                  </div>

                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-olive-500 text-white rounded-xl font-semibold hover:bg-olive-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Booking Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-brown-700 mb-4">Contact Info</h3>
                <div className="space-y-4">
                  {[
                    { icon: Phone, label: 'Phone', value: '+91 99670 01963', href: 'tel:+919967001963' },
                    { icon: Mail, label: 'Email', value: 'zuniicreation@gmail.com', href: 'mailto:zuniicreation@gmail.com' },
                    { icon: MapPin, label: 'Address', value: 'A/23-04 Deonar Municipal Colony, Govandi, Mumbai – 400043, Maharashtra, India' },
                    { icon: Clock, label: 'Response Time', value: 'Within 24 hours' },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-olive-500 mt-1 shrink-0" />
                      <div>
                        <p className="text-brown-600 font-medium">{label}</p>
                        {href ? (
                          <a href={href} className="text-brown-400 text-sm hover:text-olive-500 transition-colors">{value}</a>
                        ) : (
                          <p className="text-brown-400 text-sm">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-olive-500 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-serif font-bold mb-2">Quick Contact</h3>
                <p className="text-olive-100 mb-4 text-sm">
                  Prefer talking? WhatsApp me for instant response!
                </p>
                <a
                  href="https://wa.me/919967001963?text=Hi%20Zunaira!%20I%20want%20to%20book%20mehndi%20services."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-olive-600 rounded-full font-semibold hover:bg-beige-100 transition-all"
                >
                  WhatsApp Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
