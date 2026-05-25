'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import React, { useState, useEffect, useMemo } from 'react';
import {
  Hash, Layers, Sliders, Sparkles,
  LucideIcon
} from 'lucide-react';
import { TaxonomyItem, TabType } from '@/types/admin';

export interface TabConfig {
  id: TabType;
  labelVi: string;
  labelEn: string;
  taxonomySlug: string | null;
  queryKey: string;
  icon: LucideIcon;
}

export interface UseAdminTaxonomyReturn {
  locale: string;
  isVi: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingItem: TaxonomyItem | null;
  setEditingItem: (item: TaxonomyItem | null) => void;
  formData: {
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    description: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    description: string;
  }>>;
  isSaving: boolean;
  tabs: TabConfig[];
  currentTabConfig: TabConfig;
  items: TaxonomyItem[] | undefined;
  isLoading: boolean;
  error: any;
  deleteMutation: any;
  bulkDeleteMutation: any;
  handleAddNewClick: () => void;
  handleEditClick: (item: TaxonomyItem) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  total: number;
  totalPages: number;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  handleSelectAll: () => void;
  handleSelectRow: (id: string) => void;
  itemToDelete: TaxonomyItem | null;
  setItemToDelete: (item: TaxonomyItem | null) => void;
  showBulkDeleteModal: boolean;
  setShowBulkDeleteModal: (show: boolean) => void;
  selectedItemNames: Map<string, string>;
}

export function useAdminTaxonomy(): UseAdminTaxonomyReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';
  const [activeTab, setActiveTab] = useState<TabType>('tags');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItemNames, setSelectedItemNames] = useState<Map<string, string>>(new Map());
  const [itemToDelete, setItemToDelete] = useState<TaxonomyItem | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const ITEMS_PER_PAGE = 25;

  const tabs: TabConfig[] = [
    { id: 'tags',          labelVi: 'Quản lý Tag',            labelEn: 'Tag Management',       taxonomySlug: null,           queryKey: 'admin-tags',           icon: Hash },
    { id: 'notes',         labelVi: 'Quản lý Nhóm hương',     labelEn: 'Scent Groups',          taxonomySlug: 'scent_group',  queryKey: 'admin-scent-groups',   icon: Layers },
    { id: 'concentrations',labelVi: 'Quản lý Nồng độ',        labelEn: 'Concentration Levels',  taxonomySlug: 'concentration',queryKey: 'admin-concentrations', icon: Sliders },
    { id: 'segments',      labelVi: 'Quản lý Phân khúc nhóm', labelEn: 'Brand Segments',        taxonomySlug: 'segment',      queryKey: 'admin-segments',       icon: Sparkles },
  ];

  const currentTabConfig = tabs.find(t => t.id === activeTab)!;

  // Reset pagination when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    if (searchTerm) params.search = searchTerm;
    return params;
  }, [currentPage, searchTerm]);

  // Fetch taxonomy list (cha) — cached 10 min
  const { data: taxonomyList } = useQuery({
    queryKey: ['v2-taxonomies'],
    queryFn: async () => {
      const { data } = await api.get('/v2/taxonomies');
      return data.data as { _id: string; slug: string; name: string }[];
    },
    staleTime: 1000 * 60 * 10,
  });

  const getTaxonomyId = (slug: string): string | null =>
    taxonomyList?.find(t => t.slug === slug)?._id ?? null;

  // Fetch paginated items
  const { data: pageData, isLoading, error } = useQuery({
    queryKey: [currentTabConfig.queryKey, queryParams],
    queryFn: async () => {
      if (!currentTabConfig.taxonomySlug) {
        const { data } = await api.get('/tags', { params: queryParams });
        return data.data as { items: TaxonomyItem[]; total: number; page: number; totalPages: number };
      }

      const taxonomyId = getTaxonomyId(currentTabConfig.taxonomySlug);
      if (!taxonomyId) {
        return { items: [] as TaxonomyItem[], total: 0, page: 1, totalPages: 0 };
      }
      const { data } = await api.get(`/v2/taxonomies/${taxonomyId}/terms`, { params: queryParams });
      return data.data as { items: TaxonomyItem[]; total: number; page: number; totalPages: number };
    },
    enabled: currentTabConfig.taxonomySlug === null || !!taxonomyList,
  });

  const items = pageData?.items;
  const total = pageData?.total || 0;
  const totalPages = pageData?.totalPages || 0;

  // Track selected item names for bulk delete modal
  useEffect(() => {
    if (!items) return;
    setSelectedItemNames(prev => {
      const next = new Map(prev);
      for (const item of items) {
        if (selectedIds.includes(item._id)) {
          next.set(item._id, item.name);
        }
      }
      return next;
    });
  }, [items, selectedIds]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!currentTabConfig.taxonomySlug) {
        return api.delete(`/tags/${id}`);
      }
      const taxonomyId = getTaxonomyId(currentTabConfig.taxonomySlug);
      if (!taxonomyId) throw new Error('Taxonomy không tồn tại');
      return api.delete(`/v2/taxonomies/${taxonomyId}/terms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
      setItemToDelete(null);
      setSelectedIds(prev => prev.filter(id => id !== itemToDelete?._id));
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(err.response?.data?.message || (isVi ? 'Vui lòng kiểm tra lại thông tin.' : 'Please check the information.'));
      }
      setItemToDelete(null);
    }
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => api.post('/taxonomies/bulk-delete', { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
      setSelectedIds([]);
      setSelectedItemNames(new Map());
      setShowBulkDeleteModal(false);
    },
    onError: (err: any) => {
      console.error(err);
      alert(err.response?.data?.message || (isVi ? 'Không thể xóa các mục đã chọn.' : 'Failed to delete selected items.'));
      setShowBulkDeleteModal(false);
    }
  });

  const allFilteredIds = items?.map(i => i._id) || [];
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

  const handleAddNewClick = () => {
    setEditingItem(null);
    setFormData({ name: '', slug: '', status: 'active', description: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (item: TaxonomyItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      status: item.status,
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        status: formData.status,
        description: formData.description.trim() || undefined
      };

      if (!currentTabConfig.taxonomySlug) {
        if (editingItem) {
          await api.patch(`/tags/${editingItem._id}`, payload);
        } else {
          await api.post('/tags', payload);
        }
      } else {
        const taxonomyId = getTaxonomyId(currentTabConfig.taxonomySlug);
        if (!taxonomyId) throw new Error('Taxonomy cha chưa được tạo. Vui lòng chạy migration trước.');

        if (editingItem) {
          await api.patch(`/v2/taxonomies/${taxonomyId}/terms/${editingItem._id}`, payload);
        } else {
          await api.post(`/v2/taxonomies/${taxonomyId}/terms`, payload);
        }
      }

      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || (isVi ? 'Vui lòng kiểm tra lại thông tin.' : 'Please check the information.'));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    locale,
    isVi,
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    editingItem,
    setEditingItem,
    formData,
    setFormData,
    isSaving,
    tabs,
    currentTabConfig,
    items,
    isLoading,
    error,
    deleteMutation,
    bulkDeleteMutation,
    handleAddNewClick,
    handleEditClick,
    handleFormSubmit,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    ITEMS_PER_PAGE,
    total,
    totalPages,
    selectedIds,
    setSelectedIds,
    isAllSelected,
    isSomeSelected,
    handleSelectAll,
    handleSelectRow,
    itemToDelete,
    setItemToDelete,
    showBulkDeleteModal,
    setShowBulkDeleteModal,
    selectedItemNames,
  };
}