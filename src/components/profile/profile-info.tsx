'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { updateProfile, changePassword } from '@/services/user.service';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { DatePicker } from '@/components/shared/date-picker';

interface ProfileInfoProps {
  ordersCount: number;
  loadingOrders: boolean;
}

type EditingField = 'fullName' | 'email' | 'phone' | 'gender' | 'dob' | null;

export function ProfileInfo({ ordersCount, loadingOrders }: ProfileInfoProps) {
  const { user, accessToken, updateUser } = useAuthStore();

  const [editingField, setEditingField] = useState<EditingField>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingField, setPendingField] = useState<EditingField>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [editDob, setEditDob] = useState('');

  const [infoSaving, setInfoSaving] = useState(false);

  const handleRequestEdit = (field: EditingField) => {
    setPendingField(field);
    setShowPasswordPrompt(true);
    setPasswordInput('');
    setPasswordError('');
  };

  const handleVerifyPassword = async () => {
    if (!accessToken || !pendingField) return;
    if (!passwordInput) {
      setPasswordError('Vui lòng nhập mật khẩu');
      return;
    }
    try {
      await changePassword(accessToken, passwordInput, passwordInput);
      setShowPasswordPrompt(false);
      setEditFullName(user?.fullName || '');
      setEditEmail(user?.email || '');
      setEditPhone(user?.phoneNumber || '');
      setEditGender(user?.gender || '');
      setEditDob(user?.dateOfBirth || '');
      setEditingField(pendingField);
      setPasswordInput('');
      setPasswordError('');
    } catch {
      setPasswordError('Mật khẩu không đúng');
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  const saveInfo = async () => {
    if (!accessToken) return;
    setInfoSaving(true);
    try {
      await updateProfile(accessToken, {
        fullName: editFullName,
        email: editEmail,
        phoneNumber: editPhone,
        gender: editGender || undefined,
        dateOfBirth: editDob || undefined,
      });
      updateUser({
        fullName: editFullName,
        email: editEmail,
        phoneNumber: editPhone,
        gender: editGender || undefined,
        dateOfBirth: editDob || undefined,
      });
      toast.success('Cập nhật thông tin thành công');
      setEditingField(null);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật thông tin');
    } finally {
      setInfoSaving(false);
    }
  };

  const maskValue = (key: EditingField, val: string): string => {
    if (!val) return '';
    if (key === 'fullName') {
      if (val.length <= 2) return val;
      return val[0] + '*'.repeat(val.length - 2) + val[val.length - 1];
    }
    if (key === 'email') {
      const [local, domain] = val.split('@');
      if (!domain) return val;
      const maskedLocal = local.slice(0, 2) + '*'.repeat(local.length - 2);
      return maskedLocal + '@' + domain;
    }
    if (key === 'phone') {
      if (val.length <= 3) return val;
      return '*'.repeat(val.length - 2) + val.slice(-2);
    }
    if (key === 'dob') {
      const parts = val.split('-');
      if (parts.length === 3) {
        return `**/**/${parts[0]}`;
      }
      return val;
    }
    return val;
  };

  const handleGenderChange = (g: string) => {
    if (!accessToken) return;
    updateProfile(accessToken, { gender: g }).then(() => {
      updateUser({ gender: g as any });
      toast.success('Cập nhật giới tính thành công');
    }).catch((err) => {
      toast.error(err?.message || 'Không thể cập nhật');
    });
  };

  const fields: { key: EditingField; label: string; value: string; inline?: boolean }[] = [
    { key: 'fullName', label: 'Họ và tên', value: maskValue('fullName', user?.fullName || '') },
    { key: 'email', label: 'Email', value: maskValue('email', user?.email || '') },
    { key: 'phone', label: 'Số điện thoại', value: maskValue('phone', user?.phoneNumber || '') },
    { key: 'gender', label: 'Giới tính', value: user?.gender === 'MALE' ? 'Nam' : user?.gender === 'FEMALE' ? 'Nữ' : user?.gender === 'OTHER' ? 'Khác' : '', inline: true },
    { key: 'dob', label: 'Ngày sinh', value: maskValue('dob', user?.dateOfBirth || ''), inline: true },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Hồ sơ</h2>

      {showPasswordPrompt && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-background rounded-xl p-6 w-full max-w-sm mx-4 border border-border shadow-elevated">
            <h3 className="font-semibold text-text-primary mb-4">Xác thực mật khẩu</h3>
            <p className="text-sm text-text-secondary mb-4">Vui lòng nhập mật khẩu để thay đổi thông tin này</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
              autoFocus
            />
            {passwordError && <p className="text-xs text-red-500 mb-3">{passwordError}</p>}
            <div className="flex gap-3">
              <button onClick={handleVerifyPassword} className="btn-primary flex-1">Xác nhận</button>
              <button onClick={() => { setShowPasswordPrompt(false); setPasswordError(''); }} className="btn-ghost flex-1">Hủy</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between py-2">
          <div>
            <span className="text-sm text-text-secondary">Tên đăng nhập: </span>
            <span className="text-sm font-medium text-text-primary">{user?.username || ''}</span>
          </div>
        </div>

        {user?.oauthProvider && (
          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-sm text-text-secondary">Liên kết: </span>
              <span className="text-sm font-medium text-text-primary">
                {user.oauthProvider === 'google' ? 'Google' : 'GitHub'}
              </span>
            </div>
          </div>
        )}

        {fields.map((f) => (
          <div key={f.key} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <span className="text-sm text-text-secondary">{f.label}: </span>
              {f.inline ? (
                f.key === 'gender' ? (
                  <div className="inline-flex items-center gap-3 ml-2">
                    {['MALE', 'FEMALE', 'OTHER'].map((g) => (
                      <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value={g}
                          checked={(user?.gender || '') === g}
                          onChange={() => handleGenderChange(g)}
                          className="w-4 h-4 text-primary border-border focus:ring-primary"
                        />
                        <span className="text-sm text-text-primary">{g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác'}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <DatePicker
                    value={user?.dateOfBirth || ''}
                    onChange={(date) => {
                      if (!accessToken || !date) return;
                      const formatted = date.toISOString().split('T')[0];
                      updateProfile(accessToken, { dateOfBirth: formatted }).then(() => {
                        updateUser({ dateOfBirth: formatted });
                        toast.success('Cập nhật ngày sinh thành công');
                      }).catch((err) => {
                        toast.error(err?.message || 'Không thể cập nhật');
                      });
                    }}
                    className="ml-2"
                  />
                )
              ) : editingField === f.key ? (
                <div className="inline-flex items-center ml-2">
                  <input
                    type={f.key === 'email' ? 'email' : 'text'}
                    value={f.key === 'fullName' ? editFullName : f.key === 'email' ? editEmail : editPhone}
                    onChange={(e) => {
                      if (f.key === 'fullName') setEditFullName(e.target.value);
                      else if (f.key === 'email') setEditEmail(e.target.value);
                      else setEditPhone(e.target.value);
                    }}
                    className="text-sm bg-background border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    autoFocus
                  />
                </div>
              ) : (
                <span className="text-sm font-medium text-text-primary">{f.value || ''}</span>
              )}
            </div>
            {f.inline ? null : editingField === f.key ? (
              <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                <button onClick={saveInfo} disabled={infoSaving} className="text-xs font-semibold text-primary hover:text-primary-dark whitespace-nowrap">
                  {infoSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button onClick={cancelEdit} className="text-text-muted hover:text-text-primary">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => handleRequestEdit(f.key)} className="text-xs font-semibold text-primary hover:text-primary-dark whitespace-nowrap flex-shrink-0 ml-3">
                Thay đổi
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}