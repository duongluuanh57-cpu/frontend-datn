'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import type { UseLoginReturn } from '@/hooks/useLogin';

interface LoginIdentityProps {
  loginData: UseLoginReturn;
}

export function LoginIdentity({ loginData }: LoginIdentityProps) {
  const { t } = loginData;

  return (
    <div className="hidden flex-col items-center justify-center text-center lg:flex">
      <Link href="/" className="group mb-10 flex cursor-pointer flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/50 backdrop-blur-md shadow-lg border border-white/40 ring-1 ring-[#7A5C5C]/5 transition-all duration-500 group-hover:scale-115 group-hover:shadow-[0_20px_50px_rgba(212,165,165,0.25)]">
          <ShieldCheck className="text-[#D4A5A5]" size={36} />
        </div>
        <h1 className="text-3xl font-light tracking-[0.5em] text-[#7A5C5C] ml-[0.5em] transition-all group-hover:tracking-[0.55em]">L'ESSENCE</h1>
      </Link>
      
      <div className="max-w-[320px] space-y-8">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-[#5D4040]">{t('noAccount')}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A5C5C]/60 leading-relaxed">{t('registerSubtitle')}</p>
          <Link href="/register">
            <motion.div 
              whileHover={{ x: 5 }}
              className="mt-8 flex cursor-pointer items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#D4A5A5] hover:text-[#5D4040] transition-colors"
            >
              <span>{t('registerNow')}</span>
              <ArrowRight size={14} />
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}
