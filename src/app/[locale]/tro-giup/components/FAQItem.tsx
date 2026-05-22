'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';
import type { FAQItem as FAQItemType } from '@/data/faq-data';

interface FAQItemProps {
  item: FAQItemType;
}

export function FAQItem({ item }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const lang = locale === 'vi' ? 'vi' : 'en';

  return (
    <div className="border-b border-[#D4A5A5]/10 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-sm lg:text-base font-medium text-[#7A5C5C] group-hover:text-[#D4A5A5] transition-colors duration-300 pr-4 leading-relaxed">
          {item.question[lang]}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-shrink-0"
        >
          <ChevronDown size={16} className="text-[#D4A5A5]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="text-[12px] lg:text-sm leading-relaxed text-[#7A5C5C]/70 pb-5 font-medium">
              {item.answer[lang]}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
