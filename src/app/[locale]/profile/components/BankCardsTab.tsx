'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Building2, Lock, ChevronDown, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { UseUserProfileReturn } from '@/hooks/useUserProfile';

interface BankCardsTabProps {
  userProfile: UseUserProfileReturn;
}

interface Bank {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
}

export function BankCardsTab({ userProfile: _userProfile }: BankCardsTabProps) {
  const [cardNum, setCardNum] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankAccNum, setBankAccNum] = useState('');
  const [bankAccName, setBankAccName] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then((r) => r.json())
      .then((d) => { if (d.data) setBanks(d.data); })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBankDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatCardNum = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const handleCardNumChange = (v: string) => {
    const formatted = formatCardNum(v);
    setCardNum(formatted);
    const digits = formatted.replace(/\s/g, '');
    if (digits.length === 16 && !cardName) {
      setCardName('NGUYEN VAN A');
    }
  };

  const filteredBanks = banks.filter(
    (b) =>
      b.shortName.toLowerCase().includes(bankSearch.toLowerCase()) ||
      b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setBankSearch(bank.shortName);
    setBankDropdownOpen(false);
  };

  const handleSave = () => {
    alert('Tính năng đang phát triển');
  };

  const inputBase: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    padding: '4px 0',
    width: '100%',
    fontFamily: 'inherit',
  };

  return (
    <motion.div
      key="bankcards"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <div className="profile-section-header">
        <h1>Thẻ ngân hàng</h1>
        <p>Quản lý thẻ tín dụng / ghi nợ và tài khoản ngân hàng liên kết</p>
      </div>

      {/* ── Credit/Debit Card ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
          borderRadius: '16px',
          padding: '1.8rem 1.8rem 1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '40px',
              height: '30px',
              background: 'linear-gradient(135deg, #D4AF37, #B8860B)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '20px', height: '14px', border: '1.5px solid rgba(255,255,255,0.4)', borderRadius: '3px' }} />
          </div>
          <span style={{ fontFamily: 'serif', fontSize: '1.4rem', fontWeight: 700, color: '#fff', fontStyle: 'italic', letterSpacing: '0.04em', opacity: 0.85 }}>
            VISA
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
              Số thẻ
            </label>
            <input
              type="text"
              value={cardNum}
              onChange={(e) => handleCardNumChange(e.target.value)}
              placeholder="0000 0000 0000 0000"
              style={{
                ...inputBase,
                fontSize: '1.15rem',
                letterSpacing: '0.06em',
                fontFamily: 'monospace',
                borderBottomColor: 'rgba(255,255,255,0.15)',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
                Ngày hết hạn
              </label>
              <input
                type="text"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                style={{ ...inputBase, fontFamily: 'monospace' }}
              />
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
                CVV
              </label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  style={{ ...inputBase, fontFamily: 'monospace', flex: 1 }}
                />
                <Lock size={12} style={{ color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
              Chủ thẻ
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value.toUpperCase())}
              placeholder="NGUYEN VAN A"
              style={{ ...inputBase, textTransform: 'uppercase', letterSpacing: '0.04em' }}
            />
          </div>
        </div>
      </div>

      {/* ── Bank Account ── */}
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem' }}>
          <Building2 size={20} style={{ color: 'rgba(122,92,92,0.6)' }} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--content)' }}>
            Ngân hàng liên kết
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }} ref={dropdownRef}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(122,92,92,0.5)', letterSpacing: '0.04em' }}>
              Tên ngân hàng
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(122,92,92,0.35)' }} />
              <input
                type="text"
                value={bankSearch}
                onChange={(e) => {
                  setBankSearch(e.target.value);
                  setBankDropdownOpen(true);
                  if (selectedBank && e.target.value !== selectedBank.shortName) {
                    setSelectedBank(null);
                  }
                }}
                onFocus={() => setBankDropdownOpen(true)}
                placeholder="Tìm kiếm ngân hàng..."
                style={{
                  padding: '10px 14px 10px 36px',
                  fontSize: '0.9rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  color: 'var(--content)',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(122,92,92,0.35)', pointerEvents: 'none' }} />
            </div>

            {bankDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  background: '#fff',
                  border: '1px solid rgba(122,92,92,0.12)',
                  borderRadius: '12px',
                  marginTop: '4px',
                  boxShadow: '0 8px 30px rgba(122,92,92,0.12)',
                }}
              >
                {filteredBanks.length === 0 ? (
                  <div style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'rgba(122,92,92,0.5)' }}>
                    Không tìm thấy ngân hàng
                  </div>
                ) : (
                  filteredBanks.slice(0, 30).map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => handleSelectBank(bank)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(122,92,92,0.06)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,165,165,0.06)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <img src={bank.logo} alt={bank.shortName} style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'contain' }} />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--content)' }}>{bank.shortName}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(122,92,92,0.5)' }}>{bank.name}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(122,92,92,0.5)', letterSpacing: '0.04em' }}>
              Số tài khoản
            </label>
            <input
              type="text"
              value={bankAccNum}
              onChange={(e) => setBankAccNum(e.target.value.replace(/\D/g, '').slice(0, 20))}
              placeholder="Số tài khoản"
              style={{
                padding: '10px 14px',
                fontSize: '0.9rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: 'var(--content)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(122,92,92,0.5)', letterSpacing: '0.04em' }}>
              Chủ tài khoản
            </label>
            <input
              type="text"
              value={bankAccName}
              onChange={(e) => setBankAccName(e.target.value.toUpperCase())}
              placeholder="Nhập tên chủ tài khoản..."
              style={{
                padding: '10px 14px',
                fontSize: '0.9rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                color: 'var(--content)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
              }}
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="btn-profile-primary"
        style={{ padding: '11px 28px', borderRadius: '12px', fontSize: '0.88rem' }}
      >
        Lưu thông tin
      </button>
    </motion.div>
  );
}
