import Link from 'next/link';
import { Instagram, Phone, Mail, MapPin, Heart } from 'lucide-react';

const quickLinks = [
  { href: '/',         label: 'Home' },
  { href: '/gallery',  label: 'Gallery' },
  { href: '/about',    label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact',  label: 'Book Now' },
];

const contactItems = [
  { icon: Phone,  text: '+91 99670 01963', href: 'tel:+919967001963' },
  { icon: Mail,   text: 'zuniicreation@gmail.com', href: 'mailto:zuniicreation@gmail.com' },
  { icon: MapPin, text: 'A/23-04 Deonar Municipal Colony, Govandi, Mumbai – 400043, Maharashtra, India' },
];

export default function Footer() {
  return (
    <footer className="bg-brown-800 text-beige-200">

      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-serif font-bold text-gold-300 tracking-tight">
                Zuniii Creation
              </span>
            </Link>
            <p className="text-beige-300 text-sm leading-relaxed mb-6 max-w-sm">
              Professional henna artist specializing in bridal, Arabic, modern and
              customized designs. 7+ years of experience with home service across Mumbai.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/Zuniii_creation"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-brown-700 hover:bg-olive-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-5">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-beige-300 hover:text-gold-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-5">
              Contact
            </p>
            <ul className="space-y-3">
              {contactItems.map(({ icon: Icon, text, href }, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Icon size={14} className="text-olive-400 mt-0.5 shrink-0" />
                  {href ? (
                    <a href={href} className="text-sm text-beige-300 hover:text-gold-300 transition-colors">{text}</a>
                  ) : (
                    <span className="text-sm text-beige-300">{text}</span>
                  )}
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-olive-500 hover:bg-olive-600 text-white text-sm font-bold rounded-full transition-colors shadow-btn"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-gold-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-beige-400/90 font-medium">
            &copy; {new Date().getFullYear()} Zuniii Creation. All rights reserved.
          </p>
          <p className="text-xs text-beige-400/90 flex items-center gap-1 font-semibold">
            Made with <Heart size={12} className="text-olive-500 fill-olive-500 animate-pulse" /> by <a href="https://profile.nexcoreinstitute.org/zaid.html" target="_blank" rel="noopener noreferrer" className="hover:text-gold-400 underline underline-offset-2 transition-colors ml-1">Zaid</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
