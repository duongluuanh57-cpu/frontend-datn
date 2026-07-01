'use client';

import { useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function TrackVisit() {
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/visits/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: controller.signal,
      keepalive: true,
    }).catch(function() {});
    return () => controller.abort();
  }, []);
  return null;
}
