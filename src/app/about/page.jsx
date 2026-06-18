'use client';

import { Award, Clock, MapPin, Heart, Flower, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="pt-16 md:pt-20">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-beige-100 to-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center">
            <span className="text-olive-500 font-medium">About Me</span>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-brown-700 mt-2 mb-6">
              Hi, I&apos;m Zunaira
            </h1>
            <div className="space-y-4 text-brown-600 text-lg leading-relaxed text-center">
              <p>
                Welcome to Zuniii Creation! I&apos;m Zunaira, a passionate henna artist with over{' '}
                <strong className="text-olive-500">7 years of experience</strong> in creating beautiful,
                intricate mehndi designs.
              </p>
              <p>
                My journey began with a deep love for this ancient art form. What started as a hobby
                evolved into a profession as I discovered my talent for blending traditional patterns
                with modern aesthetics.
              </p>
              <p>
                I specialize in <strong>Bridal</strong>, <strong>Arabic</strong>,{' '}
                <strong>Modern</strong>, and <strong>Customized designs</strong> that perfectly
                complement your special occasions.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-olive-100 rounded-full">
                <Award className="w-5 h-5 text-olive-500" />
                <span className="text-brown-700 font-medium">5+ Certificates</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gold-100 rounded-full">
                <Heart className="w-5 h-5 text-gold-500" />
                <span className="text-brown-700 font-medium">1000+ Happy Clients</span>
              </div>
              <a
                href="https://www.instagram.com/zuniii_creation/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-olive-50 border border-olive-200 rounded-full hover:bg-olive-100 transition-all"
              >
                <Instagram className="w-5 h-5 text-olive-500" />
                <span className="text-brown-700 font-medium">@zuniii_creation</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-brown-700 text-center mb-12">
            Why Choose Me?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: 'Premium Quality', desc: 'Organic, chemical-free henna paste for the darkest stains' },
              { icon: Clock, title: '7+ Years Experience', desc: 'Years of practice ensuring flawless application' },
              { icon: MapPin, title: 'Home Service', desc: 'I come to you anywhere in Mumbai for your comfort' },
              { icon: Heart, title: 'Personal Touch', desc: 'Every design is customized to your preferences' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-olive-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-olive-500" />
                </div>
                <h3 className="text-xl font-semibold text-brown-700 mb-2">{item.title}</h3>
                <p className="text-brown-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-beige-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-brown-700 mb-4">Areas I Serve</h2>
            <p className="text-brown-500 max-w-2xl mx-auto">
              I provide professional home service across Mumbai and nearby areas
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Mumbai', 'Navi Mumbai', 'Thane', 'Andheri', 'Bandra', 'Juhu', 'Powai', 'South Mumbai'].map(
              (area) => (
                <span
                  key={area}
                  className="px-6 py-3 bg-white rounded-full text-brown-600 font-medium shadow-sm hover:shadow-md transition-shadow"
                >
                  {area}
                </span>
              )
            )}
          </div>
          <p className="text-center text-brown-400 mt-6 text-sm">
            Other areas may be available — contact me to check!
          </p>
        </div>
      </section>
    </div>
  );
}
