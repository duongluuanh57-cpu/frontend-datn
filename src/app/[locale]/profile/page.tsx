'use client';

import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { ProfileSidebar } from './components/ProfileSidebar';
import { ProfileTab } from './components/ProfileTab';
import { OrdersTab } from './components/OrdersTab';
import { SecurityTab } from './components/SecurityTab';
import { SettingsTab } from './components/SettingsTab';
import { BankCardsTab } from './components/BankCardsTab';
import { OrderDetailModal } from './components/OrderDetailModal';
import { motion, AnimatePresence } from 'framer-motion';
import './profile.css';

function ProfilePageContent() {
  const userProfile = useUserProfile();
  const { activeTab, mounted, isAuthenticated, user } = userProfile;

  if (!mounted || !isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="profile-page-shell">
      {/* Decorative background blur blobs */}
      <div className="profile-bubble-1" />
      <div className="profile-bubble-2" />

      <div className="profile-container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="profile-dashboard-layout"
        >
          <ProfileSidebar userProfile={userProfile} />

          <main className="profile-dashboard-content">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && <ProfileTab key="profile" userProfile={userProfile} />}
              {activeTab === 'orders' && <OrdersTab key="orders" userProfile={userProfile} />}
              {activeTab === 'bankcards' && <BankCardsTab key="bankcards" userProfile={userProfile} />}
              {activeTab === 'security' && <SecurityTab key="security" userProfile={userProfile} />}
              {activeTab === 'settings' && <SettingsTab key="settings" userProfile={userProfile} />}
            </AnimatePresence>
          </main>
        </motion.div>
      </div>

      <OrderDetailModal userProfile={userProfile} />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--content)' }}>
        Đang tải thông tin cá nhân...
      </div>
    }>
      <ProfilePageContent />
    </React.Suspense>
  );
}
