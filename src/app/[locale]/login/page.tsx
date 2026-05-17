'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import './login.css';

const createLoginSchema = (t: any) => z.object({
  email: z.string().email(t('emailInvalid')),
  password: z.string().min(6, t('passwordTooShort')),
  rememberMe: z.boolean().optional(),
});

export default function LoginPage() {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createLoginSchema(t)),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await api.post('/auth/login', data);
      const { user, tokens } = response.data.data;

      setAuth(user, tokens.accessToken, tokens.refreshToken);
      toast.success(t('loginSuccess'));

      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setIsError(true);
      toast.error(error.response?.data?.message || t('loginFailed'));
      // Shake effect duration
      setTimeout(() => setIsError(false), 500);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
      } as any,
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <main className="auth-page-container">
      {/* GPU-Optimized Background Blobs - No Layout Shifts */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="auth-bg-blob auth-blob-1" />
        <div className="auth-bg-blob auth-blob-2" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-[1100px] px-6 sm:px-8"
      >
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          
          {/* Left: Login Form Card */}
          <motion.div 
            variants={itemVariants}
            animate={isError ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="auth-glass-card group/card relative overflow-hidden p-6 sm:p-8 md:p-9 md:py-10"
          >
            {/* Back to Home Badge */}
            <div className="mb-5 flex justify-start">
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

            <div className="mb-5 text-center md:text-left">
              <h2 className="auth-title-luxury text-3xl font-medium md:text-4xl">{t('loginTitle')}</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#7A5C5C]/50">{t('loginSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="ml-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#5D4040]/70">{t('emailLabel')}</label>
                <div className="group relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A5C5C]/35 transition-colors group-focus-within:text-[#D4A5A5]">
                    <Mail size={18} />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@example.com"
                    className={`auth-input-luxury w-full outline-none focus:outline-none ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                </div>
                {errors.email && <p className="ml-1 text-[10px] text-red-500">{errors.email.message as string}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="ml-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#5D4040]/70">{t('passwordLabel')}</label>
                <div className="group relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A5C5C]/35 transition-colors group-focus-within:text-[#D4A5A5]">
                    <Lock size={18} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`auth-input-luxury password-field w-full outline-none focus:outline-none ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-[#7A5C5C]/30 transition-all hover:scale-110 hover:text-[#7A5C5C] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="ml-1 text-[10px] text-red-500">{errors.password.message as string}</p>}
              </div>

              <div className="flex items-center justify-between px-1.5 pt-0.5">
                <label className="flex cursor-pointer items-center gap-2.5 group relative">
                  <input {...register('rememberMe')} type="checkbox" className="peer absolute inset-0 z-10 cursor-pointer opacity-0" />
                  <div className="flex h-4 w-4 items-center justify-center rounded border border-[#7A5C5C]/20 bg-white/60 transition-all group-hover:border-[#D4A5A5] peer-checked:bg-[#D4A5A5] peer-checked:border-[#D4A5A5]">
                    <div className="h-1.5 w-1.5 scale-0 rounded-full bg-white transition-transform peer-checked:scale-100" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D4040]/70 transition-colors group-hover:text-[#5D4040]">{t('rememberMe')}</span>
                </label>
                <Link href="/forgot-password">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C88A8A] transition-colors hover:text-[#5D4040]">{t('forgotPassword')}</span>
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
                className="auth-submit-btn group relative flex w-full cursor-pointer items-center justify-center overflow-hidden text-sm font-bold uppercase tracking-[0.2em]"
              >
                <div className="relative z-10 flex items-center gap-3">
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <span>{t('loginSubmit')}</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>

            <div className="mt-6">
              <div className="relative mb-5 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#7A5C5C]/10"></div></div>
                <span className="relative bg-white/20 backdrop-blur-md px-6 text-[10px] font-bold uppercase tracking-[0.25em] text-[#7A5C5C]/45">{t('orLoginWith')}</span>
              </div>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                  className="google-auth-btn flex w-full cursor-pointer items-center justify-center gap-4"
                >
                  <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="h-6 w-6" />
                  <span className="text-sm font-bold text-[#7A5C5C]">Tiếp tục với Google</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right: Brand Identity & Benefits (Desktop Only) */}
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
          
        </div>
      </motion.div>
    </main>
  );
}
