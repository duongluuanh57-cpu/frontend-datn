'use client';

import React from 'react';
import { Globe, Send, Mail } from 'lucide-react';
import type { FooterConfig } from '@/hooks/useHomepageConfig';

const platformIcons: Record<string, React.ReactNode> = {
  instagram: <Globe size={18} />, facebook: <Globe size={18} />,
  twitter: <Send size={18} />, youtube: <Globe size={18} />,
  tiktok: <Send size={18} />, pinterest: <Globe size={18} />,
};

export function FooterPreview({ config }: { config: FooterConfig }) {
  const { style, brand, columns, socialLinks, newsletter, copyright, layout } = config;
  const currentYear = new Date().getFullYear();
  const orderedSections = layout.columnOrder
    .filter(id => {
      if (id === 'brand') return layout.showBrand && brand.enabled;
      if (id === 'newsletter') return layout.showNewsletter && newsletter.enabled;
      if (id.startsWith('col-')) return columns.find(c => c.id === id)?.enabled;
      return true;
    })
    .map(id => {
      if (id === 'brand') return { type: 'brand' as const };
      if (id === 'newsletter') return { type: 'newsletter' as const };
      const col = columns.find(c => c.id === id);
      return col ? { type: 'column' as const, column: col } : null;
    })
    .filter(Boolean);

  return (
    <div className="w-full rounded-xl p-6 shadow-sm" style={{ background: style.background, border: `1px solid ${style.borderColor}`, color: style.textColor }}>
      <div className="grid grid-cols-3 gap-10" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {orderedSections.map((section) => {
          if (!section) return null;
          if (section.type === 'brand') return (
            <div key="brand" className="space-y-4">
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 400, letterSpacing: '0.1em', color: style.headingColor }}>{brand.title}</h2>
              <p className="text-sm leading-relaxed opacity-80 max-w-[320px]">{brand.description}</p>
              {layout.showSocialLinks && (
                <div className="flex gap-3 pt-2">
                  {socialLinks.filter(sl => sl.enabled).map((sl, i) => (
                    <span key={i} className="w-9 h-9 rounded-full border flex items-center justify-center transition-all hover:bg-[#7A5C5C] hover:text-white"
                      style={{ borderColor: style.borderColor, color: style.textColor }}>
                      {platformIcons[sl.platform] || <Globe size={18} />}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
          if (section.type === 'newsletter') return (
            <div key="newsletter" className="space-y-4">
              <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: style.headingColor }}>{newsletter.title}</h4>
              <p className="text-sm opacity-70">{newsletter.description}</p>
              <div className="flex items-center gap-3 text-sm opacity-60"><Mail size={16} /><span>{newsletter.email}</span></div>
            </div>
          );
          if (section.type === 'column' && section.column) {
            const col = section.column;
            return (
              <div key={col.id} className="space-y-4">
                <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: style.headingColor }}>{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.filter(l => l.enabled).sort((a, b) => a.order - b.order).map((link, i) => (
                    <li key={i}><span className="text-sm opacity-70 hover:opacity-100 hover:pl-1 transition-all cursor-pointer" style={{ color: style.textColor }}>{link.label}</span></li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>
      {copyright.enabled && (
        <div className="mt-10 pt-6 flex justify-between items-center text-xs opacity-50" style={{ borderTop: `1px solid ${style.borderColor}` }}>
          <p>&copy; {currentYear} {copyright.text}</p>
          <div className="flex gap-6"><span>Bảo mật</span><span>Điều khoản</span><span>Vận chuyển</span></div>
        </div>
      )}
    </div>
  );
}