'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, User, Mail, CreditCard, Truck, Shield, ArrowLeft, CheckCircle, ChevronDown, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { getActiveOriginSync } from '@/lib/backendDiscovery';
import { resolveImageUrl } from '@/lib/api';
import { getCart, checkout } from '@/services/cart.service';
import { CartItem } from '@/services/cart.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function CheckoutPage() {
  const [cart, setCart] = useState<{ items: CartItem[]; totalAmount: number; totalItems: number; voucherCode?: string | null; voucherDiscount?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('default');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const setCartCount = useCartStore((state) => state.setCartCount);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    note: '',
    paymentMethod: 'cod',
  });
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);
  const [fetchingVouchers, setFetchingVouchers] = useState(false);

  // Province/District/Ward state
  const [provinces, setProvinces] = useState<Array<{ name: string; code: number }>>([]);
  const [districts, setDistricts] = useState<Array<{ name: string; code: number }>>([]);
  const [wards, setWards] = useState<Array<{ name: string; code: number }>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  const fetchProvinces = useCallback(() => {
    setLoadingProvinces(true);
    fetch('https://provinces.open-api.vn/api/p/')
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data || []);
        setLoadingProvinces(false);
      })
      .catch((err) => {
        console.error('Failed to fetch provinces:', err);
        setLoadingProvinces(false);
      });
  }, []);

  const fetchDistricts = useCallback((provinceCode: number) => {
    setLoadingDistricts(true);
    setDistricts([]);
    setWards([]);
    setSelectedDistrictCode(null);
    setFormData(prev => ({ ...prev, district: '', ward: '' }));
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
  }, []);

  const fetchWards = useCallback((districtCode: number) => {
    setLoadingWards(true);
    setWards([]);
    setFormData(prev => ({ ...prev, ward: '' }));
    fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      .then((res) => res.json())
      .then((data) => {
        setWards(data.wards || []);
        setLoadingWards(false);
      })
      .catch((err) => {
        console.error('Failed to fetch wards:', err);
        setLoadingWards(false);
      });
  }, []);

  const handleProvinceChange = (provinceName: string) => {
    setFormData(prev => ({ ...prev, city: provinceName, district: '', ward: '' }));
    const found = provinces.find((p) => p.name === provinceName);
    if (found) {
      setSelectedProvinceCode(found.code);
      fetchDistricts(found.code);
    }
  };

  const handleDistrictChange = (districtName: string) => {
    setFormData(prev => ({ ...prev, district: districtName, ward: '' }));
    const found = districts.find((d) => d.name === districtName);
    if (found) {
      setSelectedDistrictCode(found.code);
      fetchWards(found.code);
    }
  };

  // Fetch provinces on mount
  useEffect(() => {
    if (provinces.length === 0) {
      fetchProvinces();
    }
  }, [provinces.length, fetchProvinces]);

  // Pre-fill province/district when provinces loaded and user has existing values
  useEffect(() => {
    if (provinces.length > 0 && formData.city && !selectedProvinceCode) {
      const found = provinces.find((p) => p.name === formData.city);
      if (found) {
        setSelectedProvinceCode(found.code);
        fetchDistricts(found.code);
      }
    }
  }, [provinces, formData.city, selectedProvinceCode, fetchDistricts]);

  // Pre-fill district when districts loaded
  useEffect(() => {
    if (districts.length > 0 && formData.district && !selectedDistrictCode) {
      const found = districts.find((d) => d.name === formData.district);
      if (found) {
        setSelectedDistrictCode(found.code);
        fetchWards(found.code);
      }
    }
  }, [districts, formData.district, selectedDistrictCode, fetchWards]);

  useEffect(() => {
    const fetchCart = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const origin = getActiveOriginSync();
        const [cartResult, addrResult, pmResult] = await Promise.all([
          getCart(accessToken),
          api.get('/user-addresses').catch(() => ({ data: { success: false, data: [] } })),
          fetch(`${origin.replace(/\/+$/, '')}/api/payments/payment-methods`).then(r => r.json()).catch(() => ({ data: [] })),
        ]);
        if (cartResult.success && cartResult.data) {
          setCart(cartResult.data);
        }

        const addrs = addrResult.data?.data || [];
        setAddresses(addrs);
        const methods = pmResult.data || [];
        setPaymentMethods(methods);
        if (methods.length > 0 && !formData.paymentMethod) {
          setFormData(prev => ({ ...prev, paymentMethod: methods[0].code }));
        }
      } catch (error) {
        console.error('Failed to fetch cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [accessToken]);

  // Pre-fill từ user mặc định hoặc defaultAddress
  useEffect(() => {
    const defaultAddr = addresses.find((a: any) => a.isDefault);
    const addr = defaultAddr || user?.defaultAddress || null;

    setFormData(prev => ({
      ...prev,
      fullName: user?.fullName || addr?.fullName || '',
      phone: user?.phoneNumber || addr?.phoneNumber || '',
      email: user?.email || '',
      address: user?.address || addr?.address || '',
      city: user?.province || addr?.province || '',
      district: user?.district || addr?.district || '',
    }));
  }, [addresses, user]);

  const handleAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === 'default') {
      const defaultAddr = addresses.find((a: any) => a.isDefault);
      const addr = defaultAddr || user?.defaultAddress || null;
      setFormData(prev => ({
        ...prev,
        fullName: user?.fullName || addr?.fullName || '',
        phone: user?.phoneNumber || addr?.phoneNumber || '',
        address: user?.address || addr?.address || '',
        city: user?.province || addr?.province || '',
        district: user?.district || addr?.district || '',
      }));
    } else {
      const addr = addresses.find((a: any) => a._id === addrId);
      if (addr) {
        setFormData(prev => ({
          ...prev,
          fullName: addr.fullName || '',
          phone: addr.phoneNumber || '',
          address: addr.address || '',
          city: addr.province || '',
          district: addr.district || '',
        }));
      }
    }
  };

  // Kiểm tra user đã có đầy đủ thông tin chưa
  const isProfileComplete = Boolean(
    user?.fullName && user?.phoneNumber && user?.address && user?.province && user?.district
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !cart) return;

    setSubmitting(true);
    try {
      // Nếu đang chọn địa chỉ mặc định, lưu thông tin vào user profile
      if (selectedAddressId === 'default' && !isProfileComplete) {
        try {
          const { updateProfile } = await import('@/services/user.service');
          await updateProfile(accessToken, {
            fullName: formData.fullName,
            phoneNumber: formData.phone,
            address: formData.address,
            province: formData.city,
            district: formData.district,
          });
        } catch (e) {
          console.warn('Failed to auto-save profile:', e);
        }
      }

      // Nếu chọn địa chỉ khác, cập nhật vào user_address
      if (selectedAddressId !== 'default') {
        try {
          await api.patch(`/user-addresses/${selectedAddressId}`, {
            fullName: formData.fullName,
            phoneNumber: formData.phone,
            address: formData.address,
            province: formData.city,
            district: formData.district,
          });
        } catch (e) {
          console.warn('Failed to update address:', e);
        }
      }

      // Nếu chọn VNPAY đang dùng luồng redirect VNPAY trước, tạo đơn sau
      if (formData.paymentMethod === 'vnpay') {
        const origin = getActiveOriginSync();
        const res = await fetch(`${origin.replace(/\/+$/, '')}/api/payments/vnpay-prepare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.note
              ? `${formData.address}, ${formData.district}, ${formData.city} - Ghi chú: ${formData.note}`
              : `${formData.address}, ${formData.district}, ${formData.city}`,
            note: formData.note,
          }),
        });
        const json = await res.json();
        if (json.success && json.data?.paymentUrl) {
          // Redirect sang VNPAY
          window.location.href = json.data.paymentUrl;
        } else {
          toast.error(json.message || 'Không thể tạo giao dịch VNPAY');
        }
      } else {
        // COD hoặc các phương thức khác để tạo đơn ngay
        const result = await checkout(accessToken, {
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          customerAddress: formData.note
            ? `${formData.address}, ${formData.district}, ${formData.city} - Ghi chú: ${formData.note}`
            : `${formData.address}, ${formData.district}, ${formData.city}`,
          paymentMethod: formData.paymentMethod as any,
        });
        if (result.success) {
          setOrderSuccess(true);
          setCartCount(0);
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          toast.error('Không thể tạo đơn hàng. Vui lòng thử lại!');
        }
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Không thể tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const shippingFee = cart && cart.totalAmount >= 500000 ? 0 : 30000;
  const voucherDiscount = cart?.voucherDiscount || 0;
  const finalTotal = cart ? cart.totalAmount + shippingFee - voucherDiscount : 0;

  const fetchVouchers = async () => {
    if (!accessToken) return;
    setFetchingVouchers(true);
    try {
      const res = await fetch(`${API_BASE}/api/vouchers`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setVouchers(json.data);
        setShowVoucherPopup(true);
      }
    } catch {
      // ignore
    } finally {
      setFetchingVouchers(false);
    }
  };

  const handleApplyVoucher = async (code?: string) => {
    if (!accessToken || !voucherInput.trim()) return;
    setApplyingVoucher(true);
    setVoucherMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/cart/apply-voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code: (code || voucherInput).trim() }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
        setVoucherMsg({ type: 'success', text: json.message });
      } else {
        setVoucherMsg({ type: 'error', text: json.message || 'Mã giảm giá không hợp lệ' });
      }
    } catch {
      setVoucherMsg({ type: 'error', text: 'Lỗi kết nối' });
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    if (!accessToken) return;
    setApplyingVoucher(true);
    try {
      const res = await fetch(`${API_BASE}/api/cart/remove-voucher`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCart(json.data);
        setVoucherInput('');
        setVoucherMsg(null);
      }
    } catch {
      // ignore
    } finally {
      setApplyingVoucher(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-text-secondary">Đang tải...</div>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Vui lòng đăng nhập</h2>
          <p className="text-text-secondary mb-4">Bạn cần đăng nhập để thanh toán</p>
          <a href="http://localhost:4000/api/auth/login" className="btn-primary inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-text-primary mb-2">Giỏ hàng trống</h3>
          <p className="text-text-secondary mb-6">Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Link href="/" className="btn-primary">
            Khám phá sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">Đặt hàng thành công!</h2>
          <p className="text-text-secondary mb-4">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          <p className="text-sm text-text-muted">Đang chuyển về trang chủ...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="h-screen flex flex-col bg-background -mt-16 md:-mt-20 overflow-hidden">
      {/* HEADER — premium checkout header */}
      <div className="flex-shrink-0 border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="py-4 lg:py-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-text-muted hover:text-primary transition-colors group mb-2"
            >
              <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
              Quay lại cửa hàng
            </Link>
            <div className="flex items-start gap-3">
              <div className="w-1 h-7 bg-primary rounded-full flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                  Thanh toán
                </h1>
                <p className="text-sm text-text-secondary mt-1">Kiểm tra thông tin và hoàn tất đơn hàng của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY – split panel */}
      <form onSubmit={handleSubmit} className="flex-1 flex min-h-0">
        <div className="max-w-7xl mx-auto w-full flex px-4 lg:px-6">
          {/* LEFT COLUMN – scrollable */}
          <div className="flex-1 overflow-y-auto py-5 lg:py-6 pr-4 lg:pr-6">
            <div className="max-w-3xl space-y-5">

            {/* ---- Address Selector ---- */}
            {addresses.length > 0 && (
              <section className="bg-surface rounded-xl p-5 lg:p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-sm lg:text-base font-semibold text-text-primary mb-4 flex items-center gap-2.5">
                  <span className="w-1 h-4 bg-primary rounded-full" />
                  Chọn địa chỉ giao hàng
                </h2>
                <div className="relative">
                  <select
                    value={selectedAddressId}
                    onChange={(e) => handleAddressSelect(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none transition-shadow"
                  >
                    <option value="default">
                      {addresses.find((a: any) => a.isDefault)
                        ? `Mặc định: ${addresses.find((a: any) => a.isDefault).fullName} - ${addresses.find((a: any) => a.isDefault).address}`
                        : 'Sử dụng thông tin tài khoản'}
                    </option>
                    {addresses.filter(a => !a.isDefault).map((addr: any) => (
                      <option key={addr._id} value={addr._id}>
                        {addr.label}: {addr.fullName} - {addr.address}, {addr.district && `${addr.district}, `}{addr.province}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </section>
            )}

            {/* ---- Shipping Information ---- */}
            <section className="bg-surface rounded-xl p-5 lg:p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-sm lg:text-base font-semibold text-text-primary mb-4 flex items-center gap-2.5">
                <span className="w-1 h-4 bg-primary rounded-full" />
                Thông tin giao hàng
              </h2>

              {isProfileComplete && selectedAddressId === 'default' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-3.5 p-4 rounded-xl bg-background/60 ring-1 ring-black/5">
                      <User className="text-text-muted mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Họ và tên</p>
                        <p className="text-sm font-medium text-text-primary">{formData.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3.5 p-4 rounded-xl bg-background/60 ring-1 ring-black/5">
                      <Phone className="text-text-muted mt-0.5 flex-shrink-0" size={16} />
                      <div>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Số điện thoại</p>
                        <p className="text-sm font-medium text-text-primary">{formData.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-background/60 ring-1 ring-black/5">
                    <Mail className="text-text-muted mt-0.5 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm font-medium text-text-primary">{formData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 p-4 rounded-xl bg-background/60 ring-1 ring-black/5">
                    <MapPin className="text-text-muted mt-0.5 flex-shrink-0" size={16} />
                    <div>
                       <p className="text-[10px] text-text-muted uppercase tracking-widest mb-0.5">Địa chỉ</p>
                      <p className="text-sm font-medium text-text-primary">
                        {formData.address && `${formData.address}, `}
                        {formData.district && `${formData.district}, `}
                        {formData.city}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow"
                          placeholder="0912345678"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                      Địa chỉ<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow"
                      placeholder="123 Đường ABC"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                        Tỉnh/Thành phố<span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.city}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          disabled={loadingProvinces}
                          required
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow appearance-none disabled:opacity-50 pr-10"
                        >
                          <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành'}</option>
                          {provinces.map((p) => (
                            <option key={p.code} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={formData.district}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          disabled={loadingDistricts || !formData.city}
                          required
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow appearance-none disabled:opacity-50 pr-10"
                        >
                          <option value="">{loadingDistricts ? 'Đang tải...' : formData.city ? 'Chọn quận/huyện' : 'Chọn tỉnh trước'}</option>
                          {districts.map((d) => (
                            <option key={d.code} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                        Phường/Xã <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="ward"
                          value={formData.ward}
                          onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                          disabled={loadingWards || !formData.district}
                          required
                          className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow appearance-none disabled:opacity-50 pr-10"
                        >
                          <option value="">{loadingWards ? 'Đang tải...' : formData.district ? 'Chọn phường/xã' : 'Chọn quận trước'}</option>
                          {wards.map((w) => (
                            <option key={w.code} value={w.name}>{w.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="mt-4">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-text-secondary mb-1.5">
                  Ghi chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
                  placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng vào giờ hành chính"
                />
              </div>
            </section>

            {/* ---- Payment Method ---- */}
            <section className="bg-surface rounded-xl p-5 lg:p-6 shadow-sm ring-1 ring-black/5">
              <h2 className="text-sm lg:text-base font-semibold text-text-primary mb-4 flex items-center gap-2.5">
                <span className="w-1 h-4 bg-primary rounded-full" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method: any) => {
                    const isSelected = formData.paymentMethod === method.code;

                    const getMethodIcon = (code: string, icon: string) => {
                      switch (code) {
                        case 'cod':
                          return (
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200/40">
                              <Truck className="w-5 h-5 text-amber-600" />
                            </div>
                          );
                        case 'bank_transfer':
                          return (
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-200/40">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                          );
                        default:
                          if (icon) {
                            return (
                              <img src={icon} alt={method.name} className="w-10 h-10 object-contain" />
                            );
                          }
                          return (
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-200/40">
                              <CreditCard className="w-5 h-5 text-gray-500" />
                            </div>
                          );
                      }
                    };

                    const getMethodDescription = (code: string) => {
                      switch (code) {
                        case 'cod':
                          return 'Chỉ thanh toán khi bạn nhận được hàng';
                        case 'bank_transfer':
                          return 'Chuyển khoản qua tài khoản ngân hàng';
                        default:
                          return '';
                      }
                    };

                    return (
                      <label
                        key={method._id}
                        className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.99] ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary-rgb),0.15)]'
                            : 'border-border hover:border-primary/40 bg-surface'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? 'border-primary' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary scale-in" />
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {getMethodIcon(method.code, method.icon)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                            {method.name}
                          </p>
                          {getMethodDescription(method.code) && (
                            <p className="text-xs text-text-muted/80 mt-0.5 leading-relaxed">
                              {getMethodDescription(method.code)}
                            </p>
                          )}
                        </div>

                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.code}
                          checked={isSelected}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                      </label>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-text-muted">
                    <CreditCard className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-sm">Đang tải phương thức thanh toán...</p>
                  </div>
                )}
              </div>
            </section>

            </div>
          </div>

          {/* RIGHT COLUMN – fixed summary panel */}
          <div className="w-[360px] lg:w-[400px] flex-shrink-0 border-l border-border bg-surface">
            <div className="p-5 lg:p-6 h-full flex flex-col">
              <h3 className="text-sm lg:text-base font-semibold text-text-primary mb-5 flex items-center gap-2.5 flex-shrink-0">
                <span className="w-1 h-4 bg-primary rounded-full" />
                Tóm tắt đơn hàng
              </h3>

              {/* Voucher */}
              <div className="space-y-2 relative flex-shrink-0">
                {showVoucherPopup && vouchers.length > 0 && (
                  <div className="border border-border rounded-xl bg-white shadow-xl max-h-40 overflow-y-auto absolute bottom-full left-0 right-0 mb-2 z-10">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface/80 sticky top-0">
                      <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Mã giảm giá có sẵn</span>
                    </div>
                    {vouchers.map((v: any) => (
                      <button
                        key={v._id}
                        onClick={() => { setVoucherInput(v.code); setShowVoucherPopup(false); handleApplyVoucher(v.code); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                      >
                        <span className="text-sm font-semibold text-text-primary">{v.code}</span>
                        <span className="text-xs text-text-muted ml-2">
                          {v.type === 'percentage' ? `Giảm ${v.value}%` : `Giảm ${v.value.toLocaleString('vi-VN')}đ`}
                          {v.minOrderAmount > 0 && ` (Đơn từ ${v.minOrderAmount.toLocaleString('vi-VN')}đ)`}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {!cart.voucherCode ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-shadow"
                      onFocus={() => fetchVouchers()}
                      onBlur={() => setTimeout(() => setShowVoucherPopup(false), 200)}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                    />
                    <button
                      onClick={() => handleApplyVoucher()}
                      disabled={applyingVoucher || !voucherInput.trim()}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark active:scale-[0.98] text-rich-black text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      {applyingVoucher ? (
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                        </span>
                      ) : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-700">{cart.voucherCode}</span>
                      <span className="text-xs text-green-600 font-medium">
                        -{formatPrice(voucherDiscount || 0)}
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                )}
                {voucherMsg && (
                  <p className={`text-xs mt-1 ${voucherMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {voucherMsg.text}
                  </p>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1 -mr-1 min-h-0">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-14 h-14 bg-background rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-black/10">
                      {item.image ? (
                        <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-5 h-5 bg-text-muted/20 rounded" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary line-clamp-1 leading-snug">{item.name}</p>
                      <p className="text-xs text-text-muted/70 mt-0.5">SL: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Summary */}
              <div className="flex-shrink-0 border-t border-border pt-4 mt-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tạm tính</span>
                  <span className="font-medium text-text-primary">{formatPrice(cart.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Phí vận chuyển</span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-green-600' : 'text-text-primary'}`}>
                    {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-[11px] text-text-muted/70">
                    Miễn phí vận chuyển cho đơn từ {formatPrice(500000)}
                  </p>
                )}
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Giảm giá</span>
                    <span className="font-medium text-green-600">-{formatPrice(voucherDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-text-primary">Tổng cộng</span>
                    <span className="text-xl lg:text-2xl font-bold text-primary">{formatPrice(Math.max(0, finalTotal))}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 mt-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-rich-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 shadow-sm shadow-primary/20"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-rich-black/30 border-t-rich-black rounded-full animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : 'Đặt hàng'}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-text-muted/60 pt-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Thông tin của bạn được bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}