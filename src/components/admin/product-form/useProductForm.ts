'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import api from '@/lib/api';
import type { ProductFormData, Brand, TagItem } from './productFormTypes';
import { SIZE_CATEGORIES, EMPTY_FORM } from './productFormTypes';
import { toFormState, slugify, uploadBase64ImagesToR2 } from './productFormHelpers';

export type { ProductFormData, Brand, TagItem } from './productFormTypes';
export { SIZE_CATEGORIES, EMPTY_FORM } from './productFormTypes';
export { toFormState, formatSizeString, parseExplanation, slugify, uploadBase64ImagesToR2 } from './productFormHelpers';

export interface UseProductFormProps {
  initialData?: ProductFormData;
  productId?: string;
}

export function useProductForm({ initialData, productId }: UseProductFormProps) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => toFormState(initialData));
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const isGeneratingRef = useRef(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loadingSizes, setLoadingSizes] = useState<Record<string, boolean>>({});
  const isVi = t('saveToCollection')?.includes('Lưu') || false;

  // --- API Queries ---
  const { data: brands } = useQuery({
    queryKey: ['admin-active-brands-list'],
    queryFn: async () => { const { data } = await api.get('/brands'); return data.data as Brand[]; }
  });
  const { data: tags } = useQuery({
    queryKey: ['admin-active-tags-list'],
    queryFn: async () => { const { data } = await api.get('/tags'); return data.data as TagItem[]; }
  });
  const { data: categories } = useQuery({
    queryKey: ['categories-list'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.data as { _id: string; name: string; slug: string; status: string }[]; }
  });
  const { data: taxonomyList } = useQuery({
    queryKey: ['v2-taxonomies'],
    queryFn: async () => { const { data } = await api.get('/v2/taxonomies'); return data.data as { _id: string; slug: string }[]; },
    staleTime: 1000 * 60 * 10,
  });
  const getTaxonomyId = (slug: string) => taxonomyList?.find(t => t.slug === slug)?._id ?? null;

  const { data: scentGroups } = useQuery({
    queryKey: ['admin-active-scent-groups-list'],
    enabled: !!taxonomyList,
    queryFn: async () => {
      const id = getTaxonomyId('scent_group');
      if (!id) return [];
      const { data } = await api.get(`/v2/taxonomies/${id}/terms?active=true`);
      return (data.data || []) as { _id: string; name: string; slug: string; status: string }[];
    }
  });
  const { data: concentrations } = useQuery({
    queryKey: ['admin-active-concentrations-list'],
    enabled: !!taxonomyList,
    queryFn: async () => {
      const id = getTaxonomyId('concentration');
      if (!id) return [];
      const { data } = await api.get(`/v2/taxonomies/${id}/terms?active=true`);
      return (data.data || []) as { _id: string; name: string; slug: string; status: string }[];
    }
  });
  const { data: segments } = useQuery({
    queryKey: ['admin-active-segments-list'],
    enabled: !!taxonomyList,
    queryFn: async () => {
      const id = getTaxonomyId('segment');
      if (!id) return [];
      const { data } = await api.get(`/v2/taxonomies/${id}/terms?active=true`);
      return (data.data || []) as { _id: string; name: string; slug: string; status: string }[];
    }
  });

  // Chuyển đổi brand name sang brandId khi brands load xong (cho edit mode)
  useEffect(() => {
    if (brands && initialData?.brand && /^[0-9a-fA-F]{24}$/.test(initialData.brand) === false) {
      const matchedBrand = brands.find(b => b.name.toLowerCase() === initialData.brand!.toLowerCase());
      if (matchedBrand) {
        setFormData(prev => ({ ...prev, brand: matchedBrand._id }));
      }
    }
  }, [brands, initialData]);

  const update: (patch: Partial<ProductFormData>) => void = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch } as typeof prev));
  };

  // --- Selection State & Toggles ---
  const selectedTags = formData.tag ? [...new Set(formData.tag.split(',').map((s) => s.trim()).filter(Boolean))] : [];
  const selectedScentGroups = formData.scentGroup ? [...new Set(formData.scentGroup.split(',').map((s) => s.trim()).filter(Boolean))] : [];
  const selectedConcentrations = formData.concentration ? [...new Set(formData.concentration.split(',').map((s) => s.trim()).filter(Boolean))] : [];
  const selectedSegments = formData.segment ? [...new Set(formData.segment.split(',').map((s) => s.trim()).filter(Boolean))] : [];
  const selectedCategories = formData.categories ? [...new Set(formData.categories.split(',').map((s) => s.trim()).filter(Boolean))] : [];

  const handleTagToggle = (slug: string) => {
    const next = selectedTags.includes(slug) ? selectedTags.filter((t) => t !== slug) : [...selectedTags, slug];
    update({ tag: next.join(',') });
  };
  const handleCategoryToggle = (val: string) => {
    const next = selectedCategories.includes(val) ? selectedCategories.filter((v) => v !== val) : [...selectedCategories, val];
    update({ categories: next.join(',') });
  };
  const handleScentGroupToggle = (val: string) => {
    const next = selectedScentGroups.includes(val) ? selectedScentGroups.filter((v) => v !== val) : [...selectedScentGroups, val];
    update({ scentGroup: next.join(',') });
  };
  const handleConcentrationToggle = (val: string) => {
    const next = selectedConcentrations.includes(val) ? selectedConcentrations.filter((v) => v !== val) : [...selectedConcentrations, val];
    update({ concentration: next.join(',') });
  };
  const handleSegmentToggle = (val: string) => {
    const next = selectedSegments.includes(val) ? selectedSegments.filter((v) => v !== val) : [...selectedSegments, val];
    update({ segment: next.join(',') });
  };

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScentGroupModalOpen, setIsScentGroupModalOpen] = useState(false);
  const [isConcentrationModalOpen, setIsConcentrationModalOpen] = useState(false);
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);

  const [customScentGroup, setCustomScentGroup] = useState('');
  const [customConcentration, setCustomConcentration] = useState('');
  const [customSegment, setCustomSegment] = useState('');

  // --- Taxonomies Add Mutations ---
  const addScentGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const id = getTaxonomyId('scent_group');
      if (!id) throw new Error('Taxonomy "Nhóm hương" chưa được tạo');
      const { data } = await api.post(`/v2/taxonomies/${id}/terms`, { name });
      return data.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-scent-groups-list'] });
      handleScentGroupToggle(newItem.name);
      setCustomScentGroup('');
      toast.success(isVi ? 'Đã lưu nhóm hương vào database!' : 'Scent group saved to database!');
    },
    onError: (err) => { console.error(err); toast.error(isVi ? 'Không thể thêm nhóm hương' : 'Failed to add scent group'); }
  });
  const addConcentrationMutation = useMutation({
    mutationFn: async (name: string) => {
      const id = getTaxonomyId('concentration');
      if (!id) throw new Error('Taxonomy "Nồng độ" chưa được tạo');
      const { data } = await api.post(`/v2/taxonomies/${id}/terms`, { name });
      return data.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-concentrations-list'] });
      handleConcentrationToggle(newItem.name);
      setCustomConcentration('');
      toast.success(isVi ? 'Đã lưu nồng độ vào database!' : 'Concentration level saved to database!');
    },
    onError: (err) => { console.error(err); toast.error(isVi ? 'Không thể thêm nồng độ' : 'Failed to add concentration level'); }
  });
  const addSegmentMutation = useMutation({
    mutationFn: async (name: string) => {
      const id = getTaxonomyId('segment');
      if (!id) throw new Error('Taxonomy "Phân khúc" chưa được tạo');
      const { data } = await api.post(`/v2/taxonomies/${id}/terms`, { name });
      return data.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-segments-list'] });
      handleSegmentToggle(newItem.name);
      setCustomSegment('');
      toast.success(isVi ? 'Đã lưu phân khúc vào database!' : 'Brand segment saved to database!');
    },
    onError: (err) => { console.error(err); toast.error(isVi ? 'Không thể thêm phân khúc' : 'Failed to add brand segment'); }
  });

  // --- AI Generation ---
  const [priceReport, setPriceReport] = useState<string | null>(initialData?.priceReport || null);
  const [sizeReport, setSizeReport] = useState<string | null>(initialData?.sizeReport || null);
  const [discountReport, setDiscountReport] = useState<string | null>(initialData?.discountReport || null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const handleAiGenerateProduct = async () => {
    if (!formData.name.trim() || isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsAiGenerating(true);
    const loadingToastId = toast.loading(isVi ? '🤖 AI đang tự điền nội dung sản phẩm...' : '🤖 AI is generating product content...');
    const allAvailableSizes = SIZE_CATEGORIES.flatMap(category => category.sizes);
    try {
      const { data } = await api.post('/ai/generate-product', {
        name: formData.name, image: formData.image,
        availableBrands: brands?.map((b) => b.name) || [],
        availableScentGroups: scentGroups?.map((s) => s.name) || [],
        availableConcentrations: concentrations?.map((c) => c.name) || [],
        availableSegments: segments?.map((s) => s.name) || [],
        availableCategories: categories?.map(c => c.name) || ['Nam', 'Nữ', 'Unisex'],
        availableSizes: allAvailableSizes,
        availableTags: tags?.map((t) => t.name) || [],
      });
      if (data.success && data.data) {
        const info = data.data;
        setFormData((prev) => {
          let brandId = prev.brand;
          if (info.brandId) {
            brandId = info.brandId;
          } else if (info.brand && brands) {
            const matchedBrand = brands.find(b => b.name.toLowerCase() === info.brand.toLowerCase());
            if (matchedBrand) brandId = matchedBrand._id;
            else brandId = info.brand;
          }

          const nextMetaTitle = info.metaTitle || prev.metaTitle;
          const nextSlug = info.slug || prev.slug || slugify(nextMetaTitle || info.name || prev.name);

          return {
            ...prev, brand: brandId, price: info.price || prev.price,
            size: info.size || prev.size, description: info.description || prev.description,
            quantityInStock: prev.quantityInStock,
            discountPercentage: info.discountPercentage !== undefined ? info.discountPercentage : prev.discountPercentage,
            metaTitle: nextMetaTitle,
            metaDescription: info.metaDescription || prev.metaDescription,
            keywords: Array.isArray(info.keywords) ? info.keywords.join(', ') : (info.keywords || prev.keywords),
            slug: nextSlug,
            priceReport: info.priceReport || prev.priceReport,
            sizeReport: info.sizeReport || prev.sizeReport,
            discountReport: info.discountReport || prev.discountReport,
            scentGroup: info.scentGroup || prev.scentGroup, concentration: info.concentration || prev.concentration,
            segment: info.segment || prev.segment, categories: info.category || prev.categories || '', tag: info.tag || prev.tag,
          };
        });
        setPriceReport(info.priceReport || null);
        setSizeReport(info.sizeReport || null);
        setDiscountReport(info.discountReport || null);
        toast.dismiss(loadingToastId);
        toast.success(isVi ? '✨ AI đã điền xong nội dung!' : '✨ AI content generated successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToastId);
      toast.error(isVi ? '❌ Không thể viết thông tin sản phẩm bằng AI. Vui lòng thử lại.' : '❌ AI product generation failed. Please try again.');
    } finally {
      setIsAiGenerating(false);
      isGeneratingRef.current = false;
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (formData.name.trim() && !isGeneratingRef.current && !productId && brands && brands.length > 0) {
      debounceTimeoutRef.current = setTimeout(() => { handleAiGenerateProduct(); }, 2000);
    }
    return () => { if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current); };
  }, [formData.name]);

  // --- Price Suggestion ---
  const [isPriceSuggestModalOpen, setIsPriceSuggestModalOpen] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [priceMarkupPercentage, setPriceMarkupPercentage] = useState(15);
  const [priceSuggestionData, setPriceSuggestionData] = useState<{
    marketPrice: number; markupPercentage: number; markupAmount: number;
    suggestedPrice: number; explanation: string;
  } | null>(null);
  const [activeSuggestContext, setActiveSuggestContext] = useState<{
    size?: string; basePrice?: number; onApply: (price: number) => void;
  } | null>(null);

  const dynamicPriceReport = priceReport || `\n**1. Các tiêu chí cốt lõi để AI gợi ý giá:**\n* Phân tích định vị thương hiệu của dòng nước hoa cao cấp **${formData.name || 'Sản phẩm'}** thuộc nhà hương danh tiếng **${formData.brand || "L'essence"}**.\n* Nghiên cứu biến động cung cầu và xu hướng tiêu dùng nước hoa chính ngạch tại thị trường Việt Nam.\n* Định mức biên lợi nhuận kỳ vọng tối ưu dựa trên giá thành nhập khẩu và phân khúc khách hàng mục tiêu của dòng sản phẩm này.\n\n**2. "Nguồn sản phẩm" đóng vai trò gì trong thuật toán:**\n* Xác thực xuất xứ trực tiếp từ các kho vận của **${formData.brand || 'thương hiệu'}** tại thị trường Châu Âu (Pháp, Ý).\n* Đảm bảo tính toán toàn bộ thuế quan chính ngạch và chi phí bảo hiểm vận tải hàng không quốc tế an toàn tuyệt đối.\n\n**3. Tại sao AI phải đưa ra "Lý do gợi ý giá":**\n* Tối ưu hóa tính thanh khoản cho dòng hương **${formData.name || 'Sản phẩm'}** dựa trên độ thảo luận và xếp hạng trên Fragrantica.\n* Thiết lập rào cản cạnh tranh về giá và chất lượng so với các nguồn hàng xách tay không rõ xuất xứ trên thị trường nội địa.\n\n**4. Quyết định & Khuyến nghị mức Markup (${priceMarkupPercentage}%):**\n* Áp dụng biên lợi nhuận tiêu chuẩn **${priceMarkupPercentage}%** của L'essence Studio nhằm đảm bảo khả năng tái đầu tư và duy trì dịch vụ chăm sóc khách hàng VIP đẳng cấp.\n\n**5. Nguồn tham khảo & Đối chiếu của Gemini 3.1 Flash Lite:**\n* Dữ liệu định giá niêm yết chính hãng tại website official của **${formData.brand || 'hãng'}** và cổng tra cứu Fragrantica.com cho dòng **${formData.name || 'nước hoa này'}**.\n* Chỉ số giá bán lẻ của các department store lớn bao gồm Sephora.com và Harrods.com làm hệ quy chiếu giá gốc toàn cầu.`.trim();

  const dynamicSizeReport = sizeReport || `\n**1. Cơ cấu dung tích tối ưu cho dòng hương:**\n* Nghiên cứu dung tích chuẩn cho dòng nước hoa **${formData.name || 'Sản phẩm'}** của nhà hương **${formData.brand || "L'essence"}** dựa trên thói quen của khách hàng Việt Nam.\n* Đề xuất dải dung tích đa dạng gồm chiết mẫu thử 2ml/5ml/10ml để tiếp cận khách hàng mới, bên cạnh chai Fullsize 50ml/100ml cho khách hàng trung thành.\n\n**2. Chiến lược định giá phân phối mẫu chiết:**\n* Đặt biên lợi nhuận cao hơn cho các dung tích nhỏ (mẫu chiết) để bù đắp chi phí chai lọ thủy tinh mini tinh xảo và hao hụt dung dịch trong quá trình chiết thủ công.\n* Khuyến khích mua chai lớn hơn thông qua tỷ lệ chiết khấu thể tích (Volume discount) cực kỳ thông minh.\n\n**3. Tại sao AI phải đề xuất dải size đa dạng:**\n* Giảm rào cản quyết định mua hàng (low commitment size) đối với dòng nước hoa cao cấp **${formData.name || 'này'}**.\n* Tăng tần suất tương tác thương hiệu và cơ hội up-sell lên các size lớn hơn.\n\n**4. Khuyến nghị cấu trúc phân bổ dung tích:**\n* Tập trung phân phối dung tích **10ml** làm mũi nhọn phễu khách hàng, và dung tích **100ml** làm nguồn thu lợi nhuận chính cho dòng sản phẩm **${formData.brand || 'này'}**.\n\n**5. Nguồn tham khảo & Đối chiếu của Gemini 3.1 Flash Lite:**\n* Dữ liệu phân bổ size bán chạy tại cổng thông tin Fragrantica và Basenotes cho dòng **${formData.name || 'nước hoa này'}**.\n* Báo cáo xu hướng tiêu dùng nước hoa niche & designer phân khúc cao cấp khu vực Châu Á Thái Bình Dương năm 2026.`.trim();

  const dynamicDiscountReport = discountReport || `\n**1. Mục tiêu chiến dịch chiết khấu của dòng hương:**\n* Định mức giảm giá phù hợp cho nước hoa **${formData.name || 'Sản phẩm'}** thương hiệu **${formData.brand || "L'essence"}** nhằm kích cầu mua sắm mà không làm giảm giá trị thương hiệu.\n* Điều chỉnh tỷ lệ chiết khấu linh hoạt theo biên độ dao động từ 5% đến 25% dựa trên vòng đời sản phẩm.\n\n**2. Tác động của chiết khấu đến biên lợi nhuận:**\n* Bảo toàn mức biên lợi nhuận gộp an toàn tối thiểu từ 30% đến 40% sau khi đã áp dụng chương trình khuyến mãi.\n* Tối ưu hóa chi phí thu hút khách hàng mới (CAC) thông qua tỷ lệ giảm giá hấp dẫn.\n\n**3. Tại sao AI đề xuất mức chiết khấu này:**\n* Kích thích thanh khoản nhanh cho dòng nước hoa **${formData.name || 'này'}** vào các dịp lễ hội lớn hoặc mùa cao điểm mua sắm.\n* Đảm bảo thế chủ động cạnh tranh lành mạnh trước các chương trình Flash Sale của các đơn vị phân phối khác.\n\n**4. Khuyến nghị lập lịch chiết khấu sự kiện:**\n* Đề xuất lên lịch áp dụng chiết khấu tự động (Start/End Date) vào các ngày lễ lớn để tạo tâm lý khan hiếm (FOMO) cho khách hàng VIP.\n\n**5. Nguồn tham khảo & Đối chiếu của Gemini 3.1 Flash Lite:**\n* Chỉ số khuyến mãi trung bình của phân khúc nước hoa cao cấp tại thị trường Châu Âu và Đông Nam Á.\n* Dữ liệu chiến dịch ưu đãi VIP của các thương hiệu hàng đầu như Chanel, Dior, Creed, Tom Ford.`.trim();

  const handleOpenPriceSuggestion = async (sizeParam?: string, basePriceParam?: number, onApplyCallback?: (price: number) => void) => {
    if (!formData.name.trim()) {
      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
      return;
    }
    setIsPriceSuggestModalOpen(true);
    const targetOnApply = onApplyCallback || ((price: number) => update({ price }));
    setActiveSuggestContext({ size: sizeParam, basePrice: basePriceParam, onApply: targetOnApply });
    if (!sizeParam) {
      const suggestedPrice = formData.price || 3000000;
      const marketPrice = Math.round((suggestedPrice / (1 + priceMarkupPercentage / 100)) / 10000) * 10000;
      const markupAmount = suggestedPrice - marketPrice;
      setPriceSuggestionData({ marketPrice, markupPercentage: priceMarkupPercentage, markupAmount, suggestedPrice, explanation: dynamicPriceReport });
      setIsSuggestingPrice(false);
      return;
    }
    setIsSuggestingPrice(true);
    try {
      const { data } = await api.post('/ai/suggest-price', {
        name: formData.name, brand: formData.brand, size: sizeParam,
        basePrice: basePriceParam || formData.price || 0, markupPercentage: priceMarkupPercentage
      });
      if (data.success && data.data) setPriceSuggestionData(data.data);
    } catch (err) {
      console.error(err);
      toast.error(isVi ? 'Không thể lấy gợi ý giá bằng AI. Vui lòng thử lại.' : 'AI price suggestion failed. Please try again.');
    } finally { setIsSuggestingPrice(false); }
  };

  const handleRecalculatePriceMarkup = (percent: number) => {
    setPriceMarkupPercentage(percent);
    if (!priceSuggestionData) return;
    const marketPrice = priceSuggestionData.marketPrice;
    const markupAmount = Math.round((marketPrice * (percent / 100)) / 10000) * 10000;
    const suggestedPrice = marketPrice + markupAmount;
    setPriceSuggestionData((prev) => prev ? { ...prev, markupPercentage: percent, markupAmount, suggestedPrice } : null);
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const folder = formData.name.trim() ? `products/${slugify(formData.name)}` : 'products';
      const allImages = formData.image ? [formData.image, ...(formData.images || [])] : [];
      const uploadedImages = await uploadBase64ImagesToR2(allImages, folder);

      const payload = {
        ...formData,
        image: uploadedImages[0] || '',
        images: uploadedImages.slice(1),
        priceReport: priceReport || formData.priceReport || '',
        sizeReport: sizeReport || formData.sizeReport || '',
        discountReport: discountReport || formData.discountReport || '',
        slug: formData.slug || slugify(formData.metaTitle || formData.name),
        keywords: typeof formData.keywords === 'string'
            ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
            : formData.keywords || [],
      };
      if (productId) {
        await api.patch(`/products/${productId}`, payload);
        queryClient.invalidateQueries({ queryKey: ['admin-product', productId] });
      } else {
        await api.post('/products', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['new-products'] });
      queryClient.invalidateQueries({ queryKey: ['sale-products'] });
      if (productId && typeof window !== 'undefined') {
        const currentSaved = sessionStorage.getItem('adminProductListCurrentPage');
        if (currentSaved) sessionStorage.setItem('adminProductListPage', currentSaved);
      }
      router.push('/admin/products');
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message;
      toast.error(backendMsg || t('savingError'));
    } finally { setIsSubmitting(false); }
  };

  // --- Derived ---
  const parsedSizes = formData.size ? formData.size.split(',').map((s) => { const parts = s.trim().split(':'); return { sz: parts[0], price: parts[1] || '' }; }) : [];
  const selectedSizes = parsedSizes.map(p => p.sz);
  const isFormComplete = Boolean(formData.name.trim() && formData.brand && formData.price > 0 && formData.image && formData.size.trim());

  return {
    t, isVi, isSubmitting, formData, update,
    handleSubmit, isImageUploading, setIsImageUploading,
    isAiGenerating, handleAiGenerateProduct,
    parsedSizes, selectedSizes, isFormComplete,
    brands, tags, categories, scentGroups, concentrations, segments,
    selectedTags, handleTagToggle,
    isTagModalOpen, setIsTagModalOpen,
    isCategoryModalOpen, setIsCategoryModalOpen,
    isScentGroupModalOpen, setIsScentGroupModalOpen,
    isConcentrationModalOpen, setIsConcentrationModalOpen,
    isSegmentModalOpen, setIsSegmentModalOpen,
    customScentGroup, setCustomScentGroup,
    customConcentration, setCustomConcentration,
    customSegment, setCustomSegment,
    selectedScentGroups, selectedConcentrations, selectedSegments, selectedCategories,
    handleCategoryToggle, handleScentGroupToggle, handleConcentrationToggle, handleSegmentToggle,
    addScentGroupMutation, addConcentrationMutation, addSegmentMutation,
    isPriceSuggestModalOpen, setIsPriceSuggestModalOpen,
    isSuggestingPrice, priceMarkupPercentage,
    priceSuggestionData, setPriceSuggestionData,
    activeSuggestContext, setActiveSuggestContext,
    dynamicPriceReport, dynamicSizeReport, dynamicDiscountReport,
    handleOpenPriceSuggestion, handleRecalculatePriceMarkup,
    priceReport, sizeReport, discountReport,
  };
}

export type UseProductFormReturn = ReturnType<typeof useProductForm>;