'use client';

import Link from 'next/link';
import { Clock, Star, ArrowRight, Crown, Moon, Heart, Sparkles, Users, Flower2 } from 'lucide-react';

const services = [
  {
    id: 1, title: 'Bridal Mehndi',
    description: 'Full hand & feet intricate bridal designs with detailed patterns. Perfect for weddings and reception.',
    price: 'Starting from ₹2,999', duration: '2-4 hours',
    icon: Crown,
    features: ['Full hand coverage', 'Feet design included', 'Custom bridal pattern', 'Touch-up service'],
  },
  {
    id: 2, title: 'Arabic Mehndi',
    description: 'Elegant Arabic patterns with bold outlines and minimal filling. Perfect for Eid and parties.',
    price: 'Starting from ₹999', duration: '1-2 hours',
    icon: Moon,
    features: ['Modern Arabic style', 'Elegant patterns', 'Quick drying paste', 'Dark stain results'],
  },
  {
    id: 3, title: 'Engagement Mehndi',
    description: 'Beautiful designs perfect for engagement ceremonies. Combines traditional and modern styles.',
    price: 'Starting from ₹1,499', duration: '1-2 hours',
    icon: Heart,
    features: ['Custom design', 'Quick application', 'Long-lasting', 'Photo-ready look'],
  },
  {
    id: 4, title: 'Festival Mehndi',
    description: 'Perfect for Diwali, Eid, Navratri celebrations. Trendy designs at affordable prices.',
    price: 'Starting from ₹499', duration: '30-60 mins',
    icon: Sparkles,
    features: ['Festival special designs', 'Affordable rates', 'Fast application', 'Community discounts'],
  },
  {
    id: 5, title: 'Group Bookings',
    description: 'Planning a mehndi party? Get special rates for groups of 5 or more!',
    price: 'Contact for quote', duration: 'Varies',
    icon: Users,
    features: ['Special group rates', 'Multiple designs', 'Flexible timing', 'Coordination support'],
  },
  {
    id: 6, title: 'Kids Mehndi',
    description: 'Fun, simple, and safe mehndi designs for kids. Non-chemical, skin-friendly paste.',
    price: 'Starting from ₹299', duration: '15-30 mins',
    icon: Flower2,
    features: ['Kid-friendly designs', 'Safe ingredients', 'Quick session', 'Fun patterns'],
  },
];

const faqs = [
  { q: 'How long does mehndi take to dry?', a: 'Typically 30 minutes to 1 hour depending on the design size. I use premium paste that dries evenly for the best results.' },
  { q: 'How can I make the stain darker?', a: 'Keep the paste on for 4-6 hours. Avoid washing hands for 12 hours. Applying lemon juice after removing paste helps darken the stain.' },
  { q: 'Do you provide home service?', a: 'Yes! I provide home service across Mumbai. Additional travel charges may apply for areas outside central Mumbai.' },
  { q: 'What type of henna do you use?', a: 'I use 100% organic, chemical-free henna paste. It is gentle on skin and provides rich, dark stains.' },
  { q: 'Can I see designs before booking?', a: 'Absolutely! You can browse my gallery or follow me on Instagram @Zuniii_creation for latest designs.' },
];

export default function ServicesPage() {
  return (
    <div className="pt-16 md:pt-20">
      {/* Header */}
      <section className="py-20 bg-gradient-to-b from-brown-100/40 to-cream relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-olive-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="badge bg-olive-100 text-olive-700 border-olive-200/50 mb-4">Our Services</span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-olive-700 mt-3 mb-4">Henna &amp; Mehndi Services</h1>
          <p className="section-sub">
            Professional mehndi services for every celebratory event. Premium organic henna paste,
            home service across Mumbai with complete hygiene standards.
          </p>
        </div>
      </section>

      {/* Services grid */}
      <section className="section-pad bg-cream">
        <div className="container-xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="card-luxury p-8 hover:-translate-y-2 duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-olive-50 rounded-2xl flex items-center justify-center shrink-0 border border-olive-100">
                      <service.icon size={26} className="text-olive-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-brown-700">{service.title}</h3>
                      <div className="flex items-center gap-1 text-gold-600 text-xs font-bold mt-0.5 tracking-wider uppercase">
                        <Star size={11} className="fill-current text-gold-500" />
                        <span>Premium</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-brown-600 text-sm mb-6 leading-relaxed font-sans">{service.description}</p>

                  <div className="flex items-center gap-2 text-sm text-brown-400 mb-6 font-semibold bg-brown-50 px-3.5 py-1.5 rounded-full w-fit">
                    <Clock size={14} className="text-olive-500" />
                    <span>{service.duration}</span>
                  </div>

                  <ul className="space-y-3 mb-8 border-t border-brown-200/20 pt-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-brown-700 font-semibold font-sans">
                        <span className="w-1.5 h-1.5 bg-olive-500 rounded-full shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 border-t border-brown-200/20 flex items-center justify-between mt-auto">
                  <span className="text-xl font-serif font-bold text-brown-700">{service.price}</span>
                  <Link href="/contact" className="btn-primary text-xs px-5 py-2.5 shadow-md">
                    Book Now <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-brown-50/30 border-t border-brown-200/20">
        <div className="container-xl">
          <span className="block text-center text-xs text-gold-600 font-bold uppercase tracking-widest mb-3">FAQ</span>
          <h2 className="section-title text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="card-luxury p-6 bg-white hover:border-gold-300">
                <h3 className="font-serif font-bold text-lg text-brown-700 mb-2">{faq.q}</h3>
                <p className="text-brown-600 text-sm leading-relaxed font-sans">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
