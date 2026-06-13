'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSubscription() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }

    setIsSubmitting(true);
    
    // Fake API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success('Đăng ký nhận ưu đãi thành công!');
      setEmail('');
      
      // Reset success state after a few seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1200);
  };

  return (
    <section className="mx-[calc(2rem+40px)] w-[calc(100%-4rem-80px)] py-8 lg:py-12 relative overflow-hidden bg-[var(--background)]"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl p-10 md:p-16 border border-[var(--primary)]/10 shadow-sm text-center relative overflow-hidden"
        >
          
          <Mail className="w-12 h-12 text-[var(--primary)] mx-auto mb-6 stroke-[1.5]" />
          
          <h2 className="font-body text-4xl md:text-5xl text-[var(--content)] mb-4 tracking-wide font-light">
            Nhận tin khuyến mãi
          </h2>

          <p className="font-body text-[var(--content)] opacity-80 mb-10 max-w-lg mx-auto font-light leading-relaxed">
            Nhận thông tin về sản phẩm mới và ưu đãi qua email.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
            <div className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                disabled={isSubmitting || isSuccess}
                className="font-body w-full bg-white border border-[var(--primary)]/20 rounded-full py-4 pl-6 pr-14 text-[var(--content)] placeholder:text-[var(--content)]/40 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-300"
              />
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[var(--primary)] hover:bg-[var(--contrast)] text-white flex items-center justify-center transition-colors duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
            {isSuccess && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-body absolute -bottom-8 left-0 w-full text-sm text-[var(--contrast)] font-medium"
              >
                Cảm ơn bạn đã đăng ký!
              </motion.p>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
