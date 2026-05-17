'use client';

import { Mail, Phone, Languages } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useRouter, usePathname } from '@/navigation';

export function Topbar() {
  const t = useTranslations('Topbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const announcements = [
    t('announcement1'),
    t('announcement2'),
    t('announcement3'),
  ];

  const handleLocaleChange = (newLocale: 'en' | 'vi') => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <section 
      id="site-topbar"
      key={locale}
      className="relative z-[101] w-full bg-[#7A5C5C] text-white backdrop-blur-md bg-opacity-95"
    >
      <div className="flex h-10 w-full items-center justify-between px-4 md:px-8 lg:px-12">

        
        {/* Left Section: Infinite Marquee with Framer Motion */}
        <div className="relative flex flex-1 items-center overflow-hidden mr-8">
          <div className="flex whitespace-nowrap">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear",
                },
              }}
              className="flex items-center gap-12 pr-12"
            >
              {[...announcements, ...announcements, ...announcements].map((text, index) => (
                <div key={index} className="flex items-center gap-4 text-[13px] font-medium tracking-wide">
                  <span className={index % 2 === 0 ? "text-white" : "text-[#F9F6F3]/70"}>
                    {text}
                  </span>
                  <span className="text-white/30">•</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Section: Contact & Language Switcher */}
        <div className="flex items-center gap-6 text-[12px] font-bold tracking-wider">
          {/* Contact Group - Hidden on mobile if needed, but keeping for now */}
          <div className="hidden lg:flex items-center gap-6 border-r border-white/20 pr-6">
            <a 
              href={`mailto:Duongluuanh57@gmail.com`}
              className="flex items-center gap-2 transition-colors hover:text-[#F9F6F3]/70"
            >
              <Mail size={14} strokeWidth={2.5} />
              <span className="uppercase">{t('email')}</span>
            </a>
            <a 
              href="tel:0867493177" 
              className="flex items-center gap-2 transition-colors hover:text-[#F9F6F3]/70"
            >
              <Phone size={14} strokeWidth={2.5} />
              <span>0867.493.177</span>
            </a>
          </div>

          {/* Locale Switcher */}
          <div className="flex items-center gap-3">
            <Languages size={14} className="text-white/60" />
            <div className="flex gap-2">
              <Link
                href={pathname}
                locale="vi"
                className={`transition-all ${locale === 'vi' ? 'text-white underline underline-offset-4' : 'text-white/50 hover:text-white/80'}`}
              >
                VI
              </Link>
              <span className="text-white/20">/</span>
              <Link
                href={pathname}
                locale="en"
                className={`transition-all ${locale === 'en' ? 'text-white underline underline-offset-4' : 'text-white/50 hover:text-white/80'}`}
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
