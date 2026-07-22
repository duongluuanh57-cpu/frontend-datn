'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Flame, Star, Award, Crown, Package, Heart, User, Users, Gamepad2, Grid, Percent } from 'lucide-react';
import { useProductsFilterStore } from '@/store/useProductsFilterStore';

interface Category {
  name: string;
  icon: string;
  targetId?: string;
  href?: string;
  category?: string;
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
  { name: 'Nữ', icon: 'heart', href: '/products', category: 'Nữ' as const },
  { name: 'Nam', icon: 'user', href: '/products', category: 'Nam' as const },
  { name: 'Unisex', icon: 'users', href: '/products', category: 'Unisex' as const },
  { name: 'Mini Games', icon: 'gamepad', href: '/mini-games' },
  { name: 'Tất cả', icon: 'grid', href: '/products' },
];

const iconMap: Record<string, React.ReactNode> = {
  flame: <Flame size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  star: <Star size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  award: <Award size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  crown: <Crown size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  package: <Package size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  heart: <Heart size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  user: <User size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  users: <Users size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  gamepad: <Gamepad2 size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  percent: <Percent size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
  grid: <Grid size={16} className="text-primary group-hover:text-primary-dark transition-colors" />,
};

export function Categories({ categories = defaultCategories }: CategoriesProps) {
  const router = useRouter();
  const setFilterAndGo = useProductsFilterStore((s) => s.setFilterAndGo);

  const navigateToProducts = useCallback((category?: string) => {
    router.push(setFilterAndGo(category ? { pendingCategory: category } : {}));
  }, [router, setFilterAndGo]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, param: Category | string | undefined) => {
    // Backward compatibility: string or undefined = old-style targetId
    if (typeof param === 'string' || param === undefined) {
      if (!param) {
        e.preventDefault();
        navigateToProducts();
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
    if (param.category) {
      e.preventDefault();
      navigateToProducts(param.category);
      return;
    }
    if (!param.targetId) { e.preventDefault(); navigateToProducts(); return; }
    e.preventDefault();
    const el = document.getElementById(param.targetId!);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="py-6 bg-background border-b border-border mb-8 md:mb-12">
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
              className="flex flex-col items-center gap-2 p-3 hover:bg-background rounded-xl transition-colors cursor-pointer group"
            >
              <div className="w-14 h-14 bg-primary-light/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                {iconMap[category.icon] || <Grid size={16} className="text-primary group-hover:text-primary-dark transition-colors" />}
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
                className="flex flex-col items-center gap-2 p-3 min-w-[80px] bg-background rounded-xl border border-border transition-colors cursor-pointer group flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="w-12 h-12 bg-primary-light/20 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {iconMap[category.icon] || <Grid size={14} className="text-primary group-hover:text-primary-dark transition-colors" />}
                </div>
                <span className="text-xs text-text-primary font-medium text-center leading-tight">
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
