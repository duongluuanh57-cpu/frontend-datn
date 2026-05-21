'use client';

import React from 'react';
import { Edit2, Heart, Calendar, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface ProfileTabProps {
  userProfile: UseUserProfileReturn;
}

export function ProfileTab({ userProfile }: ProfileTabProps) {
  const {
    user,
    isEditingEmail,
    editedEmail,
    setEditedEmail,
    emailSubmitting,
    handleUpdateEmail,
    setIsEditingEmail,
    emailError,
    emailSuccess,
    setEmailError,
    setEmailSuccess,
    formatJoinDate,
    isEditingAddress,
    setIsEditingAddress,
    provinces,
    setProvinces,
    setLoadingProvinces,
    loadingProvinces,
    openNewAddressForm,
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
    loadingDistricts,
    districts,
    setDistricts,
    fetchDistricts,
    addrSubmitting,
    handleSaveAddress,
    addrError,
    setAddrError,
    loadingAddresses,
    addresses,
    handleSetDefault,
    openEditAddressForm,
    handleDeleteAddress,
    // Destructured fields for personal details
    editedFullName,
    setEditedFullName,
    editedPhone,
    setEditedPhone,
    detailsSubmitting,
    detailsError,
    detailsSuccess,
    handleUpdateDetails,
    // Destructured fields for password changing
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    statusMessage,
    setStatusMessage,
    handleChangePassword,
    submitting
  } = userProfile;

  const hasDetailsChanged =
    (editedFullName.trim() !== (user.fullName || '')) ||
    (editedPhone.trim() !== (user.phoneNumber || ''));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="profile-section-header">
        <h1>Thông tin cá nhân</h1>
        <p>Quản lý và xem chi tiết hồ sơ tài khoản L&apos;essence của bạn</p>
      </div>

      <div className="profile-grid-details">
        
        <div className="profile-details-card" style={{ gridColumn: 'span 3' }}>
          <div className="profile-card-label">Họ và Tên</div>
          {user.fullName ? (
            <div className="profile-card-value">{user.fullName}</div>
          ) : (
            <input
              type="text"
              placeholder="Nhập họ và tên đầy đủ..."
              value={editedFullName}
              onChange={(e) => setEditedFullName(e.target.value)}
              className="profile-form-input"
              style={{ marginTop: '6px', width: '100%' }}
              disabled={detailsSubmitting}
            />
          )}
        </div>

        <div className="profile-details-card" style={{ gridColumn: 'span 3' }}>
          <div className="profile-card-label">Số điện thoại</div>
          {user.phoneNumber ? (
            <div className="profile-card-value">{user.phoneNumber}</div>
          ) : (
            <input
              type="tel"
              placeholder="Nhập số điện thoại..."
              value={editedPhone}
              onChange={(e) => setEditedPhone(e.target.value)}
              className="profile-form-input"
              style={{ marginTop: '6px', width: '100%' }}
              disabled={detailsSubmitting}
            />
          )}
        </div>

        <div className="profile-details-card" style={{ gridColumn: 'span 3' }}>
          <div className="profile-card-label">Tên tài khoản</div>
          <div className="profile-card-value">
            {user.username}
          </div>
        </div>

        <div className="profile-details-card" style={{ gridColumn: 'span 3' }}>
          <div className="profile-card-label">Địa chỉ email</div>
          {isEditingEmail ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '6px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="profile-form-input"
                  style={{ flexGrow: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                  disabled={emailSubmitting}
                  placeholder="Nhập email mới..."
                  autoFocus
                />
                <button
                  onClick={handleUpdateEmail}
                  disabled={emailSubmitting}
                  className="btn-profile-primary"
                  style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  {emailSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingEmail(false);
                    setEditedEmail(user.email);
                    setEmailError(null);
                  }}
                  disabled={emailSubmitting}
                  className="btn-profile-secondary"
                  style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                >
                  Hủy
                </button>
              </div>
              {emailError && (
                <span style={{ fontSize: '0.78rem', color: '#e74c3c', fontWeight: 500 }}>
                  {emailError}
                </span>
              )}
            </div>
          ) : (
            <div className="profile-card-value" style={{ justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span>{user.email}</span>
              <button
                onClick={() => {
                  setIsEditingEmail(true);
                  setEmailError(null);
                  setEmailSuccess(null);
                }}
                className="btn-profile-secondary"
                style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', flexShrink: 0 }}
                title="Chỉnh sửa"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
          {emailSuccess && (
            <div className="profile-alert success" style={{ marginTop: '8px', padding: '6px 10px', fontSize: '0.8rem' }}>
              {emailSuccess}
            </div>
          )}
        </div>

        <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
          <div className="profile-card-label">Vai trò tài khoản</div>
          <div className="profile-card-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {user.role}
          </div>
        </div>

        <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
          <div className="profile-card-label">Hạng thành viên</div>
          <div className="profile-card-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {user.memberTier || 'MEMBER'}
            {user.memberTier === 'ELITE MEMBER' && (
              <Heart size={14} style={{ fill: 'var(--primary)', stroke: 'var(--primary)' }} />
            )}
            {user.memberTier === 'VIP' && (
              <span style={{ fontSize: '14px' }}>👑</span>
            )}
          </div>
        </div>

        <div className="profile-details-card" style={{ gridColumn: 'span 2' }}>
          <div className="profile-card-label">Tham gia hệ thống</div>
          <div className="profile-card-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} style={{ opacity: 0.7 }} />
            <span>{formatJoinDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons for details */}
      {(!user.fullName || !user.phoneNumber) && hasDetailsChanged && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button
            onClick={handleUpdateDetails}
            disabled={detailsSubmitting}
            className="btn-profile-primary"
            style={{ borderRadius: '12px' }}
          >
            {detailsSubmitting ? 'Đang lưu...' : 'Lưu thông tin cá nhân'}
          </button>
        </div>
      )}

      {detailsError && (
        <div className="profile-alert danger" style={{ marginTop: '1rem', padding: '10px 14px' }}>
          {detailsError}
        </div>
      )}
      {detailsSuccess && (
        <div className="profile-alert success" style={{ marginTop: '1rem', padding: '10px 14px' }}>
          {detailsSuccess}
        </div>
      )}

      {/* ── Đổi mật khẩu Section (Hiện thẳng trên form) ── */}
      <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
          <Lock size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Đổi mật khẩu tài khoản</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem' }}>
          <div className="profile-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--content)' }}>Mật khẩu hiện tại</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="profile-form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="profile-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--content)' }}>Mật khẩu mới</label>
            <input 
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="profile-form-input"
              style={{ width: '100%' }}
            />
          </div>

          <div className="profile-field-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--content)' }}>Xác nhận mật khẩu mới</label>
            <input 
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="profile-form-input"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {statusMessage && (
          <div className={`profile-alert ${statusMessage.type}`} style={{ marginTop: '1rem', padding: '8px 12px', fontSize: '0.82rem' }}>
            {statusMessage.text}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1.2rem' }}>
          <button 
            onClick={async () => {
              await handleChangePassword();
            }}
            disabled={submitting}
            className="btn-profile-primary"
            style={{ borderRadius: '12px', padding: '10px 24px' }}
          >
            {submitting ? 'Đang cập nhật mật khẩu...' : 'Xác nhận đổi mật khẩu'}
          </button>
        </div>
      </div>

      {/* Decorative glass divider */}
      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '2rem 0' }} />

      {/* ── Addresses Section ── */}
      <div className="profile-section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)' }}>Địa chỉ giao hàng</h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '2px' }}>Quản lý địa chỉ nhận hàng của bạn</p>
        </div>
        {!isEditingAddress && (
          <button
            onClick={() => {
              // Ensure provinces loaded before opening
              if (provinces.length === 0) {
                setLoadingProvinces(true);
                fetch('https://provinces.open-api.vn/api/')
                  .then((r) => r.json())
                  .then((data) => { setProvinces(data); setLoadingProvinces(false); })
                  .catch(() => setLoadingProvinces(false));
              }
              openNewAddressForm();
            }}
            className="btn-profile-primary"
            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.82rem', gap: '6px' }}
          >
            + Thêm địa chỉ
          </button>
        )}
      </div>

      {/* Address Add/Edit Form */}
      {isEditingAddress && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--foreground)', margin: '0 0 1.2rem 0' }}>
            {userProfile.editingAddressId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Nhãn địa chỉ</label>
              <input type="text" value={addrLabel} onChange={(e) => setAddrLabel(e.target.value)} placeholder="VD: Nhà riêng, Công ty..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Họ và tên</label>
              <input type="text" value={addrFullName} onChange={(e) => setAddrFullName(e.target.value)} placeholder="Họ và tên đầy đủ..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Giới tính</label>
              <select value={addrGender} onChange={(e) => setAddrGender(e.target.value as any)} className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }} disabled={addrSubmitting}>
                <option value="">Chưa chọn</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Số điện thoại</label>
              <input type="tel" value={addrPhoneNumber} onChange={(e) => setAddrPhoneNumber(e.target.value)} placeholder="Số điện thoại liên hệ..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                Tỉnh / Thành phố {loadingProvinces && <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Đang tải...)</span>}
              </label>
              <select value={addrProvince} onChange={(e) => { const n = e.target.value; setAddrProvince(n); setAddrDistrict(''); setDistricts([]); const f = provinces.find((p) => p.name === n); if (f) fetchDistricts(f.code); }} className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }} disabled={loadingProvinces || addrSubmitting}>
                <option value="">-- Chọn Tỉnh / Thành phố --</option>
                {provinces.map((prov) => (<option key={prov.code} value={prov.name}>{prov.name}</option>))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                Quận / Huyện {loadingDistricts && <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>(Đang tải...)</span>}
              </label>
              <select value={addrDistrict} onChange={(e) => setAddrDistrict(e.target.value)} className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem', color: 'var(--foreground)', background: '#1c1c1e' }} disabled={loadingDistricts || !addrProvince || addrSubmitting}>
                <option value="">-- Chọn Quận / Huyện --</option>
                {districts.map((dist) => (<option key={dist.code} value={dist.name}>{dist.name}</option>))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Địa chỉ cụ thể</label>
              <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} placeholder="Số nhà, tên đường, phường/xã..." className="profile-form-input" style={{ padding: '10px 14px', fontSize: '0.9rem' }} disabled={addrSubmitting} />
            </div>
          </div>

          {addrError && <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: '#e74c3c', fontWeight: 500 }}>{addrError}</div>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '1.2rem' }}>
            <button onClick={handleSaveAddress} disabled={addrSubmitting} className="btn-profile-primary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}>
              {addrSubmitting ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
            <button onClick={() => { setIsEditingAddress(false); setAddrError(null); }} disabled={addrSubmitting} className="btn-profile-secondary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      {loadingAddresses ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(122,92,92,0.6)', fontSize: '0.88rem' }}>Đang tải địa chỉ...</div>
      ) : addresses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <p style={{ color: 'rgba(122,92,92,0.55)', fontSize: '0.88rem', margin: 0 }}>Bạn chưa có địa chỉ giao hàng nào. Bấm <strong>+ Thêm địa chỉ</strong> để thêm mới.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {addresses.map((addr) => (
            <div key={addr._id} className="profile-order-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--content)' }}>{addr.label}</span>
                    {addr.isDefault && (
                      <span style={{ background: 'rgba(212,165,165,0.15)', color: 'var(--primary)', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', textTransform: 'uppercase' }}>Mặc định</span>
                    )}
                    {addr.gender && (
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                        {addr.gender === 'MALE' ? '♂ Nam' : addr.gender === 'FEMALE' ? '♀ Nữ' : 'Khác'}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(122,92,92,0.7)', margin: '0 0 2px 0' }}>
                    {addr.fullName || 'Chưa có tên'} · {addr.phoneNumber || 'Chưa có SĐT'}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(122,92,92,0.55)', margin: 0 }}>
                    {[addr.address, addr.district, addr.province].filter(Boolean).join(', ') || 'Chưa nhập địa chỉ cụ thể'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr._id)} className="btn-profile-secondary" style={{ padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem' }} title="Đặt làm mặc định">
                      Mặc định
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (provinces.length === 0) {
                        setLoadingProvinces(true);
                        fetch('https://provinces.open-api.vn/api/')
                          .then((r) => r.json())
                          .then((data) => { setProvinces(data); setLoadingProvinces(false); openEditAddressForm(addr); })
                          .catch(() => { setLoadingProvinces(false); openEditAddressForm(addr); });
                      } else {
                        openEditAddressForm(addr);
                      }
                    }}
                    className="btn-profile-secondary"
                    style={{ padding: '6px', borderRadius: '50%', display: 'flex', width: '30px', height: '30px', alignItems: 'center', justifyContent: 'center' }}
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDeleteAddress(addr._id)} className="btn-profile-secondary" style={{ padding: '6px', borderRadius: '50%', display: 'flex', width: '30px', height: '30px', color: '#e74c3c', alignItems: 'center', justifyContent: 'center' }} title="Xóa">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
