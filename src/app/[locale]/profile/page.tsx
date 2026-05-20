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
  Edit2,
  Camera,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { uploadImageToImgBB } from '@/lib/api';
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

  // States for editing personal details (fullName, phone, gender)
  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const [editedFullName, setEditedFullName] = React.useState('');
  const [editedPhone, setEditedPhone] = React.useState('');
  const [editedGender, setEditedGender] = React.useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [detailsSubmitting, setDetailsSubmitting] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = React.useState<string | null>(null);

  // States for UserAddress — normalized address collection
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);
  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  const [editingAddressId, setEditingAddressId] = React.useState<string | null>(null);
  const [addrLabel, setAddrLabel] = React.useState('');
  const [addrFullName, setAddrFullName] = React.useState('');
  const [addrGender, setAddrGender] = React.useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [addrPhoneNumber, setAddrPhoneNumber] = React.useState('');
  const [addrStreet, setAddrStreet] = React.useState('');
  const [addrProvince, setAddrProvince] = React.useState('');
  const [addrDistrict, setAddrDistrict] = React.useState('');
  const [addrSubmitting, setAddrSubmitting] = React.useState(false);
  const [addrError, setAddrError] = React.useState<string | null>(null);

  const [provinces, setProvinces] = React.useState<Array<{ name: string; code: number }>>([]);
  const [districts, setDistricts] = React.useState<Array<{ name: string; code: number }>>([]);
  const [loadingProvinces, setLoadingProvinces] = React.useState(false);
  const [loadingDistricts, setLoadingDistricts] = React.useState(false);

  const fetchAddresses = React.useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await api.get('/user-addresses');
      if (res.data?.success) setAddresses(res.data.data);
    } catch (e) {
      console.error('Failed to fetch addresses:', e);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const openNewAddressForm = () => {
    setEditingAddressId(null);
    setAddrLabel('Địa chỉ của tôi');
    setAddrFullName('');
    setAddrGender('');
    setAddrPhoneNumber('');
    setAddrStreet(''); setAddrProvince(''); setAddrDistrict('');
    setAddrError(null);
    setIsEditingAddress(true);
  };

  const openEditAddressForm = (addr: any) => {
    setEditingAddressId(addr._id);
    setAddrLabel(addr.label || '');
    setAddrFullName(addr.fullName || '');
    setAddrGender(addr.gender || '');
    setAddrPhoneNumber(addr.phoneNumber || '');
    setAddrStreet(addr.address || '');
    setAddrProvince(addr.province || '');
    setAddrDistrict(addr.district || '');
    setAddrError(null);
    setIsEditingAddress(true);
    // Pre-load districts
    if (addr.province && provinces.length > 0) {
      const found = provinces.find((p) => p.name === addr.province);
      if (found) fetchDistricts(found.code);
    }
  };

  const handleSaveAddress = async () => {
    setAddrSubmitting(true);
    setAddrError(null);
    try {
      const payload = {
        label: addrLabel,
        fullName: addrFullName,
        gender: addrGender,
        phoneNumber: addrPhoneNumber,
        address: addrStreet,
        province: addrProvince,
        district: addrDistrict,
      };
      if (editingAddressId) {
        await api.patch(`/user-addresses/${editingAddressId}`, payload);
      } else {
        await api.post('/user-addresses', payload);
      }
      await fetchAddresses();
      setIsEditingAddress(false);
    } catch (err: any) {
      setAddrError(err.response?.data?.message || err.message || 'Lỗi khi lưu địa chỉ');
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    try {
      await api.delete(`/user-addresses/${id}`);
      await fetchAddresses();
    } catch (err: any) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/user-addresses/${id}/set-default`);
      await fetchAddresses();
    } catch (err: any) {
      console.error('Failed to set default:', err);
    }
  };

  // States for orders history
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [ordersError, setOrdersError] = React.useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = React.useState('');
  const [filterEndDate, setFilterEndDate] = React.useState('');
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);

  const fetchOrders = React.useCallback(async (start?: string, end?: string) => {
    setLoadingOrders(true);
    setOrdersError(null);
    try {
      let url = '/orders/my-orders';
      const params: string[] = [];
      if (start) params.push(`startDate=${start}`);
      if (end) params.push(`endDate=${end}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await api.get(url);
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      } else {
        setOrdersError(res.data?.message || 'Không thể lấy dữ liệu đơn hàng');
      }
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setOrdersError(err.response?.data?.message || err.message || 'Lỗi kết nối đến máy chủ');
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const [mounted, setMounted] = React.useState(false);
  const [avatarUploading, setAvatarUploading] = React.useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const imgData = await uploadImageToImgBB(file, { maxWidth: 400, quality: 88 });
      const avatarUrl = imgData.url;
      // Save to backend
      await api.patch('/auth/update-profile', { avatar: avatarUrl });
      // Update Zustand store
      updateUser({ avatar: avatarUrl } as any);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
      // Reset file input
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

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

  React.useEffect(() => {
    if (activeTab === 'orders' && mounted && isAuthenticated) {
      fetchOrders();
    }
    if (activeTab === 'profile' && mounted && isAuthenticated) {
      fetchAddresses();
    }
  }, [activeTab, mounted, isAuthenticated, fetchOrders, fetchAddresses]);


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
              {/* Hidden file input */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />

              {/* Clickable avatar */}
              <div
                className="profile-sidebar-avatar profile-sidebar-avatar-upload"
                onClick={() => !avatarUploading && avatarInputRef.current?.click()}
                title="Bấm để thay đổi ảnh đại diện"
                style={{ cursor: avatarUploading ? 'wait' : 'pointer' }}
              >
                {avatarUploading ? (
                  <Loader2 size={28} color="var(--primary)" strokeWidth={2} className="profile-avatar-spinner" />
                ) : user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <UserIcon size={42} color="var(--primary)" strokeWidth={1.5} />
                )}

                {/* Camera overlay on hover */}
                {!avatarUploading && (
                  <div className="profile-avatar-camera-overlay">
                    <Camera size={18} color="white" strokeWidth={2} />
                  </div>
                )}
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
                    
                    <div className="profile-details-card" style={{ gridColumn: 'span 3' }}>
                      <div className="profile-card-label">Tên tài khoản</div>
                      <div className="profile-card-value">
                        {user.username}
                      </div>
                    </div>


                    <div className="profile-details-card" style={{ gridColumn: 'span 3' }}>
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
                        <div className="profile-card-value" style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>{user.email}</span>
                          <button
                            onClick={() => {
                              setIsEditingEmail(true);
                              setEmailError(null);
                              setEmailSuccess(null);
                            }}
                            className="btn-profile-secondary"
                            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', flexShrink: 0 }}
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                      {emailSuccess && (
                        <div className="profile-alert success" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '0.8rem' }}>
                          {emailSuccess}
                        </div>
                      )}
                    </div>

                    <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
                      <div className="profile-card-label">Vai trò tài khoản</div>
                      <div className="profile-card-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                        {user.role}
                      </div>
                    </div>

                    <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
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

                    <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
                      <div className="profile-card-label">Tham gia hệ thống</div>
                      <div className="profile-card-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} style={{ opacity: 0.7 }} />
                        <span>{formatJoinDate(user.createdAt)}</span>
                      </div>
                    </div>

                  </div>

                  {/* Decorative glass divider */}
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '2rem 0' }} />

                  {/* ── Addresses Section ── */}
                  <div className="profile-section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)' }}>Địa chỉ giao hàng</h2>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>Quản lý địa chỉ nhận hàng của bạn</p>
                    </div>
                    {!isEditingAddress && (
                      <button
                        onClick={() => {
                          // Ensure provinces loaded before opening
                          if (provinces.length === 0) {
                            setLoadingProvinces(true);
                            fetch('https://provinces.open-api.vn/api/')
                              .then((r) => r.json())
                              .then((data) => { setProvinces(data); setLoadingProvinces(false); })
                              .catch(() => setLoadingProvinces(false));
                          }
                          openNewAddressForm();
                        }}
                        className="btn-profile-primary"
                        style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.82rem', gap: '6px' }}
                      >
                        + Thêm địa chỉ
                      </button>
                    )}
                  </div>

                  {/* Address Add/Edit Form */}
                  {isEditingAddress && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 1.2rem 0' }}>
                        {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Nhãn địa chỉ</label>
                          <input type="text" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="VD: Nhà riêng, Công ty..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Họ và tên</label>
                          <input type="text" value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} placeholder="Họ và tên đầy đủ..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Giới tính</label>
                          <select value={addrGender} onChange={(e) => setAddrGender(e.target.value as any)} className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }} disabled={addrSubmitting}>
                            <option value="">Chưa chọn</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Số điện thoại</label>
                          <input type="tel" value={addrPhoneNumber} onChange={(e) => setAddrPhoneNumber(e.target.value)} placeholder="Số điện thoại liên hệ..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                            Tỉnh / Thành phố {loadingProvinces && <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Đang tải...)</span>}
                          </label>
                          <select value={addrProvince} onChange={(e) => { const n = e.target.value; setAddrProvince(n); setAddrDistrict(''); setDistricts([]); const f = provinces.find((p) => p.name === n); if (f) fetchDistricts(f.code); }} className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }} disabled={loadingProvinces || addrSubmitting}>
                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
                            {provinces.map((prov) => (<option key={prov.code} value={prov.name}>{prov.name}</option>))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                            Quận / Huyện {loadingDistricts && <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Đang tải...)</span>}
                          </label>
                          <select value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }} disabled={loadingDistricts || !addrProvince || addrSubmitting}>
                            <option value="">-- Chọn Quận / Huyện --</option>
                            {districts.map((dist) => (<option key={dist.code} value={dist.name}>{dist.name}</option>))}
                          </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Địa chỉ cụ thể</label>
                          <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường, phường/xã..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
                        </div>
                      </div>

                      {addrError && <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#e74c3c', fontWeight: 500 }}>{addrError}</div>}

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
                        <button onClick={handleSaveAddress} disabled={addrSubmitting} className="btn-profile-primary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}>
                          {addrSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </button>
                        <button onClick={() => { setIsEditingAddress(false); setAddrError(null); }} disabled={addrSubmitting} className="btn-profile-secondary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}>
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Address List */}
                  {loadingAddresses ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(122,92,92,0.6)', fontSize: '0.88rem' }}>Đang tải địa chỉ...</div>
                  ) : addresses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <p style={{ color: 'rgba(122,92,92,0.55)', fontSize: '0.88rem', margin: 0 }}>Bạn chưa có địa chỉ giao hàng nào. Bấm <strong>+ Thêm địa chỉ</strong> để thêm mới.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {addresses.map((addr) => (
                        <div key={addr._id} className="profile-order-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--content)' }}>{addr.label}</span>
                                {addr.isDefault && (
                                  <span style={{ background: 'rgba(212,165,165,0.15)', color: 'var(--primary)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase' }}>Mặc định</span>
                                )}
                                {addr.gender && (
                                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                                    {addr.gender === 'MALE' ? '♂ Nam' : addr.gender === 'FEMALE' ? '♀ Nữ' : 'Khác'}
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'rgba(122,92,92,0.7)', margin: '0 0 2px 0' }}>
                                {addr.fullName || 'Chưa có tên'} · {addr.phoneNumber || 'Chưa có SĐT'}
                              </p>
                              <p style={{ fontSize: '0.82rem', color: 'rgba(122,92,92,0.55)', margin: 0 }}>
                                {[addr.address, addr.district, addr.province].filter(Boolean).join(', ') || 'Chưa nhập địa chỉ cụ thể'}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefault(addr._id)} className="btn-profile-secondary" style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem' }} title="Đặt làm mặc định">
                                  Mặc định
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (provinces.length === 0) {
                                    setLoadingProvinces(true);
                                    fetch('https://provinces.open-api.vn/api/')
                                      .then((r) => r.json())
                                      .then((data) => { setProvinces(data); setLoadingProvinces(false); openEditAddressForm(addr); })
                                      .catch(() => { setLoadingProvinces(false); openEditAddressForm(addr); });
                                  } else {
                                    openEditAddressForm(addr);
                                  }
                                }}
                                className="btn-profile-secondary"
                                style={{ padding: '6px', borderRadius: '50%', display: 'flex', width: '30px', height: '30px' }}
                                title="Chỉnh sửa"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleDeleteAddress(addr._id)} className="btn-profile-secondary" style={{ padding: '6px', borderRadius: '50%', display: 'flex', width: '30px', height: '30px', color: '#e74c3c' }} title="Xóa">
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
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

                  {/* 1. Date Filter Bar */}
                  <div className="profile-order-filter-bar">
                    <div className="profile-filter-input-group">
                      <label>Từ ngày</label>
                      <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => setFilterStartDate(e.target.value)}
                        className="profile-filter-input"
                      />
                    </div>
                    <div className="profile-filter-input-group">
                      <label>Đến ngày</label>
                      <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => setFilterEndDate(e.target.value)}
                        className="profile-filter-input"
                      />
                    </div>
                    <div className="profile-filter-actions">
                      <button
                        onClick={() => fetchOrders(filterStartDate, filterEndDate)}
                        className="btn-profile-primary"
                        style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                      >
                        Lọc ngày
                      </button>
                      <button
                        onClick={() => {
                          setFilterStartDate('');
                          setFilterEndDate('');
                          fetchOrders('', '');
                        }}
                        className="btn-profile-secondary"
                        style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}
                      >
                        Xóa bộ lọc
                      </button>
                    </div>
                  </div>

                  {/* 2. Orders Content */}
                  {loadingOrders ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0', color: 'rgba(122, 92, 92, 0.6)' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Đang tải lịch sử đơn hàng...</span>
                    </div>
                  ) : ordersError ? (
                    <div className="profile-alert danger" style={{ margin: '1.5rem 0' }}>
                      {ordersError}
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.3)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.5)' }}>
                      <ShoppingBag size={48} strokeWidth={1} style={{ color: 'var(--primary)', marginBottom: '1rem', opacity: 0.8 }} />
                      <h3 style={{ fontFamily: 'var(--font-heading), serif', fontSize: '1.2rem', color: 'var(--content)', margin: '0 0 8px 0' }}>Không tìm thấy đơn hàng nào</h3>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(122, 92, 92, 0.6)', margin: 0, textAlign: 'center' }}>
                        {(filterStartDate || filterEndDate) ? 'Không có đơn hàng nào khớp với khoảng thời gian lọc.' : 'Bạn chưa thực hiện bất kỳ giao dịch nào trên hệ thống.'}
                      </p>
                    </div>
                  ) : (
                    <div className="profile-order-list">
                      {orders.map((order) => {
                        const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        });
                        
                        const displayStatus = 
                          order.status === 'delivered' ? 'Đã giao hàng' : 
                          order.status === 'pending' ? 'Chờ xử lý' :
                          order.status === 'processing' ? 'Đang xử lý' :
                          order.status === 'shipped' ? 'Đang giao' : 'Đã hủy';

                        // Format total amount to VND
                        const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0);

                        // Primary item or multiple items text - safe access
                        const items = Array.isArray(order.items) ? order.items : [];
                        const firstItemName = items[0]?.name || items[0]?.productName || 'Sản phẩm nước hoa';
                        const itemsCount = items.length;
                        const displayTitle = itemsCount > 1 ? `${firstItemName} và ${itemsCount - 1} sản phẩm khác` : firstItemName;

                        return (
                          <div 
                            key={order._id} 
                            className="profile-order-item"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedOrder(order)}
                          >
                            <div className="profile-order-info">
                              <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{displayTitle}</span>
                              </h4>
                              <p>
                                Mã đơn: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{order._id.substring(order._id.length - 8).toUpperCase()}</span> | Ngày mua: {formattedDate} | Tổng tiền: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formattedTotal}</span>
                              </p>
                            </div>
                            <div className={`profile-order-status ${order.status}`}>
                              {displayStatus}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

      {/* 3. Detail Order Modal Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="profile-modal-overlay"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="profile-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="profile-modal-header">
                <h2>Chi tiết đơn hàng</h2>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="profile-modal-close-btn"
                >
                  &times;
                </button>
              </div>

              <div className="profile-modal-body">
                
                {/* Section 1: General Info */}
                <div className="profile-modal-section">
                  <h3>Thông tin chung</h3>
                  <div className="profile-modal-info-grid">
                    <div className="profile-info-item">
                      <span className="profile-info-label">Mã đơn hàng</span>
                      <span className="profile-info-value" style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 700 }}>
                        {selectedOrder._id.toUpperCase()}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Trạng thái</span>
                      <span className={`profile-order-status ${selectedOrder.status}`} style={{ alignSelf: 'flex-start', marginTop: '2px' }}>
                        {selectedOrder.status === 'delivered' ? 'Đã giao hàng' : 
                         selectedOrder.status === 'pending' ? 'Chờ xử lý' :
                         selectedOrder.status === 'processing' ? 'Đang xử lý' :
                         selectedOrder.status === 'shipped' ? 'Đang giao' : 'Đã hủy'}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Ngày đặt hàng</span>
                      <span className="profile-info-value">
                        {new Date(selectedOrder.createdAt).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Phương thức nhận hàng</span>
                      <span className="profile-info-value">Giao hàng tận nơi</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Customer details */}
                <div className="profile-modal-section">
                  <h3>Thông tin giao hàng</h3>
                  <div className="profile-modal-info-grid">
                    <div className="profile-info-item" style={{ gridColumn: 'span 2' }}>
                      <span className="profile-info-label">Họ và tên người nhận</span>
                      <span className="profile-info-value">{selectedOrder.customerName}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Số điện thoại</span>
                      <span className="profile-info-value">{selectedOrder.customerPhone || 'Chưa cung cấp'}</span>
                    </div>
                    <div className="profile-info-item">
                      <span className="profile-info-label">Địa chỉ email</span>
                      <span className="profile-info-value">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="profile-info-item" style={{ gridColumn: 'span 2' }}>
                      <span className="profile-info-label">Địa chỉ cụ thể</span>
                      <span className="profile-info-value" style={{ lineHeight: '1.4' }}>
                        {selectedOrder.customerAddress || 'Giao theo thông tin đăng ký hồ sơ'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 3: Order Items */}
                <div className="profile-modal-section">
                  <h3>Sản phẩm đã mua</h3>
                  <div className="profile-modal-items">
                    {(Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0) ? (
                      selectedOrder.items.map((item: any, idx: number) => {
                        const itemTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((item.price || 0) * (item.quantity || 1));
                        const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0);
                        const itemName = item.name || item.productName || 'Sản phẩm';
                        const itemImage = item.image || item.imageUrl || 'https://i.ibb.co/qFf0N0kH/perfume1.webp';
                        
                        return (
                          <div key={idx} className="profile-modal-item-row">
                            <img 
                              src={itemImage} 
                              alt={itemName} 
                              className="profile-modal-item-img"
                            />
                            <div className="profile-modal-item-details">
                              <div className="profile-modal-item-name">{itemName}</div>
                              <div className="profile-modal-item-meta">
                                Số lượng: {item.quantity || 1} &times; {formattedPrice}
                              </div>
                            </div>
                            <div className="profile-modal-item-price">
                              {itemTotal}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                        Không có thông tin chi tiết sản phẩm
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 4: Payment summary */}
                <div className="profile-modal-summary">
                  <div className="profile-summary-row">
                    <span>Tạm tính</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}</span>
                  </div>
                  <div className="profile-summary-row">
                    <span>Phí vận chuyển</span>
                    <span style={{ color: '#27ae60', fontWeight: 600 }}>
                      {selectedOrder.shippingFee ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.shippingFee) : 'Miễn phí'}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="profile-summary-row">
                      <span>Giảm giá</span>
                      <span style={{ color: '#e74c3c', fontWeight: 600 }}>
                        -{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.discount)}
                      </span>
                    </div>
                  )}
                  <div className="profile-summary-row total">
                    <span>Tổng tiền thanh toán</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
