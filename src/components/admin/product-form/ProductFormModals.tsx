'use client';

import React from 'react';
import { Tag, Sparkles, X, Loader2, FileText } from 'lucide-react';
import {
  UseProductFormReturn, SIZE_CATEGORIES, parseExplanation, formatSizeString
} from './useProductForm';
import { SelectionModal } from './SelectionModal';

const formatBullets = (content: string) => {
  if (!content) return null;
  return content.split('\n').map((line) => line.trim()).filter((line) => {
    const clean = line.replace(/^[-*•\s]+/, '').trim();
    return clean.length > 0;
  }).map((line, idx) => {
    const cleanLine = line.replace(/^[-*•\s]*/, '').trim();
    const parts = cleanLine.split(/\*\*(.*?)\*\*/g);
    return (
      <li key={idx} className="mb-[6px] list-none pl-[14px] relative text-[0.718rem] leading-[1.45] text-left"
        style={{ color: 'var(--admin-text-muted)' }}>
        <span className="absolute left-0 top-[6px] w-[5px] h-[5px] rounded-full"
          style={{ background: 'var(--admin-accent, #C9A99A)' }} />
        {parts.map((part, pIdx) =>
          pIdx % 2 === 1 ? <strong key={pIdx} className="font-semibold" style={{ color: 'var(--admin-text)' }}>{part}</strong> : part
        )}
      </li>
    );
  });
};

export function ProductFormModals({ formHelpers }: { formHelpers: UseProductFormReturn }) {
  const {
    isVi, formData, update,
    tags, selectedTags, handleTagToggle, isTagModalOpen, setIsTagModalOpen,
    isGenderModalOpen, setIsGenderModalOpen, isScentGroupModalOpen, setIsScentGroupModalOpen,
    isConcentrationModalOpen, setIsConcentrationModalOpen, isSegmentModalOpen, setIsSegmentModalOpen,
    customGender, setCustomGender, customScentGroup, setCustomScentGroup,
    customConcentration, setCustomConcentration, customSegment, setCustomSegment,
    selectedGenders, selectedScentGroups, selectedConcentrations, selectedSegments,
    handleGenderToggle, handleScentGroupToggle, handleConcentrationToggle, handleSegmentToggle,
    scentGroups, concentrations, segments,
    addScentGroupMutation, addConcentrationMutation, addSegmentMutation,
    isPriceSuggestModalOpen, setIsPriceSuggestModalOpen,
    isSuggestingPrice, priceMarkupPercentage, priceSuggestionData, setPriceSuggestionData,
    activeSuggestContext, setActiveSuggestContext,
    handleRecalculatePriceMarkup, parsedSizes, selectedSizes,
  } = formHelpers;

  return (
    <>
      <SelectionModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        icon={<Tag size={18} />}
        title={isVi ? 'Phân loại Tag sản phẩm' : 'Product Tag Selection'}
        subtitle={isVi ? 'Chọn một hoặc nhiều nhãn phù hợp cho sản phẩm' : 'Select one or multiple tags for the product'}
        items={(tags || [])
          .filter(t => t.status === 'active')
          .map(t => ({ id: t.slug, label: t.name, secondaryLabel: t.slug }))}
        selectedIds={selectedTags}
        onToggle={handleTagToggle}
        emptyMessage={isVi ? 'Không có nhãn nào đang hoạt động' : 'No active tags found'}
      />

      <SelectionModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        icon={<Sparkles size={18} />}
        title={isVi ? 'Phân loại Giới tính' : 'Gender Classification'}
        subtitle={isVi ? 'Chọn một hoặc nhiều giới tính phù hợp' : 'Select one or multiple target genders'}
        items={Array.from(new Set([...['Nam', 'Nữ', 'Unisex', 'Men', 'Women'], ...selectedGenders])).map(g => ({ id: g, label: g }))}
        selectedIds={selectedGenders}
        onToggle={handleGenderToggle}
        emptyMessage={isVi ? 'Không có lựa chọn' : 'No options available'}
        customValue={customGender}
        onCustomChange={setCustomGender}
        customPlaceholder={isVi ? 'Thêm giới tính tùy chỉnh...' : 'Add custom gender...'}
        onCustomAdd={() => { if (customGender.trim()) { handleGenderToggle(customGender.trim()); setCustomGender(''); } }}
      />

      <SelectionModal
        isOpen={isScentGroupModalOpen}
        onClose={() => setIsScentGroupModalOpen(false)}
        icon={<Sparkles size={18} />}
        title={isVi ? 'Phân loại Nhóm hương' : 'Scent Group Selection'}
        subtitle={isVi ? 'Chọn các nhóm hương đặc trưng của nước hoa này' : 'Select signature scent groups of this perfume'}
        items={Array.from(new Set([
          ...(scentGroups?.map(s => s.name) || [
            'Hương Gỗ (Woody)', 'Hương Hoa Cỏ (Floral)', 'Hương Phương Đông (Oriental)',
            'Hương Cam Chanh (Citrus)', 'Hương Gia Vị (Spicy)', 'Hương Da Thuộc (Leather)',
            'Hương Nước (Aquatic)', 'Hương Trái Cây (Fruity)', 'Hương Rêu Sồi (Chypre)', 'Hương Thảo Mộc (Fougere)'
          ]),
          ...selectedScentGroups,
        ])).map(sg => ({ id: sg, label: sg }))}
        selectedIds={selectedScentGroups}
        onToggle={handleScentGroupToggle}
        emptyMessage={isVi ? 'Không có nhóm hương' : 'No scent groups available'}
        customValue={customScentGroup}
        onCustomChange={setCustomScentGroup}
        customPlaceholder={isVi ? 'Thêm nhóm hương tùy chỉnh...' : 'Add custom scent group...'}
        onCustomAdd={() => { if (customScentGroup.trim()) addScentGroupMutation.mutate(customScentGroup.trim()); }}
        isCustomPending={addScentGroupMutation.isPending}
      />

      <SelectionModal
        isOpen={isConcentrationModalOpen}
        onClose={() => setIsConcentrationModalOpen(false)}
        icon={<Sparkles size={18} />}
        title={isVi ? 'Phân loại Nồng độ' : 'Concentration Selection'}
        subtitle={isVi ? 'Chọn nồng độ tinh dầu của nước hoa' : 'Select perfume concentrations'}
        items={Array.from(new Set([
          ...(concentrations?.map(c => c.name) || [
            'EDP (Eau de Parfum)', 'EDT (Eau de Toilette)', 'Parfum / Extrait',
            'EDC (Eau de Cologne)', 'Eau Fraiche', 'Body Mist / Deodorant'
          ]),
          ...selectedConcentrations,
        ])).map(c => ({ id: c, label: c }))}
        selectedIds={selectedConcentrations}
        onToggle={handleConcentrationToggle}
        emptyMessage={isVi ? 'Không có nồng độ' : 'No concentrations available'}
        customValue={customConcentration}
        onCustomChange={setCustomConcentration}
        customPlaceholder={isVi ? 'Thêm nồng độ tùy chỉnh...' : 'Add custom concentration...'}
        onCustomAdd={() => { if (customConcentration.trim()) addConcentrationMutation.mutate(customConcentration.trim()); }}
        isCustomPending={addConcentrationMutation.isPending}
      />

      <SelectionModal
        isOpen={isSegmentModalOpen}
        onClose={() => setIsSegmentModalOpen(false)}
        icon={<Sparkles size={18} />}
        title={isVi ? 'Phân loại Phân khúc' : 'Segment Selection'}
        subtitle={isVi ? 'Chọn phân khúc phân cấp của thương hiệu nước hoa' : 'Select brand segment classification'}
        items={Array.from(new Set([
          ...(segments?.map(s => s.name) || ['Niche', 'Designer', 'Indie / Artisan', 'Masstige', 'Classic / Vintage']),
          ...selectedSegments,
        ])).map(s => ({ id: s, label: s }))}
        selectedIds={selectedSegments}
        onToggle={handleSegmentToggle}
        emptyMessage={isVi ? 'Không có phân khúc' : 'No segments available'}
        customValue={customSegment}
        onCustomChange={setCustomSegment}
        customPlaceholder={isVi ? 'Thêm phân khúc tùy chỉnh...' : 'Add custom segment...'}
        onCustomAdd={() => { if (customSegment.trim()) addSegmentMutation.mutate(customSegment.trim()); }}
        isCustomPending={addSegmentMutation.isPending}
      />

      {/* AI Price/Discount/Variants Suggestion Modal */}
      {isPriceSuggestModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 overflow-y-auto"
          style={{ background: 'rgba(61, 46, 36, 0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setIsPriceSuggestModalOpen(false)}>
          <div className="flex flex-row gap-5 items-stretch justify-center flex-wrap w-full max-w-[1060px] max-h-[90vh]"
            style={{ animation: 'fadeIn 0.2s ease-out' }}
            onClick={(e) => e.stopPropagation()}>

            {/* Left Card */}
            <div className="flex-[1_1_420px] max-w-[480px] max-h-[90vh] overflow-y-auto p-6 rounded-[var(--admin-radius-lg)] flex flex-col gap-5"
              style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}>

              {activeSuggestContext?.size === 'Dung tích' ? (
                <>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
                        <Sparkles size={18} className="text-[#D4A5A5]" />
                        {isVi ? 'Biến thể dung tích' : 'Size Variants'}
                      </h4>
                      <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
                        {isVi ? 'Chọn dung tích bán và nhập giá của từng loại' : 'Select variants and set custom pricing'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 flex-1 pr-[6px]">
                    {SIZE_CATEGORIES.map((category) => {
                      const catName = isVi ? category.name : category.nameEn;
                      return (
                        <div key={category.name} className="flex flex-col gap-[10px]">
                          <p className="text-[0.6875rem] font-bold tracking-wide uppercase text-left"
                            style={{ color: 'var(--admin-text-muted)' }}>• {catName}</p>
                          <div className="flex flex-col gap-[10px]">
                            {category.sizes.map((sz) => {
                              const isSelected = selectedSizes.includes(sz);
                              const matched = parsedSizes.find((p) => p.sz === sz);
                              const sizePrice = matched ? matched.price : '';
                              return (
                                <div key={sz} className="flex items-center gap-3 w-full">
                                  <label className="inline-flex items-center justify-center min-w-[70px] p-2 px-[14px] rounded-[var(--admin-radius)] border cursor-pointer text-sm font-medium transition-all duration-150 text-center"
                                    style={{
                                      borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                                      background: isSelected ? 'rgba(201, 169, 154, 0.1)' : 'var(--admin-surface-muted)',
                                      color: isSelected ? 'var(--admin-accent-hover)' : 'var(--admin-text)',
                                    }}>
                                    <input type="checkbox" checked={isSelected}
                                      onChange={async () => {
                                        let newSizes = [...parsedSizes];
                                        if (isSelected) {
                                          newSizes = newSizes.filter((p) => p.sz !== sz);
                                          update({ size: newSizes.map(p => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                                        } else {
                                          newSizes.push({ sz, price: '' });
                                          newSizes.sort((a, b) => parseInt(a.sz) - parseInt(b.sz));
                                          update({ size: newSizes.map(p => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                                        }
                                      }}
                                      className="hidden" />
                                    {sz}
                                  </label>
                                  {isSelected && (
                                    <div className="flex items-center gap-[6px] flex-grow">
                                      <div className="relative flex-grow flex items-center">
                                        <input type="number" min={0}
                                          placeholder={isVi ? 'Nhập giá bán...' : 'Enter price...'}
                                          value={sizePrice}
                                          onChange={(e) => {
                                            const newPrice = e.target.value;
                                            update({ size: parsedSizes.map(p => p.sz === sz ? { ...p, price: newPrice } : p).map(p => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                                          }}
                                          className="w-full p-[6px_12px] h-[34px] rounded-[var(--admin-radius)] text-sm outline-none transition-all duration-150"
                                          style={{
                                            border: '1px solid var(--admin-border-subtle)',
                                            background: 'var(--admin-surface)',
                                            color: 'var(--admin-text)',
                                          }} />
                                      </div>
                                      <span className="text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>VNĐ</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-4 mt-auto" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
                    <button type="button" onClick={() => setIsPriceSuggestModalOpen(false)}
                      className="admin-btn-submit" style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}>
                      {isVi ? 'Xác nhận dung tích' : 'Confirm Capacities'}
                    </button>
                  </div>
                </>
              ) : activeSuggestContext?.size === 'Chiết khấu' ? (
                <>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
                        <Sparkles size={18} className="text-[#D4A5A5]" />
                        {isVi ? 'Thiết lập chiết khấu' : 'Configure Discount'}
                      </h4>
                      <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
                        {isVi ? 'Chỉnh sửa tỷ lệ chiết khấu và lên lịch sự kiện' : 'Set discount rates and configure event schedules'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 flex-1">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>
                          {isVi ? 'Tỷ lệ chiết khấu (%)' : 'Discount Percentage (%)'}
                        </label>
                        <span className="text-xs font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>
                          {formData.discountPercentage}%
                        </span>
                      </div>
                      <div className="flex gap-[10px] items-center">
                        <input type="range" min={0} max={90} step={5}
                          value={formData.discountPercentage}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            update({ discountPercentage: val, ...(val <= 0 ? { discountStartDate: null, discountEndDate: null } : {}) });
                          }}
                          className="flex-grow cursor-pointer"
                          style={{ accentColor: 'var(--admin-text-brand, #7A5C5C)' }} />
                        <input type="number" min={0} max={100} value={formData.discountPercentage}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            update({ discountPercentage: val, ...(val <= 0 ? { discountStartDate: null, discountEndDate: null } : {}) });
                          }}
                          className="w-[65px] text-center outline-none text-sm rounded-[var(--admin-radius)] p-[6px] border"
                          style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)', color: 'var(--admin-text)' }} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
                      <p className="text-xs font-bold" style={{ color: 'var(--admin-text)' }}>
                        📅 {isVi ? 'Đặt lịch thời gian áp dụng' : 'Active Event Schedule'}
                      </p>
                      <div className="admin-field">
                        <label className="admin-label text-[0.6875rem]">{isVi ? 'Ngày bắt đầu' : 'Start Date'}</label>
                        <input type="datetime-local"
                          value={formData.discountStartDate ? new Date(new Date(formData.discountStartDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => update({ discountStartDate: e.target.value ? new Date(e.target.value) : null })}
                          onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
                          className="admin-input" style={{ colorScheme: 'dark', cursor: 'pointer', fontSize: '0.75rem', height: '38px' }} />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label text-[0.6875rem]">{isVi ? 'Ngày kết thúc' : 'End Date'}</label>
                        <input type="datetime-local"
                          value={formData.discountEndDate ? new Date(new Date(formData.discountEndDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => update({ discountEndDate: e.target.value ? new Date(e.target.value) : null })}
                          onClick={(e) => { try { (e.target as HTMLInputElement).showPicker(); } catch {} }}
                          className="admin-input" style={{ colorScheme: 'dark', cursor: 'pointer', fontSize: '0.75rem', height: '38px' }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 mt-auto" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
                    <button type="button" onClick={() => setIsPriceSuggestModalOpen(false)}
                      className="admin-btn-submit" style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}>
                      {isVi ? 'Xác nhận chiết khấu' : 'Confirm Discount'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
                        <Sparkles size={18} className="text-[#D4A5A5]" />
                        {isVi ? 'Đề xuất giá bằng AI' : 'AI Price Suggestion'}
                      </h4>
                      <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
                        {isVi ? 'Phân tích thị trường nước hoa chính hãng + biên lợi nhuận mong muốn' : 'Analyze authentic perfume market prices & target profit margin'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 flex-1">
                    {isSuggestingPrice ? (
                      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
                        <Loader2 size={32} className="animate-spin text-[#D4A5A5]" />
                        <p className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                          {isVi ? 'AI đang phân tích giá thị trường của sản phẩm...' : 'AI is analyzing authentic market retail prices...'}
                        </p>
                      </div>
                    ) : priceSuggestionData ? (
                      <>
                        <div className="grid grid-cols-3 gap-[10px] p-[14px] rounded-[var(--admin-radius)] border"
                          style={{ background: 'rgba(201, 169, 154, 0.05)', borderColor: 'var(--admin-border-subtle)' }}>
                          <div className="text-center">
                            <p className="text-[0.6875rem] font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                              {isVi ? 'Giá thị trường' : 'Market Price'}
                            </p>
                            <p className="text-[0.9375rem] font-semibold mt-1" style={{ color: 'var(--admin-text)' }}>
                              {priceSuggestionData.marketPrice.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                          <div className="text-center" style={{ borderLeft: '1px solid var(--admin-border-subtle)', borderRight: '1px solid var(--admin-border-subtle)' }}>
                            <p className="text-[0.6875rem] font-medium" style={{ color: 'var(--admin-text-muted)' }}>
                              Markup ({priceMarkupPercentage}%)
                            </p>
                            <p className="text-[0.9375rem] font-semibold mt-1" style={{ color: 'var(--admin-text-muted)' }}>
                              +{priceSuggestionData.markupAmount.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[0.6875rem] font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>
                              {isVi ? 'Giá đề xuất web' : 'Suggested Price'}
                            </p>
                            <p className="text-[1.0625rem] font-bold mt-1" style={{ color: 'var(--admin-accent-hover, #D4A5A5)' }}>
                              {priceSuggestionData.suggestedPrice.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-[6px]">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>
                              {isVi ? 'Biên lợi nhuận cộng thêm (Markup)' : 'Markup Margin Percentage'}
                            </label>
                            <span className="text-xs font-bold" style={{ color: 'var(--admin-text-brand, #7A5C5C)' }}>
                              {priceMarkupPercentage}%
                            </span>
                          </div>
                          <input type="range" min={5} max={40} step={5} value={priceMarkupPercentage}
                            onChange={(e) => handleRecalculatePriceMarkup(Number(e.target.value))}
                            className="w-full cursor-pointer"
                            style={{ accentColor: 'var(--admin-text-brand, #7A5C5C)' }} />
                          <div className="flex justify-between text-[0.625rem]" style={{ color: 'var(--admin-text-muted)' }}>
                            <span>5% ({isVi ? 'Thấp' : 'Low'})</span>
                            <span>15% ({isVi ? 'Chuẩn' : 'Std'})</span>
                            <span>25% ({isVi ? 'Cao' : 'High'})</span>
                            <span>40% ({isVi ? 'Thượng lưu' : 'Elite'})</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-[6px] pt-3 mt-1" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
                          <label className="text-xs font-semibold" style={{ color: 'var(--admin-text)' }}>
                            {isVi ? 'Nhập giá bán thủ công' : 'Enter Custom Price Manually'}
                          </label>
                          <div className="relative flex items-center">
                            <input type="number" min={0} value={priceSuggestionData.suggestedPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const marketPrice = Math.round((val / (1 + priceMarkupPercentage / 100)) / 10000) * 10000;
                                setPriceSuggestionData({ ...priceSuggestionData, suggestedPrice: val, marketPrice, markupAmount: val - marketPrice });
                              }}
                              className="w-full p-[8px_45px_8px_12px] text-sm outline-none rounded-[var(--admin-radius)]"
                              style={{ background: 'rgba(201, 169, 154, 0.05)', border: '1px solid var(--admin-border-subtle)', color: 'var(--admin-text)' }} />
                            <span className="absolute right-3 text-xs font-semibold" style={{ color: 'var(--admin-text-muted)' }}>VNĐ</span>
                          </div>
                          <p className="text-[0.625rem] m-0" style={{ color: 'var(--admin-text-muted)' }}>
                            {isVi ? '* Bạn có thể tự ý nhập bất kỳ mức giá bán nào mong muốn tại đây để ghi đè gợi ý.' : '* You can type any custom price here to override the suggestion.'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-1 items-center justify-center py-10 text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                        {isVi ? 'Không có dữ liệu gợi ý giá.' : 'No price suggestion data available.'}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-[10px] pt-4 mt-auto" style={{ borderTop: '1px solid var(--admin-border-subtle)' }}>
                    <button type="button" onClick={() => setIsPriceSuggestModalOpen(false)}
                      className="px-4 py-2 border border-[var(--admin-border-subtle)] hover:bg-[#7A5C5C]/5 text-[#7A5C5C] rounded-xl text-xs font-semibold transition active:scale-95">
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button type="button" disabled={!priceSuggestionData || isSuggestingPrice}
                      onClick={() => { if (priceSuggestionData && activeSuggestContext) { activeSuggestContext.onApply(priceSuggestionData.suggestedPrice); setIsPriceSuggestModalOpen(false); } }}
                      className="admin-btn-submit" style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}>
                      {isVi ? 'Áp dụng giá đề xuất' : 'Apply Suggestion'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right Card: AI Market Analysis Report */}
            {priceSuggestionData && !isSuggestingPrice && (
              <div className="flex-[1_1_500px] max-w-[560px] w-full p-6 rounded-[var(--admin-radius-lg)] flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
                style={{ background: 'var(--admin-surface)', border: '1px solid var(--admin-border)', boxShadow: 'var(--admin-shadow-lg)' }}>
                <div className="flex justify-between items-center pb-3" style={{ borderBottom: '1px solid var(--admin-border-subtle)' }}>
                  <div>
                    <h4 className="font-semibold text-lg flex items-center gap-2" style={{ color: 'var(--admin-text)' }}>
                      <FileText size={18} className="text-[#C9A99A]" />
                      {activeSuggestContext?.size === 'Dung tích'
                        ? (isVi ? 'Báo cáo cơ cấu dung tích biến thể' : 'AI Capacity Sizing Report')
                        : activeSuggestContext?.size === 'Chiết khấu'
                          ? (isVi ? 'Báo cáo chiến lược chiết khấu tối ưu' : 'AI Discount Optimization Report')
                          : (isVi ? 'Phân tích thị trường của AI' : 'AI Market Analysis Report')
                      }
                    </h4>
                    <p className="text-[0.6875rem] mt-[2px]" style={{ color: 'var(--admin-text-muted)' }}>
                      {activeSuggestContext?.size === 'Dung tích'
                        ? (isVi ? 'Phân tích định mức dung tích và giá trị biến thể bởi L\'essence AI' : 'Variant capacity pricing analysis by L\'essence AI')
                        : activeSuggestContext?.size === 'Chiết khấu'
                          ? (isVi ? 'Chiến lược kích cầu & tối ưu doanh số bán hàng bởi L\'essence AI' : 'Sales promotion & revenue optimization by L\'essence AI')
                          : (isVi ? 'Báo cáo thông minh được sinh tự động bởi L\'essence AI Studio' : 'Intellectual report auto-generated by L\'essence AI Studio')
                      }
                    </p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-[14px]">
                  {parseExplanation(priceSuggestionData.explanation).map((sec, sIdx) => (
                    <div key={sIdx} className="p-[12px_14px] flex flex-col gap-2 rounded-[var(--admin-radius)] border"
                      style={{ background: 'rgba(201, 169, 154, 0.03)', borderColor: 'var(--admin-border-subtle)' }}>
                      <h5 className="text-sm font-bold flex items-center gap-[6px] m-0" style={{ color: 'var(--admin-text)' }}>
                        <span className="w-[4px] h-3 rounded-sm" style={{ background: 'var(--admin-accent, #C9A99A)' }} />
                        {sec.title}
                      </h5>
                      <ul className="m-0 p-0">{formatBullets(sec.content)}</ul>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-3 mt-auto text-[0.625rem]"
                  style={{ borderTop: '1px solid var(--admin-border-subtle)', color: 'var(--admin-text-muted)' }}>
                  <span>🔒 L'essence Confidential Data</span>
                  <span>Model: Gemini 3.1 Flash Lite</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
