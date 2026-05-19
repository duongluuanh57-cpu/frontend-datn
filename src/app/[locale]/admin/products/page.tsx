'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { resolveImageUrl } from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, Sparkles, AlertCircle, Search, ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { formatSizeString } from '@/components/admin/ProductForm';

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  description: string;
  tag?: string;
  rating: number;
  reviewsCount: number;
  size: string;
  quantityInStock: number;
  discountPercentage: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  keywords?: string[];
  soldCount?: number;
}

interface Brand {
  _id: string;
  name: string;
}

const formatPrice = (price: number, locale: string) =>
  new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { 
    style: 'currency', 
    currency: locale === 'vi' ? 'VND' : 'USD' 
  }).format(locale === 'vi' ? price : price / 25000);

export default function AdminProductsPage() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const isVi = locale === 'vi';
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('bestSeller'); // Default sorted by Best Selling!
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data.data as Product[];
    },
  });

  const { data: allBrands } = useQuery({
    queryKey: ['admin-brands-list'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const brands = allBrands
    ? Array.from(new Set([
        ...allBrands.map(b => b.name),
        ...(products ? products.map(p => p.brand) : [])
      ].filter(Boolean)))
    : (products ? Array.from(new Set(products.map(p => p.brand).filter(Boolean))) : []);

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand => 
    brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts = products
    ? products
        .filter((product) => {
          const query = searchQuery.toLowerCase().trim();
          if (query) {
            const matchName = product.name.toLowerCase().includes(query);
            const matchBrand = product.brand.toLowerCase().includes(query);
            const matchTag = product.tag?.toLowerCase().includes(query) || false;
            const matchKeywords = Array.isArray(product.keywords)
              ? product.keywords.some((k: string) => k.toLowerCase().includes(query))
              : typeof product.keywords === 'string' && (product.keywords as string).toLowerCase().includes(query);
            if (!matchName && !matchBrand && !matchTag && !matchKeywords) {
              return false;
            }
          }

          if (selectedBrand.trim()) {
            const brandQuery = selectedBrand.toLowerCase().trim();
            if (!product.brand.toLowerCase().includes(brandQuery)) {
              return false;
            }
          }

          if (stockFilter === 'inStock' && product.quantityInStock <= 0) return false;
          if (stockFilter === 'lowStock' && (product.quantityInStock <= 0 || product.quantityInStock >= 10)) return false;
          if (selectedTag !== 'all' && (!product.tag || !product.tag.split(',').map(s => s.trim().toLowerCase()).includes(selectedTag.toLowerCase()))) return false;

          return true;
        })
        .sort((a, b) => {
          if (sortBy === 'bestSeller') {
            return (b.soldCount || 0) - (a.soldCount || 0);
          }
          if (sortBy === 'priceAsc') {
            return a.price - b.price;
          }
          if (sortBy === 'priceDesc') {
            return b.price - a.price;
          }
          if (sortBy === 'stockAsc') {
            return a.quantityInStock - b.quantityInStock;
          }
          if (sortBy === 'stockDesc') {
            return b.quantityInStock - a.quantityInStock;
          }
          if (sortBy === 'rating') {
            return b.rating - a.rating;
          }
          if (sortBy === 'newest') {
            return b._id.localeCompare(a._id);
          }
          return 0;
        })
    : [];

  if (error) {
    return (
      <div className="admin-alert">
        <AlertCircle className="admin-alert__icon" />
        <h2 className="admin-alert__title">{t('errorTitle')}</h2>
        <p className="admin-alert__text">
          {t('errorText')}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1 className="admin-page-header__title">{t('title')}</h1>
          <p className="admin-page-header__subtitle">
            {t('subtitle')}
          </p>
        </div>
        <div className="admin-page-header__actions">
          <Link href="/admin/products/new" className="admin-btn-primary">
            <Plus size={18} />
            {t('addNew')}
          </Link>
        </div>
      </header>

      {/* FILTER, SEARCH & SORT PANEL */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'var(--admin-surface)',
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius-lg)',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--admin-shadow-sm)',
        backdropFilter: 'blur(10px)',
      }}>
        {/* Row 1: Search & Sort */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search input with search icon */}
          <div style={{ flex: 1, position: 'relative', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              type="text"
              placeholder={isVi ? 'Tìm tên sản phẩm, thương hiệu hoặc từ khóa...' : 'Search name, brand or keywords...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
          </div>

          {/* Sort Select */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
              {isVi ? 'Sắp xếp' : 'Sort by'}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--admin-radius-md)',
                background: 'var(--admin-surface-muted)',
                border: '1px solid var(--admin-border-subtle)',
                color: 'var(--admin-text)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="bestSeller">{isVi ? 'Bán chạy nhất' : 'Best Sellers'}</option>
              <option value="newest">{isVi ? 'Mới nhất' : 'Newest'}</option>
              <option value="priceAsc">{isVi ? 'Giá: Thấp đến Cao' : 'Price: Low to High'}</option>
              <option value="priceDesc">{isVi ? 'Giá: Cao đến Thấp' : 'Price: High to Low'}</option>
              <option value="stockAsc">{isVi ? 'Kho: Ít đến Nhiều' : 'Stock: Low to High'}</option>
              <option value="stockDesc">{isVi ? 'Kho: Nhiều đến Ít' : 'Stock: High to Low'}</option>
              <option value="rating">{isVi ? 'Đánh giá cao nhất' : 'Top Rated'}</option>
            </select>
          </div>
        </div>

        {/* Row 2: Filters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '16px' }}>
          {/* Tag Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'New', 'Sale', 'Trending', 'Limited'].map((tag) => {
              const isSelected = selectedTag === tag;
              const displayTag = tag === 'all' ? (isVi ? 'Tất cả' : 'All') : tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--admin-accent, #D4A5A5)' : 'var(--admin-border-subtle)',
                    background: isSelected ? 'rgba(212, 165, 165, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? 'var(--admin-accent-hover, #D4A5A5)' : 'var(--admin-text-muted)',
                  }}
                >
                  {displayTag}
                </button>
              );
            })}
          </div>

          {/* Dropdown Filters (Stock & Brand) + Clear All Button */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Brand Custom Dropdown */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div ref={brandDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--admin-radius-md)',
                    background: 'var(--admin-surface-muted)',
                    border: '1px solid var(--admin-border-subtle)',
                    color: selectedBrand ? 'var(--admin-text)' : 'var(--admin-text-muted)',
                    fontSize: '0.75rem',
                    outline: 'none',
                    width: '180px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    fontWeight: selectedBrand ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border-subtle)';
                  }}
                >
                  <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    flex: 1,
                    textAlign: 'left'
                  }}>
                    {selectedBrand || (isVi ? 'Thương hiệu...' : 'Brand...')}
                  </span>
                  <ChevronDown 
                    size={14} 
                    style={{ 
                      transition: 'transform 0.2s',
                      transform: isBrandDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                      marginLeft: '4px'
                    }} 
                  />
                </button>

                {isBrandDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      width: '240px',
                      maxHeight: '280px',
                      background: 'var(--admin-surface)',
                      border: '1px solid var(--admin-border)',
                      borderRadius: 'var(--admin-radius-md)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Search input inside dropdown */}
                    <div style={{ padding: '8px', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                      <input
                        type="text"
                        placeholder={isVi ? 'Tìm thương hiệu...' : 'Search brand...'}
                        value={brandSearchQuery}
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '6px 10px',
                          borderRadius: 'var(--admin-radius-sm)',
                          background: 'var(--admin-surface-muted)',
                          border: '1px solid var(--admin-border-subtle)',
                          color: 'var(--admin-text)',
                          fontSize: '0.75rem',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Scrollable brand list */}
                    <div
                      style={{
                        overflowY: 'auto',
                        maxHeight: '220px',
                        padding: '4px',
                      }}
                    >
                      {/* Clear selection option */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrand('');
                          setBrandSearchQuery('');
                          setIsBrandDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          background: !selectedBrand ? 'rgba(212, 165, 165, 0.1)' : 'transparent',
                          border: 'none',
                          borderRadius: 'var(--admin-radius-sm)',
                          color: 'var(--admin-text-muted)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          fontStyle: 'italic',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = !selectedBrand ? 'rgba(212, 165, 165, 0.1)' : 'transparent';
                        }}
                      >
                        {isVi ? '-- Tất cả thương hiệu --' : '-- All Brands --'}
                      </button>

                      {filteredBrands.length === 0 ? (
                        <div style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          color: 'var(--admin-text-muted)',
                          fontSize: '0.75rem'
                        }}>
                          {isVi ? 'Không tìm thấy thương hiệu' : 'No brands found'}
                        </div>
                      ) : (
                        filteredBrands.map((brand) => (
                          <button
                            key={brand}
                            type="button"
                            onClick={() => {
                              setSelectedBrand(brand);
                              setBrandSearchQuery('');
                              setIsBrandDropdownOpen(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              textAlign: 'left',
                              background: selectedBrand === brand ? 'rgba(212, 165, 165, 0.15)' : 'transparent',
                              border: 'none',
                              borderRadius: 'var(--admin-radius-sm)',
                              color: selectedBrand === brand ? 'var(--admin-accent-hover, #D4A5A5)' : 'var(--admin-text)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              fontWeight: selectedBrand === brand ? 600 : 400,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(212, 165, 165, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = selectedBrand === brand ? 'rgba(212, 165, 165, 0.15)' : 'transparent';
                            }}
                          >
                            {brand}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              </div>

            {/* Stock Select */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--admin-radius-md)',
                background: 'var(--admin-surface-muted)',
                border: '1px solid var(--admin-border-subtle)',
                color: 'var(--admin-text)',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">{isVi ? 'Mọi trạng thái kho' : 'All Stock Status'}</option>
              <option value="inStock">{isVi ? 'Còn hàng' : 'In Stock'}</option>
              <option value="lowStock">{isVi ? 'Sắp hết hàng (<10)' : 'Low Stock (<10)'}</option>
              <option value="outOfStock">{isVi ? 'Hết hàng' : 'Out of Stock'}</option>
            </select>

            {/* Clear All Filters Button */}
            {(searchQuery || selectedBrand || stockFilter !== 'all' || selectedTag !== 'all' || sortBy !== 'bestSeller') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedBrand('');
                  setBrandSearchQuery('');
                  setStockFilter('all');
                  setSelectedTag('all');
                  setSortBy('bestSeller');
                }}
                title={isVi ? 'Xóa tất cả bộ lọc' : 'Clear all filters'}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--admin-radius-md)',
                  background: 'rgba(212, 165, 165, 0.1)',
                  border: '1px solid var(--admin-border-subtle)',
                  color: 'var(--admin-accent-hover, #D4A5A5)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 165, 165, 0.2)';
                  e.currentTarget.style.borderColor = 'var(--admin-accent-hover, #D4A5A5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(212, 165, 165, 0.1)';
                  e.currentTarget.style.borderColor = 'var(--admin-border-subtle)';
                }}
              >
                <X size={14} />
                {isVi ? 'Xóa bộ lọc' : 'Clear Filters'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="admin-table-wrap">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('table.product')}</th>
                <th>{t('table.tag')}</th>
                <th>{t('table.stock')}</th>
                <th>{t('table.price')}</th>
                <th>{t('table.rating')}</th>
                <th style={{ textAlign: 'right' }}>{t('table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-loading">
                      <Loader2 className="admin-loading__spinner" />
                      <p>{t('loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : !filteredProducts.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">
                      <Sparkles className="admin-empty__icon" />
                      <p>{searchQuery || selectedBrand !== 'all' || stockFilter !== 'all' || selectedTag !== 'all' ? (isVi ? 'Không tìm thấy sản phẩm khớp với bộ lọc' : 'No products match the selected filters') : t('empty')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div className="admin-table-product">
                        <div className="admin-table-product__thumb">
                          {product.image && (
                            <Image
                              src={resolveImageUrl(product.image)}
                              alt={product.name}
                              fill
                              sizes="52px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/products/${product._id}`}>
                            <p className="admin-table-product__name hover:underline hover:text-[var(--admin-accent)] transition-colors">{product.name}</p>
                          </Link>
                          <p className="admin-table-product__meta" title={`${product.brand} • ${formatSizeString(product.size)}`}>
                            {product.brand} • {formatSizeString(product.size)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {product.tag ? (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {product.tag.split(',').map((singleTag, idx) => {
                            const cleaned = singleTag.trim();
                            if (!cleaned) return null;
                            return (
                              <span key={idx} className="admin-badge" style={{ border: '1px solid var(--admin-border-subtle)', background: 'var(--admin-surface-muted)', color: 'var(--admin-text-secondary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 600 }}>
                                {cleaned}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span style={{ opacity: 0.5 }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${product.quantityInStock < 10 ? 'admin-badge--low' : 'admin-badge--ok'}`}
                      >
                        {product.quantityInStock} SP
                      </span>
                    </td>
                    <td>
                      <p className="admin-table-price">{formatPrice(product.price, locale)}</p>
                      {(() => {
                        if (!product.discountPercentage || product.discountPercentage <= 0) return null;
                        
                        const now = new Date();
                        let active = true;
                        if (product.discountStartDate && now < new Date(product.discountStartDate)) active = false;
                        if (product.discountEndDate && now > new Date(product.discountEndDate)) active = false;

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                            <span 
                              className="admin-badge--sale" 
                              style={!active ? { background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.3)', border: '1px dashed rgba(255, 255, 255, 0.15)' } : undefined}
                            >
                              -{product.discountPercentage}% {active ? '' : (locale === 'vi' ? '(Chưa chạy)' : '(Scheduled)')}
                            </span>
                            {(product.discountStartDate || product.discountEndDate) && (
                              <span style={{ fontSize: '8px', opacity: 0.5, color: '#D4A5A5', whiteSpace: 'nowrap', marginTop: '1px' }}>
                                📅 {product.discountStartDate ? new Date(product.discountStartDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '∞'}
                                {' - '}
                                {product.discountEndDate ? new Date(product.discountEndDate).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '∞'}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td>
                      <p className="admin-table-rating">
                        {product.rating} <span>({product.reviewsCount})</span>
                      </p>
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          type="button"
                          className="admin-icon-btn admin-icon-btn--danger"
                          aria-label={`Xóa ${product.name}`}
                          onClick={() => {
                            if (
                              confirm(
                                t('deleteConfirm')
                              )
                            ) {
                              deleteMutation.mutate(product._id);
                            }
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
