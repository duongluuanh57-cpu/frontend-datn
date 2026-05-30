'use client';

import React from 'react';
import { Plus, Trash2, Globe } from 'lucide-react';
import type { FooterConfig, FooterLinkItem, SocialLink } from '@/hooks/useHomepageConfig';

type EditingMode = 'col-1' | 'col-2' | 'col-3' | 'newsletter' | 'column' | 'copyright' | null;
const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok', 'pinterest'];
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: <Globe size={18} />, facebook: <Globe size={18} />,
  twitter: <Globe size={18} />, youtube: <Globe size={18} />,
  tiktok: <Globe size={18} />, pinterest: <Globe size={18} />,
};

interface FooterSidebarProps {
  footerConfig: FooterConfig;
  setFooterConfig: React.Dispatch<React.SetStateAction<FooterConfig>>;
  sidebarVisible: boolean;
  editingMode: EditingMode;
  editingColumnIndex: number | null;
  closeSidebar: () => void;
}

export function FooterSidebar({ footerConfig, setFooterConfig, sidebarVisible, editingMode, editingColumnIndex, closeSidebar }: FooterSidebarProps) {
  const updateBrand = (field: string, value: string | boolean) => setFooterConfig(prev => ({ ...prev, brand: { ...prev.brand, [field]: value } }));
  const updateNewsletter = (field: string, value: any) => setFooterConfig(prev => ({ ...prev, newsletter: { ...prev.newsletter, [field]: value } }));
  const updateCopyright = (field: string, value: any) => setFooterConfig(prev => ({ ...prev, copyright: { ...prev.copyright, [field]: value } }));
  const updateColumn = (index: number, field: string, value: any) => setFooterConfig(prev => { const cols = [...prev.columns]; cols[index] = { ...cols[index], [field]: value }; return { ...prev, columns: cols }; });
  const addColumnLink = (colIndex: number) => setFooterConfig(prev => { const cols = [...prev.columns]; cols[colIndex] = { ...cols[colIndex], links: [...cols[colIndex].links, { label: '', href: '/', order: cols[colIndex].links.length, enabled: true }] }; return { ...prev, columns: cols }; });
  const updateColumnLink = (colIndex: number, linkIndex: number, field: keyof FooterLinkItem, value: any) => setFooterConfig(prev => { const cols = [...prev.columns]; const links = [...cols[colIndex].links]; links[linkIndex] = { ...links[linkIndex], [field]: value }; cols[colIndex] = { ...cols[colIndex], links }; return { ...prev, columns: cols }; });
  const removeColumnLink = (colIndex: number, linkIndex: number) => setFooterConfig(prev => { const cols = [...prev.columns]; const links = cols[colIndex].links.filter((_, i) => i !== linkIndex).map((l, i) => ({ ...l, order: i })); cols[colIndex] = { ...cols[colIndex], links }; return { ...prev, columns: cols }; });
  const addSocialLink = () => { const unused = SOCIAL_PLATFORMS.find(p => !footerConfig.socialLinks.some(sl => sl.platform === p)); setFooterConfig(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { platform: unused || 'instagram', url: '', enabled: true }] })); };
  const updateSocialLink = (index: number, field: keyof SocialLink, value: any) => setFooterConfig(prev => { const links = [...prev.socialLinks]; links[index] = { ...links[index], [field]: value }; return { ...prev, socialLinks: links }; });
  const removeSocialLink = (index: number) => setFooterConfig(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: '320px',
      transform: sidebarVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 40,
      background: '#ffffff', borderLeft: sidebarVisible ? '1px solid #e5e7eb' : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-[11px] font-semibold text-[#7A5C5C] uppercase tracking-wider">
          {editingMode === 'col-1' && '✎ Cột 1'}
          {editingMode === 'col-2' && '✎ Cột 2'}
          {editingMode === 'col-3' && '✎ Cột 3'}
          {editingMode === 'newsletter' && '✎ Cột 4'}
          {editingMode === 'column' && '✎ ' + (footerConfig.columns[editingColumnIndex ?? -1]?.title || 'Cột')}
          {editingMode === 'copyright' && '✎ Copyright'}
        </h3>
        <button onClick={closeSidebar} className="text-[11px] font-semibold text-[#7A5C5C] hover:text-[#604444] px-1">← Đóng</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {editingMode === 'col-1' && (
          <div className="space-y-5">
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Title</label>
              <input type="text" value={footerConfig.brand.title} onChange={e => updateBrand('title', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Mô tả</label>
              <textarea value={footerConfig.brand.description} onChange={e => updateBrand('description', e.target.value)} rows={4} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40 resize-none" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Logo URL</label>
              <input type="text" value={footerConfig.brand.logo} onChange={e => updateBrand('logo', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Social Links</label>
                <button onClick={addSocialLink} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#7A5C5C] text-white hover:bg-[#604444] transition-colors"><Plus size={10} /> Thêm</button>
              </div>
              <div className="space-y-2">
                {footerConfig.socialLinks.map((link, i) => (
                  <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{SOCIAL_ICONS[link.platform] || <Globe size={18} />}</span>
                      <select value={link.platform} onChange={e => updateSocialLink(i, 'platform', e.target.value)} className="flex-1 px-1.5 py-1 text-[11px] border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] bg-white">
                        {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button onClick={() => updateSocialLink(i, 'enabled', !link.enabled)} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${link.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{link.enabled ? 'ON' : 'OFF'}</button>
                      <button onClick={() => removeSocialLink(i)} className="p-0.5 text-gray-300 hover:text-red-400 rounded transition-colors"><Trash2 size={10} /></button>
                    </div>
                    <input type="text" value={link.url} onChange={e => updateSocialLink(i, 'url', e.target.value)} placeholder="URL" className="w-full px-1.5 py-1 text-[10px] border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] bg-white" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {(editingMode === 'col-2' || editingMode === 'col-3' || editingMode === 'column') && editingColumnIndex !== null && (
          <div className="space-y-4">
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Column Title</label>
              <input type="text" value={footerConfig.columns[editingColumnIndex]?.title || ''} onChange={e => updateColumn(editingColumnIndex, 'title', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Links</label>
                <button onClick={() => addColumnLink(editingColumnIndex)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#7A5C5C] text-white hover:bg-[#604444] transition-colors"><Plus size={10} /> Thêm</button>
              </div>
              <div className="space-y-2">
                {footerConfig.columns[editingColumnIndex]?.links.map((link, li) => (
                  <div key={li} className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-1 space-y-1">
                      <input value={link.label} onChange={e => updateColumnLink(editingColumnIndex, li, 'label', e.target.value)} placeholder="Label" className="w-full px-1.5 py-0.5 text-[11px] border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] bg-white" />
                      <input value={link.href} onChange={e => updateColumnLink(editingColumnIndex, li, 'href', e.target.value)} placeholder="/link" className="w-full px-1.5 py-0.5 text-[10px] text-gray-500 border border-gray-200 rounded focus:outline-none focus:border-[#D4A5A5] bg-white" />
                    </div>
                    <div className="flex items-center gap-1 pt-0.5">
                      <button onClick={() => updateColumnLink(editingColumnIndex, li, 'enabled', !link.enabled)} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${link.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{link.enabled ? 'ON' : 'OFF'}</button>
                      <button onClick={() => removeColumnLink(editingColumnIndex, li)} className="p-0.5 text-gray-300 hover:text-red-400 rounded transition-colors"><Trash2 size={10} /></button>
                    </div>
                  </div>
                ))}
                {footerConfig.columns[editingColumnIndex]?.links.length === 0 && <p className="text-[11px] text-gray-400 italic text-center py-2">Chưa có link nào.</p>}
              </div>
            </div>
          </div>
        )}
        {editingMode === 'newsletter' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Bật/Tắt</label>
              <button onClick={() => updateNewsletter('enabled', !footerConfig.newsletter.enabled)} className={`px-2 py-1 text-[10px] font-bold rounded ${footerConfig.newsletter.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{footerConfig.newsletter.enabled ? 'ON' : 'OFF'}</button>
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Title</label>
              <input type="text" value={footerConfig.newsletter.title} onChange={e => updateNewsletter('title', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Mô tả</label>
              <textarea value={footerConfig.newsletter.description} onChange={e => updateNewsletter('description', e.target.value)} rows={3} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40 resize-none" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
              <input type="text" value={footerConfig.newsletter.email} onChange={e => updateNewsletter('email', e.target.value)} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
          </div>
        )}
        {editingMode === 'copyright' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Hiển thị</label>
              <button onClick={() => updateCopyright('enabled', !footerConfig.copyright.enabled)} className={`px-2 py-1 text-[10px] font-bold rounded ${footerConfig.copyright.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{footerConfig.copyright.enabled ? 'ON' : 'OFF'}</button>
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">Text</label>
              <textarea value={footerConfig.copyright.text} onChange={e => updateCopyright('text', e.target.value)} rows={3} className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40 resize-none" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Payment Icons</label>
              <button onClick={() => updateCopyright('showPaymentIcons', !footerConfig.copyright.showPaymentIcons)} className={`px-2 py-1 text-[10px] font-bold rounded ${footerConfig.copyright.showPaymentIcons ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>{footerConfig.copyright.showPaymentIcons ? 'ON' : 'OFF'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}