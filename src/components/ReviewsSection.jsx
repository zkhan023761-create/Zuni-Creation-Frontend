'use client';

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote, Users, TrendingUp, Heart } from 'lucide-react';
import { reviews } from '@/lib/galleryData';

export default function ReviewsSection() {
  const [active,   setActive]   = useState(0);
  const [visible,  setVisible]  = useState(false);
  const ref = useRef(null);

  // Scroll-triggered visibility
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % reviews.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setActive((a) => (a === 0 ? reviews.length - 1 : a - 1));
  const next = () => setActive((a) => (a + 1) % reviews.length);

  return (
    <section ref={ref} className="section-pad bg-beige-50 border-y border-beige-100 overflow-hidden">
      <div className="container-xl">

        {/* ── Header ── */}
        <div
          className="text-center mb-14"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.6s ease' }}
        >
          <span className="badge-olive mb-4 inline-flex items-center gap-1.5">
            <Heart size={13} className="fill-current" /> Client Love
          </span>
          <h2 className="section-title mt-3 mb-4">What Our Clients Say</h2>
          <p className="section-sub">
            Real reviews from real clients — their happiness is our greatest achievement
          </p>
        </div>

        {/* ── Review card ── */}
        <div
          className="max-w-2xl mx-auto"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.7s ease 0.2s' }}
        >
          <div className="card p-8 sm:p-10 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-olive-50 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gold-50 rounded-full" />
            <Quote size={56} className="absolute top-6 right-6 text-beige-200" />

            <div className="relative z-10">
              {/* Reviewer */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 border-beige-200 shadow-sm">
                  <img
                    key={reviews[active].id}
                    src={reviews[active].image.replace(/ /g, '%20')}
                    alt={reviews[active].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pt-1">
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(reviews[active].rating)].map((_, i) => (
                      <Star key={i} size={15} className="text-gold-400 fill-current" />
                    ))}
                  </div>
                  <p className="font-serif font-bold text-brown-700 text-lg leading-tight">
                    {reviews[active].name}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="badge-olive text-2xs py-0.5 px-2.5">
                      {reviews[active].tag}
                    </span>
                    <span className="text-2xs text-brown-400 font-medium">
                      via {reviews[active].via}
                    </span>
                  </div>
                </div>
              </div>

              {/* Text */}
              <blockquote className="text-brown-600 text-base sm:text-lg leading-relaxed italic font-serif">
                &ldquo;{reviews[active].text}&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 bg-white border border-beige-200 rounded-full flex items-center justify-center text-brown-500 hover:bg-olive-500 hover:text-white hover:border-olive-500 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === active ? 'w-7 h-2.5 bg-olive-500' : 'w-2.5 h-2.5 bg-beige-300 hover:bg-olive-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 bg-white border border-beige-200 rounded-full flex items-center justify-center text-brown-500 hover:bg-olive-500 hover:text-white hover:border-olive-500 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
