'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import api, { uploadImageToR2 } from '@/lib/api';
import { useProfileDetails } from '@/hooks/profile/useProfileDetails';
import { useProfilePassword } from '@/hooks/profile/useProfilePassword';
import { useProfileAddresses } from '@/hooks/profile/useProfileAddresses';
import { useProfileOrders } from '@/hooks/profile/useProfileOrders';

export type ActiveTab = 'profile' | 'orders' | 'security' | 'settings' | 'bankcards';

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
  filterStatus: string;
  setFilterStatus: (st: string) => void;
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
  fetchOrders: (start?: string, end?: string, st?: string) => Promise<void>;
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
  const searchParams = useSearchParams();
  const tabParam = searchParams ? searchParams.get('tab') as ActiveTab | null : null;

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  useEffect(() => {
    if (tabParam && ['profile', 'orders', 'security', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // ── Avatar upload ──
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Copy state ──
  const [copiedId, setCopiedId] = useState(false);
  const [copiedTenant, setCopiedTenant] = useState(false);

  // ── Mount guard ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // ── Sub-hooks ──
  const profileDetails = useProfileDetails(user, updateUser);
  const profilePassword = useProfilePassword(accessToken);
  const profileAddresses = useProfileAddresses();
  const profileOrders = useProfileOrders();

  // ── Sync user data into sub-hook states ──
  useEffect(() => {
    if (user) {
      if (!profileDetails.isEditingName) profileDetails.setEditedName(user.username);
      if (!profileDetails.isEditingEmail) profileDetails.setEditedEmail(user.email);
      if (!profileDetails.isEditingDetails) {
        profileDetails.setEditedFullName((user as any).fullName || '');
        profileDetails.setEditedPhone((user as any).phoneNumber || '');
        profileDetails.setEditedGender(((user as any).gender as any) || '');
      }
    }
  }, [user]);

  // ── Fetch latest profile from DB ──
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

  // ── Fetch orders/addresses on tab change ──
  useEffect(() => {
    if (activeTab === 'orders' && mounted && isAuthenticated) {
      profileOrders.fetchOrders(profileOrders.filterStartDate, profileOrders.filterEndDate, profileOrders.filterStatus);
    }
    if (activeTab === 'profile' && mounted && isAuthenticated) {
      profileAddresses.fetchAddresses();
    }
  }, [activeTab, mounted, isAuthenticated]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const imgData = await uploadImageToR2(file, { maxWidth: 400, quality: 88, folder: 'avatars' });
      await api.patch('/auth/update-profile', { avatar: imgData.url });
      updateUser({ avatar: imgData.url } as any);
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
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
    currentPassword: profilePassword.currentPassword,
    setCurrentPassword: profilePassword.setCurrentPassword,
    newPassword: profilePassword.newPassword,
    setNewPassword: profilePassword.setNewPassword,
    confirmPassword: profilePassword.confirmPassword,
    setConfirmPassword: profilePassword.setConfirmPassword,
    statusMessage: profilePassword.statusMessage,
    setStatusMessage: profilePassword.setStatusMessage,
    submitting: profilePassword.submitting,
    copiedId,
    copiedTenant,
    isEditingName: profileDetails.isEditingName,
    setIsEditingName: profileDetails.setIsEditingName,
    editedName: profileDetails.editedName,
    setEditedName: profileDetails.setEditedName,
    editingSubmitting: profileDetails.editingSubmitting,
    editingError: profileDetails.editingError,
    setEditingError: profileDetails.setEditingError,
    editingSuccess: profileDetails.editingSuccess,
    setEditingSuccess: profileDetails.setEditingSuccess,
    isEditingEmail: profileDetails.isEditingEmail,
    setIsEditingEmail: profileDetails.setIsEditingEmail,
    editedEmail: profileDetails.editedEmail,
    setEditedEmail: profileDetails.setEditedEmail,
    emailSubmitting: profileDetails.emailSubmitting,
    emailError: profileDetails.emailError,
    setEmailError: profileDetails.setEmailError,
    emailSuccess: profileDetails.emailSuccess,
    setEmailSuccess: profileDetails.setEmailSuccess,
    isEditingDetails: profileDetails.isEditingDetails,
    setIsEditingDetails: profileDetails.setIsEditingDetails,
    editedFullName: profileDetails.editedFullName,
    setEditedFullName: profileDetails.setEditedFullName,
    editedPhone: profileDetails.editedPhone,
    setEditedPhone: profileDetails.setEditedPhone,
    editedGender: profileDetails.editedGender,
    setEditedGender: profileDetails.setEditedGender,
    detailsSubmitting: profileDetails.detailsSubmitting,
    detailsError: profileDetails.detailsError,
    detailsSuccess: profileDetails.detailsSuccess,
    addresses: profileAddresses.addresses,
    setAddresses: profileAddresses.setAddresses,
    loadingAddresses: profileAddresses.loadingAddresses,
    isEditingAddress: profileAddresses.isEditingAddress,
    setIsEditingAddress: profileAddresses.setIsEditingAddress,
    editingAddressId: profileAddresses.editingAddressId,
    addrLabel: profileAddresses.addrLabel,
    setAddrLabel: profileAddresses.setAddrLabel,
    addrFullName: profileAddresses.addrFullName,
    setAddrFullName: profileAddresses.setAddrFullName,
    addrGender: profileAddresses.addrGender,
    setAddrGender: profileAddresses.setAddrGender,
    addrPhoneNumber: profileAddresses.addrPhoneNumber,
    setAddrPhoneNumber: profileAddresses.setAddrPhoneNumber,
    addrStreet: profileAddresses.addrStreet,
    setAddrStreet: profileAddresses.setAddrStreet,
    addrProvince: profileAddresses.addrProvince,
    setAddrProvince: profileAddresses.setAddrProvince,
    addrDistrict: profileAddresses.addrDistrict,
    setAddrDistrict: profileAddresses.setAddrDistrict,
    addrSubmitting: profileAddresses.addrSubmitting,
    addrError: profileAddresses.addrError,
    setAddrError: profileAddresses.setAddrError,
    provinces: profileAddresses.provinces,
    setProvinces: profileAddresses.setProvinces,
    districts: profileAddresses.districts,
    setDistricts: profileAddresses.setDistricts,
    loadingProvinces: profileAddresses.loadingProvinces,
    setLoadingProvinces: profileAddresses.setLoadingProvinces,
    loadingDistricts: profileAddresses.loadingDistricts,
    setLoadingDistricts: profileAddresses.setLoadingDistricts,
    orders: profileOrders.orders,
    loadingOrders: profileOrders.loadingOrders,
    ordersError: profileOrders.ordersError,
    filterStartDate: profileOrders.filterStartDate,
    setFilterStartDate: profileOrders.setFilterStartDate,
    filterEndDate: profileOrders.filterEndDate,
    setFilterEndDate: profileOrders.setFilterEndDate,
    filterStatus: profileOrders.filterStatus,
    setFilterStatus: profileOrders.setFilterStatus,
    selectedOrder: profileOrders.selectedOrder,
    setSelectedOrder: profileOrders.setSelectedOrder,
    mounted,
    avatarUploading,
    avatarInputRef,
    isAdmin,
    fetchAddresses: profileAddresses.fetchAddresses,
    openNewAddressForm: profileAddresses.openNewAddressForm,
    openEditAddressForm: profileAddresses.openEditAddressForm,
    handleSaveAddress: profileAddresses.handleSaveAddress,
    handleDeleteAddress: profileAddresses.handleDeleteAddress,
    handleSetDefault: profileAddresses.handleSetDefault,
    fetchOrders: profileOrders.fetchOrders,
    handleAvatarUpload,
    fetchDistricts: profileAddresses.fetchDistricts,
    handleLogout,
    handleCopy,
    handleUpdateName: profileDetails.handleUpdateName,
    handleUpdateEmail: profileDetails.handleUpdateEmail,
    handleChangePassword: profilePassword.handleChangePassword,
    handleUpdateDetails: profileDetails.handleUpdateDetails,
    formatJoinDate,
  };
}