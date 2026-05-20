'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRegister } from '@/hooks/useRegister';
import { RegisterBenefits } from './components/RegisterBenefits';
import { RegisterForm } from './components/RegisterForm';
import { SocialRegister } from './components/SocialRegister';
import './register.css';

export default function RegisterPage() {
  const registerData = useRegister();

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

  return (
    <main className="auth-page-container">
      {/* GPU-Optimized Background Blobs */}
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
          <RegisterBenefits registerData={registerData} />
          
          <div className="p-6 lg:p-8">
            <RegisterForm registerData={registerData} />
            <SocialRegister registerData={registerData} />
          </div>
        </div>
      </motion.div>
    </main>
  );
}
