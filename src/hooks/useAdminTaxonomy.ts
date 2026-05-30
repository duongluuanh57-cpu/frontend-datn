'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import type { TaxonomyItem, TabType } from '@/types/admin';
import { useTaxonomyQuery, TABS } from '@/hooks/admin-taxonomy/useTaxonomyQuery';
import { useTaxonomyMutations } from '@/hooks/admin-taxonomy/useTaxonomyMutations';
import { useTaxonomySelection } from '@/hooks/admin-taxonomy/useTaxonomySelection';

export interface UseAdminTaxonomyReturn {
  locale: string;
  isVi: boolean;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  editingItem: TaxonomyItem | null;
  setEditingItem: (item: TaxonomyItem | null) => void;
  formData: { name: string; slug: string; status: 'active' | 'inactive' };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; slug: string; status: 'active' | 'inactive' }>>;
  isSaving: boolean;
  tabs: typeof TABS;
  currentTabConfig: (typeof TABS)[number];
  items: TaxonomyItem[] | undefined;
  isLoading: boolean;
  error: any;
  deleteMutation: ReturnType<typeof useTaxonomyMutations>['deleteMutation'];
  bulkDeleteMutation: ReturnType<typeof useTaxonomyMutations>['bulkDeleteMutation'];
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
  const isVi = locale === 'vi';
  const [activeTab, setActiveTab] = useState<TabType>('tags');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxonomyItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<TaxonomyItem | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [selectedItemNames, setSelectedItemNames] = useState<Map<string, string>>(new Map());

  // Reset pagination when tab/search changes
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchTerm]);

  const { currentTabConfig, items, isLoading, error, total, totalPages, ITEMS_PER_PAGE, getTaxonomyId } =
    useTaxonomyQuery(activeTab, searchTerm, currentPage);

  const {
    selectedIds, setSelectedIds,
    isAllSelected, isSomeSelected,
    handleSelectAll, handleSelectRow,
  } = useTaxonomySelection(items, selectedItemNames);

  const { deleteMutation, bulkDeleteMutation, saveMutation } = useTaxonomyMutations({
    currentTabConfig,
    getTaxonomyId,
    locale,
  });

  const handleAddNewClick = () => {
    setEditingItem(null);
    setFormData({ name: '', slug: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleEditClick = (item: TaxonomyItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, slug: item.slug, status: item.status });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setIsSaving(true);
    try {
      const payload = { name: formData.name.trim(), slug: formData.slug.trim() || undefined, status: formData.status };
      await saveMutation.mutateAsync({
        id: editingItem?._id,
        payload,
        isNew: !editingItem,
      });
      setIsModalOpen(false);
    } catch { /* error handled by mutation */ }
    finally { setIsSaving(false); }
  };

  return {
    locale, isVi,
    activeTab, setActiveTab,
    isModalOpen, setIsModalOpen,
    editingItem, setEditingItem,
    formData, setFormData, isSaving,
    tabs: TABS, currentTabConfig,
    items, isLoading, error,
    deleteMutation, bulkDeleteMutation,
    handleAddNewClick, handleEditClick, handleFormSubmit,
    searchTerm, setSearchTerm,
    currentPage, setCurrentPage,
    ITEMS_PER_PAGE, total, totalPages,
    selectedIds, setSelectedIds,
    isAllSelected, isSomeSelected,
    handleSelectAll, handleSelectRow,
    itemToDelete, setItemToDelete,
    showBulkDeleteModal, setShowBulkDeleteModal,
    selectedItemNames,
  };
}