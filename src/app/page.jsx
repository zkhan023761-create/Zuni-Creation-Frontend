 'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Award, Clock, MapPin, Moon, Flower, Zap, Heart, Gem, Palette, Layers, Crown } from 'lucide-react';
import ReviewsSection from '@/components/ReviewsSection';

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

const STATS = [
  { icon: Award,    label: 'Certificates',  value: '5+' },
  { icon: Star,     label: 'Happy Clients', value: '1000+' },
  { icon: Clock,    label: 'Experience',    value: '7+ Yrs' },
  { icon: Sparkles, label: 'Design Styles', value: '10+' },
];

const STYLES = [
  { name: 'Arabic',     icon: Moon,    category: 'Arabic'  },
  { name: 'Indian',     icon: Flower,  category: 'Bridal'  },
  { name: 'Dubai',      icon: Zap,     category: 'Arabic'  },
  { name: 'Pakistani',  icon: Flower,  category: 'Bridal'  },
  { name: 'Doha',       icon: Sparkles,category: 'Arabic'  },
  { name: 'Floral',     icon: Heart,   category: 'Arabic'  },
  { name: 'Indo Dubai', icon: Palette, category: 'Bridal'  },
  { name: 'Patch Work', icon: Layers,  category: 'Bridal'  },
  { name: 'Bridal',     icon: Crown,   category: 'Bridal'  },
  { name: 'Modern',     icon: Gem,     category: 'Arabic'  },
];

const ABOUT_POINTS = [
  'Professional bridal mehndi artist',
  'Home service across Mumbai',
  'Premium quality organic henna',
  'Long-lasting dark stains guaranteed',
  'Hygienic & professional service',
];

export default function Home() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsRef,  statsVisible]  = useInView();
  const [stylesRef, stylesVisible] = useInView();
  const [aboutRef,  aboutVisible]  = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pt-16 md:pt-[72px]">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden ">
        {/* Traditional bridal henna background image */}
        <div className="absolute inset-0 pointer-events-none select-none ">
          <img
            src="/hero_bg.png"
            alt="Traditional Bridal Henna Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Decorative lighting & shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-olive-100 rounded-full blur-[140px] opacity-30 -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gold-200/40 rounded-full blur-[160px] opacity-25 translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Intricate SVG Mandala Graphic Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.03] text-olive-500 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current stroke-[0.3]">
            <circle cx="50" cy="50" r="46" />
            <circle cx="50" cy="50" r="38" />
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="20" />
            <circle cx="50" cy="50" r="10" />
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i * 360) / 36;
              const rad = (angle * Math.PI) / 180;
              const x1 = (50 + 10 * Math.cos(rad)).toFixed(4);
              const y1 = (50 + 10 * Math.sin(rad)).toFixed(4);
              const x2 = (50 + 46 * Math.cos(rad)).toFixed(4);
              const y2 = (50 + 46 * Math.sin(rad)).toFixed(4);
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} L ${x2} ${y2}`}
                />
              );
            })}
          </svg>
        </div>

        <div className="container-xl relative z-10 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            
            <div className="mb-6" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(16px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span className="badge bg-white/20 text-white border-white/30 text-xs py-2 px-5 font-semibold tracking-wider backdrop-blur-sm">
                <Sparkles size={13} className="text-white" />
                7+ Years of Excellence in Mumbai
              </span>
            </div>

            <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s' }}>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-6 text-center drop-shadow-lg">
                Bridal &amp; Arabic
                <br />
                <span className="text-white relative inline-block">
                  Mehndi Artist
                  <span className="absolute bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </span>
                <br />
                <span className="text-white/80 text-2xl sm:text-3xl md:text-4xl font-medium tracking-wide">in Mumbai</span>
              </h1>
            </div>

            <div className="mb-8" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s' }}>
              <p className="text-white/85 text-base sm:text-lg max-w-2xl leading-relaxed font-sans text-center drop-shadow">
                Transform your special occasions with intricate, beautiful mehndi designs.
                Premium home service across Mumbai with professional care and organic henna.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto mb-10" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'none' : 'translateY(20px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s' }}>
              <Link href="/contact" className="btn-primary text-base px-8 py-4 shadow-lg shadow-olive-500/20">
                Book Appointment <ArrowRight size={18} />
              </Link>
              <Link href="/gallery" className="btn-outline text-base px-8 py-4">
                View Showcase
              </Link>
            </div>

            <div style={{ opacity: heroVisible ? 1 : 0, transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s' }}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full border border-white/30 shadow-sm">
                <MapPin size={14} className="text-white" />
                Home Service Available Across Mumbai &amp; Suburbs
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ══ STATS ═════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="py-16 bg-white border-y border-brown-200/30">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-brown-50/40 border border-brown-200/20 hover:border-gold-300 hover:bg-white transition-all duration-300"
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'none' : 'translateY(20px)',
                  transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.08}s`,
                }}
              >
                <div className="w-12 h-12 bg-olive-50 rounded-2xl flex items-center justify-center mb-4">
                  <s.icon size={22} className="text-olive-500" />
                </div>
                <span className="text-3xl sm:text-4xl font-serif font-bold text-brown-700 tracking-tight">{s.value}</span>
                <span className="text-xs text-brown-400 font-bold mt-2 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DESIGN STYLES ═════════════════════════════════════════════════ */}
      <section ref={stylesRef} className="section-pad bg-brown-50/30 border-b border-brown-200/30">
        <div className="container-xl">
          <div
            className="text-center mb-14"
            style={{ opacity: stylesVisible ? 1 : 0, transform: stylesVisible ? 'none' : 'translateY(20px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <span className="text-xs text-gold-600 font-bold uppercase tracking-widest bg-gold-100/60 px-4 py-1.5 rounded-full border border-gold-200/50">Artistry &amp; Styles</span>
            <h2 className="section-title mt-4 mb-4">Design Styles Offered</h2>
            <p className="section-sub">From modern minimalist patterns to heavy traditional bridal henna layouts</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {STYLES.map((style, i) => (
              <Link
                key={style.name}
                href={`/gallery?category=${encodeURIComponent(style.category)}`}
                className="card-luxury p-6 text-center block group hover:border-gold-500"
                style={{
                  opacity: stylesVisible ? 1 : 0,
                  transform: stylesVisible ? 'none' : 'translateY(16px)',
                  transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s`,
                }}
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-olive-50 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <style.icon size={24} className="text-olive-500" />
                </div>
                <p className="text-sm font-bold text-brown-700 group-hover:text-olive-500 transition-colors uppercase tracking-wider">{style.name}</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/gallery" className="btn-primary">
              View Design Gallery <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ ABOUT ═════════════════════════════════════════════════════════ */}
      <section ref={aboutRef} className="section-pad bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <div style={{ opacity: aboutVisible ? 1 : 0, transform: aboutVisible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <span className="badge bg-olive-100 text-olive-700 border-olive-200/50 mb-5">About the Artist</span>
              <h2 className="section-title mt-3 mb-6">
                Hi, I&apos;m <span className="text-olive-500">Zunaira</span>
              </h2>
              <p className="text-brown-600 text-base leading-relaxed mb-4 font-sans text-center">
                Founder and Lead Artist of Zuniii Creation. With over 7 years of professional experience in Mumbai,
                I specialize in bespoke bridal, intricate Arabic, and custom contemporary henna designs that reflect your personality.
              </p>
              <p className="text-brown-600 text-base leading-relaxed mb-8 font-sans text-center">
                I pride myself on using 100% organic, chemical-free henna to ensure a deep, dark, long-lasting stain while guaranteeing safety and hygiene.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-2xl mx-auto text-left">
                {ABOUT_POINTS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-brown-700 text-sm font-semibold">
                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/about" className="btn-primary">
                Read My Story <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ REVIEWS ═══════════════════════════════════════════════════════ */}
      <ReviewsSection />

      {/* ══ CTA BANNER ════════════════════════════════════════════════════ */}
      <section className="section-pad bg-cream border-t border-brown-200/30 relative overflow-hidden">
        {/* Soft decorative golden lighting in CTA */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-olive-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-200/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="container-xl relative z-10 text-center">
          <span className="badge bg-olive-100 text-olive-700 border-olive-200/50 mb-6">
            Get in touch
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-brown-700 mb-6 tracking-tight">
            Ready to Get Beautiful Mehndi?
          </h2>
          <p className="text-brown-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed font-sans">
            Whether it&apos;s your wedding, engagement, Eid celebration, or a private mehndi party —
            we customize each style to make your celebration memorable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-base px-8 py-4 shadow-xl">
              Book Home Visit <ArrowRight size={18} />
            </Link>
            <a
              href="https://instagram.com/Zuniii_creation"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-base px-8 py-4 bg-white/50"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
