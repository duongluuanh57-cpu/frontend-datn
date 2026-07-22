'use client';

import { useState, useEffect } from 'react';
import { X, Check, Home, Building2, MapPin, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import type { AddressStep } from '@/hooks/profile/useProfileAddresses';

const MapPicker = dynamic(() => import('@/components/shared/map-picker').then((m) => m.MapPicker), {
  ssr: false,
  loading: () => <div className="w-full h-48 rounded-lg bg-foreground/5 border border-border animate-pulse" />,
});

export interface AddressEditFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddressId: string | null;
  addrType: 'home' | 'office';
  setAddrType: (v: 'home' | 'office') => void;
  addrFullName: string;
  setAddrFullName: (v: string) => void;
  addrPhoneNumber: string;
  setAddrPhoneNumber: (v: string) => void;
  addrStreet: string;
  setAddrStreet: (v: string) => void;
  addrProvince: string;
  setAddrProvince: (v: string) => void;
  addrDistrict: string;
  setAddrDistrict: (v: string) => void;
  addrWard: string;
  setAddrWard: (v: string) => void;
  addrLat: number;
  addrLng: number;
  setAddrLat: (v: number) => void;
  setAddrLng: (v: number) => void;
  addrSubmitting: boolean;
  setAddrError: (v: string | null) => void;
  provinces: Array<{ name: string; code: number }>;
  districts: Array<{ name: string; code: number }>;
  wards: Array<{ name: string; code: number }>;
  setWards: (v: Array<{ name: string; code: number }>) => void;
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  addressStep: AddressStep;
  selectedProvinceCode: number | null;
  selectedDistrictCode: number | null;
  handleSelectProvince: (name: string, code: number) => void;
  handleSelectWard: (name: string, code: number) => void;
  handleSelectDistrict: (name: string) => void;
  resetLocationFlow: () => void;
  handleSaveAddress: () => Promise<void>;
  fetchDistricts: (code: number) => void;
}

export function AddressEditForm({
  isOpen, onClose,
  editingAddressId,
  addrType, setAddrType,
  addrFullName, setAddrFullName,
  addrPhoneNumber, setAddrPhoneNumber,
  addrStreet, setAddrStreet,
  addrProvince, setAddrProvince,
  addrDistrict, setAddrDistrict,
  addrWard, setAddrWard,
  addrLat, addrLng, setAddrLat, setAddrLng,
  addrSubmitting, setAddrError,
  provinces, districts, wards, setWards,
  loadingProvinces, loadingDistricts, loadingWards,
  addressStep, selectedProvinceCode, selectedDistrictCode,
  handleSelectProvince, handleSelectWard, handleSelectDistrict,
  resetLocationFlow, handleSaveAddress, fetchDistricts,
}: AddressEditFormProps) {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowLocationDropdown(false);
    }
  }, [isOpen]);

  const renderLocationBreadcrumb = () => {
    const parts: { label: string; step: AddressStep }[] = [];
    if (addrProvince) parts.push({ label: addrProvince, step: 'province' });
    if (addrWard) parts.push({ label: addrWard, step: 'ward' });
    if (addrDistrict) parts.push({ label: addrDistrict, step: 'district' });

    if (parts.length === 0) return null;

    return (
      <div className="flex items-center gap-1.5 text-xs text-text-secondary bg-foreground/5 rounded-lg px-3 py-2 mb-3 flex-wrap">
        <MapPin size={12} className="text-primary flex-shrink-0" />
        {parts.map((p, i) => (
          <span key={p.step} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={10} className="text-text-muted" />}
            <span className="text-text-primary font-medium">{p.label}</span>
          </span>
        ))}
      </div>
    );
  };

  const renderLocationStep = () => {
    return (
      <div className="space-y-3 relative">
        <label className="block text-xs font-medium text-text-secondary">Địa chỉ</label>
        {addressStep === 'done' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-text-primary bg-foreground/5 rounded-lg px-3 py-2 flex-1">
              <MapPin size={14} className="text-primary flex-shrink-0" />
              <span className="font-medium">{addrProvince}</span>
              {addrWard && <><ChevronRight size={12} className="text-text-muted" /><span>{addrWard}</span></>}
              {addrDistrict && <><ChevronRight size={12} className="text-text-muted" /><span>{addrDistrict}</span></>}
            </div>
            <button type="button" onClick={() => setShowLocationDropdown(!showLocationDropdown)} className="text-xs font-medium text-primary hover:text-primary-dark whitespace-nowrap">
              Thay đổi
            </button>
          </div>
        ) : null}

        {addressStep !== 'done' && (
          <div className="space-y-2">
            <select
              value={addrProvince}
              onChange={(e) => {
                const selected = provinces.find((p) => p.name === e.target.value);
                if (selected) {
                  handleSelectProvince(selected.name, selected.code);
                  setAddrWard('');
                  setAddrDistrict('');
                  setWards([]);
                }
              }}
              disabled={loadingProvinces}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành phố'}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>

            {(addressStep === 'ward' || addressStep === 'district') && (
              <select
                value={addrWard}
                onChange={(e) => {
                  const selected = districts.find((d) => d.name === e.target.value);
                  if (selected) {
                    handleSelectWard(selected.name, selected.code);
                    setAddrDistrict('');
                    setWards([]);
                  }
                }}
                disabled={loadingDistricts}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              >
                <option value="">{loadingDistricts ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
            )}

            {addressStep === 'district' && (
              <select
                value={addrDistrict}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                disabled={loadingWards}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              >
                <option value="">{loadingWards ? 'Đang tải...' : 'Chọn Quận/Huyện'}</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {showLocationDropdown && addressStep === 'done' && (
          <div className="space-y-2">
            <select
              value={addrProvince}
              onChange={(e) => {
                const selected = provinces.find((p) => p.name === e.target.value);
                if (selected) {
                  handleSelectProvince(selected.name, selected.code);
                  setAddrWard('');
                  setAddrDistrict('');
                  setWards([]);
                }
              }}
              disabled={loadingProvinces}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
            >
              <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/Thành phố'}</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>{p.name}</option>
              ))}
            </select>

            {(addressStep === 'ward' || addressStep === 'district') && (
              <select
                value={addrWard}
                onChange={(e) => {
                  const selected = districts.find((d) => d.name === e.target.value);
                  if (selected) {
                    handleSelectWard(selected.name, selected.code);
                    setAddrDistrict('');
                    setWards([]);
                  }
                }}
                disabled={loadingDistricts}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              >
                <option value="">{loadingDistricts ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
            )}

            {addressStep === 'district' && (
              <select
                value={addrDistrict}
                onChange={(e) => handleSelectDistrict(e.target.value)}
                disabled={loadingWards}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
              >
                <option value="">{loadingWards ? 'Đang tải...' : 'Chọn Quận/Huyện'}</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-background rounded-xl p-6 w-full max-w-2xl mx-4 border border-border shadow-elevated max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-primary text-lg">{editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
          <button onClick={() => { onClose(); setAddrError(''); }} className="p-1 text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {/* Họ và tên + Số điện thoại */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Họ và tên</label>
              <input type="text" value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} placeholder="Nguyễn Văn A" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Số điện thoại</label>
              <input type="text" value={addrPhoneNumber} onChange={(e) => setAddrPhoneNumber(e.target.value)} placeholder="0912 345 678" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
            </div>
          </div>

          {/* Step-by-step location picker */}
          {renderLocationStep()}

          {/* Địa chỉ cụ thể */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Địa chỉ cụ thể</label>
            <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường, khu vực" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>

          {/* Bản đồ */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Chọn vị trí trên bản đồ</label>
            <MapPicker
              latitude={addrLat}
              longitude={addrLng}
              onLocationChange={(lat, lng) => { setAddrLat(lat); setAddrLng(lng); }}
            />
          </div>

          {/* Loại địa chỉ */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Loại địa chỉ</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors flex-1">
                <input
                  type="radio"
                  name="addrType"
                  value="home"
                  checked={addrType === 'home'}
                  onChange={() => setAddrType('home')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <Home size={18} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Nhà riêng</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors flex-1">
                <input
                  type="radio"
                  name="addrType"
                  value="office"
                  checked={addrType === 'office'}
                  onChange={() => setAddrType('office')}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <Building2 size={18} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Văn phòng</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button disabled={addrSubmitting} onClick={handleSaveAddress} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"><Check size={16} />{addrSubmitting ? 'Đang lưu...' : 'Lưu'}</button>
            <button onClick={() => { onClose(); setAddrError(''); }} className="btn-ghost">Hủy</button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}