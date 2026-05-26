'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /admin/login → /login?tab=admin
export default function AdminLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login?tab=admin');
  }, [router]);
  return null;
}
