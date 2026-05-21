'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone, History, Key } from 'lucide-react';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface SecurityTabProps {
  userProfile: UseUserProfileReturn;
}

export function SecurityTab({ userProfile: _ }: SecurityTabProps) {
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
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={26} style={{ color: 'var(--primary)' }} />
          Bảo mật &amp; Xác thực
        </h1>
        <p>Quản lý các cơ chế bảo mật nâng cao nhằm bảo vệ tuyệt đối tài khoản L&apos;essence của bạn</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
        
        {/* Card 1: 2FA */}
        <div style={{
          display: 'flex',
          gap: '1.2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          borderRadius: '20px',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px -10px rgba(122, 92, 92, 0.02)'
        }}
        className="security-feature-card"
        >
          <div style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--primary)',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Smartphone size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--content)', margin: '0 0 4px 0' }}>
              Xác thực hai yếu tố (2FA)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(122, 92, 92, 0.6)', margin: 0, lineHeight: 1.4 }}>
              Tăng cường bảo mật bằng cách yêu cầu mã OTP xác nhận từ ứng dụng Authenticator (Google/Microsoft) khi thực hiện đăng nhập.
            </p>
          </div>
          <span style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap'
          }}>
            Sắp ra mắt
          </span>
        </div>

        {/* Card 2: Login History */}
        <div style={{
          display: 'flex',
          gap: '1.2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          borderRadius: '20px',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px -10px rgba(122, 92, 92, 0.02)'
        }}
        className="security-feature-card"
        >
          <div style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--primary)',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <History size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--content)', margin: '0 0 4px 0' }}>
              Nhật ký hoạt động &amp; Thiết bị
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(122, 92, 92, 0.6)', margin: 0, lineHeight: 1.4 }}>
              Theo dõi lịch sử truy cập chi tiết, bao gồm địa chỉ IP, vị trí địa lý, trình duyệt và các thiết bị đã được cấp quyền truy cập.
            </p>
          </div>
          <span style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap'
          }}>
            Sắp ra mắt
          </span>
        </div>

        {/* Card 3: Passkeys */}
        <div style={{
          display: 'flex',
          gap: '1.2rem',
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          borderRadius: '20px',
          alignItems: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 20px -10px rgba(122, 92, 92, 0.02)'
        }}
        className="security-feature-card"
        >
          <div style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--primary)',
            padding: '12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Key size={24} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--content)', margin: '0 0 4px 0' }}>
              Khóa bảo mật &amp; Sinh trắc học (Passkey)
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'rgba(122, 92, 92, 0.6)', margin: 0, lineHeight: 1.4 }}>
              Đăng nhập cực kỳ an toàn mà không cần nhập mật khẩu bằng cách tích hợp sinh trắc học Face ID, Touch ID hoặc mã bảo mật của máy tính.
            </p>
          </div>
          <span style={{
            background: 'rgba(212, 165, 165, 0.15)',
            color: 'var(--primary)',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap'
          }}>
            Sắp ra mắt
          </span>
        </div>

      </div>
    </motion.div>
  );
}
