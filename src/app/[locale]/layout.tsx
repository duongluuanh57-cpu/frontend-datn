import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/navigation';
import { PHProvider } from '@/providers/posthog-provider';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Topbar } from '@/components/ui/topbar';
import { Navbar } from '@/components/ui/navbar';
import { NavigationWrapper } from '@/components/ui/navigation-wrapper';
import { BackendWarmup } from '@/providers/BackendWarmup';
import { Toaster } from 'sonner';
import { VisitTracker } from '@/providers/VisitTracker';
import { SpeedInsights } from '@vercel/speed-insights/next';

import QueryProvider from '@/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "L'essence",
    description: locale === 'en' ? "Premium Fragrance Experience" : "Trải nghiệm hương thơm cao cấp",
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const isProduction = process.env.NODE_ENV === 'production';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Elite SaaS 2026",
    "url": "https://your-domain.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "{search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://pub-51942afe81314369ba1985f0493bce19.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-51942afe81314369ba1985f0493bce19.r2.dev" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
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

        <PHProvider>
          <QueryProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <VisitTracker />
              <NavigationWrapper>
                <Toaster position="top-center" richColors />
                <BackendWarmup />
                {children}
              </NavigationWrapper>
            </NextIntlClientProvider>
          </QueryProvider>
        </PHProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
