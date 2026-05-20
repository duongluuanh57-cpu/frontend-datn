'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLogin } from '@/hooks/useLogin';
import { LoginForm } from './components/LoginForm';
import { LoginIdentity } from './components/LoginIdentity';
import './login.css';

export default function LoginPage() {
  const loginData = useLogin();
  const { isError } = loginData;

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
            <LoginForm loginData={loginData} />
          </motion.div>

          {/* Right: Brand Identity & Benefits (Desktop Only) */}
          <LoginIdentity loginData={loginData} />
          
        </div>
      </motion.div>
    </main>
  );
}
