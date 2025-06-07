'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === '/404') return;
    
    const url = pathname + (searchParams ? searchParams.toString() : '');
    if (window.gtag) {
      window.gtag('config', 'G-6Y04YMHPN1', {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}