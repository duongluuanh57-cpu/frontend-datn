'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Flame, Star, Award, Crown, Package, Heart, User, Users, Gamepad2, Grid, Percent, Tag } from 'lucide-react';
import api from '@/lib/api';

const staticItems = [
  { name: 'Flash Sale', icon: 'flame' },
  { name: 'Mới', icon: 'star', targetId: 'session-new' },
  { name: 'Bán chạy', icon: 'award', targetId: 'session-hot' },
  { name: 'Giới hạn', icon: 'crown', targetId: 'session-limited' },
  { name: 'Bộ sưu tập', icon: 'package', targetId: 'session-standard' },
];

function findCatName(categories: any[], keyword: string, fallback: string): string {
  const match = (categories || []).find(
    (c: any) => c.status === 'active' && c.name.toLowerCase().includes(keyword)
  );
  return match ? match.name : fallback;
}

const genderKeys = [
  { name: 'Nữ', icon: 'heart', keyword: 'nữ' },
  { name: 'Nam', icon: 'user', keyword: 'nam' },
  { name: 'Unisex', icon: 'users', keyword: 'unisex' },
];

const fixedItems = [
  { name: 'Mini Games', icon: 'gamepad', href: '/mini-games' },
  { name: 'Tất cả', icon: 'grid', href: '/products' },
];

const iconMap: Record<string, React.ReactNode> = {
  flame: <Flame size={16} className="text-primary" />,
  star: <Star size={16} className="text-primary" />,
  award: <Award size={16} className="text-primary" />,
  crown: <Crown size={16} className="text-primary" />,
  package: <Package size={16} className="text-primary" />,
  heart: <Heart size={16} className="text-primary" />,
  user: <User size={16} className="text-primary" />,
  users: <Users size={16} className="text-primary" />,
  gamepad: <Gamepad2 size={16} className="text-primary" />,
  percent: <Percent size={16} className="text-primary" />,
  grid: <Grid size={16} className="text-primary" />,
  tag: <Tag size={16} className="text-primary" />,
};

function iconForCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('nữ')) return 'heart';
  if (lower.includes('nam')) return 'user';
  if (lower.includes('unisex')) return 'users';
  if (lower.includes('sale') || lower.includes('giảm')) return 'percent';
  return 'tag';
}

export function Categories() {
  const { data: categoryData } = useQuery({
    queryKey: ['home-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return (data.data || []) as any[];
    },
    staleTime: 300_000,
  });

  const dynamicCategories = (categoryData || [])
    .filter((c: any) => c.status === 'active')
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((c: any) => ({
      name: c.name,
      icon: iconForCategory(c.name),
      href: `/products?category=${encodeURIComponent(c.name)}`,
    }));

  const genderItems = genderKeys.map((g) => ({
    name: g.name,
    icon: g.icon,
    href: `/products?category=${encodeURIComponent(findCatName(categoryData, g.keyword, g.name))}`,
  }));

  const allItems = [...staticItems, ...dynamicCategories, ...genderItems, ...fixedItems];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof allItems[0]) => {
    if (item.href) {
      e.preventDefault();
      window.location.href = item.href;
      return;
    }
    if (item.targetId) {
      e.preventDefault();
      const el = document.getElementById(item.targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-6 bg-surface border-b border-border mb-8 md:mb-12">
      <div className="section-container">
        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-8 lg:grid-cols-10 gap-4">
          {allItems.map((item, i) => (
            <motion.a
              key={item.name}
              href="#"
              onClick={(e) => handleClick(e, item)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-2 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-14 h-14 bg-primary-light/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                {iconMap[item.icon] || <Grid size={16} className="text-primary" />}
              </div>
              <span className="text-xs text-text-primary font-medium text-center leading-tight">
                {item.name}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Mobile: horizontal scroll-snap */}
        <div className="md:hidden overflow-x-auto scrollbar-none -mx-4 px-4">
          <div className="flex gap-3 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {allItems.map((item) => (
              <a
                key={item.name}
                href="#"
                onClick={(e) => handleClick(e, item)}
                className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl border border-border/50 transition-colors cursor-pointer group flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-12 h-12 bg-primary-light/20 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {iconMap[item.icon] || <Grid size={14} className="text-primary" />}
                </div>
                <span className="text-[11px] text-text-primary font-medium text-center leading-tight">
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
