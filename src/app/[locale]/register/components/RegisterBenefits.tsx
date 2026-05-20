'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import type { UseRegisterReturn } from '@/hooks/useRegister';

interface RegisterBenefitsProps {
  registerData: UseRegisterReturn;
}

export function RegisterBenefits({ registerData }: RegisterBenefitsProps) {
  const { t } = registerData;

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
  };

  return (
    <aside className="relative flex flex-col bg-[#7A5C5C]/5 p-6 lg:p-8 border-r border-[#7A5C5C]/5 pt-20 lg:pt-24">
      {/* Back to Home Badge */}
      <div className="absolute left-6 top-6 lg:left-8 lg:top-8 z-30">
        <Link href="/">
          <motion.div 
            whileHover={{ x: -3 }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#7A5C5C]/10 bg-white/40 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#7A5C5C]/60 backdrop-blur-md transition-all hover:bg-white hover:text-[#7A5C5C] hover:shadow-sm"
          >
            <ArrowRight size={13} className="rotate-180" />
            <span>{t('backToHome')}</span>
          </motion.div>
        </Link>
      </div>
      <motion.div variants={itemVariants} className="mb-4">
        <Link href="/" className="inline-block cursor-pointer no-underline">
          <h1 className="text-xl font-light tracking-[0.5em] text-[#7A5C5C] ml-[0.5em]">L'ESSENCE</h1>
        </Link>
      </motion.div>
      
      <motion.div variants={itemVariants} className="mb-4">
        <h2 className="auth-title-luxury text-3xl font-medium">{t('registerTitle')}</h2>
        <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#7A5C5C]/50">{t('registerSubtitle')}</p>
      </motion.div>

      <ul className="space-y-3">
        {[
          { icon: ShieldCheck, text: t('benefit2') },
          { icon: Heart, text: t('benefit3') }
        ].map((benefit, i) => (
          <motion.li 
            key={i}
            variants={itemVariants}
            className="flex items-center gap-3.5 text-sm text-[#7A5C5C]/80"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-[#7A5C5C]/5 text-[#D4A5A5]">
              <benefit.icon size={16} />
            </div>
            <span className="font-semibold text-[13px] tracking-wide text-[#7A5C5C]">{benefit.text}</span>
          </motion.li>
        ))}
      </ul>
    </aside>
  );
}
