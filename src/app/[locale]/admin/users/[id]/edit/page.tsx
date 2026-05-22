'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from '@/navigation';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Shield,
  Calendar,
  User as UserIcon,
  Phone,
  MapPin,
  Globe,
  Award,
  CreditCard,
  Lock,
  Key,
  Loader2,
  AlertCircle,
  BadgeCheck,
  BadgeX,
  Clock,
  Save,
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import api from '@/lib/api';
import type { User } from '@/types/admin';

export default function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    gender: '' as string,
    address: '',
    province: '',
    district: '',
    role: '' as string,
    memberTier: '' as string,
    status: '' as string,
    twoFactorEnabled: false,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/${id}`);
        const u = data.data as User;
        setUser(u);
        setFormData({
          username: u.username,
          email: u.email,
          fullName: u.fullName || '',
          phoneNumber: u.phoneNumber || '',
          gender: u.gender || '',
          address: u.address || '',
          province: u.province || '',
          district: u.district || '',
          role: u.role,
          memberTier: u.memberTier,
          status: u.status,
          twoFactorEnabled: u.twoFactorEnabled,
        });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!formData.username.trim() || !formData.email.trim()) {
      toast.error('Tên người dùng và email không được để trống');
      return;
    }
    try {
      setSaving(true);
      await api.patch(`/users/${id}`, {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        address: formData.address,
        province: formData.province,
        district: formData.district,
        role: formData.role,
        memberTier: formData.memberTier,
        status: formData.status,
        twoFactorEnabled: formData.twoFactorEnabled,
      });
      toast.success('Đã cập nhật thông tin người dùng thành công');
      router.back();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading py-20">
          <Loader2 className="admin-loading__spinner" />
          <p>Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="admin-page">
        <div className="admin-alert">
          <AlertCircle className="admin-alert__icon" />
          <h2 className="admin-alert__title">Lỗi kết nối dữ liệu</h2>
          <p className="admin-alert__text">{error || 'Không tìm thấy người dùng'}</p>
        </div>
      </div>
    );
  }

  const EditableField = ({ label, value, onChange, type = 'text' }: {
    label: string; value: string; onChange: (v: string) => void; type?: string;
  }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 items-center">
      <span className="text-xs font-semibold text-[#7A5C5C]/60">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-semibold text-[#7A5C5C] bg-transparent border border-gray-200 rounded-lg px-3 py-1 w-48 text-right focus:outline-none focus:border-[#D4A5A5] focus:ring-2 focus:ring-[#D4A5A5]/20"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
  }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 items-center">
      <span className="text-xs font-semibold text-[#7A5C5C]/60">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-semibold text-[#7A5C5C] bg-transparent border border-gray-200 rounded-lg px-3 py-1 w-48 text-right focus:outline-none focus:border-[#D4A5A5] focus:ring-2 focus:ring-[#D4A5A5]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Chỉnh sửa người dùng</h1>
          <p className="admin-page-header__subtitle">Cập nhật thông tin cho {user.username}</p>
        </div>
        <div className="admin-page-header__actions flex gap-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#604444] text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving ? <><Loader2 size={16} className="animate-spin" /> Đang lưu...</> : <><Save size={16} /> Lưu thay đổi</>}
          </button>
        </div>
      </header>

      {/* Avatar & Basic Info - same layout as detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full bg-[#F9F6F3] overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            {user.avatar && user.avatar.startsWith('http') ? (
              <Image
                src={user.avatar}
                alt={user.username}
                fill
                className="object-cover"
                unoptimized={!user.avatar.includes('r2.dev') && !user.avatar.includes('googleusercontent.com')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#7A5C5C] font-bold text-3xl">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[#7A5C5C]">{user.username}</h2>
            <p className="text-sm text-[#7A5C5C]/60 flex items-center gap-1.5 mt-1">
              <Mail size={14} /> {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Info Grid - same 2-column layout as detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserIcon size={16} /> Thông tin cá nhân
          </h3>
          <div className="space-y-1">
            <EditableField label="Họ tên đầy đủ" value={formData.fullName} onChange={(v) => setFormData(f => ({ ...f, fullName: v }))} />
            <EditableField label="Số điện thoại" value={formData.phoneNumber} onChange={(v) => setFormData(f => ({ ...f, phoneNumber: v }))} />
            <SelectField
              label="Giới tính"
              value={formData.gender}
              onChange={(v) => setFormData(f => ({ ...f, gender: v }))}
              options={[
                { value: '', label: 'Chưa xác định' },
                { value: 'MALE', label: 'Nam' },
                { value: 'FEMALE', label: 'Nữ' },
                { value: 'OTHER', label: 'Khác' },
              ]}
            />
            <div className="flex justify-between py-2 border-b border-gray-50 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Ngày tham gia</span>
              <span className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-1">
                <Calendar size={12} />
                {new Date(user.createdAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between py-2 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Cập nhật lần cuối</span>
              <span className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-1">
                <Clock size={12} />
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Address Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MapPin size={16} /> Địa chỉ
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between py-2 border-b border-gray-50 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Địa chỉ</span>
              <span className="text-sm font-semibold text-[#7A5C5C]">{formData.address || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Tỉnh/Thành phố</span>
              <span className="text-sm font-semibold text-[#7A5C5C]">{formData.province || '—'}</span>
            </div>
            <div className="flex justify-between py-2 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Quận/Huyện</span>
              <span className="text-sm font-semibold text-[#7A5C5C]">{formData.district || '—'}</span>
            </div>
          </div>
        </div>

        {/* Account & Security */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lock size={16} /> Tài khoản & Bảo mật
          </h3>
          <div className="space-y-1">
            <SelectField
              label="Vai trò"
              value={formData.role}
              onChange={(v) => setFormData(f => ({ ...f, role: v }))}
              options={[
                { value: 'USER', label: 'USER' },
                { value: 'ADMIN', label: 'ADMIN' },
                { value: 'SUBADMIN', label: 'SUBADMIN' },
              ]}
            />
            <div className="flex justify-between py-2 border-b border-gray-50 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Xác thực 2 lớp (2FA)</span>
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, twoFactorEnabled: !f.twoFactorEnabled }))}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  formData.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Key size={12} />
                {formData.twoFactorEnabled ? 'Đã bật' : 'Tắt'}
              </button>
            </div>
            <SelectField
              label="Trạng thái"
              value={formData.status}
              onChange={(v) => setFormData(f => ({ ...f, status: v }))}
              options={[
                { value: 'active', label: 'Hoạt động' },
                { value: 'inactive', label: 'Không hoạt động' },
                { value: 'suspended', label: 'Đã khoá' },
              ]}
            />
            <div className="flex justify-between py-2 items-center">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Hạng thành viên</span>
              <select
                value={formData.memberTier}
                onChange={(e) => setFormData(f => ({ ...f, memberTier: e.target.value }))}
                className="text-sm font-semibold text-[#7A5C5C] bg-transparent border border-gray-200 rounded-lg px-3 py-1 w-48 text-right focus:outline-none focus:border-[#D4A5A5] focus:ring-2 focus:ring-[#D4A5A5]/20"
              >
                {[
                  { value: 'MEMBER', label: 'Thành viên' },
                  { value: 'Bac', label: 'Bạc' },
                  { value: 'Vang', label: 'Vàng' },
                  { value: 'KimCuong', label: 'Kim Cương' },
                ].map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Membership & Spending */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard size={16} /> Thành viên & Chi tiêu
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Tổng chi tiêu</span>
              <span className="text-sm font-bold text-[#7A5C5C]">
                {user.totalSpent ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.totalSpent) : '0₫'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Đăng nhập qua</span>
              <span className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-1">
                <Globe size={12} />
                {user.oauthProvider
                  ? user.oauthProvider === 'google' ? 'Google' : 'GitHub'
                  : 'Email / Mật khẩu'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}