'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, User, Mail, CreditCard, Truck, Shield, ArrowLeft, CheckCircle, Building2, Loader2, ChevronDown, X, Percent, Banknote, Receipt, ShoppingBag, Package, Clock, Info, Home, Zap, Tag, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { getActiveOriginSync } from '@/lib/backendDiscovery';
import { resolveImageUrl } from '@/lib/api';
import { getCart, checkout } from '@/services/cart.service';
import { CartItem } from '@/services/cart.service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPrice } from '@/lib/formatPrice';
import { AddressCard } from '@/components/profile/address-card';
import { AddressEditForm } from '@/components/profile/address-edit-form';
import { VoucherCard } from '@/components/profile/voucher-card';
import { PriceSummary } from '@/components/shared/PriceSummary';
import { VoucherSelector } from '@/components/shared/VoucherSelector';
import { useProfileAddresses } from '@/hooks/profile/useProfileAddresses';

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
  const queryClient = useQueryClient();
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
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherMsg, setVoucherMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showVoucherPopup, setShowVoucherPopup] = useState(false);
  const [fetchingVouchers, setFetchingVouchers] = useState(false);
  const [selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [editingCheckoutAddr, setEditingCheckoutAddr] = useState<any>(null);
  const [checkoutAddrForm, setCheckoutAddrForm] = useState({
    editingAddressId: null as string | null,
    addrType: 'home' as 'home' | 'office',
    addrFullName: '',
    addrPhoneNumber: '',
    addrStreet: '',
    addrProvince: '',
    addrDistrict: '',
    addrWard: '',
    addrLat: 10.8231,
    addrLng: 106.6297,
    addrSubmitting: false,
    addressStep: 'province' as AddressStep,
    selectedProvinceCode: null as number | null,
    selectedDistrictCode: null as number | null,
  });
  const [checkoutAddrError, setCheckoutAddrError] = useState<string | null>(null);

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
        const methods = (pmResult.data || []).filter(
          (m: any) => m.code === 'cod' || m.code === 'vnpay'
        );
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
            shippingMethod: shippingMethod,
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
          shippingMethod: shippingMethod,
        });
        if (result.success) {
          setOrderSuccess(true);
          setCartCount(0);
          queryClient.invalidateQueries({ queryKey: ['cart'] });
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

  const shippingFee = shippingMethod === 'express'
    ? Math.round(cart ? cart.totalAmount * 0.5 : 0)
    : (cart && cart.totalAmount >= 500000 ? 0 : 30000);
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
    if (!accessToken) return;
    const finalCode = (code || voucherInput || '').trim();
    if (!finalCode) return;
    setApplyingVoucher(true);
    setVoucherMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/cart/apply-voucher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ code: finalCode }),
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

  // ===== Flowbite-inspired Input component =====
  function FormInput({ label, required, icon: Icon, ...props }: {
    label: string; required?: boolean; icon?: React.ElementType;
  } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon className="w-4 h-4 text-text-muted" />
            </div>
          )}
          <input
            {...props}
            className={`w-full border border-border bg-white text-text-primary text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
              Icon ? 'pl-10 pr-3.5 py-2.5' : 'px-3.5 py-2.5'
            } disabled:bg-gray-50 disabled:text-text-muted`}
          />
        </div>
      </div>
    );
  }

  function FormSelect({ label, required, icon: Icon, children, ...props }: {
    label: string; required?: boolean; icon?: React.ElementType; children: React.ReactNode;
  } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon className="w-4 h-4 text-text-muted" />
            </div>
          )}
          <select
            {...props}
            className={`w-full border border-border bg-white text-text-primary text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none ${
              Icon ? 'pl-10 pr-8 py-2.5' : 'px-3.5 pr-8 py-2.5'
            } disabled:bg-gray-50 disabled:text-text-muted`}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <SkeletonLoader />;
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
          <ShoppingBag className="w-16 h-16 text-text-muted mx-auto mb-4" />
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
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Đặt hàng thành công!</h2>
          <p className="text-text-secondary mb-1">Cảm ơn bạn đã mua hàng.</p>
          <p className="text-sm text-text-muted">Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
          <p className="text-xs text-text-muted mt-4 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Đang chuyển về trang chủ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] -mt-16 md:-mt-20">
      {/* HEADER */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-5">
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide text-text-muted hover:text-primary transition-colors group mb-2"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Quay lại giỏ hàng
            </Link>
          <div className="flex items-start gap-3">
            <div className="w-1 h-7 bg-primary rounded-full flex-shrink-0 mt-0.5" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary tracking-tight leading-tight">
                Thanh toán
              </h1>
              <p className="text-sm text-text-secondary mt-0.5">Kiểm tra thông tin và hoàn tất đơn hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* ===== LEFT COLUMN ===== */}
            <div className="flex-1 space-y-6 min-w-0">

              {/* Address Selector */}
              {addresses.length > 0 && (
                <section className="bg-white rounded-xl border border-border shadow-sm p-5 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm lg:text-base font-semibold text-text-primary flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Địa chỉ nhận hàng
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowAddressPopup(true)}
                      className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors cursor-pointer"
                    >
                      Thay đổi
                    </button>
                  </div>

                  {/* Selected address display */}
                  {(() => {
                    const selectedAddr = selectedAddressId === 'default'
                      ? addresses.find((a: any) => a.isDefault)
                      : addresses.find((a: any) => a._id === selectedAddressId);
                    if (!selectedAddr) return null;
                    const isDefault = !!selectedAddr.isDefault;
                    return (
                      <div className="bg-foreground/5 rounded-xl p-4">
                        <p className="text-sm font-semibold text-text-primary flex items-center gap-2 flex-wrap">
                          <span>{selectedAddr.fullName} · {selectedAddr.phoneNumber}</span>
                          {isDefault && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full whitespace-nowrap">
                              <Home size={10} /> Mặc định
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-text-muted mt-1">
                          {selectedAddr.address}
                          {selectedAddr.ward ? `, ${selectedAddr.ward}` : ''}
                          {selectedAddr.district ? `, ${selectedAddr.district}` : ''}
                          {selectedAddr.province ? `, ${selectedAddr.province}` : ''}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Note */}
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Ghi chú</label>
                    <textarea
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      rows={2}
                      placeholder="Ghi chú về đơn hàng, ví dụ: giao hàng vào giờ hành chính"
                      className="w-full border border-border bg-white text-text-primary text-sm rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors px-3.5 py-2.5 resize-none"
                    />
                  </div>

                  {/* Address picker popup */}
                  {showAddressPopup && (
                    <>
                      <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setShowAddressPopup(false)} />
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-elevated w-full max-w-lg max-h-[80vh] flex flex-col">
                          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                            <h3 className="text-base font-semibold text-text-primary">Chọn địa chỉ nhận hàng</h3>
                            <button type="button" onClick={() => setShowAddressPopup(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                              <X size={18} />
                            </button>
                          </div>
                          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                            {addresses.map((addr: any) => (
                              <div
                                key={addr._id}
                                className={`relative rounded-xl border-2 transition-all ${
                                  selectedAddressId === addr._id
                                    ? 'border-primary bg-primary/[0.04]'
                                    : 'border-border'
                                }`}
                              >
                                <label className="block cursor-pointer p-4">
                                  <input
                                    type="radio"
                                    name="checkout-address"
                                    checked={selectedAddressId === addr._id}
                                    onChange={() => {
                                      handleAddressSelect(addr._id);
                                      setShowAddressPopup(false);
                                    }}
                                    className="sr-only"
                                  />
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-text-primary">{addr.fullName}</span>
                                    <span className="text-xs text-text-muted">· {addr.phoneNumber}</span>
                                    {addr.isDefault && (
                                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded-full">Mặc định</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-muted">
                                    {addr.address}
                                    {addr.ward ? `, ${addr.ward}` : ''}
                                    {addr.district ? `, ${addr.district}` : ''}
                                    {addr.province ? `, ${addr.province}` : ''}
                                  </p>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCheckoutAddr(addr);
                                    setCheckoutAddrForm({
                                      editingAddressId: addr._id,
                                      addrType: addr.addressType === 'office' ? 'office' : 'home',
                                      addrFullName: addr.fullName || '',
                                      addrPhoneNumber: addr.phoneNumber || '',
                                      addrStreet: addr.address || '',
                                      addrProvince: addr.province || '',
                                      addrDistrict: addr.district || '',
                                      addrWard: addr.ward || '',
                                      addrLat: addr.latitude || 10.8231,
                                      addrLng: addr.longitude || 106.6297,
                                      addrSubmitting: false,
                                      addressStep: 'done' as AddressStep,
                                      selectedProvinceCode: null,
                                      selectedDistrictCode: null,
                                    });
                                  }}
                                  className="absolute top-3 right-3 p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="flex-shrink-0 flex justify-end px-5 py-4 border-t border-border">
                            <button
                              type="button"
                              onClick={() => setShowAddressPopup(false)}
                              className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                            >
                              Xác nhận
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* Shipping Method */}
              <section className="bg-white rounded-xl border border-border shadow-sm p-5 lg:p-6">
                <h2 className="text-sm lg:text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Phương thức vận chuyển
                </h2>
                <div className="space-y-3">
                  <label
                    className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'border-primary bg-primary/[0.04] shadow-[0_0_0_1px_rgba(201,169,110,0.15)]'
                        : 'border-border hover:border-primary/30 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      shippingMethod === 'standard' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {shippingMethod === 'standard' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${shippingMethod === 'standard' ? 'text-primary' : 'text-text-primary'}`}>
                        Giao hàng thường
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {cart && cart.totalAmount >= 500000 ? 'Miễn phí' : `${formatPrice(30000)}`}
                        {cart && cart.totalAmount < 500000 && ` · Miễn phí cho đơn từ ${formatPrice(500000)}`}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="sr-only"
                    />
                  </label>

                  <label
                    className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'border-primary bg-primary/[0.04] shadow-[0_0_0_1px_rgba(201,169,110,0.15)]'
                        : 'border-border hover:border-primary/30 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      shippingMethod === 'express' ? 'border-primary' : 'border-gray-300'
                    }`}>
                      {shippingMethod === 'express' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-orange-50 border border-orange-200">
                        <Zap className="w-5 h-5 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${shippingMethod === 'express' ? 'text-primary' : 'text-text-primary'}`}>
                        Giao hàng Hỏa tốc
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Phí 50% tổng giá trị đơn hàng · {cart ? formatPrice(Math.round(cart.totalAmount * 0.5)) : '0đ'}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="sr-only"
                    />
                  </label>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-white rounded-xl border border-border shadow-sm p-5 lg:p-6">
                <h2 className="text-sm lg:text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  Phương thức thanh toán
                </h2>
                {paymentMethods.length === 0 ? (
                  <div className="space-y-3">
                    <label className="relative flex items-center gap-4 p-4 border-2 rounded-xl border-primary bg-primary/[0.04] shadow-[0_0_0_1px_rgba(201,169,110,0.15)] cursor-pointer">
                      <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-green-50 border border-green-200">
                          <Banknote className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-primary">
                          Thanh toán khi nhận hàng (COD)
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Thanh toán bằng tiền mặt khi nhận hàng
                        </p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method: any) => (
                      <label
                        key={method.code}
                        className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.paymentMethod === method.code
                            ? 'border-primary bg-primary/[0.04] shadow-[0_0_0_1px_rgba(201,169,110,0.15)]'
                            : 'border-border hover:border-primary/30 bg-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          formData.paymentMethod === method.code ? 'border-primary' : 'border-gray-300'
                        }`}>
                          {formData.paymentMethod === method.code && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-11 h-11 flex items-center justify-center rounded-lg bg-green-50 border border-green-200">
                            {method.code === 'vnpay' ? (
                              <Building2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Banknote className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${formData.paymentMethod === method.code ? 'text-primary' : 'text-text-primary'}`}>
                            {method.name}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {method.code === 'vnpay'
                              ? 'Thanh toán qua cổng VNPAY'
                              : method.code === 'cod'
                                ? 'Thanh toán bằng tiền mặt khi nhận hàng'
                                : ''}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.code}
                          checked={formData.paymentMethod === method.code}
                          onChange={() => setFormData(prev => ({ ...prev, paymentMethod: method.code }))}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </section>

            </div>

            {/* ===== RIGHT COLUMN — Order Summary ===== */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
              <div className="bg-white rounded-xl border border-border shadow-sm p-5 lg:p-6 sticky top-24 space-y-5">

                <h3 className="text-sm lg:text-base font-semibold text-text-primary flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  Tóm tắt đơn hàng
                </h3>

                <VoucherSelector
                  accessToken={accessToken!}
                  voucherCode={cart.voucherCode}
                  onApply={async (code) => {
                    setVoucherInput(code);
                    await handleApplyVoucher(code);
                  }}
                  onRemove={handleRemoveVoucher}
                />

                {/* Cart Items */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1 -mr-1">
                  {cart.items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-14 h-14 bg-[#F9FAFB] rounded-lg overflow-hidden flex-shrink-0 border border-border">
                        {item.image ? (
                          <img src={resolveImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-text-muted/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary line-clamp-1 leading-snug">{item.name}</p>
                        <p className="text-xs text-text-muted mt-0.5">SL: {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <PriceSummary
                  totalAmount={cart.totalAmount}
                  shippingFee={shippingFee}
                  showFreeShippingHint={shippingFee > 0 && shippingMethod === 'standard'}
                  voucherDiscount={voucherDiscount}
                  finalTotal={finalTotal}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 text-sm font-bold text-on-primary bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </span>
                  ) : 'Đặt hàng'}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-text-muted pt-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Thông tin của bạn được bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Voucher selection modal — outside form */}
      {showVoucherPopup && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" style={{ margin: 0 }} onClick={() => setShowVoucherPopup(false)}>
          <div className="bg-white rounded-xl shadow-elevated w-full max-w-md max-h-[80vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <h3 className="text-base font-semibold text-text-primary">Chọn mã giảm giá</h3>
                <button type="button" onClick={() => setShowVoucherPopup(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              {fetchingVouchers ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
                </div>
              ) : vouchers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 px-5">
                  <Ticket className="w-12 h-12 text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary">Không có voucher nào khả dụng.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-5 pb-4">
                  <div className="space-y-4 pt-4">
                    {vouchers.filter((v: any) => !v.minTier).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Voucher L'essence</p>
                        <div className="space-y-2">
                          {vouchers.filter((v: any) => !v.minTier).map((v: any) => (
                            <label key={v.code} className="block cursor-pointer">
                              <input
                                type="radio"
                                name="checkout-voucher"
                                checked={selectedVoucherCode === v.code}
                                onChange={() => {
                                  setSelectedVoucherCode(v.code);
                                  setVoucherInput(v.code);
                                  setShowVoucherPopup(false);
                                  handleApplyVoucher(v.code);
                                }}
                                className="sr-only"
                              />
                              <VoucherCard voucher={v} selected={selectedVoucherCode === v.code} />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {vouchers.filter((v: any) => !!v.minTier).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Voucher VIP</p>
                        <div className="space-y-2">
                          {vouchers.filter((v: any) => !!v.minTier).map((v: any) => (
                            <label key={v.code} className="block cursor-pointer">
                              <input
                                type="radio"
                                name="checkout-voucher"
                                checked={selectedVoucherCode === v.code}
                                onChange={() => {
                                  setSelectedVoucherCode(v.code);
                                  setVoucherInput(v.code);
                                  setShowVoucherPopup(false);
                                  handleApplyVoucher(v.code);
                                }}
                                className="sr-only"
                              />
                              <VoucherCard voucher={v} selected={selectedVoucherCode === v.code} />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex-shrink-0 flex justify-end px-5 py-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowVoucherPopup(false)}
                  className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Address edit form in checkout */}
      <AddressEditForm
        isOpen={!!editingCheckoutAddr}
        onClose={() => { setEditingCheckoutAddr(null); setCheckoutAddrError(null); }}
        editingAddressId={checkoutAddrForm.editingAddressId}
        addrType={checkoutAddrForm.addrType}
        setAddrType={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrType: v }))}
        addrFullName={checkoutAddrForm.addrFullName}
        setAddrFullName={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrFullName: v }))}
        addrPhoneNumber={checkoutAddrForm.addrPhoneNumber}
        setAddrPhoneNumber={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrPhoneNumber: v }))}
        addrStreet={checkoutAddrForm.addrStreet}
        setAddrStreet={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrStreet: v }))}
        addrProvince={checkoutAddrForm.addrProvince}
        setAddrProvince={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrProvince: v }))}
        addrDistrict={checkoutAddrForm.addrDistrict}
        setAddrDistrict={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrDistrict: v }))}
        addrWard={checkoutAddrForm.addrWard}
        setAddrWard={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrWard: v }))}
        addrLat={checkoutAddrForm.addrLat}
        addrLng={checkoutAddrForm.addrLng}
        setAddrLat={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrLat: v }))}
        setAddrLng={(v) => setCheckoutAddrForm(prev => ({ ...prev, addrLng: v }))}
        addrSubmitting={checkoutAddrForm.addrSubmitting}
        setAddrError={setCheckoutAddrError}
        provinces={provinces}
        districts={districts}
        wards={wards}
        setWards={setWards}
        loadingProvinces={loadingProvinces}
        loadingDistricts={loadingDistricts}
        loadingWards={loadingWards}
        addressStep={checkoutAddrForm.addressStep}
        selectedProvinceCode={checkoutAddrForm.selectedProvinceCode}
        selectedDistrictCode={checkoutAddrForm.selectedDistrictCode}
        handleSelectProvince={(name, code) => {
          setCheckoutAddrForm(prev => ({ ...prev, addrProvince: name, selectedProvinceCode: code, addrDistrict: '', addrWard: '', addressStep: 'ward' as AddressStep }));
          fetchDistricts(code);
        }}
        handleSelectWard={(name, code) => {
          setCheckoutAddrForm(prev => ({ ...prev, addrWard: name, selectedDistrictCode: code, addrDistrict: '', addressStep: 'district' as AddressStep }));
          fetchWards(code);
        }}
        handleSelectDistrict={(name) => {
          setCheckoutAddrForm(prev => ({ ...prev, addrDistrict: name, addressStep: 'done' as AddressStep }));
        }}
        resetLocationFlow={() => {
          setCheckoutAddrForm(prev => ({ ...prev, addressStep: 'province' as AddressStep, selectedProvinceCode: null, selectedDistrictCode: null, addrProvince: '', addrDistrict: '', addrWard: '' }));
        }}
        handleSaveAddress={async () => {
          setCheckoutAddrForm(prev => ({ ...prev, addrSubmitting: true }));
          try {
            const payload = {
              addressType: checkoutAddrForm.addrType,
              fullName: checkoutAddrForm.addrFullName,
              phoneNumber: checkoutAddrForm.addrPhoneNumber,
              address: checkoutAddrForm.addrStreet,
              province: checkoutAddrForm.addrProvince,
              district: checkoutAddrForm.addrDistrict,
              ward: checkoutAddrForm.addrWard,
              latitude: checkoutAddrForm.addrLat,
              longitude: checkoutAddrForm.addrLng,
            };
            await api.patch(`/user-addresses/${checkoutAddrForm.editingAddressId}`, payload);
            // Refresh addresses
            const addrResult = await api.get('/user-addresses').catch(() => ({ data: { success: false, data: [] } }));
            const addrs = addrResult.data?.data || [];
            setAddresses(addrs);
            setEditingCheckoutAddr(null);
            setCheckoutAddrError(null);
            toast.success('Cập nhật địa chỉ thành công');
          } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Lỗi khi lưu địa chỉ');
          } finally {
            setCheckoutAddrForm(prev => ({ ...prev, addrSubmitting: false }));
          }
        }}
        fetchDistricts={fetchDistricts}
      />

    </div>
  );
}

/* ===== Skeleton Loader ===== */
function SkeletonLoader() {
  const shimmer = 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-shimmer rounded';
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-5">
          <div className={`${shimmer} h-3 w-28 mb-3`} />
          <div className="flex items-start gap-3">
            <div className={`${shimmer} w-1 h-7 flex-shrink-0 mt-0.5`} />
            <div className="space-y-2">
              <div className={`${shimmer} h-7 w-40`} />
              <div className={`${shimmer} h-4 w-60`} />
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-xl border border-border p-5 lg:p-6 space-y-4">
              <div className={`${shimmer} h-4 w-40`} />
              <div className={`${shimmer} h-10 w-full`} />
            </div>
            <div className="bg-white rounded-xl border border-border p-5 lg:p-6 space-y-5">
              <div className={`${shimmer} h-4 w-44`} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${shimmer} h-10 w-full`} />
                <div className={`${shimmer} h-10 w-full`} />
              </div>
              <div className={`${shimmer} h-10 w-full`} />
              <div className={`${shimmer} h-10 w-full`} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${shimmer} h-10 w-full`} />
                <div className={`${shimmer} h-10 w-full`} />
                <div className={`${shimmer} h-10 w-full`} />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border p-5 lg:p-6 space-y-3">
              <div className={`${shimmer} h-4 w-48`} />
              <div className={`${shimmer} h-16 w-full`} />
              <div className={`${shimmer} h-16 w-full`} />
            </div>
          </div>
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-xl border border-border p-5 lg:p-6 space-y-5">
              <div className={`${shimmer} h-4 w-40`} />
              <div className={`${shimmer} h-10 w-full`} />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`${shimmer} w-14 h-14 flex-shrink-0`} />
                    <div className="flex-1 space-y-2">
                      <div className={`${shimmer} h-4 w-3/4`} />
                      <div className={`${shimmer} h-3 w-12`} />
                      <div className={`${shimmer} h-4 w-20`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between"><div className={`${shimmer} h-4 w-16`} /><div className={`${shimmer} h-4 w-20`} /></div>
                <div className="flex justify-between"><div className={`${shimmer} h-4 w-24`} /><div className={`${shimmer} h-4 w-16`} /></div>
                <div className="border-t border-border pt-3 flex justify-between"><div className={`${shimmer} h-5 w-20`} /><div className={`${shimmer} h-7 w-28`} /></div>
                <div className={`${shimmer} h-12 w-full`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}