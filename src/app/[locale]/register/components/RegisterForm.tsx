'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Shield, Loader2, ArrowRight } from 'lucide-react';
import type { UseRegisterReturn } from '@/hooks/useRegister';

interface RegisterFormProps {
  registerData: UseRegisterReturn;
}

export function RegisterForm({ registerData }: RegisterFormProps) {
  const { register, handleSubmit, onSubmit, errors, isLoading, t } = registerData;

  return (
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
  );
}
