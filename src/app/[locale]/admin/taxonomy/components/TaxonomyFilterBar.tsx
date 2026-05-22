'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import type { UseAdminTaxonomyReturn } from '@/hooks/useAdminTaxonomy';

interface TaxonomyFilterBarProps {
    adminTaxonomy: UseAdminTaxonomyReturn;
}

export function TaxonomyFilterBar({ adminTaxonomy }: TaxonomyFilterBarProps) {
    const { isVi, searchTerm, setSearchTerm } = adminTaxonomy;

    return (
        <div
            style={{
                display: 'flex',
                gap: '16px',
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-lg)',
                padding: '20px',
                marginBottom: '24px',
                boxShadow: 'var(--admin-shadow-sm)',
                backdropFilter: 'blur(10px)',
            }}
        >
            {/* Search Input */}
            <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
                <Search
                    size={16}
                    style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--admin-text-muted)',
                    }}
                />
                <input
                    type="text"
                    placeholder={isVi ? 'Tìm kiếm tag, nhóm hương, nồng độ...' : 'Search tags, scent groups, concentrations...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px 14px 10px 40px',
                        borderRadius: 'var(--admin-radius-md)',
                        background: 'var(--admin-surface-muted)',
                        border: '1px solid var(--admin-border-subtle)',
                        color: 'var(--admin-text)',
                        fontSize: '0.8125rem',
                        outline: 'none',
                        transition: 'all 0.2s',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
                        e.target.style.boxShadow = '0 0 0 2px rgba(212, 165, 165, 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--admin-border-subtle)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--admin-text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px',
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}