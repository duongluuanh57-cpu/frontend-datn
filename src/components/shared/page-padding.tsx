'use client';

import { usePathname } from 'next/navigation';

const NO_NAVBAR_PAGES: string[] = [];

export function PagePadding({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasNavbar = !NO_NAVBAR_PAGES.includes(pathname);

  return (
    <div className={`${hasNavbar ? 'pt-16 md:pt-20' : ''} h-full`}>
      {children}
    </div>
  );
}
