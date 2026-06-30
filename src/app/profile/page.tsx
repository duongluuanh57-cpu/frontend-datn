'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileAddresses } from '@/hooks/profile/useProfileAddresses';
import { getMe, updateProfile, changePassword } from '@/services/user.service';
import { getMyOrders } from '@/services/order.service';
import { User, Mail, Shield, MapPin, ShoppingBag, Key, LogOut, Plus, Edit2, Trash2, Check, Crown, DollarSign, Phone, UserRound, Globe, Building2, LayoutDashboard } from 'lucide-react';
import { getBackendOrigin, resolveImageUrl } from '@/lib/api';
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

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editFullName, setEditFullName] = useState(user?.fullName || '');
  const [editPhone, setEditPhone] = useState(user?.phoneNumber || '');
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>(user?.gender || '');
  const [editAddress, setEditAddress] = useState(user?.address || '');
  const [editProvince, setEditProvince] = useState(user?.province || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || '');
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');

  const isOAuth = Boolean(user?.provider && user.provider !== 'local');

  const startEditInfo = () => {
    setEditFullName(user?.fullName || '');
    setEditPhone(user?.phoneNumber || '');
    setEditGender(user?.gender || '');
    setEditAddress(user?.address || '');
    setEditProvince(user?.province || '');
    setEditDistrict(user?.district || '');
    setIsEditingInfo(true);
    setInfoError('');
    setInfoSuccess('');
  };

  const saveInfo = async () => {
    if (!accessToken) return;
    setInfoSaving(true);
    setInfoError('');
    setInfoSuccess('');
    try {
      await updateProfile(accessToken, {
        fullName: editFullName,
        phoneNumber: editPhone,
        gender: editGender as any,
        address: editAddress,
        province: editProvince,
        district: editDistrict,
      });
      updateUser({
        fullName: editFullName,
        phoneNumber: editPhone,
        gender: editGender as any,
        address: editAddress,
        province: editProvince,
        district: editDistrict,
      });
      setInfoSuccess('Cập nhật thông tin thành công');
      setIsEditingInfo(false);
    } catch (err: any) {
      setInfoError(err?.message || 'Không thể cập nhật thông tin');
    } finally {
      setInfoSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!accessToken) return;
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword(accessToken, currentPassword, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'Không thể đổi mật khẩu');
    } finally {
      setPasswordSaving(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0) {
      setLoadingOrders(true);
      setOrdersError('');
      getMyOrders(accessToken!)
        .then((data) => {
          setOrders(data);
          setLoadingOrders(false);
        })
        .catch((err) => {
          setOrdersError(err?.message || 'Không thể tải đơn hàng');
          setLoadingOrders(false);
        });
    }
  }, [activeTab, accessToken, orders.length]);

  useEffect(() => {
    if (activeTab === 'addresses' && addresses.length === 0 && accessToken) {
      fetchAddresses();
    }
  }, [activeTab, addresses.length, accessToken, fetchAddresses]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const statusLabel: Record<string, string> = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-text-secondary mb-4">Bạn cần đăng nhập để xem trang cá nhân</p>
          <a href={getBackendOrigin() + '/api/auth/login'} className="btn-primary inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen flex flex-col pt-16 md:pt-20">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="bg-surface border-b md:border-b-0 md:border-r border-border md:w-72 lg:w-80 flex-shrink-0 flex flex-col overflow-y-auto">
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/30">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserRound size={24} className="text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-text-primary text-lg truncate">{user?.fullName || user?.username || 'Người dùng'}</h3>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  {user?.role === 'ADMIN' && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      <Crown size={10} /> ADMIN
                    </span>
                  )}
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <a href={getBackendOrigin()} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary text-rich-black rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors">
                  <LayoutDashboard size={18} />
                  Trang quản trị
                </a>
              )}
            </div>

            <nav className="flex-1 px-3 space-y-1 pb-6">
              {[
                { key: 'info', icon: User, label: 'Thông tin tài khoản' },
                { key: 'orders', icon: ShoppingBag, label: 'Lịch sử đơn hàng' },
                { key: 'addresses', icon: MapPin, label: 'Sổ địa chỉ' },
                !isOAuth && { key: 'password', icon: Key, label: 'Đổi mật khẩu' },
              ].filter(Boolean).map((tab: any) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
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
                    <div className="space-y-4">
                      <InfoRow icon={User} label="Họ và tên" value={user?.fullName || 'Chưa cập nhật'} />
                      <InfoRow icon={Phone} label="Số điện thoại" value={user?.phoneNumber || 'Chưa cập nhật'} />
                      <InfoRow icon={Mail} label="Email" value={user?.email || 'Chưa cập nhật'} />
                      <InfoRow icon={Globe} label="Giới tính" value={user?.gender === 'MALE' ? 'Nam' : user?.gender === 'FEMALE' ? 'Nữ' : user?.gender || 'Chưa cập nhật'} />
                      <InfoRow icon={MapPin} label="Địa chỉ" value={user?.address ? `${user.address}, ${user.district || ''}, ${user.province || ''}` : 'Chưa cập nhật'} />
                      <InfoRow icon={Shield} label="Vai trò" value={user?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-text-primary">Sổ địa chỉ</h2>
                    <button onClick={openNewAddressForm} className="flex items-center gap-2 px-4 py-2 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                      <Plus size={16} /> Thêm địa chỉ
                    </button>
                  </div>

                  {addrError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{addrError}</div>}
                  {deleteError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{deleteError}</div>}

                  {isEditingAddress && (
                    <div className="space-y-4 p-5 rounded-xl bg-surface border border-border">
                      <h3 className="font-semibold text-text-primary">{editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Nhãn</label>
                          <input type="text" value={addrLabel} onChange={e => setAddrLabel(e.target.value)} placeholder="Nhà riêng, Công ty..." className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
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
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Địa chỉ</label>
                        <input type="text" value={addrStreet} onChange={e => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường" className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Tỉnh/Thành phố</label>
                          <select
                            value={addrProvince}
                            onChange={e => { setAddrProvince(e.target.value); const found = provinces.find((p: any) => p.name === e.target.value); if (found) fetchDistricts(found.code); }}
                            disabled={loadingProvinces}
                            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none disabled:opacity-50"
                          >
                            <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành'}</option>
                            {provinces.map((p: any) => (
                              <option key={p.code} value={p.name}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">Quận/Huyện</label>
                          <select value={addrDistrict} onChange={e => setAddrDistrict(e.target.value)} disabled={loadingDistricts || !addrProvince} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none disabled:opacity-50">
                            <option value="">{loadingDistricts ? 'Đang tải...' : addrProvince ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'}</option>
                            {districts.map((d: any) => (
                              <option key={d.code} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={handleSaveAddress} disabled={addrSubmitting} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-rich-black rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50">
                          <Check size={16} /> {addrSubmitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button onClick={() => { setIsEditingAddress(false); setAddrError(''); }} className="px-5 py-2.5 bg-surface border border-border text-text-secondary rounded-lg text-sm font-medium hover:bg-background transition-colors">Hủy</button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {addresses.map((addr: any) => (
                      <div key={addr._id} className="p-5 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-text-primary text-sm">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">Mặc định</span>
                            )}
                          </div>
                          <p className="text-sm text-text-secondary">{addr.fullName} · {addr.phoneNumber}</p>
                          <p className="text-sm text-text-muted mt-1">{addr.address}, {addr.district}, {addr.province}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr._id)} className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">Đặt mặc định</button>
                          )}
                          <button onClick={() => openEditAddressForm(addr)} className="p-2 text-text-muted hover:text-text-primary transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (() => {
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

                if (selectedOrder) {
                  const order = selectedOrder;
                  return (
                    <div className="space-y-6">
                      <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium">
                        ← Quay lại danh sách
                      </button>
                      <div className="space-y-4">
                        <div className="bg-surface rounded-xl p-5 border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-text-primary">Đơn hàng #{order._id?.slice(-8).toUpperCase()}</h3>
                              <p className="text-xs text-text-muted mt-1">{formatDate(order.createdAt)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || 'bg-gray-100'}`}>
                              {statusLabel[order.status] || order.status}
                            </span>
                          </div>
                          <div className="border-t border-border pt-4 space-y-2">
                            <p className="text-sm"><span className="text-text-muted">Người nhận:</span> <span className="text-text-primary font-medium">{order.shippingAddress?.fullName || order.customerName}</span></p>
                            <p className="text-sm"><span className="text-text-muted">Điện thoại:</span> <span className="text-text-primary font-medium">{order.shippingAddress?.phone || order.customerPhone}</span></p>
                            <p className="text-sm"><span className="text-text-muted">Địa chỉ:</span> <span className="text-text-primary font-medium">{order.shippingAddress?.address || order.customerAddress}</span></p>
                            {order.note && <p className="text-sm"><span className="text-text-muted">Ghi chú:</span> <span className="text-text-primary">{order.note}</span></p>}
                          </div>
                        </div>

                        <div className="bg-surface rounded-xl border border-border overflow-hidden">
                          <div className="px-5 py-4 border-b border-border">
                            <h3 className="font-semibold text-text-primary text-sm">Sản phẩm ({order.items?.length || 0})</h3>
                          </div>
                          <div className="divide-y divide-border">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-4 px-5 py-4">
                                <div className="w-16 h-16 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
                                  {item.image ? <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-text-muted"><ShoppingBag size={18} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/product/${item.productId}`} className="text-sm font-semibold text-text-primary hover:text-primary truncate block">{item.name}</Link>
                                  {item.brand && <p className="text-xs text-text-muted mt-0.5">{item.brand}</p>}
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-text-muted">SL: {item.quantity}</span>
                                    {item.variantSize && <span className="text-xs text-text-muted">{item.variantSize}</span>}
                                  </div>
                                </div>
                                <p className="font-semibold text-text-primary text-sm">{formatPrice(item.price * (item.quantity || 1))}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-surface rounded-xl p-5 border border-border">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Tạm tính</span>
                              <span className="font-medium text-text-primary">{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Phí vận chuyển</span>
                              <span className={`font-medium ${order.shippingFee === 0 ? 'text-green-600' : 'text-text-primary'}`}>
                                {order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-text-secondary">Phương thức</span>
                              <span className="font-medium text-text-primary">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : order.paymentMethod}</span>
                            </div>
                            <div className="border-t border-border pt-2 mt-2">
                              <div className="flex justify-between items-baseline">
                                <span className="font-semibold text-text-primary">Tổng cộng</span>
                                <span className="text-xl font-bold text-primary">{formatPrice(order.finalAmount || order.totalAmount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

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