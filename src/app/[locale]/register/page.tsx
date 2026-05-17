'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import api from '@/lib/api';
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Shield, 
  ShieldCheck, 
  Heart,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import './register.css';

const createRegisterSchema = (t: any) => z.object({
  username: z.string().min(3, t('usernameTooShort')),
  email: z.string().email(t('emailInvalid')),
  password: z.string().min(6, t('passwordTooShort')),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: t('passwordsNotMatch'),
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRegisterSchema(t)),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password
      });
      toast.success(t('registerSuccess'));
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('registerFailed'));
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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
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
        {/* Glassmorphic Grid Panel */}
        <div className="auth-glass-card grid grid-cols-1 overflow-hidden lg:grid-cols-[0.8fr_1.2fr]">
          
          {/* Left Side: Benefits (Elite Branding) */}
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

          {/* Right Side: Form */}
          <div className="p-6 lg:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-x-6 gap-y-3.5 md:grid-cols-2">
              
              {/* Username */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="ml-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4040]/70">{t('usernameLabel')}</label>
                <div className="group relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A5C5C]/35 transition-colors group-focus-within:text-[#D4A5A5]" size={18} />
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className={`auth-input-luxury w-full outline-none focus:outline-none ${errors.username ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                </div>
                {errors.username && <p className="ml-1 text-[10px] text-red-500">{errors.username.message as string}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="ml-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4040]/70">{t('emailLabel')}</label>
                <div className="group relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A5C5C]/35 transition-colors group-focus-within:text-[#D4A5A5]" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@example.com"
                    className={`auth-input-luxury w-full outline-none focus:outline-none ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                </div>
                {errors.email && <p className="ml-1 text-[10px] text-red-500">{errors.email.message as string}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="ml-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4040]/70">{t('passwordLabel')}</label>
                <div className="group relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A5C5C]/35 transition-colors group-focus-within:text-[#D4A5A5]" size={18} />
                  <input
                    {...register('password')}
                    type="password"
                    placeholder="••••••••"
                    className={`auth-input-luxury password-field w-full outline-none focus:outline-none ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                </div>
                {errors.password && <p className="ml-1 text-[10px] text-red-500">{errors.password.message as string}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="ml-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#5D4040]/70">{t('confirmPasswordLabel')}</label>
                <div className="group relative">
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7A5C5C]/35 transition-colors group-focus-within:text-[#D4A5A5]" size={18} />
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    placeholder="••••••••"
                    className={`auth-input-luxury password-field w-full outline-none focus:outline-none ${errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                </div>
                {errors.confirmPassword && <p className="ml-1 text-[10px] text-red-500">{errors.confirmPassword.message as string}</p>}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                disabled={isLoading}
                className="auth-submit-btn group relative flex w-full cursor-pointer items-center justify-center overflow-hidden text-sm font-bold uppercase tracking-[0.2em] md:col-span-2"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>{t('registerSubmit')}</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </motion.button>
            </form>

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
                  <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="h-5 w-5" />
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
          </div>

        </div>
      </motion.div>
    </main>
  );
}
