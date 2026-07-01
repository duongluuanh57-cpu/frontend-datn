'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, User, Users, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const USPS = [
  {
    icon: Heart,
    title: 'NƯỚC HOA NỮ',
    desc: 'Hương thơm quyến rũ, mềm mại và sang trọng phong cách dành cho nữ.',
    keyword: 'nữ',
  },
  {
    icon: User,
    title: 'NƯỚC HOA NAM',
    desc: 'Tầng hương ấm áp, cay nồng và gỗ trầm, tạo nên phong thái lịch lãm.',
    keyword: 'nam',
  },
  {
    icon: Users,
    title: 'UNISEX',
    desc: 'Pha trộn cân bằng cho cả nam và nữ với cảm hứng tự do và nghệ thuật.',
    keyword: 'unisex',
  },
];

function findCategory(categories: any[], keyword: string): string | null {
  const lower = keyword.toLowerCase();
  const match = categories.find(
    (c: any) => c.status === 'active' && c.name.toLowerCase().includes(lower)
  );
  return match ? match.name : null;
}

export function BrandUsp() {
  const { data: categoryData } = useQuery({
    queryKey: ['brand-usp-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return (data.data || []) as any[];
    },
    staleTime: 300_000,
  });

  const activeCategories = (categoryData || []).filter((c: any) => c.status === 'active');

  const currentUsps = USPS.map((usp) => {
    const dbName = findCategory(activeCategories, usp.keyword);
    return {
      ...usp,
      href: dbName
        ? `/products?category=${encodeURIComponent(dbName)}`
        : `/products?category=${usp.keyword}`,
    };
  });

  return (
    <section className="relative mx-auto max-w-7xl bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>

      <div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentUsps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col items-center p-6 pt-8 pb-8 text-center rounded-xl border border-primary/10 bg-background/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 min-h-[280px]"
              >
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-background shadow-sm border border-primary/10 text-primary">
                  <Icon size={22} className="stroke-[1.6]" />
                </div>

                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-text-primary mb-2">
                  {usp.title}
                </h3>

                <p className="text-[11px] leading-relaxed text-text-secondary font-medium max-w-[240px] mb-auto">
                  {usp.desc}
                </p>

                <Link
                  href={usp.href}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all duration-300 group/btn"
                >
                  Khám phá ngay
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
