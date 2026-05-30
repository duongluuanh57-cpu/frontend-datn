'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

export function useProfileAddresses() {
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

  return {
    addresses, setAddresses,
    loadingAddresses,
    isEditingAddress, setIsEditingAddress,
    editingAddressId,
    addrLabel, setAddrLabel,
    addrFullName, setAddrFullName,
    addrGender, setAddrGender,
    addrPhoneNumber, setAddrPhoneNumber,
    addrStreet, setAddrStreet,
    addrProvince, setAddrProvince,
    addrDistrict, setAddrDistrict,
    addrSubmitting, addrError, setAddrError,
    provinces, setProvinces,
    districts, setDistricts,
    loadingProvinces, setLoadingProvinces,
    loadingDistricts, setLoadingDistricts,
    fetchAddresses,
    openNewAddressForm,
    openEditAddressForm,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefault,
    fetchDistricts,
  };
}