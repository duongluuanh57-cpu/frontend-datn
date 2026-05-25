'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/navigation';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { UseRegisterReturn } from '@/hooks/useRegister';

interface SocialRegisterProps {
  registerData: UseRegisterReturn;
}

export function SocialRegister({ registerData }: SocialRegisterProps) {
  const { t } = registerData;

  return (
    <>
      <div className="mt-5">
        <div className="relative mb-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#7A5C5C]/10"></div>
          </div>
          <span className="relative bg-white/20 backdrop-blur-md px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7A5C5C]/45">
            {t('orRegisterWith')}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
            className="google-auth-btn flex w-full cursor-pointer items-center justify-center gap-3"
          >
            <Image src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" width={20} height={20} />
            <span className="text-sm font-bold text-[#7A5C5C]">Tiếp tục với Google</span>
          </motion.button>
        </div>
      </div>

      <div className="mt-8 text-center border-t border-[#7A5C5C]/5 pt-6">
        <div className="flex items-center justify-center gap-6">
          <div className="text-left">
            <h3 className="text-base font-semibold text-[#5D4040]">{t('hasAccount')}</h3>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#7A5C5C]/50">{t('loginSubtitle')}</p>
          </div>
          <Link href="/login">
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#D4A5A5]/25 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-[#D4A5A5] hover:bg-[#D4A5A5]/5 transition-all"
            >
              <span>{t('loginNow')}</span>
              <ArrowRight size={14} />
            </motion.div>
          </Link>
        </div>
      </div>
    </>
  );
}
