import '@astryxdesign/core/astryx.css';
import './globals.css';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import QueryProvider from '@/providers/QueryProvider';
import { Suspense } from 'react';
import { TokenHandler } from '@/components/shared/token-handler';
import { TrackVisit } from '@/components/shared/track-visit';
import { ScrollToTop } from '@/components/shared/ScrollToTop';
import AstryxProvider from '@/providers/AstryxProvider';


const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
  preload: false,
});

export const metadata: Metadata = {
  title: "L'essence",
  description: "Trải nghiệm hương thơm cao cấp",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <html lang="vi" suppressHydrationWarning data-scroll-behavior="smooth" className="h-full">
      <head>
        <link rel="preconnect" href="https://pub-51942afe81314369ba1985f0493bce19.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-51942afe81314369ba1985f0493bce19.r2.dev" />
      </head>
<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans h-screen flex flex-col`}>
        {isProduction && (
          <Script id="fb-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_PIXEL_ID');
              fbq('track', 'PageView');
            `}
          </Script>
        )}

        <QueryProvider>
          <AstryxProvider>
            <ScrollToTop />
            <Suspense fallback={null}>
              <TokenHandler />
            </Suspense>
            <TrackVisit />
            <Navbar />
            <Toaster position="top-center" richColors />
            <div className="flex-1 pt-16 md:pt-20 min-h-0">
              {children}
            </div>
          </AstryxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}