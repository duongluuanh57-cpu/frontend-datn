import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { withSentryConfig } from "@sentry/nextjs";

let withBundleAnalyzer = (config: NextConfig) => config;
if (process.env.ANALYZE === 'true') {
  withBundleAnalyzer = require('@next/bundle-analyzer')();
}

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.thegioinuochoa.com.vn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fonts.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vietqr.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'vietqr.net',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

// Chỉ chạy Sentry khi build production, bỏ qua hoàn toàn khi dev
const isDev = process.env.NODE_ENV === 'development';

const sentryConfig = isDev ? {} : {
  org: "elite-saas",
  project: "frontend",
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  hideSourceMaps: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

const finalConfig = isDev
  ? withBundleAnalyzer(withNextIntl(nextConfig))
  : withBundleAnalyzer(withSentryConfig(withNextIntl(nextConfig), sentryConfig));

export default finalConfig;
