'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /admin → /admin/dashboard (layout handles auth gate)
export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  return null;
}
