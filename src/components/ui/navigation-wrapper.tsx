'use client';

import { usePathname } from 'next/navigation';
import { Topbar } from '@/components/ui/topbar';
import { Navbar } from '@/components/ui/navbar';
import { ChatWidget } from '@/components/ui/chat-widget';
import { Footer } from '@/components/ui/footer';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Các đường dẫn không hiển thị Navigation (Admin, Login, Register)
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  const isAdmin = pathname.includes('/admin');

  if (isAdmin || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
