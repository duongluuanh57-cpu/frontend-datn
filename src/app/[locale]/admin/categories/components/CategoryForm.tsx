'use client';

import React from 'react';
import { Hash, Sparkles } from 'lucide-react';

interface CategoryFormData {
  name: string;
  status: 'active' | 'inactive';
  sortOrder: number;
}

interface CategoryFormProps {
  formData: CategoryFormData;
  onChange: (data: CategoryFormData) => void;
  errors?: Partial<Record<keyof CategoryFormData, string>>;
}

export function CategoryForm({ formData, onChange, errors }: CategoryFormProps) {
  return (
    <form className="admin-form-grid" style={{ gridTemplateColumns: '300px 1fr' }}>
      <section className="admin-form-card">
        <div className="admin-form-card__head">
          <div className="admin-form-card__head-icon">
            <Hash size={18} />
          </div>
          <div>
            <p className="admin-form-card__title">Trạng thái & Thứ tự</p>
            <p className="admin-form-card__desc">Cấu hình hiển thị danh mục</p>
          </div>
        </div>

        <div className="admin-form-fields" style={{ marginTop: 10 }}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="status">Trạng thái hoạt động</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => onChange({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="admin-select"
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngừng</option>
            </select>
          </div>

          <div className="admin-field" style={{ marginTop: 10 }}>
            <label className="admin-label" htmlFor="sortOrder">Thứ tự sắp xếp</label>
            <input
              id="sortOrder"
              type="number"
              min={0}
              value={formData.sortOrder}
              onChange={(e) => onChange({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
              className="admin-input"
              placeholder="0"
            />
            {errors?.sortOrder && (
              <p className="admin-field-error" style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{errors.sortOrder}</p>
            )}
          </div>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-card__head">
          <div className="admin-form-card__head-icon">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="admin-form-card__title">Thông tin danh mục</p>
            <p className="admin-form-card__desc">Tên danh mục sản phẩm</p>
          </div>
        </div>

        <div className="admin-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="admin-field">
            <label className="admin-label" htmlFor="name">Tên danh mục *</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="VD: Nước hoa nam, Nước hoa nữ, Unisex..."
              className="admin-input"
            />
            {errors?.name && (
              <p className="admin-field-error" style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{errors.name}</p>
            )}
          </div>
        </div>
      </section>
    </form>
  );
}
