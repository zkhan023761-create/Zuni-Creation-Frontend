'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X, ZoomIn, ArrowRight, Instagram, Flower } from 'lucide-react';
import { workImages } from '@/lib/galleryData';

const categories = ['All', 'Bridal', 'Arabic', 'Feet Mehndi', 'Eid'];

function getImgSrc(item) {
  return item.src.replace(/ /g, '%20');
}

function GalleryContent() {
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Set category from URL param on mount / param change
  useEffect(() => {
    if (paramCategory && categories.includes(paramCategory)) {
      setActiveCategory(paramCategory);
    } else {
      setActiveCategory('All');
    }
  }, [paramCategory]);

  const filtered =
    activeCategory === 'All'
      ? workImages
      : workImages.filter((i) => i.category === activeCategory);

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-cream">

      {/* ── Hero ── */}
      <section className="relative py-20 bg-gradient-to-b from-brown-100/40 to-cream overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-olive-100 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gold-200/30 rounded-full blur-3xl opacity-30 translate-x-1/3 translate-y-1/3" />

        <div className={`max-w-4xl mx-auto px-4 text-center relative z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-olive-100 text-olive-700 rounded-full text-xs font-bold uppercase tracking-wider mb-5 border border-olive-200/50 shadow-sm">
            <Flower size={14} className="fill-current text-gold-500" /> Handcrafted Artistry by Zunaira
          </span>
          <h1 className="text-5xl sm:text-6xl font-serif font-bold text-brown-700 mb-5 leading-tight">
            Mehndi <span className="text-olive-500">Design Gallery</span>
          </h1>
          <p className="text-brown-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Every design is crafted with custom precision — browse our portfolio of real client work
          </p>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <div className="sticky top-16 md:top-20 z-40 bg-cream/95 backdrop-blur-sm border-b border-brown-200/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => {
              const count = cat === 'All' ? workImages.length : workImages.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full font-bold text-xs tracking-wider uppercase transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-olive-500 text-white shadow-lg shadow-olive-500/25 scale-105'
                      : 'bg-white text-brown-600 hover:bg-olive-50 border border-brown-200/40 hover:border-olive-300'
                  }`}
                >
                  {cat}
                  <span className={`ml-1.5 text-[10px] ${activeCategory === cat ? 'opacity-85' : 'opacity-50'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Masonry Grid ── */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
            {filtered.map((item, idx) => (
              <div
                key={item.id}
                className="break-inside-avoid mb-4 group relative overflow-hidden rounded-3xl cursor-pointer bg-brown-100/25 border border-brown-200/10 shadow-sm hover:shadow-xl hover:border-gold-300/60 transition-all duration-350"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.6s ease ${idx * 0.04}s, transform 0.6s ease ${idx * 0.04}s, border-color 0.3s ease, box-shadow 0.3s ease`,
                }}
                onClick={() => setLightbox(item)}
              >
                <img
                  src={getImgSrc(item)}
                  alt={item.title}
                  className="w-full object-cover rounded-3xl transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                
                {/* Floating Glassmorphism Description Card */}
                <div className="absolute inset-x-3 bottom-3 bg-white/95 backdrop-blur-md border border-white/40 rounded-2xl p-3 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-between shadow-lg">
                  <div>
                    <p className="text-brown-700 font-serif font-bold text-xs leading-tight">{item.title}</p>
                    <p className="text-olive-600 font-bold text-[9px] uppercase mt-0.5 tracking-wider">{item.category}</p>
                  </div>
                  <div className="w-7 h-7 bg-olive-500 text-white rounded-full flex items-center justify-center shrink-0 ml-2">
                    <ZoomIn size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-brown-400 text-lg">No designs in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-cream border-t border-brown-200/30 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-olive-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-brown-700 mb-4">
            Love What You See?
          </h2>
          <p className="text-brown-500 text-lg mb-8 max-w-xl mx-auto">
            Book your custom mehndi session or follow for daily henna inspiration!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn-primary text-base px-8 py-4 shadow-xl"
            >
              Book Now <ArrowRight size={18} />
            </Link>
            <a
              href="https://instagram.com/Zuniii_creation"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-base px-8 py-4 bg-white/50"
            >
              <Instagram size={18} /> @Zuniii_creation
            </a>
          </div>
        </div>
      </section>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X size={22} />
          </button>

          {/* Prev / Next */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); const idx = filtered.findIndex(i => i.id === lightbox.id); setLightbox(filtered[(idx - 1 + filtered.length) % filtered.length]); }}
          >
            ‹
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); const idx = filtered.findIndex(i => i.id === lightbox.id); setLightbox(filtered[(idx + 1) % filtered.length]); }}
          >
            ›
          </button>

          <div
            className="max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImgSrc(lightbox)}
              alt={lightbox.title}
              className="w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-4 flex items-center justify-between px-1">
              <div>
                <p className="text-white font-semibold text-lg">{lightbox.title}</p>
                <p className="text-white/50 text-sm">{lightbox.category}</p>
              </div>
              <span className="bg-olive-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                {lightbox.tag}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <GalleryContent />
    </Suspense>
  );
}
