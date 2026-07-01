import * as Sentry from "@sentry/nextjs";

// Chỉ khởi tạo Sentry trong production, tránh làm chậm dev
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://dummy@sentry.io/123",
    tracesSampleRate: 0.1,
    debug: false,
    replaysOnErrorSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  });
}