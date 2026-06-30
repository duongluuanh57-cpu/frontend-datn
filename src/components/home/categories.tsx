'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flame, Star, Award, Crown, Package, Heart, User, Users, Gamepad2, Grid, Percent } from 'lucide-react';

interface Category {
  name: string;
  icon: string;
  targetId?: string;
  href?: string;
}

interface CategoriesProps {
  categories?: Category[];
}

const defaultCategories: Category[] = [
  { name: 'Flash Sale', icon: 'flame' },
  { name: 'Mới', icon: 'star', targetId: 'session-new' },
  { name: 'Bán chạy', icon: 'award', targetId: 'session-hot' },
  { name: 'Giới hạn', icon: 'crown', targetId: 'session-limited' },
  { name: 'Bộ sưu tập', icon: 'package', targetId: 'session-standard' },
  { name: 'Nữ', icon: 'heart' },
  { name: 'Nam', icon: 'user' },
  { name: 'Unisex', icon: 'users' },
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
};

export function Categories({ categories = defaultCategories }: CategoriesProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, param: Category | string | undefined) => {
    // Backward compatibility: string or undefined = old-style targetId
    if (typeof param === 'string' || param === undefined) {
      if (!param) {
        e.preventDefault();
        window.location.href = '/products';
        return;
      }
      e.preventDefault();
      const el = document.getElementById(param);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    // Category object mode
    if (param.href) {
      e.preventDefault();
      window.location.href = param.href;
      return;
    }
    if (!param.targetId) { e.preventDefault(); window.location.href = '/products'; return; }
    e.preventDefault();
    const el = document.getElementById(param.targetId!);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-6 bg-surface border-b border-border mb-8 md:mb-12">
      <div className="section-container">
        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-10 gap-4">
          {categories.map((category, i) => (
            <motion.a
              key={category.name}
              href="#"
              onClick={(e) => handleClick(e, category)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-2 p-3 hover:bg-white rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-14 h-14 bg-primary-light/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                {iconMap[category.icon] || <Grid size={16} className="text-primary" />}
              </div>
              <span className="text-xs text-text-primary font-medium text-center leading-tight">
                {category.name}
              </span>
            </motion.a>
          ))}
        </div>

        {/* Mobile: horizontal scroll-snap */}
        <div className="md:hidden overflow-x-auto scrollbar-none -mx-4 px-4">
          <div className="flex gap-3 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {categories.map((category) => (
              <a
                key={category.name}
                href="#"
                onClick={(e) => handleClick(e, category)}
                className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-white rounded-xl border border-border/50 transition-colors cursor-pointer group flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-12 h-12 bg-primary-light/20 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {iconMap[category.icon] || <Grid size={14} className="text-primary" />}
                </div>
                <span className="text-[11px] text-text-primary font-medium text-center leading-tight">
                  {category.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}