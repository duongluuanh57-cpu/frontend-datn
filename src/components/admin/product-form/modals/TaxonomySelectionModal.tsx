'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SelectionModal } from '../SelectionModal';

interface TaxonomySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  items: Array<{ name: string }>;
  defaultItems: string[];
  selectedIds: string[];
  onToggle: (val: string) => void;
  customValue: string;
  onCustomChange: (val: string) => void;
  customPlaceholder: string;
  onCustomAdd: () => void;
  isCustomPending: boolean;
  emptyMessage: string;
  isVi: boolean;
}

export function TaxonomySelectionModal({
  isOpen, onClose, title, subtitle, items, defaultItems,
  selectedIds, onToggle, customValue, onCustomChange,
  customPlaceholder, onCustomAdd, isCustomPending, emptyMessage, isVi,
}: TaxonomySelectionModalProps) {
  return (
    <SelectionModal
      isOpen={isOpen}
      onClose={onClose}
      icon={<Sparkles size={18} />}
      title={title}
      subtitle={subtitle}
      items={Array.from(new Set([
        ...(items?.map(s => s.name) || defaultItems),
        ...selectedIds,
      ])).map(sg => ({ id: sg, label: sg }))}
      selectedIds={selectedIds}
      onToggle={onToggle}
      emptyMessage={emptyMessage}
      customValue={customValue}
      onCustomChange={onCustomChange}
      customPlaceholder={customPlaceholder}
      onCustomAdd={onCustomAdd}
      isCustomPending={isCustomPending}
    />
  );
}