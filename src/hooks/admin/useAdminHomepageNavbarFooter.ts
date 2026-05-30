'use client';

import { useState, useCallback } from 'react';
import type { NavbarConfig, FooterConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_NAVBAR_CONFIG, DEFAULT_FOOTER_CONFIG } from '@/hooks/useHomepageConfig';

export function useAdminHomepageNavbarFooter() {
  const [navbarConfig, setNavbarConfig] = useState<NavbarConfig>(DEFAULT_NAVBAR_CONFIG);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);

  const initNavbarFooter = useCallback((dbConfig: any) => {
    // Navbar
    if (dbConfig?.navbar) {
      const cfg = dbConfig.navbar;
      setNavbarConfig({
        logo: { ...DEFAULT_NAVBAR_CONFIG.logo, ...cfg.logo },
        links: cfg.links?.length > 0
          ? cfg.links.map((l: any) => ({ ...DEFAULT_NAVBAR_CONFIG.links[0], ...l }))
          : DEFAULT_NAVBAR_CONFIG.links,
        searchConfig: { ...DEFAULT_NAVBAR_CONFIG.searchConfig, ...cfg.searchConfig },
        cartConfig: { ...DEFAULT_NAVBAR_CONFIG.cartConfig, ...cfg.cartConfig },
        userConfig: { ...DEFAULT_NAVBAR_CONFIG.userConfig, ...cfg.userConfig },
        style: { ...DEFAULT_NAVBAR_CONFIG.style, ...cfg.style },
        layout: cfg.layout?.left
          ? { left: cfg.layout.left, center: cfg.layout.center, right: cfg.layout.right }
          : DEFAULT_NAVBAR_CONFIG.layout,
      });
    }
    // Footer
    if (dbConfig?.footer) {
      const cfg = dbConfig.footer;
      setFooterConfig({
        style: { ...DEFAULT_FOOTER_CONFIG.style, ...cfg.style },
        brand: { ...DEFAULT_FOOTER_CONFIG.brand, ...cfg.brand },
        columns: cfg.columns?.length > 0
          ? cfg.columns.map((col: any) => ({
              id: col.id || `col-${Math.random().toString(36).slice(2, 6)}`,
              title: col.title,
              links: col.links?.length > 0 ? col.links.map((l: any) => ({ ...DEFAULT_FOOTER_CONFIG.columns[0].links[0], ...l })) : [],
              enabled: col.enabled ?? true,
            }))
          : DEFAULT_FOOTER_CONFIG.columns,
        socialLinks: cfg.socialLinks?.length > 0
          ? cfg.socialLinks.map((sl: any) => ({ ...DEFAULT_FOOTER_CONFIG.socialLinks[0], ...sl }))
          : DEFAULT_FOOTER_CONFIG.socialLinks,
        newsletter: { ...DEFAULT_FOOTER_CONFIG.newsletter, ...cfg.newsletter },
        copyright: { ...DEFAULT_FOOTER_CONFIG.copyright, ...cfg.copyright },
        layout: { ...DEFAULT_FOOTER_CONFIG.layout, ...cfg.layout },
      });
    }
  }, []);

  return {
    navbarConfig, setNavbarConfig,
    footerConfig, setFooterConfig,
    initNavbarFooter,
  };
}