'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search } from 'lucide-react';
import { useLocale } from 'next-intl';
import { FAQ_DATA } from '@/data/faq-data';
import { FAQItem } from './FAQItem';

const ALL_KEY = '__all__';

const CATEGORIES = [
  { id: ALL_KEY, vi: 'Tất cả chủ đề', en: 'All topics' },
  { id: 'Tài khoản & Đăng nhập', vi: 'Tài khoản & Đăng nhập', en: 'Account & Login' },
  { id: 'Đặt hàng & Thanh toán', vi: 'Đặt hàng & Thanh toán', en: 'Orders & Payment' },
  { id: 'Vận chuyển & Giao nhận', vi: 'Vận chuyển & Giao nhận', en: 'Shipping & Delivery' },
  { id: 'Đổi trả & Hoàn tiền', vi: 'Đổi trả & Hoàn tiền', en: 'Returns & Refunds' },
  { id: 'Sản phẩm & Hương thơm', vi: 'Sản phẩm & Hương thơm', en: 'Products & Fragrance' },
  { id: 'Khuyến mãi & Voucher', vi: 'Khuyến mãi & Voucher', en: 'Promotions & Vouchers' },
  { id: 'Kỹ thuật & Bảo mật', vi: 'Kỹ thuật & Bảo mật', en: 'Technical & Security' },
];

export function FAQCategorySelect() {
  const [selected, setSelected] = useState(ALL_KEY);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const locale = useLocale();
  const lang = locale === 'vi' ? 'vi' : 'en';

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      return FAQ_DATA.filter(
        (item) =>
          item.question.vi.toLowerCase().includes(query) ||
          item.question.en.toLowerCase().includes(query) ||
          item.answer.vi.toLowerCase().includes(query) ||
          item.answer.en.toLowerCase().includes(query)
      );
    }
    if (selected === ALL_KEY) return FAQ_DATA;
    return FAQ_DATA.filter((item) => item.category.vi === selected);
  }, [selected, searchQuery]);

  const currentLabel = CATEGORIES.find((c) => c.id === selected)?.[lang] ?? 'All topics';
  const currentCount = filtered.length;

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#D4A5A5]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'vi' ? 'Tìm câu hỏi...' : 'Search questions...'}
          className="w-full bg-white/30 border border-[#D4A5A5]/20 rounded-xl pl-11 pr-5 py-4 text-sm text-[#7A5C5C] placeholder:text-[#7A5C5C]/40 outline-none focus:border-[#D4A5A5]/50 transition-colors duration-300"
        />
      </div>

      <div className="relative mb-10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-white/30 border border-[#D4A5A5]/20 rounded-xl px-5 py-4 text-left group"
        >
          <span className="text-sm font-medium text-[#7A5C5C]">{searchQuery ? (locale === 'vi' ? 'Kết quả tìm kiếm' : 'Search results') : currentLabel}</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-[#D4A5A5] bg-[#D4A5A5]/10 px-3 py-1 rounded-full">
              {currentCount} {locale === 'vi' ? 'câu hỏi' : 'questions'}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <ChevronDown size={16} className="text-[#D4A5A5]" />
            </motion.div>
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden absolute top-full left-0 right-0 z-20 mt-2 bg-white/90 backdrop-blur-md border border-[#D4A5A5]/20 rounded-xl shadow-lg"
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelected(cat.id);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                  className={`w-full px-5 py-3.5 text-left text-sm transition-colors duration-200 ${
                    selected === cat.id
                      ? 'text-[#D4A5A5] font-medium'
                      : 'text-[#7A5C5C] hover:text-[#D4A5A5]'
                  }`}
                >
                  {cat[lang]}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div layout className="bg-white/30 rounded-xl px-6">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <FAQItem item={item} />
              </motion.div>
            ))
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-sm text-[#7A5C5C]/50 text-center"
            >
              {locale === 'vi' ? 'Không tìm thấy câu hỏi nào.' : 'No questions found.'}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
