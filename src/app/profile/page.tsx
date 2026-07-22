'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileAddresses } from '@/hooks/profile/useProfileAddresses';
import { getMe } from '@/services/user.service';
import { getMyOrders } from '@/services/order.service';
import { User, ShoppingBag, Crown, UserRound, LayoutDashboard, Search, Medal, Ticket } from 'lucide-react';
import { toast } from 'sonner';
import { getBackendOrigin } from '@/lib/api';
import { OrderCard } from '@/components/profile/order-card';
import { OrderDetail } from '@/components/profile/order-detail';
import { ProfileInfo } from '@/components/profile/profile-info';
import { AddressManager } from '@/components/profile/address-manager';
import { PasswordManager } from '@/components/profile/password-manager';
import { RankManager } from '@/components/profile/rank-card';
import { VoucherManager } from '@/components/profile/voucher-manager';

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const { user, logout, accessToken, updateUser } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const orderParam = searchParams.get('order');
  const [activeTab, setActiveTab] = useState(tabParam || 'orders');
  const {
    addresses,
    loadingAddresses,
    isEditingAddress,
    setIsEditingAddress,
    editingAddressId,
    addrType,
    setAddrType,
    addrFullName,
    setAddrFullName,
    addrPhoneNumber,
    setAddrPhoneNumber,
    addrStreet,
    setAddrStreet,
    addrProvince,
    setAddrProvince,
    addrDistrict,
    setAddrDistrict,
    addrWard,
    setAddrWard,
    addrLat,
    setAddrLat,
    addrLng,
    setAddrLng,
    addrSubmitting,
    addrError,
    setAddrError,
    deleteError,
    setDeleteError,
    provinces,
    districts,
    wards,
    setWards,
    loadingProvinces,
    loadingDistricts,
    loadingWards,
    addressStep,
    selectedProvinceCode,
    selectedDistrictCode,
    handleSelectProvince,
    handleSelectWard,
    handleSelectDistrict,
    resetLocationFlow,
    fetchAddresses,
    openNewAddressForm,
    openEditAddressForm,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefault,
    fetchDistricts,
  } = useProfileAddresses();


  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSort, setOrderSort] = useState('newest');
  const [orderSearch, setOrderSearch] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showAccountMenu, setShowAccountMenu] = useState(activeTab === 'info' || activeTab === 'addresses' || activeTab === 'password');

  const isOAuth = Boolean(user?.oauthProvider);

  const switchTab = useCallback((tab: string) => {
    setActiveTab(tab);
    setSelectedOrder(null);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    params.delete('order');
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const selectOrder = useCallback((order: any) => {
    setSelectedOrder(order);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'orders');
    if (order?._id) params.set('order', order._id);
    router.replace(`/profile?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);


  useEffect(() => {
    if (accessToken) {
      setLoadingProfile(true);
      getMe(accessToken)
        .then((userData) => {
          updateUser({
            totalSpent: userData.totalSpent ?? 0,
            memberTier: userData.memberTier || 'MEMBER',
            fullName: userData.fullName || '',
            phoneNumber: userData.phoneNumber || '',
            status: userData.status || 'active',
            oauthProvider: userData.oauthProvider || undefined,
          });
        })
        .catch(() => {
          // Backend lỗi → giữ nguyên data cũ, vẫn cho xem profile
        })
        .finally(() => {
          setLoadingProfile(false);
        });
    } else {
      setLoadingProfile(false);
    }
  }, [accessToken, updateUser]);

  useEffect(() => {
    if (activeTab === 'orders' && orders.length === 0 && accessToken) {
      setLoadingOrders(true);
      setOrdersError('');
      getMyOrders(accessToken)
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

  // Restore selected order from URL after orders load
  useEffect(() => {
    if (orderParam && orders.length > 0) {
      const found = orders.find((o: any) => o._id === orderParam);
      if (found) {
        setSelectedOrder(found);
      }
    }
  }, [orderParam]);

  useEffect(() => {
    if (activeTab === 'addresses' && addresses.length === 0 && accessToken) {
      fetchAddresses();
    }
  }, [activeTab, addresses.length, accessToken, fetchAddresses]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-sm text-text-secondary mb-4">Bạn cần đăng nhập để xem trang cá nhân</p>
          <a href={getBackendOrigin() + '/api/auth/login'} className="btn-primary inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  // Skeleton loading khi đang fetch profile
  if (loadingProfile) {
    return (
      <div className="h-[calc(100vh-80px)] bg-background max-w-7xl mx-auto px-4 overflow-hidden">
        <div className="h-full flex flex-col bg-background overflow-hidden">
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar Skeleton */}
            <div className="bg-foreground/5 border-b md:border-b-0 md:border-r border-border md:w-72 lg:w-80 flex-shrink-0 p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-text-muted/10 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-text-muted/10 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-text-muted/10 rounded w-40 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 bg-text-muted/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>

            {/* Right Content Skeleton */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-4 py-6 md:py-8 space-y-6">
                <div className="h-8 bg-text-muted/10 rounded w-48 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-5 rounded-xl bg-foreground/5 border border-border space-y-3">
                      <div className="h-3 bg-text-muted/10 rounded w-20 animate-pulse" />
                      <div className="h-4 bg-text-muted/10 rounded w-40 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-background max-w-7xl mx-auto px-4 overflow-hidden">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="bg-foreground/5 border-b md:border-b-0 md:border-r border-border md:w-72 lg:w-80 flex-shrink-0 flex flex-col overflow-y-auto">
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
                  <h3 className="font-semibold text-text-primary text-base truncate">{user?.fullName || user?.username || 'Người dùng'}</h3>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  {user?.role === 'ADMIN' && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      <Crown size={10} /> ADMIN
                    </span>
                  )}
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <a href={`${getBackendOrigin()}/api/auth/set-admin-session?token=${encodeURIComponent(accessToken || '')}`} target="_blank" rel="noopener noreferrer"               className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-soft transition-colors">
                  <LayoutDashboard size={18} />
                  Trang quản trị
                </a>
              )}
            </div>

            <nav className="flex-1 px-3 space-y-1 pb-6">
              {/* Tài khoản của tôi - click vào sẽ vào Hồ sơ */}
              <button
                onClick={() => { if (showAccountMenu) { setShowAccountMenu(false); } else { switchTab('info'); setShowAccountMenu(true); } }}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                  activeTab === 'info' || activeTab === 'addresses' || activeTab === 'password'
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <User size={18} />
                  Tài khoản của tôi
                </div>
                <svg
                  className={`w-4 h-4 text-text-muted transition-transform duration-200 ${showAccountMenu ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                className={`ml-9 space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${
                  showAccountMenu ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <button
                  onClick={() => switchTab('info')}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'info'
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                  }`}
                >
                  Hồ sơ
                </button>
                <button
                  onClick={() => switchTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                  }`}
                >
                  Địa chỉ
                </button>
                  <button
                    onClick={() => switchTab('password')}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                      activeTab === 'password'
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                    }`}
                  >
                    Đổi mật khẩu
                  </button>
              </div>

              {/* Lịch sử đơn hàng - separate */}
              <div className="pt-3">
                <button
                  onClick={() => { switchTab('orders'); setShowAccountMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                  }`}
                >
                  <ShoppingBag size={18} />
                  Lịch sử đơn hàng
                </button>
              </div>

              {/* Voucher - separate */}
              <div className="pt-3">
                <button
                  onClick={() => { switchTab('voucher'); setShowAccountMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors ${
                    activeTab === 'voucher'
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                  }`}
                >
                  <Ticket size={18} />
                  Voucher
                </button>
              </div>

              {/* Thứ hạng - separate */}
              <div className="pt-3">
                <button
                  onClick={() => { switchTab('rank'); setShowAccountMenu(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors ${
                    activeTab === 'rank'
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-foreground/5 hover:text-text-primary'
                  }`}
                >
                  <Medal size={18} />
                  Thứ hạng
                </button>
              </div>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-4 py-6 md:py-8 h-full">

              {activeTab === 'info' && (
                <ProfileInfo ordersCount={orders.length} loadingOrders={loadingOrders} />
              )}

              {activeTab === 'addresses' && (
                <AddressManager
                  addresses={addresses}
                  loadingAddresses={loadingAddresses}
                  isEditingAddress={isEditingAddress}
                  setIsEditingAddress={setIsEditingAddress}
                  editingAddressId={editingAddressId}
                  addrType={addrType}
                  setAddrType={setAddrType}
                  addrFullName={addrFullName}
                  setAddrFullName={setAddrFullName}
                  addrPhoneNumber={addrPhoneNumber}
                  setAddrPhoneNumber={setAddrPhoneNumber}
                  addrStreet={addrStreet}
                  setAddrStreet={setAddrStreet}
                  addrProvince={addrProvince}
                  setAddrProvince={setAddrProvince}
                  addrDistrict={addrDistrict}
                  setAddrDistrict={setAddrDistrict}
                  addrWard={addrWard}
                  setAddrWard={setAddrWard}
                  addrLat={addrLat}
                  addrLng={addrLng}
                  setAddrLat={setAddrLat}
                  setAddrLng={setAddrLng}
                  addrSubmitting={addrSubmitting}
                  setAddrError={setAddrError}
                  provinces={provinces}
                  districts={districts}
                  wards={wards}
                  setWards={setWards}
                  loadingProvinces={loadingProvinces}
                  loadingDistricts={loadingDistricts}
                  loadingWards={loadingWards}
                  addressStep={addressStep}
                  selectedProvinceCode={selectedProvinceCode}
                  selectedDistrictCode={selectedDistrictCode}
                  handleSelectProvince={handleSelectProvince}
                  handleSelectWard={handleSelectWard}
                  handleSelectDistrict={handleSelectDistrict}
                  resetLocationFlow={resetLocationFlow}
                  openNewAddressForm={openNewAddressForm}
                  openEditAddressForm={openEditAddressForm}
                  handleSaveAddress={handleSaveAddress}
                  handleDeleteAddress={handleDeleteAddress}
                  handleSetDefault={handleSetDefault}
                  fetchDistricts={fetchDistricts}
                />
              )}

              {activeTab === 'orders' && (() => {
                const filterTabs = [
                  { key: 'all', label: 'Tất cả' },
                  { key: 'pending', label: 'Chờ thanh toán' },
                  { key: 'processing', label: 'Vận chuyển' },
                  { key: 'shipped', label: 'Chờ giao hàng' },
                  { key: 'delivered', label: 'Hoàn thành' },
                  { key: 'cancelled', label: 'Đã hủy' },
                ];

                const q = orderSearch.toLowerCase().trim();
                const filtered = orders
                  .filter(o => {
                    let matchesFilter = orderFilter === 'all' || o.status === orderFilter;
                    // Loại đơn đã gửi yêu cầu hủy khỏi tab "pending"
                    if (orderFilter === 'pending' && o.cancelRequested) matchesFilter = false;
                    return matchesFilter && (
                      !q || o._id?.toLowerCase().includes(q) || o.items?.some((item: any) => item.name?.toLowerCase().includes(q))
                    );
                  })
                  .sort((a, b) => {
                    switch (orderSort) {
                      case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                      case 'highest': return b.totalAmount - a.totalAmount;
                      case 'lowest': return a.totalAmount - b.totalAmount;
                      default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                  });

                if (selectedOrder) {
                  return (
                    <OrderDetail order={selectedOrder} onBack={() => { setSelectedOrder(null); const params = new URLSearchParams(searchParams.toString()); params.delete('order'); router.replace(`/profile?${params.toString()}`, { scroll: false }); }} />
                  );
                }

                return (
                  <div className="space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Đơn hàng</h2>
                    {loadingOrders && (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-full rounded-xl bg-foreground/5 border border-border p-5 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-text-muted/10 animate-pulse flex-shrink-0" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-text-muted/10 rounded w-32 animate-pulse" />
                                <div className="h-3 bg-text-muted/10 rounded w-48 animate-pulse" />
                              </div>
                            </div>
                            <div className="h-4 bg-text-muted/10 rounded w-20 animate-pulse" />
                          </div>
                        ))}
                      </div>
                    )}
                    {ordersError && (
                      <div className="text-center py-12">
                        <ShoppingBag className="mx-auto text-text-muted mb-3" size={48} />
                        <p className="text-red-500 text-sm mb-3">{ordersError}</p>
                        <button onClick={() => { if (!accessToken) return; setLoadingOrders(true); setOrdersError(''); getMyOrders(accessToken).then((data) => { setOrders(data); setLoadingOrders(false); }).catch((err) => { setOrdersError(err?.message || 'Không thể tải đơn hàng'); setLoadingOrders(false); }); }} className="btn-primary">Thử lại</button>
                      </div>
                    )}
                    {!loadingOrders && !ordersError && orders.length === 0 && (
                      <div className="text-center py-12">
                        <ShoppingBag className="mx-auto text-text-muted mb-3" size={48} />
                        <p className="text-text-secondary text-sm">Chưa có đơn hàng nào.</p>
                      </div>
                    )}
                    {!loadingOrders && !ordersError && orders.length > 0 && (
                      <>
                        <div className="sticky top-0 z-10 bg-background py-3 -mx-4 px-4">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-background rounded-lg p-1 border border-border w-full">
                            {filterTabs.map(tab => {
                              const count = tab.key === 'all' ? orders.length : orders.filter(o => {
                                if (tab.key === 'pending') return o.status === 'pending' && !o.cancelRequested;
                                return o.status === tab.key;
                              }).length;
                              return (
                                <button key={tab.key} onClick={() => setOrderFilter(tab.key)} className={`px-2 py-2 rounded-md text-sm font-medium transition-all duration-300 text-center ${orderFilter === tab.key ? 'bg-primary text-on-primary shadow-soft' : 'text-text-secondary hover:text-text-primary hover:bg-foreground/5'}`}>
                                  {tab.label}<span className="ml-1 opacity-60">({count})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                          <input type="text" value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Tìm kiếm sản phẩm, mã đơn hàng..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary placeholder-text-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" />
                        </div>
                      </>
                    )}
                    {!loadingOrders && !ordersError && orders.length > 0 && filtered.length === 0 && (
                      <div className="text-center py-12 text-text-muted">
                        {orderSearch ? 'Không tìm thấy đơn hàng phù hợp.' : 'Không có đơn hàng nào ở trạng thái này.'}
                      </div>
                    )}
                    {!loadingOrders && !ordersError && filtered.length > 0 && (
                      <div key={orderFilter} className="space-y-3 animate-fade-up">
                        {filtered.map((order: any) => (
                          <OrderCard key={order._id} order={order} onClick={() => selectOrder(order)} onOrderCancelled={() => { getMyOrders(accessToken).then((data) => { setOrders(data); }).catch(() => {}); }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeTab === 'password' && (
                <PasswordManager accessToken={accessToken} />
              )}

              {activeTab === 'rank' && (
                <RankManager user={user} ordersCount={orders.length} />
              )}

              {activeTab === 'voucher' && (
                <VoucherManager />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}