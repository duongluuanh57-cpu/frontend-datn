'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, DragEndEvent, type SensorDescriptor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';
import {
    GripVertical,
    Eye,
    EyeOff,
    SlidersHorizontal,
    Palette,
    Type,
    Check,
    RotateCcw,
    Calendar,
    Clock,
    Image
} from 'lucide-react';
import type { BlogCardConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_BLOG_CARD_CONFIG } from '@/hooks/useHomepageConfig';

interface ElementOrderItem {
    id: string;
    label: string;
    show: boolean;
}

interface HomepageBlogCardTabProps {
    blogCardConfig: BlogCardConfig;
    setBlogCardConfig: React.Dispatch<React.SetStateAction<BlogCardConfig>>;
    blogElementOrder: ElementOrderItem[];
    setBlogElementOrder: React.Dispatch<React.SetStateAction<ElementOrderItem[]>>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cardElementSensors: SensorDescriptor<any>[];
}

export const HomepageBlogCardTab = React.memo(function HomepageBlogCardTab({
    blogCardConfig,
    setBlogCardConfig,
    blogElementOrder,
    setBlogElementOrder,
    cardElementSensors
}: HomepageBlogCardTabProps) {

    return (
        <motion.div
            key="blog-card-customizer-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8"
        >
            {/* ── Control Panel (Left) ── */}
            <div className="space-y-5 order-2 lg:order-1">

                {/* Section: Layout */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <SlidersHorizontal size={15} className="text-[#D4A5A5]" />
                        <h3 className="text-sm font-bold text-[#7A5C5C]">Layout & Kích thước</h3>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider block">Tỷ lệ khung ảnh</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['landscape', 'square', 'portrait'] as const).map((asp) => (
                                <button
                                    key={asp}
                                    onClick={() => setBlogCardConfig(p => ({ ...p, imageAspect: asp }))}
                                    className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${blogCardConfig.imageAspect === asp
                                            ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                                            : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40'
                                        }`}
                                >
                                    {asp === 'landscape' ? '4:3 Ngang' : asp === 'square' ? '1:1 Vuông' : '3:4 Dọc'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider">Padding ảnh</label>
                            <span className="text-[10px] font-bold text-[#7A5C5C]">{blogCardConfig.imagePadding}px</span>
                        </div>
                        <input type="range" min={0} max={40} value={blogCardConfig.imagePadding}
                            onChange={e => setBlogCardConfig(p => ({ ...p, imagePadding: Number(e.target.value) }))}
                            className="w-full accent-[#7A5C5C]"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider">Bo góc card</label>
                            <span className="text-[10px] font-bold text-[#7A5C5C]">{blogCardConfig.cardRadius}px</span>
                        </div>
                        <input type="range" min={0} max={32} value={blogCardConfig.cardRadius}
                            onChange={e => setBlogCardConfig(p => ({ ...p, cardRadius: Number(e.target.value) }))}
                            className="w-full accent-[#7A5C5C]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider block">Căn chỉnh văn bản</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['left', 'center'] as const).map((align) => (
                                <button
                                    key={align}
                                    onClick={() => setBlogCardConfig(p => ({ ...p, textAlign: align }))}
                                    className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 ${blogCardConfig.textAlign === align
                                            ? 'bg-[#7A5C5C] text-white border-[#7A5C5C]'
                                            : 'bg-white text-[#7A5C5C] border-gray-200 hover:border-[#7A5C5C]/40'
                                        }`}
                                >
                                    {align === 'left' ? '← Trái' : '⇔ Giữa'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section: Element Order */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <GripVertical size={15} className="text-[#D4A5A5]" />
                        <h3 className="text-sm font-bold text-[#7A5C5C]">Thứ tự & Hiển thị Elements</h3>
                    </div>
                    <p className="text-[10px] text-[#7A5C5C]/50">Kéo thả để đổi thứ tự, Toggle để ẩn/hiện</p>
                    <DndContext
                        sensors={cardElementSensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event: DragEndEvent) => {
                            const { active, over } = event;
                            if (!over || active.id === over.id) return;
                            setBlogElementOrder(prev => {
                                const oldIdx = prev.findIndex(e => e.id === active.id);
                                const newIdx = prev.findIndex(e => e.id === over.id);
                                return arrayMove(prev, oldIdx, newIdx);
                            });
                        }}
                    >
                        <SortableContext items={blogElementOrder.map(e => e.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {blogElementOrder.map((elem) => (
                                    <BlogElementRow
                                        key={elem.id}
                                        element={elem}
                                        onToggle={() => setBlogElementOrder(prev =>
                                            prev.map(e => e.id === elem.id ? { ...e, show: !e.show } : e)
                                        )}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>

                {/* Section: Colors */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Palette size={15} className="text-[#D4A5A5]" />
                        <h3 className="text-sm font-bold text-[#7A5C5C]">Màu sắc Badge Danh mục</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Badge - Nền', key: 'categoryBadgeBg' as const },
                            { label: 'Badge - Chữ', key: 'categoryBadgeText' as const },
                        ].map(({ label, key }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider block">{label}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={blogCardConfig[key]}
                                        onChange={e => setBlogCardConfig(p => ({ ...p, [key]: e.target.value }))}
                                        className="h-8 w-8 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
                                    />
                                    <input
                                        type="text"
                                        value={blogCardConfig[key]}
                                        onChange={e => setBlogCardConfig(p => ({ ...p, [key]: e.target.value }))}
                                        className="flex-1 px-2 py-1 text-[10px] font-mono border border-gray-200 rounded-lg focus:outline-none focus:border-[#7A5C5C] text-[#7A5C5C]"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Typography */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Type size={15} className="text-[#D4A5A5]" />
                        <h3 className="text-sm font-bold text-[#7A5C5C]">Typography</h3>
                    </div>
                    {[
                        { label: 'Tiêu đề bài viết', key: 'titleFontSize' as const, min: 12, max: 24 },
                        { label: 'Đoạn trích', key: 'excerptFontSize' as const, min: 9, max: 16 }
                    ].map(({ label, key, min, max }) => (
                        <div key={key} className="space-y-1.5">
                            <div className="flex justify-between">
                                <label className="text-[9px] font-bold text-[#7A5C5C]/60 uppercase tracking-wider">{label}</label>
                                <span className="text-[10px] font-bold text-[#7A5C5C]">{blogCardConfig[key]}px</span>
                            </div>
                            <input type="range" min={min} max={max} value={blogCardConfig[key]}
                                onChange={e => setBlogCardConfig(p => ({ ...p, [key]: Number(e.target.value) }))}
                                className="w-full accent-[#7A5C5C]"
                            />
                        </div>
                    ))}
                </div>

            </div>

            {/* ── Live Preview (Right) ── */}
            <div className="order-1 lg:order-2">
                <div className="sticky top-6 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-emerald-500" />
                                <h3 className="text-sm font-bold text-[#7A5C5C]">Xem trước Live</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setBlogCardConfig(DEFAULT_BLOG_CARD_CONFIG);
                                    setBlogElementOrder([
                                        { id: 'category', label: 'Danh mục / Category', show: true },
                                        { id: 'date', label: 'Ngày đăng + Giờ đọc', show: true },
                                        { id: 'title', label: 'Tiêu đề bài viết', show: true },
                                        { id: 'excerpt', label: 'Đoạn trích', show: true },
                                        { id: 'readMore', label: 'Nút Đọc tiếp', show: true }
                                    ]);
                                }}
                                className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-[#7A5C5C]/60 hover:text-[#7A5C5C] border border-gray-200 hover:border-[#7A5C5C]/30 px-2.5 py-1.5 rounded-lg transition-all duration-200"
                            >
                                <RotateCcw size={11} /> Reset
                            </button>
                        </div>

                        {/* Preview Card */}
                        <div className="max-w-[280px] mx-auto">
                            <BlogCardPreview
                                config={{
                                    ...blogCardConfig,
                                    elementOrder: blogElementOrder.map(e => e.id),
                                    showCategory: blogElementOrder.find(e => e.id === 'category')?.show ?? true,
                                    showDate: blogElementOrder.find(e => e.id === 'date')?.show ?? true,
                                    showReadTime: blogElementOrder.find(e => e.id === 'date')?.show ?? true,
                                    showExcerpt: blogElementOrder.find(e => e.id === 'excerpt')?.show ?? true,
                                    showReadMore: blogElementOrder.find(e => e.id === 'readMore')?.show ?? true
                                }}
                            />
                        </div>

                        <p className="text-center text-[9px] text-gray-400 mt-4 italic">
                            * Bản xem trước dùng dữ liệu bài viết mẫu
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

// ============================================================
// Blog Element Row (Sortable)
// ============================================================
function BlogElementRow({
    element,
    onToggle
}: {
    element: { id: string; label: string; show: boolean };
    onToggle: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1, zIndex: isDragging ? 50 : undefined };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${element.show ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100 opacity-60'
                } ${isDragging ? 'shadow-lg ring-1 ring-[#D4A5A5]/30' : ''}`}
        >
            <button {...attributes} {...listeners} className="text-gray-300 hover:text-[#7A5C5C]/40 cursor-grab active:cursor-grabbing focus:outline-none">
                <GripVertical size={15} />
            </button>
            <span className="flex-1 text-xs font-medium text-[#7A5C5C]">{element.label}</span>
            <button
                onClick={onToggle}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${element.show
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}
            >
                {element.show ? <><Eye size={10} /> Hiện</> : <><EyeOff size={10} /> Ẩn</>}
            </button>
        </div>
    );
}

// ============================================================
// Blog Card Preview - Static mock data
// ============================================================
function BlogCardPreview({ config }: { config: BlogCardConfig }) {
    const ASPECT_CLASSES: Record<string, string> = {
        landscape: 'aspect-[4/3]',
        square: 'aspect-square',
        portrait: 'aspect-[3/4]'
    };
    const aspectClass = ASPECT_CLASSES[config.imageAspect] ?? 'aspect-[4/3]';
    const badgeStyle = { backgroundColor: config.categoryBadgeBg, color: config.categoryBadgeText };
    const textAlignClass = config.textAlign === 'left' ? 'items-start text-left' : 'items-center text-center';
    const justifyClass = config.textAlign === 'left' ? 'justify-start' : 'justify-center';

    const elementMap: Record<string, React.ReactNode> = {
        category: config.showCategory ? (
            <div key="category">
                <div className="inline-block px-3 py-1 text-[8px] font-bold tracking-wider rounded-full shadow-sm border border-white/30" style={badgeStyle}>
                    Kiến thức
                </div>
            </div>
        ) : null,
        date: config.showDate ? (
            <div key="date" className={`flex items-center gap-3 text-[#7A5C5C]/50 text-[9px] font-bold uppercase tracking-wider ${justifyClass}`}>
                <div className="flex items-center gap-1">
                    <Calendar size={9} className="text-[#D4A5A5]" />
                    <span>15/03/2026</span>
                </div>
                {config.showReadTime && (
                    <div className="flex items-center gap-1">
                        <Clock size={9} className="text-[#D4A5A5]" />
                        <span>5 phút</span>
                    </div>
                )}
            </div>
        ) : null,
        title: (
            <h3 key="title" className="font-medium text-[#7A5C5C] line-clamp-2 leading-snug" style={{ fontSize: `${config.titleFontSize}px` }}>
                Hương thơm Niche Premium cho người sành điệu
            </h3>
        ),
        excerpt: config.showExcerpt ? (
            <p key="excerpt" className="text-[#7A5C5C]/65 font-medium line-clamp-2 leading-relaxed" style={{ fontSize: `${config.excerptFontSize}px` }}>
                Khám phá thế giới nước hoa niche đẳng cấp với những tầng hương tinh tế và câu chuyện đằng sau mỗi chai nước hoa thủ công.
            </p>
        ) : null,
        readMore: config.showReadMore ? (
            <div key="readMore" className={`mt-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#D4A5A5] ${justifyClass}`}>
                <span>Đọc tiếp</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1 5H9M9 5L5.5 1.5M9 5L5.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        ) : null
    };

    return (
        <div className="flex flex-col h-full">
            {/* Image area */}
            <div
                className={`${aspectClass} w-full relative overflow-hidden bg-gradient-to-br from-[#FFF5F5] to-[#F5EEE8]`}
                style={{ borderRadius: `${config.cardRadius}px` }}
            >
                {/* Mock image placeholder */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ padding: `${config.imagePadding}px` }}
                >
                    <div className="w-full h-full flex items-center justify-center opacity-15">
                        <Image size={48} className="text-[#7A5C5C]" />
                    </div>
                </div>
            </div>

            {/* Info area */}
            <div className={`mt-3 flex flex-col gap-2 ${textAlignClass}`}>
                {config.elementOrder.map(id => elementMap[id] ?? null)}
            </div>
        </div>
    );
}