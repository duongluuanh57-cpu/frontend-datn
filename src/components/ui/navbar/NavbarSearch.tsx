'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from '@/navigation';
import { resolveImageUrl } from '@/lib/api';
import api from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';
import type { NavbarConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_NAVBAR_CONFIG } from '@/hooks/useHomepageConfig';

interface NavbarSearchProps {
  navbarConfig?: NavbarConfig | null;
  style?: NavbarConfig['style'];
}

interface ProductSuggestion {
  _id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
}

export function NavbarSearch({ navbarConfig, style }: NavbarSearchProps) {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sc = navbarConfig?.searchConfig || DEFAULT_NAVBAR_CONFIG.searchConfig;
  const mode = sc.displayMode || 'icon';

  const debouncedQuery = useDebounce(query, 300);
  const hasResults = suggestions.length > 0;

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Fetch product suggestions when search opens
  useEffect(() => {
    if (!isSearchOpen) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/products/suggest?q=&limit=10`);
        if (!cancelled) {
          const products: ProductSuggestion[] = data.data || [];
          setSuggestions(products);
          if (products.length > 0) setIsOpen(true);
        }
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [isSearchOpen]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!debouncedQuery || debouncedQuery.length < 1) {
        try {
          const { data } = await api.get(`/products/suggest?q=&limit=10`);
          if (cancelled) return;
          const products: ProductSuggestion[] = data.data || [];
          setSuggestions(products);
          if (products.length > 0) setIsOpen(true);
        } catch {
          // ignore
        }
        return;
      }

      setIsLoading(true);
      setSelectedIndex(-1);

      try {
        const { data } = await api.get(`/products/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=10`);
        if (cancelled) return;

        const products: ProductSuggestion[] = data.data || [];
        setSuggestions(products);
        setIsOpen(true);
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setIsOpen(false);
      setIsSearchOpen(false);
      setQuery('');
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const totalItems = suggestions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !hasResults) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      const product = suggestions[selectedIndex];
      setIsOpen(false);
      setQuery('');
      router.push(`/product/${product._id}`);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      searchInputRef.current?.blur();
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/product/${productId}`);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div
      ref={containerRef}
      key="search"
      className={`search-container ${isSearchOpen ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        position: 'relative',
      }}
    >
      {mode !== 'text' && (
        <div style={{
          position: 'relative',
          width: isSearchOpen ? '200px' : '40px',
          height: '40px',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value && !isOpen) setIsOpen(true);
            }}
            onFocus={() => { if (query && hasResults) setIsOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder={t('searchPlaceholder')}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              opacity: isSearchOpen ? 1 : 0,
              padding: isSearchOpen ? '0 40px 0 16px' : '0',
              border: isSearchOpen ? '1px solid var(--accent)' : 'none',
              outline: 'none',
              background: 'white',
              borderRadius: '25px',
              fontSize: '0.85rem',
              transition: 'opacity 0.3s',
              color: 'var(--content)',
              pointerEvents: isSearchOpen ? 'auto' : 'none',
              boxShadow: isSearchOpen ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
              zIndex: 1,
            }}
          />

          <button
            className="nav-link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--content)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              width: '40px',
              height: '100%',
              padding: 0,
              flexShrink: 0,
            }}
          >
            {isLoading && isSearchOpen ? (
              <Loader2 size={18} strokeWidth={2} className="animate-spin" style={{ color: '#D4A5A5' }} />
            ) : (
              <Search size={20} strokeWidth={2} style={{ display: isSearchOpen ? 'none' : 'block' }} />
            )}
            <X size={20} strokeWidth={2} style={{ display: isSearchOpen && !isLoading ? 'block' : 'none' }} />
            {!isSearchOpen && <span className="nav-tooltip">{t('search')}</span>}
          </button>
        </div>
      )}

      {(mode === 'text' || mode === 'icon-text') && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: style?.textColor || 'var(--content)', whiteSpace: 'nowrap' }}>
          {sc.label || t('search')}
        </span>
      )}

      {isOpen && isSearchOpen && (
        <div
          className="search-dropdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            maxHeight: '300px',
            background: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(122,92,92,0.12)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {suggestions.length > 0 && (
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {suggestions.map((product, idx) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => handleSelectProduct(product._id)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    border: 'none',
                    background: selectedIndex === idx ? 'rgba(212,165,165,0.1)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
            overflowY: 'auto',
                    flexShrink: 0,
                    background: '#f5f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {product.image ? (
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <ImageIcon size={16} style={{ color: '#ccc' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#5D4040', lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '2px' }}>
                      {product.brand}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D4A5A5', whiteSpace: 'nowrap' }}>
                    {formatPrice(product.price)}
                  </div>
                </button>
              ))}
            </div>
          )}



          {!hasResults && !isLoading && debouncedQuery.length >= 1 && (
            <div style={{
              padding: '24px 16px',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#b8a0a0',
            }}>
              {t('noResults') || 'Không tìm thấy sản phẩm'}
            </div>
          )}

          {isLoading && !hasResults && (
            <div style={{
              padding: '20px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#b8a0a0',
            }}>
              <Loader2 size={14} className="animate-spin" />
              Đang tìm...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
