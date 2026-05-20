import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'sonner';
import { Product, Brand } from '@/types/admin';

export function useProductCatalog() {
  const t = useTranslations('Admin');
  const locale = useLocale();
  const isVi = locale === 'vi';
  const queryClient = useQueryClient();

  // State Declarations
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('bestSeller');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 15; // Set to 15 to match catalog pagination logic from recent updates!

  // Fetch Products
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data.data as Product[];
    },
  });

  // Fetch Brands
  const { data: allBrands } = useQuery({
    queryKey: ['admin-brands-list'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    },
  });

  // Delete Single Product Mutation
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

  // Delete Bulk Products Mutation
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

  // Distinct Brands Extraction
  const brands = useMemo(() => {
    if (!allBrands) {
      return products ? Array.from(new Set(products.map(p => p.brand).filter(Boolean))) : [];
    }
    return Array.from(new Set([
      ...allBrands.map(b => b.name),
      ...(products ? products.map(p => p.brand) : [])
    ].filter(Boolean)));
  }, [allBrands, products]);

  // Filtered Brands for Brand select dropdown search field
  const filteredBrands = useMemo(() => {
    return brands.filter(brand =>
      brand.toLowerCase().includes(brandSearchQuery.toLowerCase())
    );
  }, [brands, brandSearchQuery]);

  // Count products under each brand (memoized)
  const brandProductCount = useMemo(() => {
    const map: Record<string, number> = {};
    if (products) {
      for (const p of products) {
        if (p.brand) {
          map[p.brand] = (map[p.brand] || 0) + 1;
        }
      }
    }
    return map;
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products
      .filter((product) => {
        const query = searchQuery.toLowerCase().trim();
        if (query) {
          const matchName = product.name.toLowerCase().includes(query);
          const matchBrand = product.brand.toLowerCase().includes(query);
          const matchTag = product.tag?.toLowerCase().includes(query) || false;
          
          const keywordsArray = Array.isArray(product.keywords)
            ? product.keywords
            : typeof product.keywords === 'string'
              ? (product.keywords as string).split(',').map(k => k.trim())
              : [];
          const matchKeywords = keywordsArray.some((k: string) => k.toLowerCase().includes(query));

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
        
        if (selectedTag !== 'all') {
          if (!product.tag) return false;
          const productTags = product.tag.split(',').map(s => s.trim().toLowerCase());
          if (!productTags.includes(selectedTag.toLowerCase())) return false;
        }

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
      });
  }, [products, searchQuery, selectedBrand, stockFilter, selectedTag, sortBy]);

  // Reset page when filter inputs change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBrand, stockFilter, selectedTag, sortBy]);

  // Pagination Computations
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const allFilteredIds = useMemo(() => {
    return paginatedProducts.map(p => p._id);
  }, [paginatedProducts]);

  const isAllSelected = useMemo(() => {
    return allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
  }, [allFilteredIds, selectedIds]);

  const isSomeSelected = useMemo(() => {
    return selectedIds.length > 0 && !isAllSelected;
  }, [selectedIds, isAllSelected]);

  // Actions
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setBrandSearchQuery('');
    setStockFilter('all');
    setSelectedTag('all');
    setSortBy('bestSeller');
  };

  // Click outside to close brand dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    t,
    locale,
    isVi,
    products,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedProducts,
    filteredProducts,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow,
    handleClearFilters,
    // Deletes
    productToDelete,
    setProductToDelete,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    deleteMutation,
    bulkDeleteMutation,
    // Filters State & Action Handlers
    searchQuery,
    setSearchQuery,
    selectedBrand,
    setSelectedBrand,
    brandSearchQuery,
    setBrandSearchQuery,
    isBrandDropdownOpen,
    setIsBrandDropdownOpen,
    brandDropdownRef,
    filteredBrands,
    brandProductCount,
    stockFilter,
    setStockFilter,
    selectedTag,
    setSelectedTag,
    sortBy,
    setSortBy,
  };
}

export type UseProductCatalogReturn = ReturnType<typeof useProductCatalog>;
