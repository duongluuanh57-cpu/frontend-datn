import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api';
    
    const response = await fetch(`${backendUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Backend Proxy Error:', error);
      return new Response(`Backend Error: ${error}`, { status: response.status });
    }

    // Chuyển tiếp toàn bộ headers từ Backend
    const headers = new Headers(response.headers);
    
    // ÉP BUỘC các header chống buffering
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-transform');
    headers.set('X-Accel-Buffering', 'no'); // Dành cho Nginx/Render proxy

    return new Response(response.body, {
      status: response.status,
      headers: headers,
    });
  } catch (error: any) {
    console.error('[Chat Proxy Error]', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
