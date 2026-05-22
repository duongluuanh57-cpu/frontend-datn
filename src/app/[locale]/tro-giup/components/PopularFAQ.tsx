'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { FAQ_DATA } from '@/data/faq-data';
import { FAQItem } from './FAQItem';

const POPULAR_IDS = ['faq-1', 'faq-9', 'faq-23', 'faq-30', 'faq-37'];

export function PopularFAQ() {
  const locale = useLocale();
  const popular = FAQ_DATA.filter((item) => POPULAR_IDS.includes(item.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-16 bg-white/30 border border-[#D4A5A5]/15 rounded-xl p-6"
    >
      <h2 className="text-base font-medium text-[#7A5C5C] mb-5"
        style={{ fontFamily: 'var(--font-heading), serif' }}>
        {locale === 'vi' ? 'Câu hỏi phổ biến' : 'Popular questions'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {popular.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/40 border border-[#D4A5A5]/10 rounded-lg overflow-hidden"
          >
            <FAQItem item={item} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
