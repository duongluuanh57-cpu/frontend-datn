'use client';

import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export type AddressStep = 'province' | 'ward' | 'district' | 'done';

export function useProfileAddresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrType, setAddrType] = useState<'home' | 'office'>('home');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrPhoneNumber, setAddrPhoneNumber] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrProvince, setAddrProvince] = useState('');
  const [addrDistrict, setAddrDistrict] = useState('');
  const [addrWard, setAddrWard] = useState('');
  const [addrLat, setAddrLat] = useState(10.8231);
  const [addrLng, setAddrLng] = useState(106.6297);
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Array<{ name: string; code: number }>>([]);
  const [districts, setDistricts] = useState<Array<{ name: string; code: number }>>([]);
  const [wards, setWards] = useState<Array<{ name: string; code: number }>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [addressStep, setAddressStep] = useState<AddressStep>('province');
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

  // Fetch provinces on mount
  useEffect(() => {
    if (provinces.length === 0) {
      fetchProvinces();
    }
  }, [provinces.length, fetchProvinces]);

  const handleSelectProvince = useCallback((name: string, code: number) => {
    setAddrProvince(name);
    setSelectedProvinceCode(code);
    setAddrDistrict('');
    setAddrWard('');
    setDistricts([]);
    setWards([]);
    setAddressStep('ward');
    fetchDistricts(code);
  }, [fetchDistricts]);

  // Step "Phường/Xã" thực chất chọn Quận/Huyện từ API, nhưng UI hiển thị là Phường/Xã
  const handleSelectWard = useCallback((name: string, code: number) => {
    setAddrWard(name);
    setSelectedDistrictCode(code);
    setAddrDistrict('');
    setWards([]);
    setAddressStep('district');
    fetchWards(code);
  }, [fetchWards]);

  // Step "Quận/Huyện" thực chất chọn Phường/Xã từ API, nhưng UI hiển thị là Quận/Huyện
  const handleSelectDistrict = useCallback((name: string) => {
    setAddrDistrict(name);
    setAddressStep('done');
  }, []);

  const resetLocationFlow = useCallback(() => {
    setAddressStep('province');
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setAddrProvince('');
    setAddrDistrict('');
    setAddrWard('');
    setDistricts([]);
    setWards([]);
  }, []);

  const openNewAddressForm = useCallback(() => {
    setEditingAddressId(null);
    setAddrType('home');
    setAddrFullName('');
    setAddrPhoneNumber('');
    setAddrStreet('');
    resetLocationFlow();
    setAddrLat(10.8231);
    setAddrLng(106.6297);
    setAddrError(null);
    setIsEditingAddress(true);
  }, [resetLocationFlow]);

  const openEditAddressForm = useCallback((addr: any) => {
    setEditingAddressId(addr._id);
    setAddrType(addr.addressType === 'office' ? 'office' : 'home');
    setAddrFullName(addr.fullName || '');
    setAddrPhoneNumber(addr.phoneNumber || '');
    setAddrStreet(addr.address || '');
    setAddrProvince(addr.province || '');
    setAddrDistrict(addr.district || '');
    setAddrWard(addr.ward || '');
    setAddrLat(addr.latitude || 10.8231);
    setAddrLng(addr.longitude || 106.6297);
    setAddrError(null);
    setAddressStep('done');
    setIsEditingAddress(true);
    if (addr.province && provinces.length > 0) {
      const found = provinces.find((p) => p.name === addr.province);
      if (found) {
        setSelectedProvinceCode(found.code);
        fetchDistricts(found.code);
      }
    }
  }, [provinces, fetchDistricts]);

  const handleSaveAddress = async () => {
    setAddrSubmitting(true);
    setAddrError(null);
    try {
      const payload = {
        addressType: addrType,
        fullName: addrFullName,
        phoneNumber: addrPhoneNumber,
        address: addrStreet,
        province: addrProvince,
        district: addrDistrict,
        ward: addrWard,
        latitude: addrLat,
        longitude: addrLng,
      };
      if (editingAddressId) {
        await api.patch(`/user-addresses/${editingAddressId}`, payload);
      } else {
        await api.post('/user-addresses', payload);
      }
      await fetchAddresses();
      setIsEditingAddress(false);
      toast.success(editingAddressId ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi lưu địa chỉ');
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    setDeleteError(null);
    try {
      const res = await api.delete(`/user-addresses/${id}`);
      if (res.data && !res.data.success) {
        toast.error(res.data.message || 'Không thể xóa địa chỉ');
        return;
      }
      await fetchAddresses();
      toast.success('Xóa địa chỉ thành công');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Lỗi khi xóa địa chỉ';
      toast.error(msg);
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.patch(`/user-addresses/${id}/set-default`);
      await fetchAddresses();
      toast.success('Đặt địa chỉ mặc định thành công');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Lỗi khi đặt mặc định');
    }
  };

  return {
    addresses, setAddresses,
    loadingAddresses,
    isEditingAddress, setIsEditingAddress,
    editingAddressId,
    addrType, setAddrType,
    addrFullName, setAddrFullName,
    addrPhoneNumber, setAddrPhoneNumber,
    addrStreet, setAddrStreet,
    addrProvince, setAddrProvince,
    addrDistrict, setAddrDistrict,
    addrWard, setAddrWard,
    addrLat, setAddrLat,
    addrLng, setAddrLng,
    addrSubmitting, addrError, setAddrError, deleteError, setDeleteError,
    provinces, setProvinces,
    districts, setDistricts,
    wards, setWards,
    loadingProvinces, setLoadingProvinces,
    loadingDistricts, setLoadingDistricts,
    loadingWards, setLoadingWards,
    addressStep, setAddressStep,
    selectedProvinceCode, selectedDistrictCode,
    handleSelectProvince,
    handleSelectWard,
    handleSelectDistrict,
    resetLocationFlow,
    fetchAddresses,
    fetchProvinces,
    openNewAddressForm,
    openEditAddressForm,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefault,
    fetchDistricts,
  };
}