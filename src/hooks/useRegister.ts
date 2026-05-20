'use client';

import { useState } from 'react';
import { useForm, UseFormRegister, FieldErrors, UseFormHandleSubmit } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { toast } from 'sonner';

const createRegisterSchema = (t: any) => z.object({
  username: z.string().min(3, t('usernameTooShort')),
  email: z.string().email(t('emailInvalid')),
  password: z.string().min(6, t('passwordTooShort')),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: t('passwordsNotMatch'),
  path: ["confirmPassword"],
});

export interface UseRegisterReturn {
  t: (key: string) => string;
  isLoading: boolean;
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  errors: FieldErrors<any>;
  onSubmit: (data: any) => Promise<void>;
  router: any;
}

export function useRegister(): UseRegisterReturn {
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

  return {
    t,
    isLoading,
    register,
    handleSubmit,
    errors,
    onSubmit,
    router
  };
}
