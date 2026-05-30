'use client';

import { useState } from 'react';
import api from '@/lib/api';

export function useProfileDetails(user: any, updateUser: (u: any) => void) {
  // Name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.username || '');
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [editingSuccess, setEditingSuccess] = useState<string | null>(null);

  // Email editing
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Personal details editing
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedFullName, setEditedFullName] = useState(user?.fullName || '');
  const [editedPhone, setEditedPhone] = useState(user?.phoneNumber || '');
  const [editedGender, setEditedGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>((user as any)?.gender || '');
  const [detailsSubmitting, setDetailsSubmitting] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);

  const handleUpdateName = async () => {
    setEditingError(null);
    setEditingSuccess(null);
    if (!editedName || editedName.trim().length < 3) {
      setEditingError('Tên người dùng phải có ít nhất 3 ký tự');
      return;
    }
    setEditingSubmitting(true);
    try {
      const res = await api.patch('/auth/update-profile', { username: editedName.trim() });
      if (res.data && res.data.success) {
        updateUser({ username: editedName.trim() });
        setEditingSuccess('Cập nhật tên tài khoản thành công!');
        setIsEditingName(false);
        setTimeout(() => setEditingSuccess(null), 3000);
      } else {
        setEditingError(res.data?.message || 'Lỗi khi cập nhật tên');
      }
    } catch (err: any) {
      setEditingError(err.response?.data?.message || err.message || 'Lỗi kết nối');
    } finally {
      setEditingSubmitting(false);
    }
  };

  const handleUpdateEmail = async () => {
    setEmailError(null);
    setEmailSuccess(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editedEmail || !emailRegex.test(editedEmail.trim())) {
      setEmailError('Email không đúng định dạng');
      return;
    }
    setEmailSubmitting(true);
    try {
      const res = await api.patch('/auth/update-profile', { email: editedEmail.trim() });
      if (res.data && res.data.success) {
        updateUser({ email: editedEmail.trim() });
        setEmailSuccess('Cập nhật địa chỉ email thành công!');
        setIsEditingEmail(false);
        setTimeout(() => setEmailSuccess(null), 3000);
      } else {
        setEmailError(res.data?.message || 'Lỗi khi cập nhật email');
      }
    } catch (err: any) {
      setEmailError(err.response?.data?.message || err.message || 'Lỗi kết nối');
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleUpdateDetails = async () => {
    setDetailsError(null);
    setDetailsSuccess(null);
    setDetailsSubmitting(true);
    try {
      const res = await api.patch('/auth/update-profile', {
        fullName: editedFullName.trim(),
        phoneNumber: editedPhone.trim(),
        gender: editedGender,
      });
      if (res.data && res.data.success) {
        updateUser({
          fullName: editedFullName.trim(),
          phoneNumber: editedPhone.trim(),
          gender: editedGender,
        } as any);
        setDetailsSuccess('Cập nhật thông tin cá nhân thành công!');
        setIsEditingDetails(false);
        setTimeout(() => setDetailsSuccess(null), 3000);
      } else {
        setDetailsError(res.data?.message || 'Lỗi khi cập nhật thông tin');
      }
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || err.message || 'Lỗi kết nối');
    } finally {
      setDetailsSubmitting(false);
    }
  };

  return {
    isEditingName, setIsEditingName,
    editedName, setEditedName,
    editingSubmitting, editingError, setEditingError, editingSuccess, setEditingSuccess,
    handleUpdateName,
    isEditingEmail, setIsEditingEmail,
    editedEmail, setEditedEmail,
    emailSubmitting, emailError, setEmailError, emailSuccess, setEmailSuccess,
    handleUpdateEmail,
    isEditingDetails, setIsEditingDetails,
    editedFullName, setEditedFullName,
    editedPhone, setEditedPhone,
    editedGender, setEditedGender,
    detailsSubmitting, detailsError, detailsSuccess,
    handleUpdateDetails,
  };
}