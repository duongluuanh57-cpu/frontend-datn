'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sc = navbarConfig?.searchConfig || DEFAULT_NAVBAR_CONFIG.searchConfig;
  const mode = sc.displayMode || 'icon';

  const debouncedQuery = useDebounce(query, 300);
  const hasResults = suggestions.length > 0 || aiSuggestions.length > 0;

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) {
      setSuggestions([]);
      setAiSuggestions([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setSelectedIndex(-1);

    (async () => {
      try {
        const { data } = await api.get(`/products/suggest?q=${encodeURIComponent(debouncedQuery)}&limit=8`);
        if (cancelled) return;

        const products: ProductSuggestion[] = data.data || [];
        setSuggestions(products);

        if (products.length === 0 && debouncedQuery.length >= 2) {
          try {
            const aiRes = await api.post('/ai/autocomplete', {
              field: 'name',
              currentValue: debouncedQuery,
            });
            if (!cancelled && aiRes.data?.success) {
              setAiSuggestions(aiRes.data.data || []);
            }
          } catch {
            setAiSuggestions([]);
          }
        } else {
          setAiSuggestions([]);
        }

        setIsOpen(true);
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setAiSuggestions([]);
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
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const totalItems = suggestions.length + aiSuggestions.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !hasResults) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex < suggestions.length) {
        const product = suggestions[selectedIndex];
        setIsOpen(false);
        setQuery('');
        router.push(`/product/${product._id}`);
      } else {
        const aiIdx = selectedIndex - suggestions.length;
        const aiText = aiSuggestions[aiIdx];
        if (aiText) {
          setIsOpen(false);
          setQuery('');
          router.push(`/search?q=${encodeURIComponent(aiText)}`);
        }
      }
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

  const handleSelectAi = (text: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/search?q=${encodeURIComponent(text)}`);
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
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          width: isSearchOpen ? '300px' : '40px',
          height: '40px',
          justifyContent: 'center',
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
              right: 0,
              width: '100%',
              opacity: isSearchOpen ? 1 : 0,
              padding: isSearchOpen ? '10px 45px 10px 20px' : '0',
              border: isSearchOpen ? '1px solid var(--accent)' : 'none',
              outline: 'none',
              background: 'white',
              borderRadius: '25px',
              fontSize: '0.9rem',
              transition: 'opacity 0.3s',
              color: 'var(--content)',
              pointerEvents: isSearchOpen ? 'auto' : 'none',
              boxShadow: isSearchOpen ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
              zIndex: 1,
            }}
          />

          {isSearchOpen && query && (
            <button
              onClick={() => { setQuery(''); setSuggestions([]); setAiSuggestions([]); setIsOpen(false); searchInputRef.current?.focus(); }}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                zIndex: 2,
                padding: '2px',
              }}
            >
              <X size={16} />
            </button>
          )}

          <button
            className="nav-link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            style={{
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
              <Loader2 size={22} strokeWidth={2} className="animate-spin" style={{ color: '#D4A5A5' }} />
            ) : (
              <Search size={26} strokeWidth={2} style={{ display: isSearchOpen ? 'none' : 'block' }} />
            )}
            <X size={26} strokeWidth={2} style={{ display: isSearchOpen && !isLoading ? 'block' : 'none' }} />
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
            width: '340px',
            maxHeight: '420px',
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
                    overflow: 'hidden',
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

          {aiSuggestions.length > 0 && (
            <div style={{
              borderTop: suggestions.length > 0 ? '1px solid rgba(122,92,92,0.08)' : 'none',
              padding: '6px 0',
            }}>
              <div style={{
                padding: '6px 14px 4px',
                fontSize: '0.65rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#b8a0a0',
              }}>
                <Sparkles size={10} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                Gợi ý tìm kiếm
              </div>
              {aiSuggestions.map((text, idx) => {
                const globalIdx = suggestions.length + idx;
                return (
                  <button
                    key={`ai-${idx}`}
                    type="button"
                    onClick={() => handleSelectAi(text)}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 14px',
                      border: 'none',
                      background: selectedIndex === globalIdx ? 'rgba(212,165,165,0.1)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.8rem',
                      color: '#7A5C5C',
                      transition: 'background 0.15s',
                    }}
                  >
                    <Sparkles size={14} style={{ flexShrink: 0, color: '#D4A5A5' }} />
                    <span style={{ lineClamp: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</span>
                  </button>
                );
              })}
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
