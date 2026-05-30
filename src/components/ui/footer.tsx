'use client';

import React from 'react';
import { Link } from '@/navigation';
import { Camera, Globe, Send, Mail } from 'lucide-react';
import { useHomepageConfig, DEFAULT_FOOTER_CONFIG } from '@/hooks/useHomepageConfig';
import type { FooterConfig } from '@/hooks/useHomepageConfig';
import './footer.css';

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: <Camera size={18} />,
  facebook: <Globe size={18} />,
  twitter: <Send size={18} />,
};

export function Footer() {
  const { data: homepageConfig } = useHomepageConfig();
  const config: FooterConfig = homepageConfig?.footer || DEFAULT_FOOTER_CONFIG;
  const { style, brand, columns, socialLinks, newsletter, copyright, layout } = config;
  const currentYear = new Date().getFullYear();

  const orderedSections = layout.columnOrder.filter(id => {
    if (id === 'brand') return layout.showBrand && brand.enabled;
    if (id === 'newsletter') return layout.showNewsletter && newsletter.enabled;
    if (id.startsWith('col-')) {
      const col = columns.find(c => c.id === id);
      return col?.enabled;
    }
    return true;
  });

  const visibleSocialLinks = socialLinks.filter(sl => sl.enabled);

  return (
    <footer className="footer-luxury" style={{
      background: style.background,
      borderTop: `1px solid ${style.borderColor}`,
      color: style.textColor,
    }}>
      <div className="footer-container">
        {orderedSections.map((id) => {
          if (id === 'brand') {
            return (
              <div key="brand" className="footer-col footer-brand">
                <h2 style={{ color: style.headingColor }}>{brand.title}</h2>
                <p>{brand.description}</p>
                {layout.showSocialLinks && visibleSocialLinks.length > 0 && (
                  <div className="social-links">
                    {visibleSocialLinks.map((sl, i) => (
                      <a key={i} href={sl.url} aria-label={sl.platform}
                        style={{ color: style.textColor, borderColor: style.borderColor }}>
                        {SOCIAL_ICONS[sl.platform] || <Globe size={18} />}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (id === 'newsletter') {
            return (
              <div key="newsletter" className="footer-col footer-newsletter">
                <h4 style={{ color: style.headingColor }}>{newsletter.title}</h4>
                <p>{newsletter.description}</p>
                <div className="contact-info flex items-center gap-3 text-sm opacity-60">
                  <Mail size={16} />
                  <span>{newsletter.email}</span>
                </div>
              </div>
            );
          }
          const col = columns.find(c => c.id === id);
          if (col) {
            const visibleLinks = col.links.filter(l => l.enabled).sort((a, b) => a.order - b.order);
            return (
              <div key={col.id} className="footer-col footer-links">
                <h4 style={{ color: style.headingColor }}>{col.title}</h4>
                <ul>
                  {visibleLinks.map((link, i) => (
                    <li key={i}>
                      <Link href={link.href} style={{ color: style.textColor }}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })}
      </div>

      {copyright.enabled && (
        <div className="footer-bottom" style={{ borderTop: `1px solid ${style.borderColor}` }}>
          <p>&copy; {currentYear} {copyright.text}</p>
          <div className="footer-legal">
            <Link href="/privacy">Bảo mật</Link>
            <Link href="/terms">Điều khoản</Link>
            <Link href="/shipping">Vận chuyển</Link>
          </div>
        </div>
      )}
    </footer>
  );
}
