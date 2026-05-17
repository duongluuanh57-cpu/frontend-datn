import createMiddleware from 'next-intl/middleware';
import {locales, localePrefix} from './navigation';
 
export default createMiddleware({
  defaultLocale: 'vi',
  locales,
  localePrefix,
  localeDetection: false
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - /api (API routes)
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /static, /favicon.ico, etc. (static files)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match all pathnames within a locale
    '/(vi|en)/:path*'
  ]
};
