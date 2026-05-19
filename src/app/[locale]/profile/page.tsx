'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/navigation';
import { 
  LogOut, 
  LayoutDashboard, 
  User as UserIcon, 
  Mail, 
  Shield, 
  Settings, 
  ShoppingBag, 
  Heart, 
  Copy, 
  Check, 
  Calendar,
  Lock,
  KeyRound,
  Fingerprint,
  UserCheck,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import './profile.css';

type ActiveTab = 'profile' | 'orders' | 'security' | 'settings';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, accessToken, updateUser } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('profile');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedTenant, setCopiedTenant] = React.useState(false);

  // States for editing name
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState('');
  const [editingSubmitting, setEditingSubmitting] = React.useState(false);
  const [editingError, setEditingError] = React.useState<string | null>(null);
  const [editingSuccess, setEditingSuccess] = React.useState<string | null>(null);

  // States for editing email
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [editedEmail, setEditedEmail] = React.useState('');
  const [emailSubmitting, setEmailSubmitting] = React.useState(false);
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = React.useState<string | null>(null);

  // States for editing additional details
  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const [editedFullName, setEditedFullName] = React.useState('');
  const [editedPhone, setEditedPhone] = React.useState('');
  const [editedGender, setEditedGender] = React.useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [editedAddress, setEditedAddress] = React.useState('');
  const [editedProvince, setEditedProvince] = React.useState('');
  const [editedDistrict, setEditedDistrict] = React.useState('');

  const [provinces, setProvinces] = React.useState<Array<{ name: string; code: number }>>([]);
  const [districts, setDistricts] = React.useState<Array<{ name: string; code: number }>>([]);
  const [loadingProvinces, setLoadingProvinces] = React.useState(false);
  const [loadingDistricts, setLoadingDistricts] = React.useState(false);
  const [detailsSubmitting, setDetailsSubmitting] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = React.useState<string | null>(null);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  React.useEffect(() => {
    if (user) {
      setEditedName(user.username);
      setEditedEmail(user.email);
      setEditedFullName((user as any).fullName || '');
      setEditedPhone((user as any).phoneNumber || '');
      setEditedGender(((user as any).gender as any) || '');
      setEditedAddress((user as any).address || '');
      setEditedProvince((user as any).province || '');
      setEditedDistrict((user as any).district || '');
    }
  }, [user]);


  React.useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.success) {
          updateUser(res.data.data);
        }
      } catch (err) {
        console.error('Failed to sync profile with database:', err);
      }
    };

    if (mounted && isAuthenticated) {
      fetchLatestProfile();
    }
  }, [mounted, isAuthenticated]);

  const fetchDistricts = (provinceCode: number) => {
    setLoadingDistricts(true);
    fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setDistricts(data.districts || []);
        setLoadingDistricts(false);
      })
      .catch((err) => {
        console.error('Failed to fetch districts:', err);
        setLoadingDistricts(false);
      });
  };

  // Fetch provinces and districts from open-api.vn
  React.useEffect(() => {
    if (isEditingDetails && provinces.length === 0) {
      setLoadingProvinces(true);
      fetch('https://provinces.open-api.vn/api/')
        .then((res) => res.json())
        .then((data) => {
          setProvinces(data);
          setLoadingProvinces(false);
          
          if (editedProvince) {
            const foundProvince = data.find((p: any) => p.name === editedProvince);
            if (foundProvince) {
              fetchDistricts(foundProvince.code);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to fetch provinces:', err);
          setLoadingProvinces(false);
        });
    }
  }, [isEditingDetails]);


  if (!mounted || !isAuthenticated || !user) {
    return null; // Wait for client hydration or redirect
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleCopy = (text: string, type: 'id' | 'tenant') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedTenant(true);
      setTimeout(() => setCopiedTenant(false), 2000);
    }
  };

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
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối';
      setEditingError(errMsg);
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
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối';
      setEmailError(errMsg);
    } finally {
      setEmailSubmitting(false);
    }
  };

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



  const handleUpdateDetails = async () => {
    setDetailsError(null);
    setDetailsSuccess(null);
    setDetailsSubmitting(true);

    try {
      const res = await api.patch('/auth/update-profile', {
        fullName: editedFullName.trim(),
        phoneNumber: editedPhone.trim(),
        gender: editedGender,
        address: editedAddress.trim(),
        province: editedProvince,
        district: editedDistrict
      });

      if (res.data && res.data.success) {
        updateUser({
          fullName: editedFullName.trim(),
          phoneNumber: editedPhone.trim(),
          gender: editedGender,
          address: editedAddress.trim(),
          province: editedProvince,
          district: editedDistrict
        } as any);
        setDetailsSuccess('Cập nhật thông tin chi tiết thành công!');
        setIsEditingDetails(false);
        setTimeout(() => setDetailsSuccess(null), 3000);
      } else {
        setDetailsError(res.data?.message || 'Lỗi khi cập nhật thông tin');
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Lỗi kết nối';
      setDetailsError(errMsg);
    } finally {
      setDetailsSubmitting(false);
    }
  };

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUBADMIN';


  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return 'Tháng 5, 2026';
    try {
      const date = new Date(dateStr);
      return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
    } catch (e) {
      return 'Tháng 5, 2026';
    }
  };

  // Sidebar Menu Configuration
  const menuItems = [
    { id: 'profile' as ActiveTab, name: 'Thông tin cá nhân', icon: UserIcon },
    { id: 'orders' as ActiveTab, name: 'Lịch sử mua sắm', icon: ShoppingBag },
    { id: 'security' as ActiveTab, name: 'Bảo mật & Xác thực', icon: Lock },
    { id: 'settings' as ActiveTab, name: 'Thiết lập hệ thống', icon: Settings },
  ];

  return (
    <div className="profile-page-shell">
      {/* Decorative background blur blobs */}
      <div className="profile-bubble-1" />
      <div className="profile-bubble-2" />

      <div className="profile-container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="profile-dashboard-layout"
        >
          
          {/* 1. Left Sidebar Panel */}
          <aside className="profile-dashboard-sidebar">
            
            {/* User Profiler block */}
            <div className="profile-sidebar-user">
              <div className="profile-sidebar-avatar">
                <UserIcon size={42} color="var(--primary)" strokeWidth={1.5} />
              </div>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
              <div className={`profile-sidebar-role ${isAdmin ? 'admin' : 'user'}`}>
                <Shield size={12} strokeWidth={2.5} />
                {user.role}
              </div>
            </div>

            {/* Menu Tabs Navigation */}
            <nav className="profile-dashboard-menu">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setStatusMessage(null);
                  }}
                  className={`profile-dashboard-menu-item ${activeTab === item.id ? 'active' : ''}`}
                >
                  <item.icon size={18} strokeWidth={2} />
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Actions Footer */}
            <div className="profile-sidebar-footer">
              {isAdmin && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="btn-profile-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LayoutDashboard size={16} strokeWidth={2.5} />
                  Vào Dashboard
                </button>
              )}
              <button 
                onClick={handleLogout}
                className="btn-profile-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <LogOut size={16} strokeWidth={2.5} />
                Đăng xuất
              </button>
            </div>

          </aside>

          {/* 2. Right Main Content Workspace */}
          <main className="profile-dashboard-content">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: PROFILE PERSONAL DETAILS */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%' }}
                >
                  <div className="profile-section-header">
                    <h1>Thông tin cá nhân</h1>
                    <p>Quản lý và xem chi tiết hồ sơ tài khoản L&apos;essence của bạn</p>
                  </div>

                  <div className="profile-grid-details">
                    
                    <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
                      <div className="profile-card-label">Tên tài khoản</div>
                      <div className="profile-card-value">
                        {user.username}
                      </div>
                    </div>


                    <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
                      <div className="profile-card-label">Địa chỉ email</div>
                      {isEditingEmail ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '6px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input
                              type="email"
                              value={editedEmail}
                              onChange={(e) => setEditedEmail(e.target.value)}
                              className="profile-form-input"
                              style={{ flexGrow: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                              disabled={emailSubmitting}
                              placeholder="Nhập email mới..."
                              autoFocus
                            />
                            <button
                              onClick={handleUpdateEmail}
                              disabled={emailSubmitting}
                              className="btn-profile-primary"
                              style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                              {emailSubmitting ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingEmail(false);
                                setEditedEmail(user.email);
                                setEmailError(null);
                              }}
                              disabled={emailSubmitting}
                              className="btn-profile-secondary"
                              style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                            >
                              Hủy
                            </button>
                          </div>
                          {emailError && (
                            <span style={{ fontSize: '0.78rem', color: '#e74c3c', fontWeight: 500 }}>
                              {emailError}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="profile-card-value" style={{ justifyContent: 'space-between', width: '100%' }}>
                          <span>{user.email}</span>
                          <button
                            onClick={() => {
                              setIsEditingEmail(true);
                              setEmailError(null);
                              setEmailSuccess(null);
                            }}
                            className="btn-profile-secondary"
                            style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit2 size={12} />
                            Chỉnh sửa
                          </button>
                        </div>
                      )}
                      {emailSuccess && (
                        <div className="profile-alert success" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '0.8rem' }}>
                          {emailSuccess}
                        </div>
                      )}
                    </div>

                    <div className="profile-details-card">
                      <div className="profile-card-label">Vai trò tài khoản</div>
                      <div className="profile-card-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {user.role}
                      </div>
                    </div>

                    <div className="profile-details-card">
                      <div className="profile-card-label">Hạng thành viên</div>
                      <div className="profile-card-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {user.memberTier || 'MEMBER'}
                        {user.memberTier === 'ELITE MEMBER' && (
                          <Heart size={14} style={{ fill: 'var(--primary)', stroke: 'var(--primary)' }} />
                        )}
                        {user.memberTier === 'VIP' && (
                          <span style={{ fontSize: '14px' }}>👑</span>
                        )}
                      </div>
                    </div>

                    <div className="profile-details-card">
                      <div className="profile-card-label">Tham gia hệ thống</div>
                      <div className="profile-card-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} style={{ opacity: 0.7 }} />
                        <span>{formatJoinDate(user.createdAt)}</span>
                      </div>
                    </div>

                  </div>

                  {/* Decorative glass divider */}
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '2rem 0' }} />

                  <div className="profile-section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)' }}>Thông tin liên hệ & Địa chỉ</h2>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>Cung cấp thông tin đầy đủ để L&apos;essence phục vụ giao hàng tốt nhất</p>
                    </div>
                    {!isEditingDetails && (
                      <button
                        onClick={() => {
                          setIsEditingDetails(true);
                          setDetailsError(null);
                          setDetailsSuccess(null);
                        }}
                        className="btn-profile-secondary"
                        style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit2 size={14} />
                        Cập nhật
                      </button>
                    )}
                  </div>

                  {detailsSuccess && (
                    <div className="profile-alert success" style={{ marginBottom: '1.5rem', padding: '10px 14px', fontSize: '0.85rem' }}>
                      {detailsSuccess}
                    </div>
                  )}

                  {isEditingDetails ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.2rem' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Họ và tên</label>
                          <input
                            type="text"
                            value={editedFullName}
                            onChange={(e) => setEditedFullName(e.target.value)}
                            placeholder="Nhập họ và tên của bạn..."
                            className="profile-form-input"
                            style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                            disabled={detailsSubmitting}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Số điện thoại</label>
                          <input
                            type="tel"
                            value={editedPhone}
                            onChange={(e) => setEditedPhone(e.target.value)}
                            placeholder="Nhập số điện thoại..."
                            className="profile-form-input"
                            style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                            disabled={detailsSubmitting}
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Giới tính</label>
                          <select
                            value={editedGender}
                            onChange={(e) => setEditedGender(e.target.value as any)}
                            className="profile-form-input"
                            style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }}
                            disabled={detailsSubmitting}
                          >
                            <option value="">Chưa chọn</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                            Tỉnh / Thành phố {loadingProvinces && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Đang tải...)</span>}
                          </label>
                          <select
                            value={editedProvince}
                            onChange={(e) => {
                              const provinceName = e.target.value;
                              setEditedProvince(provinceName);
                              setEditedDistrict('');
                              setDistricts([]);
                              const foundProvince = provinces.find((p) => p.name === provinceName);
                              if (foundProvince) {
                                fetchDistricts(foundProvince.code);
                              }
                            }}
                            className="profile-form-input"
                            style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }}
                            disabled={loadingProvinces || detailsSubmitting}
                          >
                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                            {provinces.map((prov) => (
                              <option key={prov.code} value={prov.name}>
                                {prov.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>
                            Quận / Huyện {loadingDistricts && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Đang tải...)</span>}
                          </label>
                          <select
                            value={editedDistrict}
                            onChange={(e) => setEditedDistrict(e.target.value)}
                            className="profile-form-input"
                            style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }}
                            disabled={loadingDistricts || !editedProvince || detailsSubmitting}
                          >
                            <option value="">-- Chọn Quận / Huyện --</option>
                            {districts.map((dist) => (
                              <option key={dist.code} value={dist.name}>
                                {dist.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}>Địa chỉ cụ thể</label>
                          <input
                            type="text"
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            placeholder="Số nhà, tên đường, phường/xã..."
                            className="profile-form-input"
                            style={{ padding: '10px 14px', fontSize: '0.9rem' }}
                            disabled={detailsSubmitting}
                          />
                        </div>

                      </div>

                      {detailsError && (
                        <div style={{ fontSize: '0.82rem', color: '#e74c3c', fontWeight: 500 }}>
                          {detailsError}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button
                          onClick={handleUpdateDetails}
                          disabled={detailsSubmitting}
                          className="btn-profile-primary"
                          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                        >
                          {detailsSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingDetails(false);
                            setDetailsError(null);
                            setEditedFullName((user as any).fullName || '');
                            setEditedPhone((user as any).phoneNumber || '');
                            setEditedGender(((user as any).gender as any) || '');
                            setEditedAddress((user as any).address || '');
                            setEditedProvince((user as any).province || '');
                            setEditedDistrict((user as any).district || '');
                          }}
                          disabled={detailsSubmitting}
                          className="btn-profile-secondary"
                          style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                        >
                          Hủy
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="profile-grid-details" style={{ gap: '1.2rem' }}>
                      
                      <div className="profile-details-card">
                        <div className="profile-card-label">Họ và tên</div>
                        <div className="profile-card-value">{(user as any).fullName || 'Chưa cập nhật'}</div>
                      </div>

                      <div className="profile-details-card">
                        <div className="profile-card-label">Số điện thoại</div>
                        <div className="profile-card-value">{(user as any).phoneNumber || 'Chưa cập nhật'}</div>
                      </div>

                      <div className="profile-details-card">
                        <div className="profile-card-label">Giới tính</div>
                        <div className="profile-card-value">
                          {(user as any).gender === 'MALE' ? 'Nam' : (user as any).gender === 'FEMALE' ? 'Nữ' : (user as any).gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                        </div>
                      </div>

                      <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
                        <div className="profile-card-label">Địa chỉ đầy đủ</div>
                        <div className="profile-card-value">
                          {(user as any).province ? (
                            `${(user as any).address ? `${(user as any).address}, ` : ''}${(user as any).district}, ${(user as any).province}`
                          ) : (
                            'Chưa cập nhật'
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </motion.div>
              )}


              {/* TAB 2: PURCHASE HISTORY (ORDERS) */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%' }}
                >
                  <div className="profile-section-header">
                    <h1>Lịch sử mua sắm</h1>
                    <p>Danh sách các mùi hương sang trọng bạn đã sở hữu</p>
                  </div>

                  <div className="profile-order-list">
                    {[
                      { id: 'ORD-94819', date: '12/04/2026', total: '2.450.000đ', name: 'L\'essence Royal Amber - 100ml', status: 'delivered', statusText: 'Đã giao hàng' },
                      { id: 'ORD-93012', date: '01/03/2026', total: '1.890.000đ', name: 'Midnight Rose Gold - 50ml', status: 'delivered', statusText: 'Đã giao hàng' },
                      { id: 'ORD-89412', date: '15/01/2026', total: '3.120.000đ', name: 'Imperial Leather & Suede - 100ml', status: 'delivered', statusText: 'Đã giao hàng' },
                      { id: 'ORD-81045', date: '28/11/2025', total: '2.600.000đ', name: 'Citrus Sensation Cologne - 100ml', status: 'delivered', statusText: 'Đã giao hàng' },
                    ].map((order) => (
                      <div key={order.id} className="profile-order-item">
                        <div className="profile-order-info">
                          <h4>{order.name}</h4>
                          <p>Mã đơn: {order.id} | Ngày mua: {order.date} | Tổng tiền: {order.total}</p>
                        </div>
                        <div className={`profile-order-status ${order.status}`}>
                          {order.statusText}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SECURITY & AUTHENTICATION */}
              {activeTab === 'security' && (
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
              )}

              {/* TAB 4: SYSTEM SETTINGS */}
              {activeTab === 'settings' && (
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
                        <h4>Xác thực 2 yếu tố (2FA Status)</h4>
                        <p>Yêu cầu OTP khi đăng nhập từ thiết bị lạ</p>
                      </div>
                      <span className="profile-badge-status" style={{ background: 'rgba(212,165,165,0.12)', color: 'var(--primary)' }}>ƯU TIÊN</span>
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
              )}

            </AnimatePresence>
          </main>

        </motion.div>
      </div>
    </div>
  );
}
