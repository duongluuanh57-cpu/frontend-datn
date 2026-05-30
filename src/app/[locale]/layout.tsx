import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PHProvider } from '@/providers/posthog-provider';
import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Cormorant, Montserrat } from 'next/font/google';
import { Toaster } from 'sonner';
import { NavigationWrapper } from '@/components/ui/navigation-wrapper';

import QueryProvider from '@/providers/QueryProvider';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-inter',
});

const cormorant = Cormorant({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

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
  const isProduction = process.env.NODE_ENV === 'production';

  // Prevent favicon.ico or other non-locale paths from crashing
  if (!locale || locale === 'favicon.ico' || locale.includes('.')) {
    return <>{children}</>;
  }

  setRequestLocale(locale);

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pub-51942afe81314369ba1985f0493bce19.r2.dev" />
        <link rel="dns-prefetch" href="https://pub-51942afe81314369ba1985f0493bce19.r2.dev" />
      </head>
      <body className={`${inter.className} ${cormorant.variable} ${montserrat.variable}`}>
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
              <NavigationWrapper>
                <Toaster position="top-center" richColors />
                {children}
              </NavigationWrapper>
            </NextIntlClientProvider>
          </QueryProvider>
        </PHProvider>
      </body>
    </html>
  );
}