'use client';

import { Edit2, Trash2, Home, Building2, Star } from 'lucide-react';

interface AddressCardProps {
  address: any;
  onSetDefault: (id: string) => void;
  onEdit: (addr: any) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({ address: addr, onSetDefault, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="p-5 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-semibold text-text-primary text-sm">
            {addr.addressType === 'office' ? <Building2 size={14} className="inline mr-1" /> : <Home size={14} className="inline mr-1" />}
            {addr.addressType === 'office' ? 'Văn phòng' : 'Nhà riêng'}
          </span>
          {addr.isDefault && (
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
              <Star size={10} /> Mặc định
            </span>
          )}
        </div>
        <p className="text-sm text-text-secondary">{addr.fullName} · {addr.phoneNumber}</p>
        <p className="text-sm text-text-muted mt-1">{addr.address}{addr.ward ? `, ${addr.ward}` : ''}{addr.district ? `, ${addr.district}` : ''}{addr.province ? `, ${addr.province}` : ''}</p>
      </div>
      <div className="flex flex-col items-end gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(addr)} className="p-2 text-text-muted hover:text-text-primary transition-colors" title="Chỉnh sửa"><Edit2 size={16} /></button>
          <button onClick={() => onDelete(addr._id)} className="p-2 text-text-muted hover:text-red-500 transition-colors" title="Xóa"><Trash2 size={16} /></button>
        </div>
        <button
          onClick={() => onSetDefault(addr._id)}
          className="text-xs font-semibold whitespace-nowrap px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Thiết lập mặc định
        </button>
      </div>
    </div>
  );
}