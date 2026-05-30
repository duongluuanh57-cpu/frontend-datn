'use client';

import React from 'react';
import { Tag } from 'lucide-react';
import { SelectionModal } from '../SelectionModal';

export function TagSelectionModal({ isOpen, onClose, tags, selectedTags, handleTagToggle, isVi }: any) {
  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Tag size={18} />}
      title={isVi ? 'Phân loại Tag sản phẩm' : 'Product Tag Selection'}
      subtitle={isVi ? 'Chọn một hoặc nhiều nhãn phù hợp cho sản phẩm' : 'Select one or multiple tags for the product'}
      items={(tags || [])
        .filter((t: any) => t.status === 'active')
        .map((t: any) => ({ id: t.slug, label: t.name, secondaryLabel: t.slug }))}
      selectedIds={selectedTags}
      onToggle={handleTagToggle}
      emptyMessage={isVi ? 'Không có nhãn nào đang hoạt động' : 'No active tags found'}
    />
  );
}