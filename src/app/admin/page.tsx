'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.ok) {
          // Already authenticated, go to dashboard
          router.push('/admin/dashboard');
        } else {
          // Not authenticated, go to login
          router.push('/admin/login');
        }
      } catch (error) {
        // Error checking auth, go to login
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg">Redirecting to admin panel...</p>
      </div>
    </div>
  );
}
