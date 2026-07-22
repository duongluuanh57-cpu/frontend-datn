'use client';

import { useState } from 'react';
import { Key } from 'lucide-react';
import { toast } from 'sonner';
import { changePassword } from '@/services/user.service';

interface PasswordManagerProps {
  accessToken: string | null;
}

export function PasswordManager({ accessToken }: PasswordManagerProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleChangePassword = async () => {
    if (!accessToken) return;
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(accessToken, currentPassword, newPassword);
      toast.success('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể đổi mật khẩu');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
        Đổi mật khẩu
      </h2>
      {passwordError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{passwordError}</div>
      )}
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Mật khẩu mới</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          disabled={passwordSaving}
          onClick={handleChangePassword}
          className="flex items-center gap-2 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Key size={16} />
          {passwordSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
        </button>
      </div>
    </div>
  );
}