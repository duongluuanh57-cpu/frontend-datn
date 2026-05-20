'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface SettingsTabProps {
  userProfile: UseUserProfileReturn;
}

export function SettingsTab({ userProfile: _ }: SettingsTabProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="profile-section-header">
        <h1>Thiết lập hệ thống</h1>
        <p>Cấu hình và điều chỉnh các chế độ hoạt động của tài khoản</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
        
        <div className="profile-setting-toggle">
          <div className="profile-setting-toggle-info">
            <h4>Mã hóa dữ liệu đầu cuối (End-to-End Encryption)</h4>
            <p>Bảo mật cuộc trò chuyện AI và dữ liệu cá nhân hoàn toàn</p>
          </div>
          <span className="profile-badge-status">KÍCH HOẠT</span>
        </div>

        <div className="profile-setting-toggle">
          <div className="profile-setting-toggle-info">
            <h4>Thông báo email giao dịch</h4>
            <p>Nhận biên lai hóa đơn và thông tin cập nhật đơn hàng</p>
          </div>
          <span className="profile-badge-status">BẬT</span>
        </div>

      </div>
    </motion.div>
  );
}
