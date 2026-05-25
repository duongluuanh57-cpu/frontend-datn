'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Eye, Type, AlignLeft, Home, Store, Library, BookOpen, HelpCircle } from 'lucide-react';
import type { NavbarConfig, NavLink } from '@/hooks/useHomepageConfig';

interface HomepageNavbarTabProps {
  navbarConfig: NavbarConfig;
  setNavbarConfig: React.Dispatch<React.SetStateAction<NavbarConfig>>;
}

// ── Logo presets ──
const LOGO_PRESETS = [
  { label: 'Rất nhỏ', w: 30, h: 30, text: "L'essence" },
  { label: 'Nhỏ', w: 40, h: 40, text: "L'essence" },
  { label: 'Trung bình', w: 50, h: 50, text: "L'essence" },
  { label: 'Lớn', w: 64, h: 64, text: "L'essence" },
  { label: 'Rất lớn', w: 80, h: 80, text: "L'essence" },
  { label: 'Cực lớn', w: 100, h: 100, text: "L'essence" },
];

type ZoneId = 'left' | 'center' | 'right';

function getItemLabel(id: string, navbarConfig: NavbarConfig): string {
  if (id === 'logo') return `Logo: ${navbarConfig.logo.text || "L'essence"}`;
  if (id === 'search') return 'Search';
  if (id === 'cart') return 'Cart';
  if (id === 'user') return 'User';
  const match = id.match(/^link-(\d+)$/);
  if (match) {
    const idx = parseInt(match[1]);
    return navbarConfig.links[idx]?.label || `Link #${idx}`;
  }
  return id;
}

// ── Droppable Zone ──
function Zone({ id, items, navbarConfig, onRemove, onEdit, editingId }: {
  id: ZoneId;
  items: string[];
  navbarConfig: NavbarConfig;
  onRemove: (zone: ZoneId, itemId: string) => void;
  onEdit: (itemId: string) => void;
  editingId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const zoneLabel = { left: 'Trái', center: 'Giữa', right: 'Phải' }[id];

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[120px] rounded-xl border-2 p-2 transition-colors ${
        isOver ? 'border-[#D4A5A5] bg-[#D4A5A5]/10' : 'border-gray-200 bg-gray-50'
      }`}
    >
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
        {zoneLabel} ({items.length})
      </div>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {items.map((itemId) => (
            <SortableItem
              key={itemId}
              id={itemId}
              navbarConfig={navbarConfig}
              onRemove={() => onRemove(id, itemId)}
              onEdit={() => onEdit(itemId)}
              isEditing={editingId === itemId}
            />
          ))}
        </div>
      </SortableContext>
      {items.length === 0 && (
        <div className="text-[11px] text-gray-300 text-center py-6">
          Kéo item vào đây
        </div>
      )}
    </div>
  );
}

// ── Sortable Item (used inside zones) ──
function SortableItem({ id, navbarConfig, onRemove, onEdit, isEditing }: {
  id: string;
  navbarConfig: NavbarConfig;
  onRemove: () => void;
  onEdit: () => void;
  isEditing: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-white rounded-lg border shadow-sm text-[11px] cursor-grab active:cursor-grabbing ${
        isEditing ? 'border-[#D4A5A5] ring-2 ring-[#D4A5A5]/30' : 'border-gray-100'
      }`}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={11} className="text-gray-300 shrink-0" />
      <span
        className="truncate flex-1 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onEdit(); }}
      >
        {getItemLabel(id, navbarConfig)}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="p-0.5 text-gray-300 hover:text-red-400 rounded shrink-0"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
}

// ── Preview Navbar ──
function previewIcon(href: string, size: number) {
  const map: Record<string, React.ReactNode> = {
    '/': <Home size={size} strokeWidth={1.5} />,
    '/collections': <Store size={size} strokeWidth={1.5} />,
    '/bo-suu-tap': <Library size={size} strokeWidth={1.5} />,
    '/blog': <BookOpen size={size} strokeWidth={1.5} />,
    '/tro-giup': <HelpCircle size={size} strokeWidth={1.5} />,
  };
  return map[href] || <Store size={size} strokeWidth={1.5} />;
}

function NavbarPreview({ navbarConfig }: { navbarConfig: NavbarConfig }) {
  const { logo, links, style, layout } = navbarConfig;
  const iconSize = style.iconSize || 26;

  const renderItem = (id: string) => {
    if (id === 'logo') {
      return (
        <span key="logo" className="font-bold text-sm tracking-wide" style={{ color: style.textColor }}>
          {logo.text || "L'essence"}
        </span>
      );
    }
    const match = id.match(/^link-(\d+)$/);
    if (match) {
      const link = links[parseInt(match[1])];
      if (!link || !link.enabled) return null;
      const mode = link.displayMode || 'icon';
      return (
        <span key={id} className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ color: style.textColor }}>
          {(mode === 'icon' || mode === 'icon-text') && previewIcon(link.href, iconSize)}
          {(mode === 'text' || mode === 'icon-text') && link.label}
        </span>
      );
    }
    const emojiMap: Record<string, string> = { search: '🔍', cart: '🛒', user: '👤' };
    if (emojiMap[id]) {
      return (
        <span key={id} className="px-1.5" style={{ fontSize: iconSize }}>
          {emojiMap[id]}
        </span>
      );
    }
    return null;
  };

  const zones = ['left', 'center', 'right'] as ZoneId[];

  return (
    <div
      className="w-full rounded-xl border p-3 flex items-center gap-4 min-h-[48px] shadow-sm"
      style={{ background: style.background, borderColor: style.accentColor + '40' }}
    >
      {zones.map((zoneId) => {
        const items = layout[zoneId].map(renderItem).filter(Boolean);
        const justify = zoneId === 'left' ? 'flex-start' : zoneId === 'center' ? 'center' : 'flex-end';
        return (
          <div
            key={zoneId}
            className="flex-1 flex items-center gap-1 flex-wrap"
            style={{ justifyContent: justify }}
          >
            {items.length > 0 ? items : <span className="text-[9px] text-gray-300 italic">{zoneId}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ── Inline Item Editor ──
function ItemEditor({ itemId, navbarConfig, setNavbarConfig, onClose }: {
  itemId: string;
  navbarConfig: NavbarConfig;
  setNavbarConfig: React.Dispatch<React.SetStateAction<NavbarConfig>>;
  onClose: () => void;
}) {
  if (itemId.match(/^link-\d+$/)) return null;

  if (itemId === 'logo') {
    const inPreset = LOGO_PRESETS.some(p => p.w === navbarConfig.logo.width && p.h === navbarConfig.logo.height);
    const [customMode, setCustomMode] = useState(!inPreset);

    const pickPreset = (preset: typeof LOGO_PRESETS[0]) => {
      setCustomMode(false);
      setNavbarConfig(prev => ({ ...prev, logo: { ...prev.logo, width: preset.w, height: preset.h, text: preset.text } }));
    };

    return (
      <div className="admin-panel bg-white rounded-2xl border border-[#D4A5A5]/40 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h3 className="text-xs font-bold text-[#7A5C5C] uppercase tracking-wider">
            ✎ Editing: Logo
          </h3>
          <button onClick={onClose} className="text-[10px] text-gray-400 hover:text-gray-600">✕ Close</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {LOGO_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => pickPreset(p)}
              className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
                !customMode && p.w === navbarConfig.logo.width && p.h === navbarConfig.logo.height
                  ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
            >
              {p.label} ({p.w}×{p.h})
            </button>
          ))}
          <button
            onClick={() => { setCustomMode(true); }}
            className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-colors ${
              customMode
                ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            Tùy chỉnh
          </button>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block">Brand Text</label>
              <input type="text" value={navbarConfig.logo.text}
                onChange={e => setNavbarConfig(prev => ({ ...prev, logo: { ...prev.logo, text: e.target.value } }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block">Image URL</label>
              <input type="text" value={navbarConfig.logo.image}
                onChange={e => setNavbarConfig(prev => ({ ...prev, logo: { ...prev.logo, image: e.target.value } }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
            </div>
          </div>
          {customMode && (
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block">Width (px)</label>
                <input type="number" min="10" max="300" value={navbarConfig.logo.width}
                  onChange={e => setNavbarConfig(prev => ({ ...prev, logo: { ...prev.logo, width: Number(e.target.value) } }))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
              </div>
              <div>
                <label className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block">Height (px)</label>
                <input type="number" min="10" max="300" value={navbarConfig.logo.height}
                  onChange={e => setNavbarConfig(prev => ({ ...prev, logo: { ...prev.logo, height: Number(e.target.value) } }))}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A5A5]/40" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // search / cart / user
  return (
    <div className="admin-panel bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          ✎ Editing: {getItemLabel(itemId, navbarConfig)}
        </h3>
        <button onClick={onClose} className="text-[10px] text-gray-400 hover:text-gray-600">✕ Close</button>
      </div>
      <p className="text-[11px] text-gray-400 italic">Item này là cố định, không thể chỉnh sửa.</p>
    </div>
  );
}

// ── Sidebar Link Row (draggable into zones) ──
function SidebarLinkRow({ index, link, isSelected, onUpdate, onRemove, onSelect }: {
  index: number;
  link: NavLink;
  isSelected: boolean;
  onUpdate: (i: number, f: keyof NavLink, v: any) => void;
  onRemove: (i: number) => void;
  onSelect: (i: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `link-src-${index}`,
    data: { source: 'sidebar', index },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const modes: { key: NavLink['displayMode']; label: string }[] = [
    { key: 'icon', label: 'I' },
    { key: 'text', label: 'T' },
    { key: 'icon-text', label: 'I+T' },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-link-index={index}
      className={`flex items-stretch gap-0 rounded-lg border transition-all ${
        isSelected ? 'border-[#D4A5A5] ring-2 ring-[#D4A5A5]/20 bg-[#D4A5A5]/5' : 'border-gray-100 bg-white'
      } ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center px-1.5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
        <GripVertical size={13} />
      </div>
      <div className="flex-1 min-w-0 py-1.5 pr-2 space-y-1">
        <div className="flex items-center gap-1.5">
          <input value={link.label}
            onChange={e => { e.stopPropagation(); onUpdate(index, 'label', e.target.value); }}
            onClick={e => e.stopPropagation()}
            placeholder="Label"
            className="flex-1 min-w-0 px-1.5 py-0.5 text-[11px] border border-gray-100 rounded focus:outline-none focus:border-[#D4A5A5] bg-transparent" />
          <input value={link.href}
            onChange={e => { e.stopPropagation(); onUpdate(index, 'href', e.target.value); }}
            onClick={e => e.stopPropagation()}
            placeholder="/link"
            className="w-20 px-1.5 py-0.5 text-[10px] text-gray-500 border border-gray-100 rounded focus:outline-none focus:border-[#D4A5A5] bg-transparent" />
        </div>
        <div className="flex items-center gap-1">
          {modes.map(m => (
            <button key={m.key}
              onClick={e => { e.stopPropagation(); onUpdate(index, 'displayMode', m.key); }}
              className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-colors ${
                link.displayMode === m.key
                  ? 'bg-[#7A5C5C] text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}>
              {m.label}
            </button>
          ))}
          <div className="flex-1" />
          <button onClick={e => { e.stopPropagation(); onUpdate(index, 'enabled', !link.enabled); }}
            className={`px-1.5 py-0.5 text-[9px] font-bold rounded transition-colors ${
              link.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
            {link.enabled ? 'ON' : 'OFF'}
          </button>
          <button onClick={e => { e.stopPropagation(); onRemove(index); }}
            className="p-0.5 text-gray-300 hover:text-red-400 rounded transition-colors">
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export const HomepageNavbarTab = React.memo(function HomepageNavbarTab({
  navbarConfig,
  setNavbarConfig,
}: HomepageNavbarTabProps) {

  const [editingId, setEditingId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [selectedLinkIndex, setSelectedLinkIndex] = useState<number | null>(null);

  // ── Link management ──
  const addLink = () => {
    setNavbarConfig(prev => ({
      ...prev,
      links: [...prev.links, { label: '', href: '/', order: prev.links.length, enabled: true, displayMode: 'icon' }]
    }));
    setSidebarVisible(true);
  };

  const updateLink = <K extends keyof NavLink>(index: number, field: K, value: NavLink[K]) => {
    setNavbarConfig(prev => {
      const links = [...prev.links];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, links };
    });
  };

  const removeLink = (index: number) => {
    setNavbarConfig(prev => {
      const links = prev.links.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i }));
      const layout = { ...prev.layout };
      for (const zone of ['left', 'center', 'right'] as const) {
        layout[zone] = layout[zone].reduce<string[]>((acc, id) => {
          if (id === `link-${index}`) return acc;
          const match = id.match(/^link-(\d+)$/);
          if (match) {
            const oldIdx = parseInt(match[1]);
            if (oldIdx > index) {
              acc.push(`link-${oldIdx - 1}`);
              return acc;
            }
          }
          acc.push(id);
          return acc;
        }, []);
      }
      return { ...prev, links, layout };
    });
  };

  // ── Layout DnD ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleLayoutDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    // ── Handle sidebar → zone ──
    const sidebarMatch = activeId.match(/^link-src-(\d+)$/);
    if (sidebarMatch) {
      const linkIndex = parseInt(sidebarMatch[1]);
      const zones = ['left', 'center', 'right'] as ZoneId[];
      const isOverZone = zones.includes(overId as ZoneId);

      let overZone: ZoneId | undefined;
      if (isOverZone) {
        overZone = overId as ZoneId;
      } else {
        overZone = zones.find(z => navbarConfig.layout[z].includes(overId));
      }
      if (!overZone) return;

      setNavbarConfig(prev => {
        const itemId = `link-${linkIndex}`;
        if (prev.layout[overZone!].includes(itemId)) return prev;
        const dst = [...prev.layout[overZone!]];
        if (isOverZone) {
          dst.push(itemId);
        } else {
          const overIdx = dst.indexOf(overId);
          dst.splice(overIdx >= 0 ? overIdx : dst.length, 0, itemId);
        }
        return { ...prev, layout: { ...prev.layout, [overZone!]: dst } };
      });
      return;
    }

    // ── Zone-to-zone reorder ──
    const zones = ['left', 'center', 'right'] as ZoneId[];
    let activeZone = zones.find(z => navbarConfig.layout[z].includes(activeId));
    const isOverZone = zones.includes(overId as ZoneId);
    let overZone: ZoneId | undefined;
    if (isOverZone) {
      overZone = overId as ZoneId;
    } else {
      overZone = zones.find(z => navbarConfig.layout[z].includes(overId));
    }

    if (!activeZone || !overZone) return;

    setNavbarConfig(prev => {
      const layout = { ...prev.layout };
      const src = [...layout[activeZone!]];
      const dst = activeZone === overZone ? src : [...layout[overZone!]];

      const srcIdx = src.indexOf(activeId);
      if (srcIdx === -1) return prev;
      src.splice(srcIdx, 1);

      let dstIdx: number;
      if (isOverZone) {
        dstIdx = dst.length;
      } else {
        const overIdx = dst.indexOf(overId);
        dstIdx = overIdx >= 0 ? overIdx : dst.length;
      }
      dst.splice(dstIdx, 0, activeId);

      return {
        ...prev,
        layout: {
          left: activeZone === 'left' ? src : (overZone === 'left' ? dst : layout.left),
          center: activeZone === 'center' ? src : (overZone === 'center' ? dst : layout.center),
          right: activeZone === 'right' ? src : (overZone === 'right' ? dst : layout.right),
        }
      };
    });
  };

  const handleRemoveFromZone = (zone: ZoneId, itemId: string) => {
    setNavbarConfig(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [zone]: prev.layout[zone].filter(id => id !== itemId),
      }
    }));
  };

  const handleEditChip = (id: string) => {
    const linkMatch = id.match(/^link-(\d+)$/);
    if (linkMatch) {
      setSelectedLinkIndex(parseInt(linkMatch[1]));
      setSidebarVisible(true);
    }
    setEditingId(id);
  };

  return (
    <motion.div
      key="navbar-panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-8"
    >
      {/* ── Live Preview ── */}
      <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <h2 className="text-sm font-semibold text-[#7A5C5C]">Navbar Preview</h2>
        </div>
        <NavbarPreview navbarConfig={navbarConfig} />
      </div>

      {/* ── Layout Builder + Sidebar ── */}
      <div className="admin-panel bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical size={18} className="text-[#D4A5A5]" />
            <h2 className="text-sm font-semibold text-[#7A5C5C]">Navbar Layout Builder</h2>
          </div>
          <button onClick={() => setSidebarVisible(!sidebarVisible)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            {sidebarVisible ? '✕' : '☰'} {sidebarVisible ? 'Ẩn' : 'Hiện'} Liên kết
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mb-4">
          Kéo thả các item giữa các khu vực hoặc kéo từ danh sách Liên kết bên phải vào khu vực mong muốn.
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLayoutDragEnd}>
          <div className="flex gap-4">
            <div className={`grid grid-cols-3 gap-3 ${sidebarVisible ? 'flex-1' : 'w-full'}`}>
              {(['left', 'center', 'right'] as ZoneId[]).map(zoneId => (
                <Zone
                  key={zoneId}
                  id={zoneId}
                  items={navbarConfig.layout[zoneId]}
                  navbarConfig={navbarConfig}
                  onRemove={handleRemoveFromZone}
                  onEdit={handleEditChip}
                  editingId={editingId}
                />
              ))}
            </div>

            {/* ── Sidebar ── */}
            {sidebarVisible && (
              <div className="w-72 shrink-0 border-l border-gray-200 pl-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[11px] font-semibold text-[#7A5C5C] uppercase tracking-wider">
                    Liên kết
                  </h3>
                  <button onClick={addLink}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg bg-[#7A5C5C] text-white hover:bg-[#604444] transition-colors">
                    <Plus size={10} /> Thêm
                  </button>
                </div>
                <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1">
                  {navbarConfig.links.map((link, i) => (
                    <div key={i} onClick={() => setSelectedLinkIndex(i)}
                      className={selectedLinkIndex === i ? 'rounded-lg ring-2 ring-[#D4A5A5]/30' : ''}>
                      <SidebarLinkRow
                        index={i}
                        link={link}
                        isSelected={selectedLinkIndex === i}
                        onUpdate={updateLink}
                        onRemove={removeLink}
                        onSelect={setSelectedLinkIndex}
                      />
                    </div>
                  ))}
                  {navbarConfig.links.length === 0 && (
                    <p className="text-[11px] text-gray-400 italic text-center py-4">Chưa có liên kết nào.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </DndContext>
      </div>

      {/* ── Inline Item Editor (logo / search / cart / user only) ── */}
      {editingId && (
        <ItemEditor
          itemId={editingId}
          navbarConfig={navbarConfig}
          setNavbarConfig={setNavbarConfig}
          onClose={() => setEditingId(null)}
        />
      )}
    </motion.div>
  );
});
