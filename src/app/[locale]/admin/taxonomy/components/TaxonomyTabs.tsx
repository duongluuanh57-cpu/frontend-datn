'use client';

import React from 'react';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';

interface TaxonomyTabsProps {
  adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyTabs({ adminTaxonomy }: TaxonomyTabsProps) {
  const { tabs, activeTab, setActiveTab, isVi } = adminTaxonomy;

  return (
    <div 
      style={{ 
        display: 'flex', 
        gap: '24px', 
        borderBottom: '1px solid var(--admin-border-subtle, rgba(61,46,36,0.08))', 
        marginBottom: '24px',
        paddingBottom: '2px',
        overflowX: 'auto' 
      }}
      className="admin-scrollbar-luxury"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: active ? '2px solid #D4A5A5' : '2px solid transparent',
              color: active ? '#D4A5A5' : 'var(--admin-text-muted, #9a857c)',
              padding: '8px 4px 12px 4px',
              fontSize: '0.875rem',
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
            }}
          >
            {isVi ? tab.labelVi : tab.labelEn}
          </button>
        );
      })}
    </div>
  );
}
