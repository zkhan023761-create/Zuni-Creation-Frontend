'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    router.push(token ? '/admin/dashboard' : '/admin/login');
  }, [router]);
  return null;
}
