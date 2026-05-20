'use client';

import React from 'react';
import { Tag, X, Sparkles, Loader2, FileText } from 'lucide-react';
import { 
  UseProductFormReturn, 
  SIZE_CATEGORIES, 
  parseExplanation, 
  formatSizeString 
} from './useProductForm';

// Helper function to format AI explanation bullets
const formatBullets = (content: string) => {
  if (!content) return null;
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      const clean = line.replace(/^[-*•\s]+/, '').trim();
      return clean.length > 0;
    })
    .map((line, idx) => {
      const cleanLine = line.replace(/^[-*•\s]*/, '').trim();
      const parts = cleanLine.split(/\*\*(.*?)\*\*/g);
      return (
        <li key={idx} style={{ marginBottom: '6px', listStyleType: 'none', paddingLeft: '14px', position: 'relative', fontSize: '0.718rem', color: 'var(--admin-text-muted)', lineHeight: 1.45, textAlign: 'left' }}>
          <span style={{ position: 'absolute', left: 0, top: '6px', width: '5px', height: '5px', borderRadius: '50%', background: 'var(--admin-accent, #C9A99A)' }} />
          {parts.map((part, pIdx) => 
            pIdx % 2 === 1 ? <strong key={pIdx} style={{ color: 'var(--admin-text)', fontWeight: 600 }}>{part}</strong> : part
          )}
        </li>
      );
    });
};

export function ProductFormModals({ formHelpers }: { formHelpers: UseProductFormReturn }) {
  const {
    isVi,
    formData,
    update,
    tags,
    selectedTags,
    handleTagToggle,
    isTagModalOpen,
    setIsTagModalOpen,
    isGenderModalOpen,
    setIsGenderModalOpen,
    isScentGroupModalOpen,
    setIsScentGroupModalOpen,
    isConcentrationModalOpen,
    setIsConcentrationModalOpen,
    isSegmentModalOpen,
    setIsSegmentModalOpen,
    customGender,
    setCustomGender,
    customScentGroup,
    setCustomScentGroup,
    customConcentration,
    setCustomConcentration,
    customSegment,
    setCustomSegment,
    selectedGenders,
    selectedScentGroups,
    selectedConcentrations,
    selectedSegments,
    handleGenderToggle,
    handleScentGroupToggle,
    handleConcentrationToggle,
    handleSegmentToggle,
    scentGroups,
    concentrations,
    segments,
    addScentGroupMutation,
    addConcentrationMutation,
    addSegmentMutation,
    isPriceSuggestModalOpen,
    setIsPriceSuggestModalOpen,
    isSuggestingPrice,
    priceMarkupPercentage,
    priceSuggestionData,
    setPriceSuggestionData,
    activeSuggestContext,
    handleRecalculatePriceMarkup,
    parsedSizes,
    selectedSizes,
  } = formHelpers;

  return (
    <>
      {/* Tag Selection Modal */}
      {isTagModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(61, 46, 36, 0.35)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setIsTagModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--admin-surface, #ffffff)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: 'var(--admin-radius-lg, 20px)',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)',
              animation: 'fadeIn 0.25s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border, #e8e0da)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--admin-accent, #5c4a42)' }}>
                  <Tag size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                    {isVi ? 'Phân loại Tag sản phẩm' : 'Product Tag Selection'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                    {isVi ? 'Chọn một hoặc nhiều nhãn phù hợp cho sản phẩm' : 'Select one or multiple tags for the product'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted, #9a857c)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
                  e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tags Checkbox Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}
              className="admin-scrollbar-luxury"
            >
              {tags?.filter(t => t.status === 'active').map((t) => {
                const isChecked = selectedTags.includes(t.slug);
                return (
                  <label
                    key={t._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text, #3d2e24)',
                      userSelect: 'none',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isChecked ? 'rgba(212, 165, 165, 0.08)' : 'var(--admin-surface-muted, #faf8f6)',
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(212, 165, 165, 0.25)' : 'var(--admin-border, #e8e0da)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'var(--admin-surface-muted, #faf8f6)';
                        e.currentTarget.style.borderColor = 'var(--admin-border, #e8e0da)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 500, color: 'var(--admin-text, #3d2e24)' }}>{t.name}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--admin-text-secondary, #6b564c)', background: 'rgba(61, 46, 36, 0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        {t.slug}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTagToggle(t.slug)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--admin-accent, #5c4a42)',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                );
              })}
              {(!tags || tags.filter(t => t.status === 'active').length === 0) && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-secondary, #6b564c)', fontStyle: 'italic', textAlign: 'center', margin: 0, padding: '24px 0' }}>
                  {isVi ? 'Không có nhãn nào đang hoạt động' : 'No active tags found'}
                </p>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border, #e8e0da)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsTagModalOpen(false)}
                style={{
                  background: 'var(--admin-accent, #5c4a42)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(92, 74, 66, 0.15)',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.background = 'var(--admin-accent-hover, #4a3728)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'var(--admin-accent, #5c4a42)';
                }}
              >
                {isVi ? 'Hoàn thành' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gender Selection Modal */}
      {isGenderModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(61, 46, 36, 0.35)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setIsGenderModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--admin-surface, #ffffff)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: 'var(--admin-radius-lg, 20px)',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)',
              animation: 'fadeIn 0.25s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border, #e8e0da)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--admin-accent, #5c4a42)' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                    {isVi ? 'Phân loại Giới tính' : 'Gender Classification'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                    {isVi ? 'Chọn một hoặc nhiều giới tính phù hợp' : 'Select one or multiple target genders'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenderModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted, #9a857c)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
                  e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Checkboxes Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}
              className="admin-scrollbar-luxury"
            >
              {Array.from(new Set([...['Nam', 'Nữ', 'Unisex', 'Men', 'Women'], ...selectedGenders])).map((g) => {
                const isChecked = selectedGenders.includes(g);
                return (
                  <label
                    key={g}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text, #3d2e24)',
                      userSelect: 'none',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isChecked ? 'rgba(212, 165, 165, 0.08)' : 'var(--admin-surface-muted, #faf8f6)',
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(212, 165, 165, 0.25)' : 'var(--admin-border, #e8e0da)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'var(--admin-surface-muted, #faf8f6)';
                        e.currentTarget.style.borderColor = 'var(--admin-border, #e8e0da)';
                      }
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--admin-text, #3d2e24)' }}>{g}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleGenderToggle(g)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--admin-accent, #5c4a42)',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                );
              })}

              {/* Add custom option input */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder={isVi ? 'Thêm giới tính tùy chỉnh...' : 'Add custom gender...'}
                  value={customGender}
                  onChange={(e) => setCustomGender(e.target.value)}
                  className="admin-input"
                  style={{ height: '36px', fontSize: '0.8125rem', flexGrow: 1 }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGender.trim()) {
                      handleGenderToggle(customGender.trim());
                      setCustomGender('');
                    }
                  }}
                  className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#634747] text-white rounded-xl text-xs font-semibold transition active:scale-95"
                  style={{ height: '36px', borderRadius: '10px' }}
                >
                  {isVi ? 'Thêm' : 'Add'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border, #e8e0da)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsGenderModalOpen(false)}
                style={{
                  background: 'var(--admin-accent, #5c4a42)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(92, 74, 66, 0.15)',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.background = 'var(--admin-accent-hover, #4a3728)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'var(--admin-accent, #5c4a42)';
                }}
              >
                {isVi ? 'Hoàn thành' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scent Group Selection Modal */}
      {isScentGroupModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(61, 46, 36, 0.35)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setIsScentGroupModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--admin-surface, #ffffff)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: 'var(--admin-radius-lg, 20px)',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)',
              animation: 'fadeIn 0.25s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border, #e8e0da)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--admin-accent, #5c4a42)' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                    {isVi ? 'Phân loại Nhóm hương' : 'Scent Group Selection'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                    {isVi ? 'Chọn các nhóm hương đặc trưng của nước hoa này' : 'Select signature scent groups of this perfume'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScentGroupModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted, #9a857c)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
                  e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Checkboxes Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}
              className="admin-scrollbar-luxury"
            >
              {Array.from(new Set([
                ...(scentGroups?.map(s => s.name) || [
                  'Hương Gỗ (Woody)', 
                  'Hương Hoa Cỏ (Floral)', 
                  'Hương Phương Đông (Oriental)', 
                  'Hương Cam Chanh (Citrus)', 
                  'Hương Gia Vị (Spicy)', 
                  'Hương Da Thuộc (Leather)', 
                  'Hương Nước (Aquatic)', 
                  'Hương Trái Cây (Fruity)', 
                  'Hương Rêu Sồi (Chypre)', 
                  'Hương Thảo Mộc (Fougere)'
                ]), 
                ...selectedScentGroups
              ])).map((sg) => {
                const isChecked = selectedScentGroups.includes(sg);
                return (
                  <label
                    key={sg}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text, #3d2e24)',
                      userSelect: 'none',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isChecked ? 'rgba(212, 165, 165, 0.08)' : 'var(--admin-surface-muted, #faf8f6)',
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(212, 165, 165, 0.25)' : 'var(--admin-border, #e8e0da)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'var(--admin-surface-muted, #faf8f6)';
                        e.currentTarget.style.borderColor = 'var(--admin-border, #e8e0da)';
                      }
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--admin-text, #3d2e24)' }}>{sg}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleScentGroupToggle(sg)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--admin-accent, #5c4a42)',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                );
              })}

              {/* Add custom option input */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder={isVi ? 'Thêm nhóm hương tùy chỉnh...' : 'Add custom scent group...'}
                  value={customScentGroup}
                  onChange={(e) => setCustomScentGroup(e.target.value)}
                  className="admin-input"
                  style={{ height: '36px', fontSize: '0.8125rem', flexGrow: 1 }}
                />
                <button
                  type="button"
                  disabled={addScentGroupMutation.isPending}
                  onClick={() => {
                    if (customScentGroup.trim()) {
                      addScentGroupMutation.mutate(customScentGroup.trim());
                    }
                  }}
                  className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#634747] text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                  style={{ height: '36px', borderRadius: '10px' }}
                >
                  {addScentGroupMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    isVi ? 'Thêm' : 'Add'
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border, #e8e0da)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsScentGroupModalOpen(false)}
                style={{
                  background: 'var(--admin-accent, #5c4a42)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(92, 74, 66, 0.15)',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.background = 'var(--admin-accent-hover, #4a3728)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'var(--admin-accent, #5c4a42)';
                }}
              >
                {isVi ? 'Hoàn thành' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Concentration Selection Modal */}
      {isConcentrationModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(61, 46, 36, 0.35)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setIsConcentrationModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--admin-surface, #ffffff)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: 'var(--admin-radius-lg, 20px)',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)',
              animation: 'fadeIn 0.25s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border, #e8e0da)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--admin-accent, #5c4a42)' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                    {isVi ? 'Phân loại Nồng độ' : 'Concentration Selection'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                    {isVi ? 'Chọn nồng độ tinh dầu của nước hoa' : 'Select perfume concentrations'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConcentrationModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted, #9a857c)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
                  e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Checkboxes Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}
              className="admin-scrollbar-luxury"
            >
              {Array.from(new Set([
                ...(concentrations?.map(c => c.name) || [
                  'EDP (Eau de Parfum)', 
                  'EDT (Eau de Toilette)', 
                  'Parfum / Extrait', 
                  'EDC (Eau de Cologne)', 
                  'Eau Fraiche', 
                  'Body Mist / Deodorant'
                ]), 
                ...selectedConcentrations
              ])).map((c) => {
                const isChecked = selectedConcentrations.includes(c);
                return (
                  <label
                    key={c}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text, #3d2e24)',
                      userSelect: 'none',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isChecked ? 'rgba(212, 165, 165, 0.08)' : 'var(--admin-surface-muted, #faf8f6)',
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(212, 165, 165, 0.25)' : 'var(--admin-border, #e8e0da)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'var(--admin-surface-muted, #faf8f6)';
                        e.currentTarget.style.borderColor = 'var(--admin-border, #e8e0da)';
                      }
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--admin-text, #3d2e24)' }}>{c}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleConcentrationToggle(c)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--admin-accent, #5c4a42)',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                );
              })}

              {/* Add custom option input */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder={isVi ? 'Thêm nồng độ tùy chỉnh...' : 'Add custom concentration...'}
                  value={customConcentration}
                  onChange={(e) => setCustomConcentration(e.target.value)}
                  className="admin-input"
                  style={{ height: '36px', fontSize: '0.8125rem', flexGrow: 1 }}
                />
                <button
                  type="button"
                  disabled={addConcentrationMutation.isPending}
                  onClick={() => {
                    if (customConcentration.trim()) {
                      addConcentrationMutation.mutate(customConcentration.trim());
                    }
                  }}
                  className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#634747] text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                  style={{ height: '36px', borderRadius: '10px' }}
                >
                  {addConcentrationMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    isVi ? 'Thêm' : 'Add'
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border, #e8e0da)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsConcentrationModalOpen(false)}
                style={{
                  background: 'var(--admin-accent, #5c4a42)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(92, 74, 66, 0.15)',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.background = 'var(--admin-accent-hover, #4a3728)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'var(--admin-accent, #5c4a42)';
                }}
              >
                {isVi ? 'Hoàn thành' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Segment Selection Modal */}
      {isSegmentModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(61, 46, 36, 0.35)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setIsSegmentModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--admin-surface, #ffffff)',
              border: '1px solid var(--admin-border, #e8e0da)',
              borderRadius: 'var(--admin-radius-lg, 20px)',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(61, 46, 36, 0.08)',
              animation: 'fadeIn 0.25s ease-out',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border, #e8e0da)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(212, 165, 165, 0.1)', padding: '8px', borderRadius: '10px', color: 'var(--admin-accent, #5c4a42)' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--admin-text, #3d2e24)' }}>
                    {isVi ? 'Phân loại Phân khúc' : 'Segment Selection'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--admin-text-secondary, #6b564c)' }}>
                    {isVi ? 'Chọn phân khúc phân cấp của thương hiệu nước hoa' : 'Select brand segment classification'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSegmentModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--admin-text-muted, #9a857c)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text, #3d2e24)';
                  e.currentTarget.style.background = 'rgba(61, 46, 36, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--admin-text-muted, #9a857c)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Checkboxes Grid */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxHeight: '300px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}
              className="admin-scrollbar-luxury"
            >
              {Array.from(new Set([
                ...(segments?.map(s => s.name) || [
                  'Niche', 
                  'Designer', 
                  'Indie / Artisan', 
                  'Masstige', 
                  'Classic / Vintage'
                ]), 
                ...selectedSegments
              ])).map((s) => {
                const isChecked = selectedSegments.includes(s);
                return (
                  <label
                    key={s}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      color: 'var(--admin-text, #3d2e24)',
                      userSelect: 'none',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isChecked ? 'rgba(212, 165, 165, 0.08)' : 'var(--admin-surface-muted, #faf8f6)',
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(212, 165, 165, 0.25)' : 'var(--admin-border, #e8e0da)',
                      transition: 'all 0.25s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'rgba(61, 46, 36, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChecked) {
                        e.currentTarget.style.background = 'var(--admin-surface-muted, #faf8f6)';
                        e.currentTarget.style.borderColor = 'var(--admin-border, #e8e0da)';
                      }
                    }}
                  >
                    <span style={{ fontWeight: 500, color: 'var(--admin-text, #3d2e24)' }}>{s}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSegmentToggle(s)}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: 'var(--admin-accent, #5c4a42)',
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                );
              })}

              {/* Add custom option input */}
              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder={isVi ? 'Thêm phân khúc tùy chỉnh...' : 'Add custom segment...'}
                  value={customSegment}
                  onChange={(e) => setCustomSegment(e.target.value)}
                  className="admin-input"
                  style={{ height: '36px', fontSize: '0.8125rem', flexGrow: 1 }}
                />
                <button
                  type="button"
                  disabled={addSegmentMutation.isPending}
                  onClick={() => {
                    if (customSegment.trim()) {
                      addSegmentMutation.mutate(customSegment.trim());
                    }
                  }}
                  className="px-4 py-2 bg-[#7A5C5C] hover:bg-[#634747] text-white rounded-xl text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                  style={{ height: '36px', borderRadius: '10px' }}
                >
                  {addSegmentMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    isVi ? 'Thêm' : 'Add'
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border, #e8e0da)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsSegmentModalOpen(false)}
                style={{
                  background: 'var(--admin-accent, #5c4a42)',
                  color: '#ffffff',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(92, 74, 66, 0.15)',
                  transition: 'transform 0.2s, opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.opacity = '0.95';
                  e.currentTarget.style.background = 'var(--admin-accent-hover, #4a3728)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.background = 'var(--admin-accent, #5c4a42)';
                }}
              >
                {isVi ? 'Hoàn thành' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Price/Discount/Variants Suggestion Modal */}
      {isPriceSuggestModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(61, 46, 36, 0.4)',
            backdropFilter: 'blur(8px)',
            overflowY: 'auto',
            padding: '20px',
          }}
          onClick={() => setIsPriceSuggestModalOpen(false)}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '20px',
              alignItems: 'stretch',
              justifyContent: 'center',
              flexWrap: 'wrap',
              maxWidth: '1060px',
              width: '100%',
              maxHeight: '90vh',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Card: Price Suggestion or Sizing Editor or Discount Editor */}
            <div
              style={{
                flex: '1 1 420px',
                maxWidth: '480px',
                background: 'var(--admin-surface)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-lg)',
                boxShadow: 'var(--admin-shadow-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {activeSuggestContext?.size === 'Dung tích' ? (
                <>
                  {/* Left Column for Capacity (Dung tích) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} className="text-[#D4A5A5]" />
                        {isVi ? 'Biến thể dung tích' : 'Size Variants'}
                      </h4>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        {isVi ? 'Chọn dung tích bán và nhập giá của từng loại' : 'Select variants and set custom pricing'}
                      </p>
                    </div>
                  </div>

                  {/* Size selection content */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, paddingRight: '6px' }}>
                    {SIZE_CATEGORIES.map((category) => {
                      const catName = isVi ? category.name : category.nameEn;
                      return (
                        <div key={category.name} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--admin-text-muted)', textAlign: 'left' }}>
                            • {catName}
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {category.sizes.map((sz) => {
                              const isSelected = selectedSizes.includes(sz);
                              const matched = parsedSizes.find((p) => p.sz === sz);
                              const sizePrice = matched ? matched.price : '';
                              return (
                                <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                  <label
                                    style={{
                                      flexShrink: 0,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minWidth: '70px',
                                      padding: '8px 14px',
                                      borderRadius: 'var(--admin-radius)',
                                      border: '1px solid',
                                      borderColor: isSelected ? 'var(--admin-accent)' : 'var(--admin-border)',
                                      background: isSelected ? 'rgba(201, 169, 154, 0.1)' : 'var(--admin-surface-muted)',
                                      cursor: 'pointer',
                                      fontSize: '0.8125rem',
                                      fontWeight: isSelected ? 600 : 500,
                                      color: isSelected ? 'var(--admin-accent-hover)' : 'var(--admin-text)',
                                      transition: 'all 0.15s ease',
                                      textAlign: 'center'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
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
                                      style={{ display: 'none' }}
                                    />
                                    {sz}
                                  </label>

                                  {isSelected && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexGrow: 1 }}>
                                      <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                                        <input
                                          type="number"
                                          min={0}
                                          placeholder={isVi ? 'Nhập giá bán...' : 'Enter price...'}
                                          value={sizePrice}
                                          onChange={(e) => {
                                            const newPrice = e.target.value;
                                            const newSizes = parsedSizes.map(p => {
                                              if (p.sz === sz) {
                                                return { ...p, price: newPrice };
                                              }
                                              return p;
                                            });
                                            update({ size: newSizes.map(p => p.price ? `${p.sz}:${p.price}` : p.sz).join(', ') });
                                          }}
                                          style={{
                                            width: '100%',
                                            padding: '6px 12px',
                                            borderRadius: 'var(--admin-radius)',
                                            border: '1px solid var(--admin-border-subtle)',
                                            background: 'var(--admin-surface)',
                                            color: 'var(--admin-text)',
                                            fontSize: '0.8125rem',
                                            outline: 'none',
                                            height: '34px',
                                            transition: 'all 0.15s ease',
                                          }}
                                        />
                                      </div>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>VNĐ</span>
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

                  {/* Footer for Dung tích */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '16px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setIsPriceSuggestModalOpen(false)}
                      className="admin-btn-submit"
                      style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}
                    >
                      {isVi ? 'Xác nhận dung tích' : 'Confirm Capacities'}
                    </button>
                  </div>
                </>
              ) : activeSuggestContext?.size === 'Chiết khấu' ? (
                <>
                  {/* Left Column for Chiết khấu (Discount) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} className="text-[#D4A5A5]" />
                        {isVi ? 'Thiết lập chiết khấu' : 'Configure Discount'}
                      </h4>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        {isVi ? 'Chỉnh sửa tỷ lệ chiết khấu và lên lịch sự kiện' : 'Set discount rates and configure event schedules'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                    {/* Discount rate slider & custom input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                          {isVi ? 'Tỷ lệ chiết khấu (%)' : 'Discount Percentage (%)'}
                        </label>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-brand, #7A5C5C)' }}>
                          {formData.discountPercentage}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="range"
                          min={0}
                          max={90}
                          step={5}
                          value={formData.discountPercentage}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            update({ 
                              discountPercentage: val,
                              ...(val <= 0 ? { discountStartDate: null, discountEndDate: null } : {})
                            });
                          }}
                          style={{
                            flexGrow: 1,
                            accentColor: 'var(--admin-text-brand, #7A5C5C)',
                            cursor: 'pointer'
                          }}
                        />
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={formData.discountPercentage}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            update({ 
                              discountPercentage: val,
                              ...(val <= 0 ? { discountStartDate: null, discountEndDate: null } : {})
                            });
                          }}
                          style={{
                            width: '65px',
                            background: 'rgba(201, 169, 154, 0.05)',
                            border: '1px solid var(--admin-border-subtle)',
                            borderRadius: 'var(--admin-radius)',
                            padding: '6px',
                            fontSize: '0.8125rem',
                            color: 'var(--admin-text)',
                            textAlign: 'center',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    {/* Schedulers */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '16px' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text)' }}>
                        📅 {isVi ? 'Đặt lịch thời gian áp dụng' : 'Active Event Schedule'}
                      </p>
                      
                      <div className="admin-field">
                        <label className="admin-label" style={{ fontSize: '0.6875rem' }}>
                          {isVi ? 'Ngày bắt đầu' : 'Start Date'}
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.discountStartDate ? new Date(new Date(formData.discountStartDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => update({ discountStartDate: e.target.value ? new Date(e.target.value) : null })}
                          onClick={(e) => {
                            try { e.currentTarget.showPicker(); } catch {}
                          }}
                          className="admin-input"
                          style={{ colorScheme: 'dark', cursor: 'pointer', fontSize: '0.75rem', height: '38px' }}
                        />
                      </div>

                      <div className="admin-field">
                        <label className="admin-label" style={{ fontSize: '0.6875rem' }}>
                          {isVi ? 'Ngày kết thúc' : 'End Date'}
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.discountEndDate ? new Date(new Date(formData.discountEndDate).getTime() - new Date().getTimezoneOffset()*60000).toISOString().slice(0, 16) : ''}
                          onChange={(e) => update({ discountEndDate: e.target.value ? new Date(e.target.value) : null })}
                          onClick={(e) => {
                            try { e.currentTarget.showPicker(); } catch {}
                          }}
                          className="admin-input"
                          style={{ colorScheme: 'dark', cursor: 'pointer', fontSize: '0.75rem', height: '38px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer for Chiết khấu */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '16px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setIsPriceSuggestModalOpen(false)}
                      className="admin-btn-submit"
                      style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}
                    >
                      {isVi ? 'Xác nhận chiết khấu' : 'Confirm Discount'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Left Column for Selling Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} className="text-[#D4A5A5]" />
                        {isVi ? 'Đề xuất giá bằng AI' : 'AI Price Suggestion'}
                      </h4>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        {isVi ? 'Phân tích thị trường nước hoa chính hãng + biên lợi nhuận mong muốn' : 'Analyze authentic perfume market prices & target profit margin'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    {isSuggestingPrice ? (
                      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '40px 0' }}>
                        <Loader2 size={32} className="animate-spin text-[#D4A5A5]" />
                        <p style={{ fontSize: '0.8125rem', color: 'var(--admin-text-muted)' }}>
                          {isVi ? 'AI đang phân tích giá thị trường của sản phẩm...' : 'AI is analyzing authentic market retail prices...'}
                        </p>
                      </div>
                    ) : priceSuggestionData ? (
                      <>
                        {/* Prices Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(201, 169, 154, 0.05)', borderRadius: 'var(--admin-radius)', padding: '14px', border: '1px solid var(--admin-border-subtle)' }}>
                          {/* Market Price */}
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>
                              {isVi ? 'Giá thị trường' : 'Market Price'}
                            </p>
                            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--admin-text)', marginTop: '4px' }}>
                              {priceSuggestionData.marketPrice.toLocaleString('vi-VN')}đ
                            </p>
                          </div>

                          {/* Markup Amount */}
                          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--admin-border-subtle)', borderRight: '1px solid var(--admin-border-subtle)' }}>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>
                              Markup ({priceMarkupPercentage}%)
                            </p>
                            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--admin-text-muted)', marginTop: '4px' }}>
                              +{priceSuggestionData.markupAmount.toLocaleString('vi-VN')}đ
                            </p>
                          </div>

                          {/* Suggested Price */}
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-brand, #7A5C5C)', fontWeight: 700 }}>
                              {isVi ? 'Giá đề xuất web' : 'Suggested Price'}
                            </p>
                            <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--admin-accent-hover, #D4A5A5)', marginTop: '4px' }}>
                              {priceSuggestionData.suggestedPrice.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                        </div>

                        {/* Markup Adjuster (Slider) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                              {isVi ? 'Biên lợi nhuận cộng thêm (Markup)' : 'Markup Margin Percentage'}
                            </label>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--admin-text-brand, #7A5C5C)' }}>
                              {priceMarkupPercentage}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min={5}
                            max={40}
                            step={5}
                            value={priceMarkupPercentage}
                            onChange={(e) => handleRecalculatePriceMarkup(Number(e.target.value))}
                            style={{
                              width: '100%',
                              accentColor: 'var(--admin-text-brand, #7A5C5C)',
                              cursor: 'pointer'
                            }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: 'var(--admin-text-muted)' }}>
                            <span>5% ({isVi ? 'Thấp' : 'Low'})</span>
                            <span>15% ({isVi ? 'Chuẩn' : 'Std'})</span>
                            <span>25% ({isVi ? 'Cao' : 'High'})</span>
                            <span>40% ({isVi ? 'Thượng lưu' : 'Elite'})</span>
                          </div>
                        </div>

                        {/* Custom Price Input */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '12px', marginTop: '4px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                            {isVi ? 'Nhập giá bán thủ công' : 'Enter Custom Price Manually'}
                          </label>
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                              type="number"
                              min={0}
                              value={priceSuggestionData.suggestedPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                const marketPrice = Math.round((val / (1 + priceMarkupPercentage / 100)) / 10000) * 10000;
                                const markupAmount = val - marketPrice;
                                setPriceSuggestionData({
                                  ...priceSuggestionData,
                                  suggestedPrice: val,
                                  marketPrice,
                                  markupAmount
                                });
                              }}
                              style={{
                                width: '100%',
                                background: 'rgba(201, 169, 154, 0.05)',
                                border: '1px solid var(--admin-border-subtle)',
                                borderRadius: 'var(--admin-radius)',
                                padding: '8px 12px',
                                fontSize: '0.8125rem',
                                color: 'var(--admin-text)',
                                outline: 'none',
                                paddingRight: '45px'
                              }}
                            />
                            <span style={{ position: 'absolute', right: '12px', fontSize: '0.75rem', color: 'var(--admin-text-muted)', fontWeight: 600 }}>VNĐ</span>
                          </div>
                          <p style={{ fontSize: '0.625rem', color: 'var(--admin-text-muted)', margin: 0 }}>
                            {isVi ? '* Bạn có thể tự ý nhập bất kỳ mức giá bán nào mong muốn tại đây để ghi đè gợi ý.' : '* You can type any custom price here to override the suggestion.'}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--admin-text-muted)', fontSize: '0.8125rem' }}>
                        {isVi ? 'Không có dữ liệu gợi ý giá.' : 'No price suggestion data available.'}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '16px', marginTop: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setIsPriceSuggestModalOpen(false)}
                      className="px-4 py-2 border border-[var(--admin-border-subtle)] hover:bg-[#7A5C5C]/5 text-[#7A5C5C] rounded-xl text-xs font-semibold transition active:scale-95"
                    >
                      {isVi ? 'Hủy' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      disabled={!priceSuggestionData || isSuggestingPrice}
                      onClick={() => {
                        if (priceSuggestionData && activeSuggestContext) {
                          activeSuggestContext.onApply(priceSuggestionData.suggestedPrice);
                          setIsPriceSuggestModalOpen(false);
                        }
                      }}
                      className="admin-btn-submit"
                      style={{ padding: '8px 20px', fontSize: '0.75rem', width: 'auto', borderRadius: 'var(--admin-radius-lg)' }}
                    >
                      {isVi ? 'Áp dụng giá đề xuất' : 'Apply Suggestion'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Right Card: AI Market Analysis Report */}
            {priceSuggestionData && !isSuggestingPrice && (
              <div
                style={{
                  flex: '1 1 500px',
                  maxWidth: '560px',
                  width: '100%',
                  background: 'var(--admin-surface)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--admin-radius-lg)',
                  boxShadow: 'var(--admin-shadow-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                {/* Report Head */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--admin-border-subtle)', paddingBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} className="text-[#C9A99A]" />
                      {activeSuggestContext?.size === 'Dung tích' ? (
                        isVi ? 'Báo cáo cơ cấu dung tích biến thể' : 'AI Capacity Sizing Report'
                      ) : activeSuggestContext?.size === 'Chiết khấu' ? (
                        isVi ? 'Báo cáo chiến lược chiết khấu tối ưu' : 'AI Discount Optimization Report'
                      ) : (
                        isVi ? 'Phân tích thị trường của AI' : 'AI Market Analysis Report'
                      )}
                    </h4>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                      {activeSuggestContext?.size === 'Dung tích' ? (
                        isVi ? 'Phân tích định mức dung tích và giá trị biến thể bởi L\'essence AI' : 'Variant capacity pricing analysis by L\'essence AI'
                      ) : activeSuggestContext?.size === 'Chiết khấu' ? (
                        isVi ? 'Chiến lược kích cầu & tối ưu doanh số bán hàng bởi L\'essence AI' : 'Sales promotion & revenue optimization by L\'essence AI'
                      ) : (
                        isVi ? 'Báo cáo thông minh được sinh tự động bởi L\'essence AI Studio' : 'Intellectual report auto-generated by L\'essence AI Studio'
                      )}
                    </p>
                  </div>
                </div>

                {/* Report Body */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {parseExplanation(priceSuggestionData.explanation).map((sec, sIdx) => (
                    <div 
                      key={sIdx}
                      style={{
                        background: 'rgba(201, 169, 154, 0.03)',
                        border: '1px solid var(--admin-border-subtle)',
                        borderRadius: 'var(--admin-radius)',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <h5 style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--admin-text)', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <span style={{ width: '4px', height: '12px', background: 'var(--admin-accent, #C9A99A)', borderRadius: '2px' }} />
                        {sec.title}
                      </h5>
                      <ul style={{ margin: 0, padding: 0 }}>
                        {formatBullets(sec.content)}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Report Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--admin-border-subtle)', paddingTop: '12px', fontSize: '0.625rem', color: 'var(--admin-text-muted)', marginTop: 'auto' }}>
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
