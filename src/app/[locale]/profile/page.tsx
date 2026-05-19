'use client';

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from '@/navigation';
import { LogOut, LayoutDashboard, User as UserIcon, Mail, Shield, Settings, ShoppingBag, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, accessToken } = useAuthStore();
  const router = useRouter();

  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const handleChangePassword = async () => {
    setStatusMessage(null);
    if (!accessToken) {
      setStatusMessage('Bạn cần đăng nhập lại để đổi mật khẩu.');
      return;
    }
    if (newPassword.length < 6) {
      setStatusMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data?.message || 'Lỗi khi đổi mật khẩu');
      } else {
        setStatusMessage('Đổi mật khẩu thành công');
        setShowChangePassword(false);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      }
    } catch (err: any) {
      setStatusMessage(err.message || 'Lỗi mạng');
    } finally {
      setSubmitting(false);
    }
  };


  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect shortly
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUBADMIN';

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFF5F5', 
      position: 'relative',
      overflow: 'hidden',
      padding: '4rem 2rem' 
    }}>
      {/* Decorative Blur Blobs for Glassmorphism Effect */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50vw',
        height: '50vw',
        background: 'var(--accent)',
        filter: 'blur(120px)',
        opacity: 0.15,
        borderRadius: '50%',
        zIndex: 0,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        right: '-5%',
        width: '40vw',
        height: '40vw',
        background: '#e7b8b8',
        filter: 'blur(100px)',
        opacity: 0.2,
        borderRadius: '50%',
        zIndex: 0,
      }} />

      <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ 
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '32px', 
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,1)',
            overflow: 'hidden'
          }}
        >
          {/* Minimalist Cover Header */}
          <div style={{ 
            height: '160px', 
            background: 'linear-gradient(135deg, rgba(231,184,184,0.4) 0%, rgba(212,154,154,0.1) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.5)',
            position: 'relative'
          }} />

          {/* Profile Content */}
          <div style={{ padding: '0 3.5rem 3.5rem', position: 'relative' }}>
            {/* Avatar */}
            <div style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffffff 0%, #fcfcfc 100%)',
              border: '4px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 8px 24px rgba(192, 132, 151, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              top: '-55px',
              left: '3.5rem'
            }}>
              <UserIcon size={50} color="var(--primary)" strokeWidth={1.5} />
            </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '70px', gap: '20px' }}>
              <div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em', margin: 0 }}>
                  {user.username}
                </h1>
                <p style={{ color: 'var(--content)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', marginTop: '6px' }}>
                  <Mail size={16} strokeWidth={2} /> {user.email}
                </p>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  backgroundColor: isAdmin ? 'var(--primary)' : 'rgba(231,184,184,0.3)', 
                  color: isAdmin ? 'white' : 'var(--primary)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginTop: '16px',
                  border: isAdmin ? 'none' : '1px solid rgba(231,184,184,0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  <Shield size={14} strokeWidth={2.5} />
                  {user.role}
                </div>
                
                {/* Full Profile Details */}
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.5)' }}>
                  {Object.entries(user)
                    .filter(([key]) => key !== 'password' && key !== 'role' && key !== 'username' && key !== 'email')
                    .map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 700, textTransform: 'capitalize', color: 'var(--primary)' }}>{key}:</span>
                        <span style={{ color: 'var(--content)' }}>{String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {isAdmin && (
                  <button 
                    onClick={() => router.push('/admin')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 8px 20px rgba(32, 23, 23, 0.15)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(32, 23, 23, 0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(32, 23, 23, 0.15)'; }}
                  >
                    <LayoutDashboard size={18} strokeWidth={2.5} />
                    Vào Dashboard
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <LogOut size={18} strokeWidth={2.5} />
                  Đăng xuất
                </button>
              </div>
            </div>

            {/* User Details Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: '1.5rem',
              marginTop: '3.5rem'
            }}>
              {[
                { icon: ShoppingBag, title: 'Đơn hàng của tôi', desc: 'Xem lịch sử mua hàng và theo dõi vận chuyển.' },
                { icon: Heart, title: 'Sản phẩm yêu thích', desc: 'Bộ sưu tập các mùi hương bạn đã đánh dấu.' },
                { icon: Settings, title: 'Thiết lập tài khoản', desc: 'Quản lý mật khẩu và thông tin cá nhân.' }
              ].map((item, idx) => {
                const isSettings = item.title === 'Thiết lập tài khoản';
                return (
                  <div key={idx} style={{ 
                    padding: '1.8rem', 
                    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '8px' }}>
                      <item.icon size={22} strokeWidth={2} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--content)', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>

                    {isSettings && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={() => setShowChangePassword(s => !s)} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{showChangePassword ? 'Huỷ' : 'Đổi mật khẩu'}</button>

                        {showChangePassword && (
                          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input placeholder="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" />
                            <input placeholder="Mật khẩu mới" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" />
                            <input placeholder="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
                            {statusMessage && <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{statusMessage}</div>}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button disabled={submitting} onClick={handleChangePassword} style={{ padding: '10px 14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>{submitting ? 'Đang...' : 'Xác nhận'}</button>
                              <button onClick={() => { setShowChangePassword(false); setStatusMessage(null); }} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.08)', background: 'white', color: 'var(--primary)', fontWeight: 700 }}>Huỷ</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
