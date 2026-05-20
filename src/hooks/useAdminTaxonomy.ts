'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useLocale } from 'next-intl';
import React, { useState } from 'react';
import { 
  Hash, Layers, Sliders, Sparkles,
  LucideIcon
} from 'lucide-react';
import { TaxonomyItem, TabType } from '@/types/admin';

export interface TabConfig {
  id: TabType;
  labelVi: string;
  labelEn: string;
  apiPath: string;
  queryKey: string;
  taxonomyType: string | null;
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
  handleAddNewClick: () => void;
  handleEditClick: (item: TaxonomyItem) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useAdminTaxonomy(): UseAdminTaxonomyReturn {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const isVi = locale === 'vi';
  const [activeTab, setActiveTab] = useState<TabType>('tags');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
    description: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Define tab configuration
  const tabs: TabConfig[] = [
    { id: 'tags', labelVi: 'Quản lý Tag', labelEn: 'Tag Management', apiPath: '/tags', queryKey: 'admin-tags', taxonomyType: null, icon: Hash },
    { id: 'notes', labelVi: 'Quản lý Nhóm hương', labelEn: 'Scent Groups', apiPath: '/taxonomies', queryKey: 'admin-scent-groups', taxonomyType: 'scent_group', icon: Layers },
    { id: 'concentrations', labelVi: 'Quản lý Nồng độ', labelEn: 'Concentration Levels', apiPath: '/taxonomies', queryKey: 'admin-concentrations', taxonomyType: 'concentration', icon: Sliders },
    { id: 'segments', labelVi: 'Quản lý Phân khúc nhóm', labelEn: 'Brand Segments', apiPath: '/taxonomies', queryKey: 'admin-segments', taxonomyType: 'segment', icon: Sparkles },
  ];

  const currentTabConfig = tabs.find(t => t.id === activeTab)!;

  // Generic query to fetch data for the active tab
  const { data: items, isLoading, error } = useQuery({
    queryKey: [currentTabConfig.queryKey],
    queryFn: async () => {
      const url = currentTabConfig.taxonomyType 
        ? `${currentTabConfig.apiPath}?type=${currentTabConfig.taxonomyType}` 
        : currentTabConfig.apiPath;
      const { data } = await api.get(url);
      return data.data as TaxonomyItem[];
    },
  });

  // Generic mutation to delete an item
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`${currentTabConfig.apiPath}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
    },
    onError: (err: any) => {
      console.error(err);
      const isAuth = err.response?.status === 401 || err.message?.includes('Unauthorized');
      if (isAuth) {
        alert(isVi ? 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!' : 'Session expired. Please log in again!');
        window.location.href = `/${locale}/login`;
      } else {
        alert(isVi ? 'Không thể xóa mục này.' : 'Failed to delete this item.');
      }
    }
  });

  // Open modal for adding a new item
  const handleAddNewClick = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      slug: '',
      status: 'active',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an item
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

  // Form submit handler (both create and update)
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

      if (currentTabConfig.taxonomyType) {
        payload.type = currentTabConfig.taxonomyType;
      }

      if (editingItem) {
        // Update
        await api.patch(`${currentTabConfig.apiPath}/${editingItem._id}`, payload);
      } else {
        // Create
        await api.post(currentTabConfig.apiPath, payload);
      }

      queryClient.invalidateQueries({ queryKey: [currentTabConfig.queryKey] });
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(isVi ? 'Có lỗi xảy ra khi lưu thông tin.' : 'Error occurred while saving.');
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
    handleAddNewClick,
    handleEditClick,
    handleFormSubmit
  };
}
