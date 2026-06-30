'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileAddresses } from '@/hooks/profile/useProfileAddresses';
import { getMe, updateProfile, changePassword } from '@/services/user.service';
import { getMyOrders } from '@/services/order.service';
import { User, Mail, Shield, MapPin, ShoppingBag, Key, LogOut, Plus, Edit2, Trash2, Check, Crown, DollarSign, Phone, UserRound, Globe, Building2, LayoutDashboard } from 'lucide-react';
import { getBackendOrigin } from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, accessToken, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('info');
  const {
    addresses,
    loadingAddresses,
    isEditingAddress,
    setIsEditingAddress,
    editingAddressId,
    addrLabel,
    setAddrLabel,
    addrFullName,
    setAddrFullName,
    addrGender,
    setAddrGender,
    addrPhoneNumber,
    setAddrPhoneNumber,
    addrStreet,
    setAddrStreet,
    addrProvince,
    setAddrProvince,
    addrDistrict,
    setAddrDistrict,
    addrSubmitting,
    addrError,
    setAddrError,
    deleteError,
    setDeleteError,
    provinces,
    districts,
    loadingProvinces,
    loadingDistricts,
    fetchAddresses,
    openNewAddressForm,
    openEditAddressForm,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefault,
    fetchDistricts,
  } = useProfileAddresses();

  // Info editing state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [editAddress, setEditAddress] = useState('');
  const [editProvince, setEditProvince] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSort, setOrderSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Fetch full profile on mount
  useEffect(() => {
    if (!accessToken) return;
    getMe(accessToken).then(res => {
      if (res.success && res.data) {
        updateUser(res.data);
      }
    }).catch(() => {});
  }, [accessToken]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'dashboard') {
      fetchOrders();
    }
    if (tabId === 'addresses') {
      fetchAddresses();
    }
    if (tabId === 'orders') {
      fetchOrders();
    }
  };

  const handleProvinceChange = (provinceName: string) => {
    setAddrProvince(provinceName);
    setAddrDistrict('');
    const found = provinces.find((p) => p.name === provinceName);
    if (found) fetchDistricts(found.code);
  };

  const startEditInfo = () => {
    setEditFullName(user.fullName || '');
    setEditPhone(user.phoneNumber || '');
    setEditGender((user.gender as 'MALE' | 'FEMALE' | 'OTHER' | '') || '');
    setEditAddress(user.address || '');
    setEditProvince(user.province || '');
    setEditDistrict(user.district || '');
    setIsEditingInfo(true);
    setInfoError('');
    setInfoSuccess('');
  };

  const saveInfo = async () => {
    setInfoSaving(true);
    setInfoError('');
    setInfoSuccess('');
    try {
      const res = await updateProfile(accessToken, {
        fullName: editFullName,
        phoneNumber: editPhone,
        gender: editGender || undefined,
        address: editAddress,
        province: editProvince,
        district: editDistrict,
      });
      if (res.success) {
        updateUser(res.data);
        setInfoSuccess('Cập nhật thành công!');
        setIsEditingInfo(false);
      } else {
        setInfoError(res.message || 'Cập nhật thất bại');
      }
    } catch (e: any) {
      setInfoError(e.message || 'Cập nhật thất bại');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!accessToken) return;
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng nhập đầy đủ các trường');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await changePassword(accessToken, currentPassword, newPassword);
      if (res.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message || 'Đổi mật khẩu thất bại');
      }
    } catch (e: any) {
      setPasswordError(e.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPasswordSaving(false);
    }
  };

  const fetchOrders = async () => {
    if (!accessToken) return;
    setLoadingOrders(true);
    setOrdersError('');
    try {
      const res = await getMyOrders(accessToken);
      if (res.success) {
        setOrders(res.data || []);
      } else {
        setOrdersError(res.message || 'Không thể tải đơn hàng');
      }
    } catch (e: any) {
      setOrdersError(e.message || 'Không thể tải đơn hàng');
    } finally {
      setLoadingOrders(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const statusLabel: Record<string, string> = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const memberTierLabel: Record<string, string> = {
    MEMBER: 'Thành viên',
    Bac: 'Bạc',
    Vang: 'Vàng',
    KimCuong: 'Kim Cương',
  };

  const tierColor: Record<string, string> = {
    MEMBER: 'text-text-secondary',
    Bac: 'text-gray-400',
    Vang: 'text-yellow-500',
    KimCuong: 'text-cyan-400',
  };

  if (!user) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Vui lòng đăng nhập</h1>
          <a href={getBackendOrigin() + '/api/auth/login'} className="text-primary hover:text-primary-dark">Đăng nhập</a>
        </div>
      </div>
    );
  }

  const isOAuth = user.oauthProvider === 'google';
  const menuItems = [
    { id: 'dashboard', label: 'Vào Dashboard', icon: LayoutDashboard },
    { id: 'info', label: 'Thông tin', icon: User },
    { id: 'addresses', label: 'Địa chỉ', icon: MapPin },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
    ...(isOAuth ? [] : [{ id: 'password', label: 'Mật khẩu', icon: Key }]),
  ];
  return (
    <div className="h-full bg-background text-foreground overflow-hidden px-4 pt-6 pb-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col bg-surface rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">{user.username[0].toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-primary tracking-tight">{user.username}</h1>
                {user.memberTier && user.memberTier !== 'MEMBER' && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tierColor[user.memberTier] || 'text-text-secondary'} bg-surface border border-border`}>
                    <Crown size={12} /> {memberTierLabel[user.memberTier] || user.memberTier}
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-sm mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Main Content – Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar – Menu */}
          <div className="w-64 flex-shrink-0 bg-surface border-r border-border p-4 flex flex-col">
            <nav className="space-y-1 flex-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={item.id === 'dashboard' ? () => { const token = accessToken; if (token) { window.location.href = getBackendOrigin().replace(/\/+$/, '') + '/api/auth/set-admin-session?token=' + encodeURIComponent(token); } } : () => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary text-rich-black'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background/50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
            </nav>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-auto"
            >
              <LogOut size={18} />
              Đăng xuất
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 overflow-y-auto bg-background/30">
            <div className="px-4 py-6 md:py-8">



              {activeTab === 'info' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-text-primary">Thông tin tài khoản</h2>
                    {!isEditingInfo && (
                      <button onClick={startEditInfo} className="flex items-center gap-2 px-4 py-2 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                        <Edit2 size={16} /> Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {infoSuccess && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">{infoSuccess}</div>}
                  {infoError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{infoError}</div>}

                  {isEditingInfo ? (
                    <div className="space-y-4 p-5 rounded-xl bg-surface border border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Họ và tên</label>
                          <input type="text" value={editFullName} onChange={e => setEditFullName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Số điện thoại</label>
                          <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="0912 345 678" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Giới tính</label>
                          <select value={editGender} onChange={e => setEditGender(e.target.value as any)} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Địa chỉ</label>
                          <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Số nhà, tên đường" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Tỉnh/Thành phố</label>
                          <input type="text" value={editProvince} onChange={e => setEditProvince(e.target.value)} placeholder="Hồ Chí Minh" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Quận/Huyện</label>
                          <input type="text" value={editDistrict} onChange={e => setEditDistrict(e.target.value)} placeholder="Quận 1" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={saveInfo} disabled={infoSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                          <Check size={16} /> {infoSaving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button onClick={() => { setIsEditingInfo(false); setInfoError(''); }} className="px-5 py-2.5 bg-surface border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-background transition-colors">Hủy</button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoRow icon={User} label="Tên đăng nhập" value={user.username} />
                      <InfoRow icon={Mail} label="Email" value={user.email} />
                      <InfoRow icon={Shield} label="Vai trò" value={user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'SUBADMIN' ? 'Quản lý' : 'Người dùng'} />
                      <InfoRow icon={Crown} label="Hạng thành viên" value={memberTierLabel[user.memberTier || 'MEMBER'] || user.memberTier || 'Thành viên'} />
                      <InfoRow icon={DollarSign} label="Tổng chi tiêu" value={user.totalSpent ? formatPrice(user.totalSpent) : '0 ₫'} />
                      <InfoRow icon={UserRound} label="Họ và tên" value={user.fullName || user.defaultAddress?.fullName || 'Chưa cập nhật'} />
                      <InfoRow icon={Phone} label="Số điện thoại" value={user.phoneNumber || user.defaultAddress?.phoneNumber || 'Chưa cập nhật'} />
                      <InfoRow icon={UserRound} label="Giới tính" value={user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : user.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'} />
                      <div className="md:col-span-2">
                        <InfoRow icon={Building2} label="Địa chỉ" value={user.address || user.defaultAddress?.address || 'Chưa cập nhật'} />
                      </div>
                      <InfoRow icon={Globe} label="Tỉnh/Thành phố" value={user.province || user.defaultAddress?.province || 'Chưa cập nhật'} />
                      <InfoRow icon={Globe} label="Quận/Huyện" value={user.district || user.defaultAddress?.district || 'Chưa cập nhật'} />
                      <div className="md:col-span-2">
                        <InfoRow icon={Globe} label="Đăng nhập qua" value={user.oauthProvider === 'google' ? 'Google' : 'Tài khoản website'} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============ ADMIN DASHBOARD LINK ============ */}
              {(user?.role === 'ADMIN' || user?.role === 'SUBADMIN') && activeTab === 'info' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                        <LayoutDashboard size={20} />
                        Bảng điều khiển Quản trị
                      </h3>
                      <p className="text-sm text-amber-600 mt-1">Quản lý sản phẩm, đơn hàng, người dùng và hơn thế nữa</p>
                    </div>
                    <button
                      onClick={() => {
                        const token = accessToken;
                        if (token) {
                          const backendUrl = getBackendOrigin();
                          window.location.href = backendUrl.replace(/\/+$/, "") + "/api/auth/set-admin-session?token=" + encodeURIComponent(token);
                        }
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      Đi đến Dashboard
                    </button>
                  </div>
                </div>
              )}

              {/* ============ TAB: ADDRESSES ============ */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-text-primary">Địa chỉ giao hàng</h2>
                    {!isEditingAddress && (
                      <button onClick={openNewAddressForm} className="flex items-center gap-2 px-4 py-2 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                        <Plus size={16} /> Thêm địa chỉ
                      </button>
                    )}
                  </div>

                  {isEditingAddress && (
                    <div className="p-6 rounded-xl bg-surface border border-border space-y-4">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
                      </h3>
                      {addrError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{addrError}</div>}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Label</label>
                          <input type="text" value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder="Ví dụ: Nhà riêng, Văn phòng" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Họ và tên</label>
                          <input type="text" value={addrFullName} onChange={e => setAddrFullName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Giới tính</label>
                          <select value={addrGender} onChange={e => setAddrGender(e.target.value as any)} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Số điện thoại</label>
                          <input type="tel" value={addrPhoneNumber} onChange={e => setAddrPhoneNumber(e.target.value)} placeholder="0912 345 678" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-text-primary mb-2">Địa chỉ</label>
                          <input type="text" value={addrStreet} onChange={e => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Tỉnh/Thành phố</label>
                          <select value={addrProvince} onChange={e => handleProvinceChange(e.target.value)} disabled={loadingProvinces} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
                            <option value="">Chọn tỉnh/thành</option>
                            {provinces.map(p => <option key={p.code} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Quận/Huyện</label>
                          <select value={addrDistrict} onChange={e => setAddrDistrict(e.target.value)} disabled={loadingDistricts} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50">
                            <option value="">Chọn quận/huyện</option>
                            {districts.map(d => <option key={d.code} value={d.name}>{d.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={handleSaveAddress} disabled={addrSubmitting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                          <Check size={16} /> {addrSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
                        </button>
                        <button onClick={() => { setIsEditingAddress(false); setAddrError(null); }} className="px-5 py-2.5 bg-surface border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-background transition-colors">Hủy</button>
                      </div>
                    </div>
                  )}

                  {!isEditingAddress && (
                    <div className="space-y-3">
                      {loadingAddresses ? (
                        <div className="text-center py-12 text-text-muted">Đang tải địa chỉ...</div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-12">
                          <MapPin className="mx-auto text-text-muted mb-3" size={48} />
                          <p className="text-text-secondary text-sm">Chưa có địa chỉ nào. Thêm địa chỉ đầu tiên của bạn.</p>
                        </div>
                      ) : (
                        <>
                          {deleteError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
                              <span>{deleteError}</span>
                              <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
                            </div>
                          )}
                          {addresses.map((addr: any) => (
                            <div key={addr._id} className={`p-5 rounded-xl border transition-all ${addr.isDefault ? 'bg-primary/5 border-primary/30' : 'bg-surface border-border/50 hover:border-border'}`}>
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-text-primary">{addr.label}</h4>
                                    {addr.isDefault && (
                                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">Mặc định</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-text-primary font-medium">{addr.fullName}</p>
                                  <p className="text-sm text-text-secondary">{addr.phoneNumber}</p>
                                  <p className="text-sm text-text-secondary">{addr.address}, {addr.district && `${addr.district}, `}{addr.province}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!addr.isDefault && (
                                    <button onClick={() => handleSetDefault(addr._id)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Đặt làm mặc định">
                                      <Check size={16} />
                                    </button>
                                  )}
                                  <button onClick={() => openEditAddressForm(addr)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Chỉnh sửa">
                                    <Edit2 size={16} />
                                  </button>
                                  {!addr.isDefault && (
                                    <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Xoá">
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============ TAB: ORDERS ============ */}
              {activeTab === 'orders' && (() => {
                // ===== Detail View =====
                if (selectedOrder) {
                  const order = selectedOrder;
                  const subtotal = order.items?.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0) || 0;
                  return (
                    <div className="space-y-6">
                      <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Quay lại danh sách đơn hàng
                      </button>

                      {/* Order header */}
                      <div className="rounded-xl bg-surface border border-border p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h2 className="text-xl font-bold text-text-primary">Đơn hàng #{order._id?.slice(-8).toUpperCase()}</h2>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || 'bg-gray-100'}`}>
                                {statusLabel[order.status] || order.status}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary mt-1">{formatDate(order.createdAt)}</p>
                          </div>
                          <p className="text-2xl font-bold text-text-primary">{formatPrice(order.totalAmount)}</p>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-border pt-4">
                          <div><p className="text-xs text-text-muted mb-1">Phương thức</p><p className="font-medium text-text-primary">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : order.paymentMethod === 'momo' ? 'MoMo' : order.paymentMethod === 'zalopay' ? 'ZaloPay' : order.paymentMethod?.toUpperCase() || ''}</p></div>
                          <div><p className="text-xs text-text-muted mb-1">Thanh toán</p><p className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'refunded' ? 'text-orange-500' : 'text-yellow-600'}`}>{order.paymentStatus === 'paid' ? 'Đã thanh toán' : order.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 'Chưa thanh toán'}</p></div>
                          <div><p className="text-xs text-text-muted mb-1">Người nhận</p><p className="font-medium text-text-primary">{order.customerName || ''}</p></div>
                          <div><p className="text-xs text-text-muted mb-1">SĐT</p><p className="font-medium text-text-primary">{order.customerPhone || ''}</p></div>
                        </div>
                        {order.customerAddress && (
                          <div className="mt-3 text-sm border-t border-border pt-3">
                            <p className="text-xs text-text-muted mb-1">Địa chỉ giao hàng</p>
                            <p className="font-medium text-text-primary">{order.customerAddress}</p>
                          </div>
                        )}
                      </div>

                      {/* Items list */}
                      <div className="rounded-xl bg-surface border border-border overflow-hidden">
                        <div className="px-5 py-3 border-b border-border bg-background/30">
                          <h3 className="font-semibold text-text-primary text-sm">{order.items?.length || 0} sản phẩm</h3>
                        </div>
                        <div className="divide-y divide-border">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-4 px-5 py-4">
                              <div className="w-16 h-16 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-text-muted"><ShoppingBag size={18} /></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link href={`/product/${item.productId}`} className="text-sm font-semibold text-text-primary hover:text-primary truncate block">{item.name}</Link>
                                {item.brand && <p className="text-xs text-text-muted mt-0.5">{item.brand}</p>}
                                <p className="text-xs text-text-secondary mt-1">{formatPrice(item.price)} ×{item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold text-text-primary flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="px-5 py-4 bg-surface/50 border-t border-border space-y-1.5 text-sm">
                          <div className="flex justify-between text-text-secondary"><span>Tạm tính</span><span>{formatPrice(subtotal)}</span></div>
                          {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(order.discountAmount)}</span></div>}
                          <div className="flex justify-between pt-1 border-t border-border text-text-primary font-bold text-base"><span>Tổng cộng</span><span>{formatPrice(order.totalAmount)}</span></div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // ===== Order List =====
                const filterTabs = [
                  { key: 'all', label: 'Tất cả' },
                  { key: 'pending', label: 'Chờ xác nhận' },
                  { key: 'processing', label: 'Đang xử lý' },
                  { key: 'shipped', label: 'Đang giao' },
                  { key: 'delivered', label: 'Đã giao' },
                  { key: 'cancelled', label: 'Đã hủy' },
                ];

                const filtered = orders
                  .filter(o => orderFilter === 'all' || o.status === orderFilter)
                  .sort((a, b) => {
                    switch (orderSort) {
                      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                      case 'highest': return b.totalAmount - a.totalAmount;
                      case 'lowest': return a.totalAmount - b.totalAmount;
                      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                  });

                return (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-text-primary">Lịch sử đơn hàng</h2>
                    {ordersError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{ordersError}</div>}

                    {!loadingOrders && orders.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <div className="flex flex-wrap gap-1.5 bg-background rounded-lg p-1 border border-border">
                          {filterTabs.map(tab => {
                            const count = tab.key === 'all' ? orders.length : orders.filter(o => o.status === tab.key).length;
                            return (
                              <button key={tab.key} onClick={() => setOrderFilter(tab.key)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${orderFilter === tab.key ? 'bg-primary text-rich-black' : 'text-text-secondary hover:text-text-primary'}`}>
                                {tab.label}<span className="ml-1 opacity-60">({count})</span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="ml-auto">
                          <select value={orderSort} onChange={e => setOrderSort(e.target.value as any)} className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium text-text-primary focus:outline-none focus:border-primary">
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="highest">Giá cao nhất</option>
                            <option value="lowest">Giá thấp nhất</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {loadingOrders ? (
                      <div className="text-center py-12 text-text-muted">Đang tải đơn hàng...</div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12"><ShoppingBag className="mx-auto text-text-muted mb-3" size={48} /><p className="text-text-secondary text-sm">Chưa có đơn hàng nào.</p></div>
                    ) : filtered.length === 0 ? (
                      <div className="text-center py-12 text-text-muted">Không có đơn hàng nào ở trạng thái này.</div>
                    ) : (
                      <div className="space-y-3">
                        {filtered.map((order: any) => (
                          <button key={order._id} onClick={() => setSelectedOrder(order)} className="w-full text-left rounded-xl bg-surface border border-border p-5 flex flex-wrap items-center justify-between gap-3 hover:bg-background/30 hover:border-primary/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <ShoppingBag size={18} className="text-primary" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-text-primary text-sm">#{order._id?.slice(-8).toUpperCase()}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] || 'bg-gray-100'}`}>{statusLabel[order.status] || order.status}</span>
                                </div>
                                <p className="text-xs text-text-muted mt-0.5">{formatDate(order.createdAt)} · {order.items?.length || 0} sản phẩm</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <p className="font-semibold text-text-primary text-sm">{formatPrice(order.totalAmount)}</p>
                              <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ============ TAB: PASSWORD ============ */}
              {activeTab === 'password' && !isOAuth && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-text-primary">Đổi mật khẩu</h2>
                  {passwordSuccess && <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">{passwordSuccess}</div>}
                  {passwordError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{passwordError}</div>}
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Mật khẩu hiện tại</label>
                      <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Mật khẩu mới</label>
                      <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Tối thiểu 6 ký tự" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Xác nhận mật khẩu mới</label>
                      <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <button onClick={handleChangePassword} disabled={passwordSaving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                      <Key size={16} /> {passwordSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for info rows
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-5 rounded-xl bg-surface border border-border">
      <Icon className="text-text-muted mt-0.5" size={20} />
      <div className="flex-1">
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{label}</p>
        <p className="text-base text-text-primary font-medium">{value}</p>
      </div>
    </div>
  );
}