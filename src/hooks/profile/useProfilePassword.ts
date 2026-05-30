'use client';

import { useState } from 'react';
import api from '@/lib/api';

export function useProfilePassword(accessToken: string | null) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    setStatusMessage(null);
    if (!accessToken) {
      setStatusMessage({ text: 'Bạn cần đăng nhập lại để đổi mật khẩu.', type: 'danger' });
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage({ text: 'Mật khẩu mới phải có ít nhất 6 ký tự.', type: 'danger' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: 'Mật khẩu xác nhận không khớp.', type: 'danger' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', { currentPassword, newPassword });
      if (res.data && res.data.success) {
        setStatusMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setStatusMessage({ text: res.data?.message || 'Lỗi khi đổi mật khẩu', type: 'danger' });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi mạng';
      setStatusMessage({ text: errMsg, type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    statusMessage, setStatusMessage,
    submitting,
    handleChangePassword,
  };
}