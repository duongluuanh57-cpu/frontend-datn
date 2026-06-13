"use client";

import { useState } from 'react';

interface Props {
  isVi: boolean;
}

export default function NewsletterForm({ isVi }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setStatus('error');
    try {
      // Placeholder: you can replace with real subscribe API call
      setStatus('sent');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <form className="mt-4 flex gap-2" onSubmit={handleSubmit}>
      <input
        aria-label="email"
        placeholder={isVi ? 'Nhập email để nhận tin' : 'Enter email for updates'}
        className="flex-1 rounded-lg border border-[#D4A5A5]/10 px-3 py-2 text-sm outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <button className="bg-[#D4A5A5] text-white px-4 py-2 rounded-lg text-sm" type="submit">
        {isVi ? 'Đăng ký' : 'Subscribe'}
      </button>
      {status === 'sent' && <span className="text-sm text-green-600 ml-2">{isVi ? 'Đã đăng ký' : 'Subscribed'}</span>}
      {status === 'error' && <span className="text-sm text-red-600 ml-2">{isVi ? 'Lỗi' : 'Error'}</span>}
    </form>
  );
}
