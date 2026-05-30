'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import type { FooterConfig, FooterLinkItem } from '@/hooks/useHomepageConfig';
import { FooterPreview } from './footer/FooterPreview';
import { FooterSidebar } from './footer/FooterSidebar';

interface HomepageFooterTabProps {
  footerConfig: FooterConfig;
  setFooterConfig: React.Dispatch<React.SetStateAction<FooterConfig>>;
  onSidebarChange?: (open: boolean) => void;
}

type EditingMode = 'col-1' | 'col-2' | 'col-3' | 'newsletter' | 'column' | 'copyright' | null;

function Chip({ label, count, visible, onToggle, onEdit }: {
  label: string; count?: string; visible: boolean; onToggle: () => void; onEdit: () => void;
}) {
  return (
    <div onClick={onEdit} className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-gray-100 shadow-sm cursor-pointer hover:border-[#D4A5A5]/40 transition-colors">
      <span className="text-xs font-semibold text-[#7A5C5C] flex-1">{label}</span>
      {count && <span className="text-[10px] text-gray-400">{count}</span>}
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className={`p-1 rounded transition-colors ${visible ? 'text-emerald-500' : 'text-gray-300'}`}>
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
    </div>
  );
}

export const HomepageFooterTab = React.memo(function HomepageFooterTab({ footerConfig, setFooterConfig, onSidebarChange }: HomepageFooterTabProps) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [editingMode, setEditingMode] = useState<EditingMode>(null);
  const [editingColumnIndex, setEditingColumnIndex] = useState<number | null>(null);

  useEffect(() => { onSidebarChange?.(sidebarVisible); }, [sidebarVisible, onSidebarChange]);

  const openSidebar = (mode: EditingMode, colIndex?: number) => {
    if (sidebarVisible && editingMode === mode && editingColumnIndex === (colIndex ?? null)) { closeSidebar(); return; }
    setEditingMode(mode); setEditingColumnIndex(colIndex ?? null); setSidebarVisible(true);
  };
  const closeSidebar = () => { setSidebarVisible(false); setEditingMode(null); setEditingColumnIndex(null); };

  const updateLayout = (field: string, value: any) => setFooterConfig(prev => ({ ...prev, layout: { ...prev.layout, [field]: value } }));
  const updateCopyright = (field: string, value: any) => setFooterConfig(prev => ({ ...prev, copyright: { ...prev.copyright, [field]: value } }));

  const addColumn = () => {
    const id = `col-${Date.now()}`;
    setFooterConfig(prev => ({ ...prev, columns: [...prev.columns, { id, title: 'Cột mới', links: [], enabled: true }], layout: { ...prev.layout, columnOrder: [...prev.layout.columnOrder, id] } }));
  };
  const removeColumn = (index: number) => {
    setFooterConfig(prev => {
      const col = prev.columns[index];
      return { ...prev, columns: prev.columns.filter((_, i) => i !== index), layout: { ...prev.layout, columnOrder: prev.layout.columnOrder.filter(id => id !== col.id) } };
    });
  };

  const col1Index = footerConfig.columns.findIndex(c => c.id === 'col-0');
  const col2Index = footerConfig.columns.findIndex(c => c.id === 'col-1');

  return (
    <>
      <motion.div key="footer-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="space-y-8">
        {/* Live Preview */}
        <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-sm font-semibold text-[#7A5C5C]">Footer Preview</h2>
          </div>
          <FooterPreview config={footerConfig} />
        </div>

        {/* Layout Builder */}
        <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#D4A5A5] text-sm">☰</span>
              <h2 className="text-sm font-semibold text-[#7A5C5C]">Footer Layout Builder</h2>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quản lý cột</h3>
            <Chip label="Cột 1" count={`${footerConfig.socialLinks.filter(s => s.enabled).length} social links`} visible={footerConfig.layout.showBrand}
              onToggle={() => updateLayout('showBrand', !footerConfig.layout.showBrand)} onEdit={() => openSidebar('col-1')} />
            {col1Index !== -1 && (
              <Chip label="Cột 2" count={`${footerConfig.columns[col1Index]?.links.filter(l => l.enabled).length || 0} links`}
                visible={footerConfig.columns[col1Index]?.enabled ?? true}
                onToggle={() => { const cols = [...footerConfig.columns]; cols[col1Index] = { ...cols[col1Index], enabled: !cols[col1Index].enabled }; setFooterConfig(prev => ({ ...prev, columns: cols })); }}
                onEdit={() => openSidebar('col-2', col1Index)} />
            )}
            {col2Index !== -1 && (
              <Chip label="Cột 3" count={`${footerConfig.columns[col2Index]?.links.filter(l => l.enabled).length || 0} links`}
                visible={footerConfig.columns[col2Index]?.enabled ?? true}
                onToggle={() => { const cols = [...footerConfig.columns]; cols[col2Index] = { ...cols[col2Index], enabled: !cols[col2Index].enabled }; setFooterConfig(prev => ({ ...prev, columns: cols })); }}
                onEdit={() => openSidebar('col-3', col2Index)} />
            )}
            <Chip label="Cột 4" count="contact" visible={footerConfig.layout.showNewsletter}
              onToggle={() => updateLayout('showNewsletter', !footerConfig.layout.showNewsletter)} onEdit={() => openSidebar('newsletter')} />

            {footerConfig.layout.columnOrder.map((colId) => {
              if (colId === 'brand' || colId === 'newsletter' || colId === 'col-0' || colId === 'col-1') return null;
              const idx = footerConfig.columns.findIndex(c => c.id === colId);
              if (idx === -1) return null;
              const col = footerConfig.columns[idx];
              return (
                <div key={col.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Chip label={col.title} count={`${col.links.filter(l => l.enabled).length} links`} visible={col.enabled}
                      onToggle={() => { const cols = [...footerConfig.columns]; cols[idx] = { ...cols[idx], enabled: !cols[idx].enabled }; setFooterConfig(prev => ({ ...prev, columns: cols })); }}
                      onEdit={() => openSidebar('column', idx)} />
                  </div>
                  <button onClick={() => { removeColumn(idx); if (editingMode === 'column' && editingColumnIndex === idx) closeSidebar(); }}
                    className="p-1.5 text-gray-300 hover:text-red-400 rounded transition-colors shrink-0"><Trash2 size={13} /></button>
                </div>
              );
            })}
            <button onClick={addColumn} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg border border-dashed border-gray-200 text-gray-400 hover:text-[#7A5C5C] hover:border-[#D4A5A5] transition-colors w-full justify-center">
              <Plus size={12} /> Thêm cột
            </button>
            <Chip label="Copyright" visible={footerConfig.copyright.enabled}
              onToggle={() => updateCopyright('enabled', !footerConfig.copyright.enabled)} onEdit={() => openSidebar('copyright')} />
          </div>
        </div>
      </motion.div>

      {/* Fixed Drawer Sidebar */}
      <FooterSidebar
        footerConfig={footerConfig} setFooterConfig={setFooterConfig}
        sidebarVisible={sidebarVisible} editingMode={editingMode}
        editingColumnIndex={editingColumnIndex} closeSidebar={closeSidebar} />
    </>
  );
});