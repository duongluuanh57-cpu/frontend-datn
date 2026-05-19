'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { resolveImageUrl } from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2, Sparkles, AlertCircle, Search, ChevronDown, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { formatSizeString } from '@/components/admin/ProductForm';
import { toast } from 'sonner';

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

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
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
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isVi ? 'Đã xóa sản phẩm thành công!' : 'Product deleted successfully!');
      setProductToDelete(null);
      setSelectedIds(prev => prev.filter(item => item !== id));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa sản phẩm' : 'Failed to delete product'));
      setProductToDelete(null);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/products/bulk-delete', { ids }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(res.data.message || (isVi ? 'Đã xóa các sản phẩm thành công!' : 'Products deleted successfully!'));
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isVi ? 'Không thể xóa các sản phẩm' : 'Failed to delete products'));
      setShowBulkDeleteModal(false);
    }
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

  const allFilteredIds = filteredProducts.map(p => p._id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };


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
                <th style={{ width: '48px', textAlign: 'center', verticalAlign: 'middle' }}>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    style={{
                      cursor: 'pointer',
                      accentColor: 'var(--admin-accent, #3d2e24)',
                      borderRadius: '4px',
                      width: '16px',
                      height: '16px',
                    }}
                  />
                </th>
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
                  <td colSpan={7}>
                    <div className="admin-loading">
                      <Loader2 className="admin-loading__spinner" />
                      <p>{t('loading')}</p>
                    </div>
                  </td>
                </tr>
              ) : !filteredProducts.length ? (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-empty">
                      <Sparkles className="admin-empty__icon" />
                      <p>{searchQuery || selectedBrand !== 'all' || stockFilter !== 'all' || selectedTag !== 'all' ? (isVi ? 'Không tìm thấy sản phẩm khớp với bộ lọc' : 'No products match the selected filters') : t('empty')}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isChecked = selectedIds.includes(product._id);
                  return (
                    <tr key={product._id} style={isChecked ? { background: 'rgba(212, 165, 165, 0.05)' } : undefined}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(product._id)}
                          style={{
                            cursor: 'pointer',
                            accentColor: 'var(--admin-accent, #3d2e24)',
                            borderRadius: '4px',
                            width: '16px',
                            height: '16px',
                          }}
                        />
                      </td>
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
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stunning Luxury Custom Modal for Deleting Product */}
      {productToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(30, 20, 15, 0.45)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={() => {
            if (!deleteMutation.isPending) {
              setProductToDelete(null);
            }
          }}
        >
          <div
            style={{
              background: 'var(--admin-surface, #ffffff)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: 'var(--admin-radius-lg, 20px)',
              padding: '32px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon & Title */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'rgba(239, 68, 68, 0.9)',
                padding: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.05)',
              }}>
                <Trash2 size={32} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                  {isVi ? 'Xóa sản phẩm' : 'Delete Product'}
                </h3>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: 'var(--admin-text-secondary, #6b564c)', lineHeight: 1.5 }}>
                  {isVi 
                    ? 'Bạn có chắc chắn muốn xóa sản phẩm ' 
                    : 'Are you sure you want to delete product '}
                  <strong style={{ color: 'var(--admin-accent, #5c4a42)' }}>{productToDelete.name}</strong>
                  {isVi 
                    ? '? Thao tác này không thể hoàn tác và sẽ gỡ bỏ sản phẩm vĩnh viễn.' 
                    : '? This action is permanent and cannot be undone.'}
                </p>
              </div>
            </div>

            {/* Product Card Preview inside Modal */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border-subtle, #f0e9e4)',
              borderRadius: '12px',
              padding: '12px',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'relative',
                background: 'rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
              }}>
                {productToDelete.image && (
                  <Image
                    src={resolveImageUrl(productToDelete.image)}
                    alt={productToDelete.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {productToDelete.name}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-muted, #9a857c)' }}>
                  {productToDelete.brand} • {formatSizeString(productToDelete.size)}
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => setProductToDelete(null)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary, #6b564c)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!deleteMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(productToDelete._id);
                }}
                style={{
                  flex: 1,
                  background: 'var(--admin-danger, #ef4444)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!deleteMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--admin-danger, #ef4444)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isVi ? 'Đang xóa...' : 'Deleting...'}
                  </>
                ) : (
                  isVi ? 'Xác nhận xóa' : 'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gorgeous Floating Glassmorphic Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(30, 20, 15, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          zIndex: 100,
          color: '#ffffff',
        }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0e9e4' }}>
            {isVi ? `Đã chọn ${selectedIds.length} sản phẩm` : `${selectedIds.length} products selected`}
          </span>
          <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <button
            type="button"
            onClick={() => setShowBulkDeleteModal(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '6px 16px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Trash2 size={14} />
            {isVi ? 'Xóa mục đã chọn' : 'Delete Selected'}
          </button>
        </div>
      )}

      {/* Stunning Custom Luxury Modal for Bulk Deleting Products */}
      {showBulkDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(30, 20, 15, 0.45)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px',
        }}>
          <div style={{
            background: 'var(--admin-surface, #ffffff)',
            border: '1px solid var(--admin-border-subtle, #f0e9e4)',
            borderRadius: '24px',
            padding: '28px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 48px rgba(30, 20, 15, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '16px',
                padding: '12px',
                color: 'var(--admin-danger, #ef4444)',
                flexShrink: 0,
              }}>
                <AlertCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--admin-text, #3d2e24)' }}>
                  {isVi ? 'Xác nhận xóa hàng loạt' : 'Confirm Bulk Deletion'}
                </h3>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', lineHeight: '1.4', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  {isVi 
                    ? `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} sản phẩm đã chọn? Thao tác này sẽ dọn dẹp sạch toàn bộ dữ liệu ảnh trên Cloud và không thể hoàn tác.`
                    : `Are you sure you want to permanently delete the ${selectedIds.length} selected products? This will clean up all associated cloud images and cannot be undone.`}
                </p>
              </div>
            </div>

            {/* Scrollable list of selected items */}
            <div style={{
              background: 'var(--admin-surface-muted, #faf8f6)',
              border: '1px solid var(--admin-border-subtle, #f0e9e4)',
              borderRadius: '12px',
              padding: '12px',
              maxHeight: '130px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              {products?.filter(p => selectedIds.includes(p._id)).map((p) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--admin-accent-hover, #D4A5A5)' }} />
                  <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => setShowBulkDeleteModal(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--admin-border, #e8e0da)',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--admin-text-secondary, #6b564c)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkDeleteMutation.isPending) {
                    e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={bulkDeleteMutation.isPending}
                onClick={() => {
                  bulkDeleteMutation.mutate(selectedIds);
                }}
                style={{
                  flex: 1,
                  background: 'var(--admin-danger, #ef4444)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!bulkDeleteMutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = '#dc2626';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'var(--admin-danger, #ef4444)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                }}
              >
                {bulkDeleteMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isVi ? 'Đang xóa...' : 'Deleting...'}
                  </>
                ) : (
                  isVi ? 'Xác nhận xóa' : 'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
