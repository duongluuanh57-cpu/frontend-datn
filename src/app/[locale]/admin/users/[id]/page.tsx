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
} from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/api';
import type { User } from '@/types/admin';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/users/${id}`);
        setUser(data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

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
          <button
            onClick={() => router.back()}
            className="admin-btn-primary mt-4 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | React.ReactNode; icon: any }) => (
    <div className="bg-gray-50 rounded-xl p-4 col-span-2 md:col-span-1">
      <p className="text-xs font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Icon size={14} /> {label}
      </p>
      <p className="text-sm font-semibold text-[#7A5C5C]">{value || <span className="text-gray-400 italic">Chưa có</span>}</p>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-500',
      suspended: 'bg-red-100 text-red-600',
    };
    const labels: Record<string, string> = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      suspended: 'Đã khoá',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colors[status] || colors.active}`}>
        {status === 'active' ? <BadgeCheck size={12} /> : <BadgeX size={12} />}
        {labels[status] || status}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const colors: Record<string, string> = {
      ADMIN: 'bg-[#7A5C5C]/10 text-[#7A5C5C]',
      SUBADMIN: 'bg-purple-100 text-purple-700',
      USER: 'bg-[#D4A5A5]/10 text-[#D4A5A5]',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[role] || colors.USER}`}>
        <Shield size={12} />
        {role}
      </span>
    );
  };

  const TierBadge = ({ tier }: { tier: string }) => {
    const colors: Record<string, string> = {
      KimCuong: 'bg-blue-100 text-blue-700',
      Vang: 'bg-yellow-100 text-yellow-700',
      Bac: 'bg-gray-200 text-gray-600',
      MEMBER: 'bg-gray-100 text-gray-400',
    };
    const labels: Record<string, string> = {
      KimCuong: 'Kim Cương',
      Vang: 'Vàng',
      Bac: 'Bạc',
      MEMBER: 'Thành viên',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${colors[tier] || colors.MEMBER}`}>
        <Award size={12} />
        {labels[tier] || tier}
      </span>
    );
  };

  const GenderLabel = ({ gender }: { gender?: string }) => {
    const map: Record<string, string> = {
      MALE: 'Nam',
      FEMALE: 'Nữ',
      OTHER: 'Khác',
      '': 'Chưa xác định',
    };
    return <>{map[gender || ''] || 'Chưa xác định'}</>;
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">Chi tiết người dùng</h1>
          <p className="admin-page-header__subtitle">Thông tin đầy đủ của {user.username}</p>
        </div>
        <div className="admin-page-header__actions">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-[#7A5C5C]/60 hover:bg-gray-50 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </button>
        </div>
      </header>

      {/* Avatar & Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full bg-[#F9F6F3] overflow-hidden border-4 border-white shadow-lg">
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
            <div className="flex items-center gap-3 mt-3">
              <RoleBadge role={user.role} />
              <TierBadge tier={user.memberTier} />
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <UserIcon size={16} /> Thông tin cá nhân
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Họ tên đầy đủ</span>
              <span className="text-sm font-semibold text-[#7A5C5C]">{user.fullName || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Số điện thoại</span>
              <span className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-1">
                <Phone size={12} /> {user.phoneNumber || '—'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Giới tính</span>
              <span className="text-sm font-semibold text-[#7A5C5C]"><GenderLabel gender={user.gender} /></span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Ngày tham gia</span>
              <span className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-1">
                <Calendar size={12} />
                {new Date(user.createdAt).toLocaleDateString('vi-VN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Cập nhật lần cuối</span>
              <span className="text-sm font-semibold text-[#7A5C5C] flex items-center gap-1">
                <Clock size={12} />
                {user.updatedAt
                  ? new Date(user.updatedAt).toLocaleDateString('vi-VN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })
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
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Địa chỉ</span>
              <span className="text-sm font-semibold text-[#7A5C5C] text-right max-w-[200px]">{user.address || '—'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Tỉnh/Thành phố</span>
              <span className="text-sm font-semibold text-[#7A5C5C]">{user.province || '—'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Quận/Huyện</span>
              <span className="text-sm font-semibold text-[#7A5C5C]">{user.district || '—'}</span>
            </div>
          </div>
        </div>

        {/* Account & Security */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-[#7A5C5C]/60 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Lock size={16} /> Tài khoản & Bảo mật
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Vai trò</span>
              <span><RoleBadge role={user.role} /></span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Xác thực 2 lớp (2FA)</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                user.twoFactorEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <Key size={12} />
                {user.twoFactorEnabled ? 'Đã bật' : 'Tắt'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Trạng thái</span>
              <span><StatusBadge status={user.status} /></span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-xs font-semibold text-[#7A5C5C]/60">Hạng thành viên</span>
              <span><TierBadge tier={user.memberTier} /></span>
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
