'use client';

import { useState } from 'react';
import { useForm, UseFormRegister, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { toast } from 'sonner';

const createLoginSchema = (t: any) => z.object({
  email: z.string().email(t('emailInvalid')),
  password: z.string().min(6, t('passwordTooShort')),
  rememberMe: z.boolean().optional(),
});

export interface UseLoginReturn {
  t: (key: string) => string;
  isLoading: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  isError: boolean;
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  errors: FieldErrors<any>;
  onSubmit: (data: any) => Promise<void>;
  router: any;
}

export function useLogin(): UseLoginReturn {
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

  return {
    t,
    isLoading,
    showPassword,
    setShowPassword,
    isError,
    register,
    handleSubmit,
    errors,
    onSubmit,
    router
  };
}
