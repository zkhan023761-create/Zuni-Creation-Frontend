import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import PublicLayout from '@/components/PublicLayout';
import { AuthProvider } from '@/context/AuthContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'Zuniii Creation | Bridal & Arabic Mehndi Artist in Mumbai',
  description:
    'Professional henna/mehndi artist specializing in bridal, Arabic, modern and customized designs with home service across Mumbai.',
  keywords:
    'mehndi artist, henna artist, bridal mehndi, Arabic mehndi, Mumbai mehndi artist, home service mehndi',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="antialiased bg-cream text-brown-700">
        <AuthProvider>
          <PublicLayout>{children}</PublicLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
