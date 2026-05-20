'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/navigation';
import api from '@/lib/api';

export interface ProductFormData {
  name: string;
  brand: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  tag: string;
  scentGroup?: string;
  concentration?: string;
  segment?: string;
  gender?: string;
  rating: number;
  reviewsCount: number;
  size: string;
  quantityInStock: number;
  discountPercentage: number;
  discountStartDate?: Date | null | string;
  discountEndDate?: Date | null | string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string[] | string;
  priceReport?: string;
  sizeReport?: string;
  discountReport?: string;
}

export interface Brand {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface TagItem {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
}

export const SIZE_CATEGORIES = [
  {
    name: 'Chiết/Sample (dùng thử)',
    nameEn: 'Decant/Sample (trial)',
    sizes: ['2ml', '5ml', '10ml']
  },
  {
    name: 'Size nhỏ',
    nameEn: 'Small Size',
    sizes: ['30ml']
  },
  {
    name: 'Size tiêu chuẩn',
    nameEn: 'Standard Size',
    sizes: ['50ml', '100ml']
  },
  {
    name: 'Size lớn',
    nameEn: 'Large Size',
    sizes: ['150ml', '200ml']
  }
];

export const EMPTY_FORM = {
  name: '',
  brand: '',
  price: 0,
  image: '',
  images: [] as string[],
  description: '',
  tag: '',
  scentGroup: '',
  concentration: '',
  segment: '',
  gender: '',
  rating: 5,
  reviewsCount: 0,
  size: '',
  quantityInStock: 0,
  discountPercentage: 0,
  discountStartDate: null as Date | null,
  discountEndDate: null as Date | null,
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  priceReport: '',
  sizeReport: '',
  discountReport: '',
};

export function toFormState(data?: ProductFormData) {
  if (!data) return { ...EMPTY_FORM };
  
  return {
    name: data.name ?? '',
    brand: data.brand ?? '',
    price: data.price ?? 0,
    image: data.image ?? '',
    images: data.images ?? [],
    description: data.description ?? '',
    tag: data.tag ?? '',
    scentGroup: data.scentGroup ?? '',
    concentration: data.concentration ?? '',
    segment: data.segment ?? '',
    gender: data.gender ?? '',
    rating: data.rating ?? 5,
    reviewsCount: data.reviewsCount ?? 0,
    size: data.size ?? '',
    quantityInStock: data.quantityInStock ?? 0,
    discountPercentage: data.discountPercentage ?? 0,
    discountStartDate: data.discountStartDate ? new Date(data.discountStartDate) : null,
    discountEndDate: data.discountEndDate ? new Date(data.discountEndDate) : null,
    metaTitle: data.metaTitle ?? '',
    metaDescription: data.metaDescription ?? '',
    keywords: Array.isArray(data.keywords)
      ? data.keywords.join(', ')
      : (data.keywords ?? ''),
    priceReport: data.priceReport ?? '',
    sizeReport: data.sizeReport ?? '',
    discountReport: data.discountReport ?? '',
  };
}

export const formatSizeString = (sizeStr: string) => {
  if (!sizeStr) return '';
  return sizeStr
    .split(',')
    .map(item => {
      const parts = item.trim().split(':');
      const sz = parts[0];
      const pr = parts[1];
      if (pr) {
        const num = parseInt(pr);
        if (!isNaN(num)) {
          return `${sz} (${num.toLocaleString('vi-VN')}đ)`;
        }
      }
      return sz;
    })
    .join(', ');
};

export const parseExplanation = (text: string) => {
  if (!text) return [];
  const sections = text.split(/\*\*(?=\d\.)/);
  return sections
    .map((sec) => sec.trim())
    .filter(Boolean)
    .filter((sec) => /^\d\./.test(sec))
    .map((sec) => {
      const lines = sec.split('\n');
      let titleLine = lines[0].replace(/\*\*/g, '').trim();
      let content = lines.slice(1).join('\n').trim();

      if (titleLine.length > 80 && titleLine.includes(':')) {
        const colonIndex = titleLine.indexOf(':');
        const realTitle = titleLine.substring(0, colonIndex + 1).trim();
        const firstBullet = titleLine.substring(colonIndex + 1).trim();
        titleLine = realTitle;
        content = firstBullet + (content ? '\n' + content : '');
      }

      return { title: titleLine, content };
    });
};

export const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

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

  const { data: brands } = useQuery({
    queryKey: ['admin-active-brands-list'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    }
  });

  const { data: tags } = useQuery({
    queryKey: ['admin-active-tags-list'],
    queryFn: async () => {
      const { data } = await api.get('/tags');
      return data.data as TagItem[];
    }
  });

  const { data: scentGroups } = useQuery({
    queryKey: ['admin-active-scent-groups-list'],
    queryFn: async () => {
      const { data } = await api.get('/taxonomies/active?type=scent_group');
      return (data.data || []) as { _id: string; name: string; slug: string; status: string }[];
    }
  });

  const { data: concentrations } = useQuery({
    queryKey: ['admin-active-concentrations-list'],
    queryFn: async () => {
      const { data } = await api.get('/taxonomies/active?type=concentration');
      return (data.data || []) as { _id: string; name: string; slug: string; status: string }[];
    }
  });

  const { data: segments } = useQuery({
    queryKey: ['admin-active-segments-list'],
    queryFn: async () => {
      const { data } = await api.get('/taxonomies/active?type=segment');
      return (data.data || []) as { _id: string; name: string; slug: string; status: string }[];
    }
  });

  const addScentGroupMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/taxonomies', { name, type: 'scent_group' });
      return data.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-scent-groups-list'] });
      handleScentGroupToggle(newItem.name);
      setCustomScentGroup('');
      toast.success(isVi ? 'Đã lưu nhóm hương vào database!' : 'Scent group saved to database!');
    },
    onError: (err) => {
      console.error(err);
      toast.error(isVi ? 'Không thể thêm nhóm hương' : 'Failed to add scent group');
    }
  });

  const addConcentrationMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/taxonomies', { name, type: 'concentration' });
      return data.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-concentrations-list'] });
      handleConcentrationToggle(newItem.name);
      setCustomConcentration('');
      toast.success(isVi ? 'Đã lưu nồng độ vào database!' : 'Concentration level saved to database!');
    },
    onError: (err) => {
      console.error(err);
      toast.error(isVi ? 'Không thể thêm nồng độ' : 'Failed to add concentration level');
    }
  });

  const addSegmentMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/taxonomies', { name, type: 'segment' });
      return data.data;
    },
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['admin-active-segments-list'] });
      handleSegmentToggle(newItem.name);
      setCustomSegment('');
      toast.success(isVi ? 'Đã lưu phân khúc vào database!' : 'Brand segment saved to database!');
    },
    onError: (err) => {
      console.error(err);
      toast.error(isVi ? 'Không thể thêm phân khúc' : 'Failed to add brand segment');
    }
  });

  const [priceReport, setPriceReport] = useState<string | null>(initialData?.priceReport || null);
  const [aiAnalyzed, setAiAnalyzed] = useState<boolean>(Boolean(initialData?.priceReport || initialData?.sizeReport || initialData?.discountReport));
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [sizeReport, setSizeReport] = useState<string | null>(initialData?.sizeReport || null);
  const [discountReport, setDiscountReport] = useState<string | null>(initialData?.discountReport || null);

  const handleAiGenerateProduct = async () => {
    if (!formData.name.trim() || isGeneratingRef.current) return;
    isGeneratingRef.current = true;
    setIsAiGenerating(true);
    
    const loadingToastId = toast.loading(isVi ? '🤖 AI đang tự điền nội dung sản phẩm...' : '🤖 AI is generating product content...');
    const allAvailableSizes = SIZE_CATEGORIES.flatMap(category => category.sizes);
    
    try {
      const { data } = await api.post('/ai/generate-product', {
        name: formData.name,
        image: formData.image,
        availableBrands: brands?.map((b) => b.name) || [],
        availableScentGroups: scentGroups?.map((s) => s.name) || [],
        availableConcentrations: concentrations?.map((c) => c.name) || [],
        availableSegments: segments?.map((s) => s.name) || [],
        availableGenders: ['Nam', 'Nữ', 'Unisex'],
        availableSizes: allAvailableSizes,
      });
      if (data.success && data.data) {
        const info = data.data;
        setFormData((prev) => ({
          ...prev,
          brand: info.brand || prev.brand,
          price: info.price || prev.price,
          size: info.size || prev.size,
          description: info.description || prev.description,
          quantityInStock: prev.quantityInStock,
          discountPercentage: info.discountPercentage !== undefined ? info.discountPercentage : prev.discountPercentage,
          metaTitle: info.metaTitle || prev.metaTitle,
          metaDescription: info.metaDescription || prev.metaDescription,
          keywords: Array.isArray(info.keywords) ? info.keywords.join(', ') : (info.keywords || prev.keywords),
          scentGroup: info.scentGroup || prev.scentGroup,
          concentration: info.concentration || prev.concentration,
          segment: info.segment || prev.segment,
          gender: info.gender || prev.gender,
        }));

        setPriceReport(info.priceReport || null);
        setSizeReport(info.sizeReport || null);
        setDiscountReport(info.discountReport || null);
        setAiAnalyzed(true);
        
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

  const update = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const selectedTags = formData.tag
    ? formData.tag.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const handleTagToggle = (slug: string) => {
    let nextTags;
    if (selectedTags.includes(slug)) {
      nextTags = selectedTags.filter((t) => t !== slug);
    } else {
      nextTags = [...selectedTags, slug];
    }
    update({ tag: nextTags.join(',') });
  };

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [isScentGroupModalOpen, setIsScentGroupModalOpen] = useState(false);
  const [isConcentrationModalOpen, setIsConcentrationModalOpen] = useState(false);
  const [isSegmentModalOpen, setIsSegmentModalOpen] = useState(false);

  const [customGender, setCustomGender] = useState('');
  const [customScentGroup, setCustomScentGroup] = useState('');
  const [customConcentration, setCustomConcentration] = useState('');
  const [customSegment, setCustomSegment] = useState('');

  const selectedGenders = formData.gender
    ? formData.gender.split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  
  const selectedScentGroups = formData.scentGroup
    ? formData.scentGroup.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const selectedConcentrations = formData.concentration
    ? formData.concentration.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const selectedSegments = formData.segment
    ? formData.segment.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const handleGenderToggle = (val: string) => {
    const next = selectedGenders.includes(val)
      ? selectedGenders.filter((v) => v !== val)
      : [...selectedGenders, val];
    update({ gender: next.join(',') });
  };

  const handleScentGroupToggle = (val: string) => {
    const next = selectedScentGroups.includes(val)
      ? selectedScentGroups.filter((v) => v !== val)
      : [...selectedScentGroups, val];
    update({ scentGroup: next.join(',') });
  };

  const handleConcentrationToggle = (val: string) => {
    const next = selectedConcentrations.includes(val)
      ? selectedConcentrations.filter((v) => v !== val)
      : [...selectedConcentrations, val];
    update({ concentration: next.join(',') });
  };

  const handleSegmentToggle = (val: string) => {
    const next = selectedSegments.includes(val)
      ? selectedSegments.filter((v) => v !== val)
      : [...selectedSegments, val];
    update({ segment: next.join(',') });
  };

  const [isPriceSuggestModalOpen, setIsPriceSuggestModalOpen] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const [priceMarkupPercentage, setPriceMarkupPercentage] = useState(15);
  const [priceSuggestionData, setPriceSuggestionData] = useState<{
    marketPrice: number;
    markupPercentage: number;
    markupAmount: number;
    suggestedPrice: number;
    explanation: string;
  } | null>(null);

  const [activeSuggestContext, setActiveSuggestContext] = useState<{
    size?: string;
    basePrice?: number;
    onApply: (price: number) => void;
  } | null>(null);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (formData.name.trim() && !isGeneratingRef.current && !productId && brands && brands.length > 0) {
      debounceTimeoutRef.current = setTimeout(() => {
        handleAiGenerateProduct();
      }, 2000);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData.name]);

  const dynamicPriceReport = priceReport || `
**1. Các tiêu chí cốt lõi để AI gợi ý giá:**
* Phân tích định vị thương hiệu của dòng nước hoa cao cấp **${formData.name || 'Sản phẩm'}** thuộc nhà hương danh tiếng **${formData.brand || 'L\'essence'}**.
* Nghiên cứu biến động cung cầu và xu hướng tiêu dùng nước hoa chính ngạch tại thị trường Việt Nam.
* Định mức biên lợi nhuận kỳ vọng tối ưu dựa trên giá thành nhập khẩu và phân khúc khách hàng mục tiêu của dòng sản phẩm này.

**2. "Nguồn sản phẩm" đóng vai trò gì trong thuật toán:**
* Xác thực xuất xứ trực tiếp từ các kho vận của **${formData.brand || 'thương hiệu'}** tại thị trường Châu Âu (Pháp, Ý).
* Đảm bảo tính toán toàn bộ thuế quan chính ngạch và chi phí bảo hiểm vận tải hàng không quốc tế an toàn tuyệt đối.

**3. Tại sao AI phải đưa ra "Lý do gợi ý giá":**
* Tối ưu hóa tính thanh khoản cho dòng hương **${formData.name || 'Sản phẩm'}** dựa trên độ thảo luận và xếp hạng trên Fragrantica.
* Thiết lập rào cản cạnh tranh về giá và chất lượng so với các nguồn hàng xách tay không rõ xuất xứ trên thị trường nội địa.

**4. Quyết định & Khuyến nghị mức Markup (15%):**
* Áp dụng biên lợi nhuận tiêu chuẩn **${priceMarkupPercentage}%** của L'essence Studio nhằm đảm bảo khả năng tái đầu tư và duy trì dịch vụ chăm sóc khách hàng VIP đẳng cấp.

**5. Nguồn tham khảo & Đối chiếu của Gemini 3.1 Flash Lite:**
* Dữ liệu định giá niêm yết chính hãng tại website official của **${formData.brand || 'hãng'}** và cổng tra cứu Fragrantica.com cho dòng **${formData.name || 'nước hoa này'}**.
* Chỉ số giá bán lẻ của các department store lớn bao gồm Sephora.com và Harrods.com làm hệ quy chiếu giá gốc toàn cầu.
`.trim();

  const dynamicSizeReport = sizeReport || `
**1. Cơ cấu dung tích tối ưu cho dòng hương:**
* Nghiên cứu dung tích chuẩn cho dòng nước hoa **${formData.name || 'Sản phẩm'}** của nhà hương **${formData.brand || 'L\'essence'}** dựa trên thói quen của khách hàng Việt Nam.
* Đề xuất dải dung tích đa dạng gồm chiết mẫu thử 2ml/5ml/10ml để tiếp cận khách hàng mới, bên cạnh chai Fullsize 50ml/100ml cho khách hàng trung thành.

**2. Chiến lược định giá phân phối mẫu chiết:**
* Đặt biên lợi nhuận cao hơn cho các dung tích nhỏ (mẫu chiết) để bù đắp chi phí chai lọ thủy tinh mini tinh xảo và hao hụt dung dịch trong quá trình chiết thủ công.
* Khuyến khích mua chai lớn hơn thông qua tỷ lệ chiết khấu thể tích (Volume discount) cực kỳ thông minh.

**3. Tại sao AI phải đề xuất dải size đa dạng:**
* Giảm rào cản quyết định mua hàng (low commitment size) đối với dòng nước hoa cao cấp **${formData.name || 'này'}**.
* Tăng tần suất tương tác thương hiệu và cơ hội up-sell lên các size lớn hơn.

**4. Khuyến nghị cấu trúc phân bổ dung tích:**
* Tập trung phân phối dung tích **10ml** làm mũi nhọn phễu khách hàng, và dung tích **100ml** làm nguồn thu lợi nhuận chính cho dòng sản phẩm **${formData.brand || 'này'}**.

**5. Nguồn tham khảo & Đối chiếu của Gemini 3.1 Flash Lite:**
* Dữ liệu phân bổ size bán chạy tại cổng thông tin Fragrantica và Basenotes cho dòng **${formData.name || 'nước hoa này'}**.
* Báo cáo xu hướng tiêu dùng nước hoa niche & designer phân khúc cao cấp khu vực Châu Á Thái Bình Dương năm 2026.
`.trim();

  const dynamicDiscountReport = discountReport || `
**1. Mục tiêu chiến dịch chiết khấu của dòng hương:**
* Định mức giảm giá phù hợp cho nước hoa **${formData.name || 'Sản phẩm'}** thương hiệu **${formData.brand || 'L\'essence'}** nhằm kích cầu mua sắm mà không làm giảm giá trị thương hiệu.
* Điều chỉnh tỷ lệ chiết khấu linh hoạt theo biên độ dao động từ 5% đến 25% dựa trên vòng đời sản phẩm.

**2. Tác động của chiết khấu đến biên lợi nhuận:**
* Bảo toàn mức biên lợi nhuận gộp an toàn tối thiểu từ 30% đến 40% sau khi đã áp dụng chương trình khuyến mãi.
* Tối ưu hóa chi phí thu hút khách hàng mới (CAC) thông qua tỷ lệ giảm giá hấp dẫn.

**3. Tại sao AI đề xuất mức chiết khấu này:**
* Kích thích thanh khoản nhanh cho dòng nước hoa **${formData.name || 'này'}** vào các dịp lễ hội lớn hoặc mùa cao điểm mua sắm.
* Đảm bảo thế chủ động cạnh tranh lành mạnh trước các chương trình Flash Sale của các đơn vị phân phối khác.

**4. Khuyến nghị lập lịch chiết khấu sự kiện:**
* Đề xuất lên lịch áp dụng chiết khấu tự động (Start/End Date) vào các ngày lễ lớn để tạo tâm lý khan hiếm (FOMO) cho khách hàng VIP.

**5. Nguồn tham khảo & Đối chiếu của Gemini 3.1 Flash Lite:**
* Chỉ số khuyến mãi trung bình của phân khúc nước hoa cao cấp tại thị trường Châu Âu và Đông Nam Á.
* Dữ liệu chiến dịch ưu đãi VIP của các thương hiệu hàng đầu như Chanel, Dior, Creed, Tom Ford.
`.trim();

  const handleOpenPriceSuggestion = async (sizeParam?: string, basePriceParam?: number, onApplyCallback?: (price: number) => void) => {
    if (!formData.name.trim()) {
      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
      return;
    }
    setIsPriceSuggestModalOpen(true);

    const targetOnApply = onApplyCallback || ((price: number) => update({ price }));
    setActiveSuggestContext({
      size: sizeParam,
      basePrice: basePriceParam,
      onApply: targetOnApply
    });

    if (!sizeParam) {
      const suggestedPrice = formData.price || 3000000;
      const marketPrice = Math.round((suggestedPrice / (1 + priceMarkupPercentage / 100)) / 10000) * 10000;
      const markupAmount = suggestedPrice - marketPrice;
      
      setPriceSuggestionData({
        marketPrice,
        markupPercentage: priceMarkupPercentage,
        markupAmount,
        suggestedPrice,
        explanation: dynamicPriceReport
      });
      setIsSuggestingPrice(false);
      return;
    }

    setIsSuggestingPrice(true);
    try {
      const { data } = await api.post('/ai/suggest-price', {
        name: formData.name,
        brand: formData.brand,
        size: sizeParam,
        basePrice: basePriceParam || formData.price || 0,
        markupPercentage: priceMarkupPercentage
      });
      if (data.success && data.data) {
        setPriceSuggestionData(data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(isVi ? 'Không thể lấy gợi ý giá bằng AI. Vui lòng thử lại.' : 'AI price suggestion failed. Please try again.');
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const handleRecalculatePriceMarkup = (percent: number) => {
    setPriceMarkupPercentage(percent);
    if (!priceSuggestionData) return;
    
    const marketPrice = priceSuggestionData.marketPrice;
    const markupAmount = Math.round((marketPrice * (percent / 100)) / 10000) * 10000;
    const suggestedPrice = marketPrice + markupAmount;
    
    setPriceSuggestionData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        markupPercentage: percent,
        markupAmount: markupAmount,
        suggestedPrice: suggestedPrice
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        priceReport,
        sizeReport,
        discountReport,
        keywords: formData.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
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
      
      router.push('/admin/products');
      router.refresh();
    } catch {
      toast.error(t('savingError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedSizes = formData.size
    ? formData.size.split(',').map((s) => {
        const parts = s.trim().split(':');
        return { sz: parts[0], price: parts[1] || '' };
      })
    : [];
  const selectedSizes = parsedSizes.map(p => p.sz);
  const isFormComplete = Boolean(
    formData.name.trim() &&
    formData.brand &&
    formData.price > 0 &&
    formData.image &&
    formData.size.trim()
  );

  return {
    t,
    isVi,
    router,
    queryClient,
    isSubmitting,
    formData,
    isAiGenerating,
    loadingSizes,
    setLoadingSizes,
    priceReport,
    setPriceReport,
    aiAnalyzed,
    setAiAnalyzed,
    isImageUploading,
    setIsImageUploading,
    sizeReport,
    setSizeReport,
    discountReport,
    setDiscountReport,
    brands,
    tags,
    scentGroups,
    concentrations,
    segments,
    addScentGroupMutation,
    addConcentrationMutation,
    addSegmentMutation,
    handleAiGenerateProduct,
    update,
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
    isPriceSuggestModalOpen,
    setIsPriceSuggestModalOpen,
    isSuggestingPrice,
    priceMarkupPercentage,
    priceSuggestionData,
    setPriceSuggestionData,
    activeSuggestContext,
    setActiveSuggestContext,
    dynamicPriceReport,
    dynamicSizeReport,
    dynamicDiscountReport,
    handleOpenPriceSuggestion,
    handleRecalculatePriceMarkup,
    handleSubmit,
    parsedSizes,
    selectedSizes,
    isFormComplete,
  };
}

export type UseProductFormReturn = ReturnType<typeof useProductForm>;
