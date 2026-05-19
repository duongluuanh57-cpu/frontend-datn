'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Save,
  ChevronLeft,
  Loader2,
  Sparkles,
  Search,
  AlignLeft,
  Tag,
  Hash,
  Calendar,
  FileText,
  X,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/navigation';
import { ImageUpload } from '@/components/admin/ImageUpload';
import api from '@/lib/api';

const parseExplanation = (text: string) => {
  if (!text) return [];
  // Split by double asterisks headers like **1. **, **2. **, **3. **, **4. **
  const sections = text.split(/\*\*(?=\d\.)/);
  return sections
    .map((sec) => sec.trim())
    .filter(Boolean)
    .filter((sec) => /^\d\./.test(sec)) // Only keep sections starting with a number like "1.", "2."
    .map((sec) => {
      const lines = sec.split('\n');
      let titleLine = lines[0].replace(/\*\*/g, '').trim();
      let content = lines.slice(1).join('\n').trim();

      // If the heading has explanation text on the same line, split at the colon
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

const slugify = (text: string) => {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-'); // replace multiple - with single -
};

const formatBullets = (content: string) => {
  if (!content) return null;
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => {
      const clean = line.replace(/^[-*•\s]+/, '').trim();
      return clean.length > 0; // Filter out empty lines or lines with only bullets/dashes/asterisks
    })
    .map((line, idx) => {
      // Remove leading dash/bullet/asterisk cleanly (even if no space after it)
      const cleanLine = line.replace(/^[-*•\s]*/, '').trim();
      // Highlight bold parts
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

export interface ProductFormData {
  name: string;
  brand: string;
  price: number;
  image: string;
  images?: string[]; // Multiple images
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
  metaTitle: string;
  metaDescription: string;
  keywords?: string[] | string;
  priceReport?: string;
  sizeReport?: string;
  discountReport?: string;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  productId?: string;
}

const SIZE_CATEGORIES = [
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

const EMPTY_FORM = {
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

function toFormState(data?: ProductFormData) {
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
    discountStartDate: (data as any).discountStartDate ?? null,
    discountEndDate: (data as any).discountEndDate ?? null,
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

interface Brand {
  _id: string;
  name: string;
  status: 'active' | 'inactive';
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => toFormState(initialData));
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const isGeneratingRef = React.useRef(false);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [loadingSizes, setLoadingSizes] = useState<Record<string, boolean>>({});
  const isVi = t('saveToCollection')?.includes('Lưu') || false;

  interface TagItem {
    _id: string;
    name: string;
    slug: string;
    status: 'active' | 'inactive';
  }

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
    
    // Lấy tất cả sizes từ SIZE_CATEGORIES
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
        availableTags: tags?.map((t) => t.name) || ['Sản phẩm mới', 'Giảm giá', 'Trending', 'Limited'],
      });
      if (data.success && data.data) {
        const info = data.data;
        setFormData((prev) => ({
          ...prev,
          brand: info.brand || prev.brand,
          price: info.price || prev.price,
          size: info.size || prev.size,
          description: info.description || prev.description,
          tag: info.tag || prev.tag,
          quantityInStock: prev.quantityInStock, // Preserves the user entered stock value!
          discountPercentage: info.discountPercentage !== undefined ? info.discountPercentage : prev.discountPercentage,
          metaTitle: info.metaTitle || prev.metaTitle,
          metaDescription: info.metaDescription || prev.metaDescription,
          keywords: Array.isArray(info.keywords) ? info.keywords.join(', ') : (info.keywords || prev.keywords),
          scentGroup: info.scentGroup || prev.scentGroup,
          concentration: info.concentration || prev.concentration,
          segment: info.segment || prev.segment,
          gender: info.gender || prev.gender,
        }));

        // Store the AI generated reports
        setPriceReport(info.priceReport || null);
        setSizeReport(info.sizeReport || null);
        setDiscountReport(info.discountReport || null);
        setAiAnalyzed(true);
        
        // Show success toast
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

  // States and toggles for Gender, Scent Group, Concentration, Segment (Multiple Selection)
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

  // AI Price Suggestion State
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

  // Track context for target of AI price suggestion
  const [activeSuggestContext, setActiveSuggestContext] = useState<{
    size?: string;
    basePrice?: number;
    onApply: (price: number) => void;
  } | null>(null);

  // Auto-trigger AI generation when product name is entered (with debounce)
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Only trigger if:
    // 1. Product name is not empty
    // 2. Not already generating
    // 3. Not editing an existing product (only for new products)
    if (formData.name.trim() && !isGeneratingRef.current && !productId && brands && brands.length > 0) {
      // Set new debounce timeout (2 seconds)
      debounceTimeoutRef.current = setTimeout(() => {
        handleAiGenerateProduct();
      }, 2000);
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData.name]); // Only depend on formData.name

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

  // Time-limited Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

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

    // Reuse the pre-loaded report from "Auto-write by AI" if this is for the standard price
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
    // Calculate markup amount and round to nearest 10,000 VNĐ
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
      if (productId) await api.patch(`/products/${productId}`, payload);
      else await api.post('/products', payload);
      
      // Invalidate the react-query cache so the list page automatically reloads the new data!
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      
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

  return (
    <>
      <form onSubmit={handleSubmit} className="admin-form-page">
      <div className="admin-form-toolbar">
        <div className="admin-form-toolbar__left">
          <Link href="/admin/products" className="admin-back-link">
            <ChevronLeft size={18} />
            {t('backToList')}
          </Link>
          <div>
            <p className="admin-form-toolbar__title">
              {productId ? t('editProduct') : t('createProduct')}
            </p>
            <p className="admin-form-toolbar__subtitle">L&apos;essence Creative Studio</p>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || isImageUploading} 
          className="admin-btn-submit"
        >
          {isSubmitting || isImageUploading ? (
            <Loader2 size={14} className="admin-btn__spinner" />
          ) : (
            <Save size={16} />
          )}
          {isImageUploading 
            ? (isVi ? 'Đang tải ảnh...' : 'Uploading image...') 
            : isSubmitting 
              ? (isVi ? 'Đang lưu...' : 'Saving...')
              : t('saveToCollection')}
        </button>
      </div>

      <div className="admin-form-grid">
        {/* Media & brand */}
        <section className="admin-form-card">
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{t('sections.media')}</p>
              <p className="admin-form-card__desc">{t('sections.mediaDesc')}</p>
            </div>
          </div>

          {/* Ảnh chính */}
          <div className="mb-4">
            <ImageUpload 
              value={formData.image} 
              onChange={(url) => update({ image: url })} 
              onUploadStateChange={(uploading) => setIsImageUploading(uploading)}
              hideUrlInput={true}
              folder={formData.name.trim() ? `products/${slugify(formData.name)}` : 'products'}
            />
          </div>

          {/* Ảnh phụ */}
          <div>
            <label className="admin-label mb-2 block">Ảnh phụ (Tối đa 9 ảnh phụ.)</label>
            <div className="grid grid-cols-4 gap-2">
              {(formData.images || []).map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img src={url} alt={`Ảnh phụ ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = (formData.images || []).filter((_, i) => i !== index);
                      update({ images: newImages });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {/* Nút thêm ảnh phụ */}
              {(!formData.images || formData.images.length < 9) && (
                <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <Plus size={24} className="text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;

                      setIsImageUploading(true);
                      const newUrls: string[] = [];

                      try {
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const uploadFormData = new FormData();
                          uploadFormData.append('image', file);
                          uploadFormData.append('maxWidth', '1920');
                          uploadFormData.append('quality', '90');
                          const uploadFolder = formData.name.trim() 
                            ? `products/${slugify(formData.name)}` 
                            : 'products';
                          uploadFormData.append('folder', uploadFolder);

                          const { data } = await api.post('/media/upload-imgbb', uploadFormData, {
                            headers: { 'Content-Type': 'multipart/form-data' },
                          });

                          if (data.success && data.data.url) {
                            newUrls.push(data.data.url);
                          }
                        }

                        update({ images: [...(formData.images || []), ...newUrls] });
                      } catch (err) {
                        console.error('Upload failed:', err);
                        alert('Lỗi khi tải ảnh');
                      } finally {
                        setIsImageUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="admin-form-fields" style={{ marginTop: 10 }}>
            <div className="admin-field">
              <label className="admin-label" htmlFor="brand">
                {t('fields.brand')}
              </label>
              <select
                id="brand"
                required
                value={formData.brand}
                onChange={(e) => update({ brand: e.target.value })}
                className="admin-select"
              >
                <option value="" disabled>
                  {isVi ? '-- Chọn thương hiệu --' : '-- Select Brand --'}
                </option>
                {brands?.map((b) => (
                  <option key={b._id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label">
                {t('fields.tag')}
              </label>
              <div
                onClick={() => setIsTagModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  background: 'var(--admin-surface-muted)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 'var(--admin-radius)',
                  padding: '10px 14px',
                  marginTop: '4px',
                  cursor: 'pointer',
                  minHeight: '44px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--admin-border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedTags.length > 0 ? (
                    selectedTags.map((slug) => {
                      const tagObj = tags?.find(t => t.slug === slug);
                      const displayName = tagObj ? tagObj.name : slug;
                      return (
                        <span
                          key={slug}
                          style={{
                            background: 'rgba(212, 165, 165, 0.12)',
                            color: '#D4A5A5',
                            border: '1px solid rgba(212, 165, 165, 0.3)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {displayName}
                        </span>
                      );
                    })
                  ) : (
                    <span style={{ color: 'var(--admin-text-muted)', fontSize: '0.8125rem' }}>
                      {isVi ? '-- Chọn phân loại tag --' : '-- Select tags --'}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center' }}>
                  <Tag size={16} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product details */}
        <section className="admin-form-card">
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <AlignLeft size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{t('sections.info')}</p>
              <p className="admin-form-card__desc">{t('sections.infoDesc')}</p>
            </div>
          </div>

          <div className="admin-form-fields">
            <div className="admin-field">
              <label className="admin-label" htmlFor="name">
                {t('fields.name')}
              </label>
              <input
                id="name"
                required
                type="text"
                value={formData.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder={t('fields.namePlaceholder')}
                className="admin-input admin-input--lg w-full"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="description">
                {t('fields.description')}
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder={t('fields.descriptionPlaceholder')}
                className="admin-textarea"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label className="admin-label" htmlFor="price">
                  {t('fields.price', { currency: 'VNĐ' })}
                </label>
                <div className="admin-input-wrap" style={{ position: 'relative' }}>
                  <input
                    id="price"
                    required
                    readOnly
                    type="text"
                    value={formData.price ? formData.price.toLocaleString('vi-VN') : ''}
                    onClick={() => handleOpenPriceSuggestion(undefined, formData.price, (suggestedVal) => update({ price: suggestedVal }))}
                    className="admin-input"
                    style={{ paddingRight: '45px', cursor: 'pointer', background: 'rgba(201, 169, 154, 0.02)' }}
                  />
                  <span className="admin-input-suffix" style={{ right: '12px' }}>VNĐ</span>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="size">
                  {t('fields.size')}
                </label>
                <div className="admin-input-wrap" style={{ position: 'relative' }}>
                  <input
                    id="size"
                    readOnly
                    type="text"
                    value={aiAnalyzed && formData.size ? formatSizeString(formData.size) : ''}
                    onClick={() => {
                      if (!formData.name.trim()) {
                        toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                        return;
                      }
                      if (!aiAnalyzed) {
                        toast('🤖 AI đang phân tích sản phẩm, vui lòng đợi...', { duration: 4000 });
                        return;
                      }

                      setPriceSuggestionData({
                        marketPrice: formData.price || 3000000,
                        markupPercentage: priceMarkupPercentage,
                        markupAmount: 0,
                        suggestedPrice: formData.price || 3000000,
                        explanation: dynamicSizeReport
                      });
                      setActiveSuggestContext({
                        size: 'Dung tích',
                        basePrice: formData.price,
                        onApply: () => {}
                      });
                      setIsPriceSuggestModalOpen(true);
                    }}
                    className="admin-input"
                    style={{
                      background: 'rgba(201, 169, 154, 0.02)',
                      cursor: 'pointer',
                      paddingRight: '45px'
                    }}
                  />
                  <span className="admin-input-suffix" style={{ right: '12px' }}>ML</span>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="stock">
                  {t('fields.stock')}
                </label>
                <div className="admin-input-wrap">
                  <Hash className="admin-input-wrap__icon" size={18} />
                  <input
                    id="stock"
                    required
                    type="number"
                    min={0}
                    value={formData.quantityInStock}
                    onChange={(e) => update({ quantityInStock: Number(e.target.value) })}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label" htmlFor="discount">
                  {t('fields.discount')}
                </label>
                <div className="admin-input-wrap" style={{ position: 'relative' }}>
                  <input
                    id="discount"
                    readOnly
                    type="text"
                    value={aiAnalyzed && formData.discountPercentage ? formData.discountPercentage : ''}
                    onClick={() => {
                      if (!formData.name.trim()) {
                        toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                        return;
                      }
                      if (!aiAnalyzed) {
                        toast('🤖 AI đang phân tích sản phẩm, vui lòng đợi...', { duration: 4000 });
                        return;
                      }

                      setPriceSuggestionData({
                        marketPrice: formData.price || 3000000,
                        markupPercentage: priceMarkupPercentage,
                        markupAmount: 0,
                        suggestedPrice: formData.price || 3000000,
                        explanation: dynamicDiscountReport
                      });
                      setActiveSuggestContext({
                        size: 'Chiết khấu',
                        basePrice: formData.price,
                        onApply: () => {}
                      });
                      setIsPriceSuggestModalOpen(true);
                    }}
                    className="admin-input"
                    style={{ 
                      cursor: 'pointer',
                      background: 'rgba(201, 169, 154, 0.02)',
                      paddingRight: '45px'
                    }}
                  />
                  <span className="admin-input-suffix" style={{ right: '12px' }}>%</span>
                </div>
                {formData.discountPercentage > 0 && (formData.discountStartDate || formData.discountEndDate) && (
                  <p style={{ fontSize: '0.6875rem', color: '#D4A5A5', marginTop: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📅</span>
                    <span>
                      {formData.discountStartDate ? new Date(formData.discountStartDate).toLocaleString(isVi ? 'vi-VN' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '∞'}
                      {' - '}
                      {formData.discountEndDate ? new Date(formData.discountEndDate).toLocaleString(isVi ? 'vi-VN' : 'en-US', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '∞'}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
              {/* Giới tính */}
              <div className="admin-field">
                <label className="admin-label">
                  {isVi ? 'Giới tính' : 'Gender'}
                </label>
                <div
                  onClick={() => {
                    if (!formData.name.trim()) {
                      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                      return;
                    }
                    setIsGenderModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: 'var(--admin-surface-muted)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius)',
                    padding: '10px 14px',
                    marginTop: '4px',
                    cursor: 'pointer',
                    minHeight: '44px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                    {selectedGenders.length > 0 && (
                      selectedGenders.map((g) => (
                        <span
                          key={g}
                          style={{
                            background: 'rgba(212, 165, 165, 0.12)',
                            color: '#D4A5A5',
                            border: '1px solid rgba(212, 165, 165, 0.3)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {g}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Nhóm hương */}
              <div className="admin-field">
                <label className="admin-label">
                  {isVi ? 'Nhóm hương' : 'Scent Group'}
                </label>
                <div
                  onClick={() => {
                    if (!formData.name.trim()) {
                      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                      return;
                    }
                    setIsScentGroupModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: 'var(--admin-surface-muted)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius)',
                    padding: '10px 14px',
                    marginTop: '4px',
                    cursor: 'pointer',
                    minHeight: '44px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                    {selectedScentGroups.length > 0 && (
                      selectedScentGroups.map((sg) => (
                        <span
                          key={sg}
                          style={{
                            background: 'rgba(212, 165, 165, 0.12)',
                            color: '#D4A5A5',
                            border: '1px solid rgba(212, 165, 165, 0.3)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {sg}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Nồng độ */}
              <div className="admin-field">
                <label className="admin-label">
                  {isVi ? 'Nồng độ' : 'Concentration'}
                </label>
                <div
                  onClick={() => {
                    if (!formData.name.trim()) {
                      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                      return;
                    }
                    setIsConcentrationModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: 'var(--admin-surface-muted)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius)',
                    padding: '10px 14px',
                    marginTop: '4px',
                    cursor: 'pointer',
                    minHeight: '44px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                    {selectedConcentrations.length > 0 && (
                      selectedConcentrations.map((c) => (
                        <span
                          key={c}
                          style={{
                            background: 'rgba(212, 165, 165, 0.12)',
                            color: '#D4A5A5',
                            border: '1px solid rgba(212, 165, 165, 0.3)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {c}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Phân khúc nhóm */}
              <div className="admin-field">
                <label className="admin-label">
                  {isVi ? 'Phân khúc nhóm' : 'Brand Segment'}
                </label>
                <div
                  onClick={() => {
                    if (!formData.name.trim()) {
                      toast.error(isVi ? 'Vui lòng nhập Tên sản phẩm trước để AI phân tích.' : 'Please enter Product Name first so AI can analyze.');
                      return;
                    }
                    setIsSegmentModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    background: 'var(--admin-surface-muted)',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 'var(--admin-radius)',
                    padding: '10px 14px',
                    marginTop: '4px',
                    cursor: 'pointer',
                    minHeight: '44px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 165, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 165, 165, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '82px', overflowY: 'auto', width: '100%' }}>
                    {selectedSegments.length > 0 && (
                      selectedSegments.map((s) => (
                        <span
                          key={s}
                          style={{
                            background: 'rgba(212, 165, 165, 0.12)',
                            color: '#D4A5A5',
                            border: '1px solid rgba(212, 165, 165, 0.3)',
                            borderRadius: '6px',
                            padding: '2px 8px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO */}
        <section className="admin-form-card admin-form-grid__seo">
          <div className="admin-form-card__head">
            <div className="admin-form-card__head-icon">
              <Search size={18} />
            </div>
            <div>
              <p className="admin-form-card__title">{t('sections.seo')}</p>
              <p className="admin-form-card__desc">{t('sections.seoDesc')}</p>
            </div>
          </div>

          <div className="admin-form-fields">
            <div className="admin-field">
              <label className="admin-label" htmlFor="metaTitle">
                {t('fields.metaTitle')}
              </label>
              <input
                id="metaTitle"
                type="text"
                value={formData.metaTitle}
                onChange={(e) => update({ metaTitle: e.target.value })}
                className="admin-input"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="keywords">
                {t('fields.keywords')}
              </label>
              <input
                id="keywords"
                type="text"
                value={formData.keywords}
                onChange={(e) => update({ keywords: e.target.value })}
                placeholder={t('fields.keywordsPlaceholder')}
                className="admin-input"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="metaDescription">
                {t('fields.metaDescription')}
              </label>
              <textarea
                id="metaDescription"
                rows={4}
                value={formData.metaDescription}
                onChange={(e) => update({ metaDescription: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div className="admin-status-pill">
              <span className="admin-status-pill__label">
                <span 
                  className="admin-status-pill__dot" 
                  style={{ 
                    background: isFormComplete ? 'var(--admin-success)' : 'var(--admin-warning)',
                    boxShadow: isFormComplete ? '0 0 8px var(--admin-success)' : '0 0 8px var(--admin-warning)'
                  }} 
                />
                {t('fields.status')}
              </span>
              <span className="admin-status-pill__value">
                {isFormComplete ? t('fields.ready') : t('fields.draft')}
              </span>
            </div>
          </div>
        </section>
      </div>
    </form>

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

            {/* Footer / Confirm */}
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
              {/* Render selected values that aren't in defaults first to ensure they are visible */}
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

                {/* Report Body - Parsed sections list */}
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
