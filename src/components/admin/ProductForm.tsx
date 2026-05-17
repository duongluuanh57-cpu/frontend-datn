'use client';

import React, { useState, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
    .map((sec) => {
      const lines = sec.split('\n');
      const titleLine = lines[0].replace(/\*\*/g, '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { title: titleLine, content };
    });
};

const formatBullets = (content: string) => {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      // Remove leading dash/bullet
      const cleanLine = line.replace(/^[-*]\s+/, '');
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
  description: string;
  tag: string;
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
  description: '',
  tag: '',
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
  const keywords = Array.isArray(data.keywords)
    ? data.keywords.join(', ')
    : (data.keywords ?? '');
  return { ...EMPTY_FORM, ...data, keywords };
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
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [loadingSizes, setLoadingSizes] = useState<Record<string, boolean>>({});
  const isVi = t('saveToCollection')?.includes('Lưu') || false;

  const { data: brands } = useQuery({
    queryKey: ['admin-active-brands-list'],
    queryFn: async () => {
      const { data } = await api.get('/brands');
      return data.data as Brand[];
    }
  });

  const [priceReport, setPriceReport] = useState<string | null>(initialData?.priceReport || null);
  const [sizeReport, setSizeReport] = useState<string | null>(initialData?.sizeReport || null);
  const [discountReport, setDiscountReport] = useState<string | null>(initialData?.discountReport || null);

  const handleAiGenerateProduct = async () => {
    if (!formData.name.trim()) return;
    setIsAiGenerating(true);
    try {
      const { data } = await api.post('/ai/generate-product', {
        name: formData.name,
        availableBrands: brands?.map((b) => b.name) || [],
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
          image: info.image || prev.image,
        }));

        // Store the AI generated reports
        setPriceReport(info.priceReport || null);
        setSizeReport(info.sizeReport || null);
        setDiscountReport(info.discountReport || null);
      }
    } catch (err) {
      console.error(err);
      alert(isVi ? 'Không thể viết thông tin sản phẩm bằng AI. Vui lòng thử lại.' : 'AI product generation failed. Please try again.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const update = (patch: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
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

**5. Nguồn tham khảo & Đối chiếu của Gemma 4:**
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

**5. Nguồn tham khảo & Đối chiếu của Gemma 4:**
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

**5. Nguồn tham khảo & Đối chiếu của Gemma 4:**
* Chỉ số khuyến mãi trung bình của phân khúc nước hoa cao cấp tại thị trường Châu Âu và Đông Nam Á.
* Dữ liệu chiến dịch ưu đãi VIP của các thương hiệu hàng đầu như Chanel, Dior, Creed, Tom Ford.
`.trim();

  // Time-limited Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const handleOpenPriceSuggestion = async (sizeParam?: string, basePriceParam?: number, onApplyCallback?: (price: number) => void) => {
    if (!formData.name.trim()) {
      alert(isVi ? 'Vui lòng điền Tên sản phẩm trước khi gợi ý giá!' : 'Please enter the Product Name before requesting a price suggestion!');
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
      alert(isVi ? 'Không thể lấy gợi ý giá bằng AI. Vui lòng thử lại.' : 'AI price suggestion failed. Please try again.');
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
      alert(t('savingError'));
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

        <button type="submit" disabled={isSubmitting} className="admin-btn-submit">
          {isSubmitting ? (
            <Loader2 size={16} className="admin-loading__spinner" />
          ) : (
            <Save size={16} />
          )}
          {t('saveToCollection')}
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

          <ImageUpload value={formData.image} onChange={(url) => update({ image: url })} />

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
              <label className="admin-label" htmlFor="tag">
                {t('fields.tag')}
              </label>
              <input
                type="text"
                id="tag"
                value={formData.tag}
                onChange={(e) => update({ tag: e.target.value })}
                className="admin-input"
                placeholder={isVi ? "Nhập nhãn sản phẩm..." : "Enter tag..."}
              />
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
              <div className="flex gap-3">
                <input
                  id="name"
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder={t('fields.namePlaceholder')}
                  className="admin-input admin-input--lg w-full"
                />
                <button
                  type="button"
                  disabled={!formData.name.trim() || isAiGenerating}
                  onClick={handleAiGenerateProduct}
                  className="px-5 rounded-2xl border border-[var(--admin-border-subtle)] hover:bg-[#7A5C5C]/5 text-[#7A5C5C] flex items-center gap-2 transition text-sm font-semibold disabled:opacity-50 active:scale-95 shadow-sm"
                  style={{ minHeight: '52px' }}
                >
                  {isAiGenerating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Sparkles size={16} className="text-[#D4A5A5]" />
                  )}
                  {isVi ? 'Tự động viết bằng AI' : 'Generate with AI'}
                </button>
              </div>
            </div>

            <div className="admin-field">
              <label className="admin-label" htmlFor="description">
                {t('fields.description')}
              </label>
              <textarea
                id="description"
                rows={2}
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
                <div className="admin-input-wrap">
                  <button
                    id="size"
                    type="button"
                    onClick={() => {
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
                      textAlign: 'left',
                      background: 'rgba(201, 169, 154, 0.02)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      width: '100%',
                      paddingRight: '12px'
                    }}
                  >
                    {formData.size ? formatSizeString(formData.size) : (isVi ? '-- Chọn dung tích --' : '-- Choose capacity --')}
                  </button>
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
                <div className="admin-input-wrap">
                  <input
                    id="discount"
                    readOnly
                    type="text"
                    value={formData.discountPercentage ? `${formData.discountPercentage}%` : (isVi ? '-- Chưa áp dụng --' : '-- No discount --')}
                    onClick={() => {
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
                      paddingRight: '12px'
                    }}
                  />
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
                rows={2}
                value={formData.metaDescription}
                onChange={(e) => update({ metaDescription: e.target.value })}
                className="admin-textarea"
              />
            </div>

            <div className="admin-status-pill">
              <span className="admin-status-pill__label">
                <span className="admin-status-pill__dot" />
                {t('fields.status')}
              </span>
              <span className="admin-status-pill__value">{t('fields.ready')}</span>
            </div>
          </div>
        </section>
      </div>
    </form>



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
                  <span>Model: Gemini 3.1 & Gemma 4</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </>
  );
}
