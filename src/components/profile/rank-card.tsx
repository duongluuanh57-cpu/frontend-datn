'use client';

import { Medal, ShoppingBag, Clock, Wallet } from 'lucide-react';

interface RankCardProps {
  user: any;
  ordersCount: number;
}

const tierConfig: Record<string, { label: string; gradient: string; iconColor: string; borderColor: string; bgLight: string }> = {
  MEMBER: {
    label: 'Đồng',
    gradient: 'from-amber-100 to-amber-200',
    iconColor: 'text-amber-700',
    borderColor: 'border-amber-500',
    bgLight: 'bg-amber-50',
  },
  SILVER: {
    label: 'Bạc',
    gradient: 'from-slate-100 to-slate-300',
    iconColor: 'text-slate-500',
    borderColor: 'border-slate-400',
    bgLight: 'bg-slate-50',
  },
  GOLD: {
    label: 'Vàng',
    gradient: 'from-yellow-100 to-yellow-300',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-500',
    bgLight: 'bg-yellow-50',
  },
  PLATINUM: {
    label: 'Bạch kim',
    gradient: 'from-cyan-100 to-cyan-300',
    iconColor: 'text-cyan-600',
    borderColor: 'border-cyan-500',
    bgLight: 'bg-cyan-50',
  },
  DIAMOND: {
    label: 'Kim cương',
    gradient: 'from-blue-100 to-purple-300',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-500',
    bgLight: 'bg-purple-50',
  },
};

export function RankManager({ user, ordersCount }: RankCardProps) {
  const totalSpent = user?.totalSpent || 0;

  const getTier = (spent: number): string => {
    if (spent >= 100000000) return 'DIAMOND';
    if (spent >= 50000000) return 'PLATINUM';
    if (spent >= 20000000) return 'GOLD';
    if (spent >= 5000000) return 'SILVER';
    return 'MEMBER';
  };

  const tier = getTier(totalSpent);
  const config = tierConfig[tier] || tierConfig.MEMBER;

  const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
  const expiryDate = new Date(createdAt);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Thứ hạng</h2>

      {/* Greeting */}
      <p className="text-sm text-text-secondary">
        Chào <span className="font-semibold text-text-primary">{user?.fullName || user?.username || 'Người dùng'}</span>,
        bạn đang là thành viên{' '}
        <span className="font-semibold text-primary">{config.label}</span>
      </p>

      {/* Rank Card — Flowbite style */}
      <div className="bg-white rounded-xl border border-border shadow-soft overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-br ${config.gradient} px-6 py-6 md:py-7`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-sm ${config.iconColor}`}>
              <Medal size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{user?.fullName || user?.username || 'Người dùng'}</p>
              <p className="text-sm text-text-secondary">Thành viên {config.label}</p>
            </div>
          </div>
        </div>

        {/* Stats grid — Flowbite style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Thời gian hiệu lực */}
          <div className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${config.bgLight} flex items-center justify-center flex-shrink-0`}>
              <Clock size={18} className={config.iconColor} />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Thời gian hiệu lực</p>
              <p className="text-sm font-semibold text-text-primary mt-0.5">
                1 năm — còn <span className="text-primary">{daysLeft} ngày</span>
              </p>
            </div>
          </div>

          {/* Tổng chi tiêu */}
          <div className="p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full ${config.bgLight} flex items-center justify-center flex-shrink-0`}>
              <Wallet size={18} className={config.iconColor} />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Tổng chi tiêu</p>
              <p className="text-base font-bold text-text-primary mt-0.5">
                {totalSpent.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders count — Flowbite stat card */}
      <div className="bg-white rounded-xl border border-border shadow-soft p-5 flex items-center gap-4 hover:shadow-card transition-shadow duration-200">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <ShoppingBag size={20} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Số đơn hàng đã mua</p>
          <p className="text-lg font-bold text-text-primary mt-0.5">{ordersCount} đơn</p>
        </div>
      </div>
    </div>
  );
}