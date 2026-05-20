'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/navigation';
import api, { uploadImageToR2 } from '@/lib/api';

export type ActiveTab = 'profile' | 'orders' | 'security' | 'settings';

export interface UseUserProfileReturn {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  accessToken: string | null;
  updateUser: (user: any) => void;
  router: any;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentPassword: string;
  setCurrentPassword: (pwd: string) => void;
  newPassword: string;
  setNewPassword: (pwd: string) => void;
  confirmPassword: string;
  setConfirmPassword: (pwd: string) => void;
  statusMessage: { text: string; type: 'success' | 'danger' } | null;
  setStatusMessage: (msg: { text: string; type: 'success' | 'danger' } | null) => void;
  submitting: boolean;
  copiedId: boolean;
  copiedTenant: boolean;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
  editedName: string;
  setEditedName: (name: string) => void;
  editingSubmitting: boolean;
  editingError: string | null;
  setEditingError: (err: string | null) => void;
  editingSuccess: string | null;
  setEditingSuccess: (success: string | null) => void;
  isEditingEmail: boolean;
  setIsEditingEmail: (editing: boolean) => void;
  editedEmail: string;
  setEditedEmail: (email: string) => void;
  emailSubmitting: boolean;
  emailError: string | null;
  setEmailError: (err: string | null) => void;
  emailSuccess: string | null;
  setEmailSuccess: (success: string | null) => void;
  isEditingDetails: boolean;
  setIsEditingDetails: (editing: boolean) => void;
  editedFullName: string;
  setEditedFullName: (name: string) => void;
  editedPhone: string;
  setEditedPhone: (phone: string) => void;
  editedGender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  setEditedGender: (gender: 'MALE' | 'FEMALE' | 'OTHER' | '') => void;
  detailsSubmitting: boolean;
  detailsError: string | null;
  detailsSuccess: string | null;
  addresses: any[];
  setAddresses: React.Dispatch<React.SetStateAction<any[]>>;
  loadingAddresses: boolean;
  isEditingAddress: boolean;
  setIsEditingAddress: (editing: boolean) => void;
  editingAddressId: string | null;
  addrLabel: string;
  setAddrLabel: (label: string) => void;
  addrFullName: string;
  setAddrFullName: (name: string) => void;
  addrGender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  setAddrGender: (gender: 'MALE' | 'FEMALE' | 'OTHER' | '') => void;
  addrPhoneNumber: string;
  setAddrPhoneNumber: (phone: string) => void;
  addrStreet: string;
  setAddrStreet: (street: string) => void;
  addrProvince: string;
  setAddrProvince: (province: string) => void;
  addrDistrict: string;
  setAddrDistrict: (district: string) => void;
  addrSubmitting: boolean;
  addrError: string | null;
  setAddrError: (err: string | null) => void;
  provinces: Array<{ name: string; code: number }>;
  setProvinces: React.Dispatch<React.SetStateAction<Array<{ name: string; code: number }>>>;
  districts: Array<{ name: string; code: number }>;
  setDistricts: React.Dispatch<React.SetStateAction<Array<{ name: string; code: number }>>>;
  loadingProvinces: boolean;
  setLoadingProvinces: (loading: boolean) => void;
  loadingDistricts: boolean;
  setLoadingDistricts: (loading: boolean) => void;
  orders: any[];
  loadingOrders: boolean;
  ordersError: string | null;
  filterStartDate: string;
  setFilterStartDate: (date: string) => void;
  filterEndDate: string;
  setFilterEndDate: (date: string) => void;
  selectedOrder: any | null;
  setSelectedOrder: (order: any | null) => void;
  mounted: boolean;
  avatarUploading: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  isAdmin: boolean;
  fetchAddresses: () => Promise<void>;
  openNewAddressForm: () => void;
  openEditAddressForm: (addr: any) => void;
  handleSaveAddress: () => Promise<void>;
  handleDeleteAddress: (id: string) => Promise<void>;
  handleSetDefault: (id: string) => Promise<void>;
  fetchOrders: (start?: string, end?: string) => Promise<void>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fetchDistricts: (provinceCode: number) => void;
  handleLogout: () => void;
  handleCopy: (text: string, type: 'id' | 'tenant') => void;
  handleUpdateName: () => Promise<void>;
  handleUpdateEmail: () => Promise<void>;
  handleChangePassword: () => Promise<void>;
  handleUpdateDetails: () => Promise<void>;
  formatJoinDate: (dateStr?: string) => string;
}

export function useUserProfile(): UseUserProfileReturn {
  const { user, isAuthenticated, logout, accessToken, updateUser } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'danger' } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTenant, setCopiedTenant] = useState(false);

  // States for editing name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editingSubmitting, setEditingSubmitting] = useState(false);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [editingSuccess, setEditingSuccess] = useState<string | null>(null);

  // States for editing email
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editedEmail, setEditedEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // States for editing personal details (fullName, phone, gender)
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedFullName, setEditedFullName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [editedGender, setEditedGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [detailsSubmitting, setDetailsSubmitting] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);

  // States for UserAddress
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrGender, setAddrGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');
  const [addrPhoneNumber, setAddrPhoneNumber] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  const [provinces, setProvinces] = useState<Array<{ name: string; code: number }>>([]);
  const [districts, setDistricts] = useState<Array<{ name: string; code: number }>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [mounted, setMounted] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const fetchDistricts = useCallback((provinceCode: number) => {
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
  }, []);

  const fetchAddresses = useCallback(async () => {
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

  const openNewAddressForm = useCallback(() => {
    setEditingAddressId(null);
    setAddrLabel('Địa chỉ của tôi');
    setAddrFullName('');
    setAddrGender('');
    setAddrPhoneNumber('');
    setAddrStreet('');
    setAddrProvince('');
    setAddrDistrict('');
    setAddrError(null);
    setIsEditingAddress(true);
  }, []);

  const openEditAddressForm = useCallback((addr: any) => {
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
  }, [provinces, fetchDistricts]);

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

  const fetchOrders = useCallback(async (start?: string, end?: string) => {
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const imgData = await uploadImageToR2(file, { maxWidth: 400, quality: 88, folder: 'avatars' });
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setEditedName(user.username);
      setEditedEmail(user.email);
      setEditedFullName((user as any).fullName || '');
      setEditedPhone((user as any).phoneNumber || '');
      setEditedGender(((user as any).gender as any) || '');
    }
  }, [user]);

  useEffect(() => {
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
  }, [mounted, isAuthenticated, updateUser]);

  useEffect(() => {
    if (activeTab === 'orders' && mounted && isAuthenticated) {
      fetchOrders();
    }
    if (activeTab === 'profile' && mounted && isAuthenticated) {
      fetchAddresses();
    }
  }, [activeTab, mounted, isAuthenticated, fetchOrders, fetchAddresses]);

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

  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return 'Tháng 5, 2026';
    try {
      const date = new Date(dateStr);
      return `Tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
    } catch (e) {
      return 'Tháng 5, 2026';
    }
  };

  const isAdmin = user ? (user.role === 'ADMIN' || user.role === 'SUBADMIN') : false;

  return {
    user,
    isAuthenticated,
    logout,
    accessToken,
    updateUser,
    router,
    activeTab,
    setActiveTab,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    statusMessage,
    setStatusMessage,
    submitting,
    copiedId,
    copiedTenant,
    isEditingName,
    setIsEditingName,
    editedName,
    setEditedName,
    editingSubmitting,
    editingError,
    setEditingError,
    editingSuccess,
    setEditingSuccess,
    isEditingEmail,
    setIsEditingEmail,
    editedEmail,
    setEditedEmail,
    emailSubmitting,
    emailError,
    setEmailError,
    emailSuccess,
    setEmailSuccess,
    isEditingDetails,
    setIsEditingDetails,
    editedFullName,
    setEditedFullName,
    editedPhone,
    setEditedPhone,
    editedGender,
    setEditedGender,
    detailsSubmitting,
    detailsError,
    detailsSuccess,
    addresses,
    setAddresses,
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
    provinces,
    setProvinces,
    districts,
    setDistricts,
    loadingProvinces,
    setLoadingProvinces,
    loadingDistricts,
    setLoadingDistricts,
    orders,
    loadingOrders,
    ordersError,
    filterStartDate,
    setFilterStartDate,
    filterEndDate,
    setFilterEndDate,
    selectedOrder,
    setSelectedOrder,
    mounted,
    avatarUploading,
    avatarInputRef,
    isAdmin,
    fetchAddresses,
    openNewAddressForm,
    openEditAddressForm,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefault,
    fetchOrders,
    handleAvatarUpload,
    fetchDistricts,
    handleLogout,
    handleCopy,
    handleUpdateName,
    handleUpdateEmail,
    handleChangePassword,
    handleUpdateDetails,
    formatJoinDate
  };
}
