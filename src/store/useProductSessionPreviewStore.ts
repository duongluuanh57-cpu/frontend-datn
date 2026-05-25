import { create } from 'zustand';
import type { ProductSessionLayoutConfig } from '@/hooks/useHomepageConfig';
import { DEFAULT_PRODUCT_SESSION_LAYOUT } from '@/hooks/useHomepageConfig';

export const SESSION_OPTIONS = [
  { id: 'saleProducts', label: 'Ưu đãi đặc biệt' },
  { id: 'newProducts', label: 'Sản phẩm mới' },
  { id: 'limitedProducts', label: 'Sản phẩm giới hạn' },
  { id: 'trendingProducts', label: 'Sản phẩm thịnh hành' },
] as const;

export type SessionId = typeof SESSION_OPTIONS[number]['id'];

interface ProductSessionPreviewState {
  /** Config đang được chỉnh sửa trong admin (preview) */
  previewConfig: ProductSessionLayoutConfig;
  setPreviewConfig: (config: ProductSessionLayoutConfig) => void;
  updatePreviewConfig: (partial: Partial<ProductSessionLayoutConfig>) => void;
  resetPreview: () => void;
  /** Config đã lưu từ DB */
  savedConfig: ProductSessionLayoutConfig | null;
  setSavedConfig: (config: ProductSessionLayoutConfig | null) => void;
  /** Đang ở chế độ preview? */
  isPreviewMode: boolean;
  setIsPreviewMode: (v: boolean) => void;
  /** Hiển thị modal preview? */
  showPreviewModal: boolean;
  setShowPreviewModal: (v: boolean) => void;
  /** Session đang được chọn để chỉnh sửa */
  selectedSessionId: SessionId;
  setSelectedSessionId: (id: SessionId) => void;
}

export const useProductSessionPreviewStore = create<ProductSessionPreviewState>((set) => ({
  previewConfig: DEFAULT_PRODUCT_SESSION_LAYOUT,
  setPreviewConfig: (config) => set({ previewConfig: config }),
  updatePreviewConfig: (partial) =>
    set((state) => ({ previewConfig: { ...state.previewConfig, ...partial } })),
  resetPreview: () => set({ previewConfig: DEFAULT_PRODUCT_SESSION_LAYOUT }),
  savedConfig: null,
  setSavedConfig: (config) =>
    set({ savedConfig: config, previewConfig: config ?? DEFAULT_PRODUCT_SESSION_LAYOUT }),
  isPreviewMode: false,
  setIsPreviewMode: (v) => set({ isPreviewMode: v }),
  showPreviewModal: false,
  setShowPreviewModal: (v) => set({ showPreviewModal: v }),
  selectedSessionId: 'newProducts',
  setSelectedSessionId: (id) => set({ selectedSessionId: id }),
}));

/**
 * Hook dùng cho component ngoài trang chủ (NewProducts, etc.).
 * Trả về config ưu tiên preview > saved > default.
 */
export function useProductSessionLayout(): ProductSessionLayoutConfig {
  const { previewConfig, isPreviewMode, savedConfig } = useProductSessionPreviewStore();
  if (isPreviewMode) return previewConfig;
  return savedConfig ?? DEFAULT_PRODUCT_SESSION_LAYOUT;
}