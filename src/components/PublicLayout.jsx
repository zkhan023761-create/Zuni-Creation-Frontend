'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

// Pages that should not show the footer
const NO_FOOTER_PATHS = ['/login', '/register'];

export default function PublicLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const hideFooter = NO_FOOTER_PATHS.includes(pathname);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      {!hideFooter && <Footer />}
      <WhatsAppButton />
    </>
  );
}
