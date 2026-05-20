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
    <section className="py-8 lg:py-12 relative overflow-hidden bg-[var(--background)]">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[100px] opacity-20 -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute top-1/2 right-0 w-64 h-64 bg-[var(--contrast)] rounded-full mix-blend-multiply filter blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>

      <div className="container mx-auto px-6 lg:px-8 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/40 backdrop-blur-md rounded-3xl p-8 md:p-14 border border-[var(--primary)]/20 shadow-[0_8px_30px_rgba(212,165,165,0.1)] text-center relative overflow-hidden"
        >
          {/* Subtle line decoration inside box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent"></div>
          
          <Mail className="w-12 h-12 text-[var(--primary)] mx-auto mb-6 stroke-[1.5]" />
          
          <h2 className="font-heading text-3xl md:text-4xl text-[var(--content)] mb-4 tracking-wide font-light">
            Nhận Đặc Quyền & Ưu Đãi
          </h2>
          
          <p className="text-[var(--content)] opacity-80 mb-10 max-w-lg mx-auto font-light leading-relaxed">
            Đăng ký email để trở thành những người đầu tiên nhận thông tin về bộ sưu tập mới và các ưu đãi đặc quyền từ L'essence.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
            <div className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                disabled={isSubmitting || isSuccess}
                className="w-full bg-white/60 border border-[var(--primary)]/30 rounded-full py-4 pl-6 pr-14 text-[var(--content)] placeholder:text-[var(--content)]/40 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-300 shadow-inner"
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
                className="absolute -bottom-8 left-0 w-full text-sm text-[var(--contrast)] font-medium"
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
