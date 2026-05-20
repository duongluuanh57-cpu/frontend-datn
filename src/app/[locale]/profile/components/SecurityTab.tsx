'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface SecurityTabProps {
  userProfile: UseUserProfileReturn;
}

export function SecurityTab({ userProfile }: SecurityTabProps) {
  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    statusMessage,
    handleChangePassword,
    submitting
  } = userProfile;

  return (
    <motion.div
      key="security"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="profile-section-header">
        <h1>Bảo mật &amp; Xác thực</h1>
        <p>Thay đổi mật khẩu tài khoản và quản lý thông tin bảo mật</p>
      </div>

      <div className="profile-form-grid">
        
        <div className="profile-field-group">
          <label>Mật khẩu hiện tại</label>
          <input 
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="profile-form-input"
          />
        </div>

        <div className="profile-field-group">
          <label>Mật khẩu mới</label>
          <input 
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="profile-form-input"
          />
        </div>

        <div className="profile-field-group">
          <label>Xác nhận mật khẩu mới</label>
          <input 
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="profile-form-input"
          />
        </div>

        {statusMessage && (
          <div className={`profile-alert ${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <button 
          onClick={handleChangePassword}
          disabled={submitting}
          className="btn-profile-submit"
        >
          {submitting ? 'Đang cập nhật bảo mật...' : 'Xác nhận đổi mật khẩu'}
        </button>

      </div>
    </motion.div>
  );
}
