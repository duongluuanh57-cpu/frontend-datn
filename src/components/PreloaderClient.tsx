"use client";

import { useLayoutEffect } from 'react';

interface Props {
  isProduction: boolean;
  jsonLd: any;
}

export default function PreloaderClient({ isProduction, jsonLd }: Props) {
  useLayoutEffect(() => {
    try {
      const path = window.location.pathname;
      const isHomepage = path === '/' || path === '/vi' || path === '/vi/' || path === '/en' || path === '/en/';
      const hasShown = sessionStorage.getItem('preloader_shown');
      if (isHomepage && !hasShown) {
        document.documentElement.classList.add('preloader-loading');
      }
    } catch (e) {
      // ignore
    }

    // inject ld+json
    try {
      if (jsonLd) {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.text = JSON.stringify(jsonLd);
        document.head.appendChild(s);
      }
    } catch (e) {
      // ignore
    }

    // inject fb pixel if production
    try {
      if (isProduction) {
        const inline = document.createElement('script');
        inline.text = `!function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', 'YOUR_PIXEL_ID');
          fbq('track', 'PageView');`;
        document.head.appendChild(inline);
      }
    } catch (e) {
      // ignore
    }
  }, [isProduction, jsonLd]);

  return null;
}
