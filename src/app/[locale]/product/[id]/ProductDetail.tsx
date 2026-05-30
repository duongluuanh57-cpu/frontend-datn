'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { ArrowLeft, Star, ShoppingBag, ChevronDown, AlertTriangle, Package } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/navigation';
import api from '@/lib/api';
import { resolveImageUrl } from '@/lib/api';
import './product-detail.css';

export interface ProductDetailData {
  _id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  tag?: string;
  rating?: number;
  reviewsCount?: number;
  discountPercentage?: number;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  keywords?: string[];
  size?: string;
  scentGroup?: string;
  concentration?: string;
  segment?: string;
  quantityInStock?: number;
  categoryId?: string;
  categoryName?: string;
  soldCount?: number;
  priceReport?: string;
  sizeReport?: string;
  discountReport?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SizeOption {
  label: string;
  price: number;
}

interface ProductDetailProps {
  productId: string;
}

const fetchProduct = async (id: string): Promise<ProductDetailData> => {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
};

const parseSizes = (sizeStr?: string): SizeOption[] => {
  if (!sizeStr) return [];
  return sizeStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [label, priceStr] = s.split(':').map((p) => p.trim());
      const price = parseInt(priceStr, 10);
      return { label, price: isNaN(price) ? 0 : price };
    })
    .filter((s) => s.label && s.price > 0);
};

const isDiscountActive = (product: ProductDetailData) => {
  if (!product.discountPercentage || product.discountPercentage <= 0) return false;
  if (!product.discountStartDate && !product.discountEndDate) return true;
  const now = new Date();
  if (product.discountStartDate && now < new Date(product.discountStartDate)) return false;
  if (product.discountEndDate && now > new Date(product.discountEndDate)) return false;
  return true;
};

const formatPrice = (price: number, locale: string) =>
  new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency: locale === 'vi' ? 'VND' : 'USD',
  }).format(locale === 'vi' ? price : price / 25000);

const splitAttr = (str?: string): string[] =>
  str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];

export function ProductDetail({ productId }: ProductDetailProps) {
  const locale = useLocale();

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const result = await fetchProduct(productId);
      console.log('[ProductDetail] API response:', { image: result.image, images: result.images, totalImages: [result.image, ...(result.images || [])].filter(Boolean).length });
      return result;
    },
    enabled: !!productId,
  });

  const allImages = product
    ? [product.image, ...(product.images || [])].filter(Boolean)
    : [];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const parsedSizes = product ? parseSizes(product.size) : [];
  const [selectedSizeIdx, setSelectedSizeIdx] = useState<number | null>(
    parsedSizes.length > 0 ? 0 : null
  );

  const activeDiscount = product ? isDiscountActive(product) : false;

  const basePrice =
    selectedSizeIdx !== null && parsedSizes[selectedSizeIdx]
      ? parsedSizes[selectedSizeIdx].price
      : product?.price || 0;

  const displayPrice = activeDiscount
    ? basePrice * (1 - (product?.discountPercentage || 0) / 100)
    : basePrice;

  const scentGroups = product ? splitAttr(product.scentGroup) : [];
  const concentrations = product ? splitAttr(product.concentration) : [];
  const segments = product ? splitAttr(product.segment) : [];
  const tags = product ? splitAttr(product.tag) : [];

  const stockStatus = !product
    ? 'loading'
    : product.quantityInStock === undefined || product.quantityInStock === null
    ? 'unknown'
    : product.quantityInStock <= 0
    ? 'out'
    : product.quantityInStock < 10
    ? 'low'
    : 'in';

  const stockLabel = (() => {
    switch (stockStatus) {
      case 'out': return locale === 'vi' ? 'Hết hàng' : 'Out of Stock';
      case 'low': return locale === 'vi' ? `Chỉ còn ${product!.quantityInStock} sản phẩm` : `Only ${product!.quantityInStock} left`;
      case 'in': return locale === 'vi' ? `Còn ${product!.quantityInStock} sản phẩm` : `${product!.quantityInStock} in stock`;
      default: return '';
    }
  })();

  if (isLoading) {
    return (
      <div className="product-detail-shell">
        <div className="product-detail-container">
          <div className="product-loading-shell">
            <div className="product-loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-shell">
        <div className="product-detail-container">
          <div className="product-error-shell">
            <AlertTriangle size={40} style={{ color: 'var(--primary)', opacity: 0.5 }} />
            <div className="product-error-title">
              {locale === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product Not Found'}
            </div>
            <div className="product-error-text">
              {locale === 'vi'
                ? 'Sản phẩm này không tồn tại hoặc đã bị xóa.'
                : 'This product does not exist or has been removed.'}
            </div>
            <button className="product-retry-btn" onClick={() => refetch()}>
              {locale === 'vi' ? 'Thử lại' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-shell">
      <div className="product-detail-container">
        <Link href="/" className="product-back-btn">
          <ArrowLeft size={13} />
          {locale === 'vi' ? 'Quay lại' : 'Back'}
        </Link>

        <div className="product-detail-grid">
          {/* ── Image Gallery ── */}
          <div className="product-gallery">
            <div className="product-main-image">
              <Image
                src={resolveImageUrl(allImages[selectedImageIndex]) || '/placeholder.svg'}
                alt={product.name}
                fill
                sizes="(max-width: 860px) 100vw, 50vw"
                className="object-contain p-4"
                quality={90}
                priority
              />
            </div>
            {allImages.length > 1 && (
              <div className="product-thumbnails">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`product-thumbnail ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <Image
                      src={resolveImageUrl(img)}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover"
                      quality={90}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="product-info-panel">
            {product.brand && (
              <span className="product-brand">{product.brand}</span>
            )}

            <h1 className="product-name">{product.name}</h1>

            {(product.rating !== undefined || product.reviewsCount !== undefined) && (
              <div className="product-rating-row">
                {product.rating !== undefined && (
                  <div className="product-rating-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.round(product.rating!) ? '#f59e0b' : 'none'}
                        stroke={i < Math.round(product.rating!) ? '#f59e0b' : 'rgba(122,92,92,0.2)'}
                      />
                    ))}
                  </div>
                )}
                {product.rating !== undefined && (
                  <span>{product.rating.toFixed(1)}</span>
                )}
                {product.rating !== undefined && product.reviewsCount !== undefined && (
                  <span className="product-rating-divider" />
                )}
                {product.reviewsCount !== undefined && (
                  <span>
                    {product.reviewsCount}{' '}
                    {locale === 'vi' ? 'đánh giá' : 'reviews'}
                  </span>
                )}
              </div>
            )}

            <div className="product-divider" />

            {/* Price */}
            <div className="product-price-section">
              <span className="product-price-current">
                {formatPrice(displayPrice, locale)}
              </span>
              {activeDiscount && (
                <>
                  <span className="product-price-original">
                    {formatPrice(basePrice, locale)}
                  </span>
                  <span className="product-discount-badge">
                    -{product.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Size Selector */}
            {parsedSizes.length > 0 && (
              <div className="product-size-section">
                <span className="product-size-label">
                  {locale === 'vi' ? 'Dung tích' : 'Size'}
                </span>
                <div className="product-size-options">
                  {parsedSizes.map((size, idx) => (
                    <button
                      key={size.label}
                      className={`product-size-btn ${idx === selectedSizeIdx ? 'active' : ''}`}
                      onClick={() => setSelectedSizeIdx(idx)}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Attribute Badges */}
            {(scentGroups.length > 0 || concentrations.length > 0 || segments.length > 0) && (
              <div className="product-attributes">
                {scentGroups.map((s) => (
                  <span key={s} className="product-attribute-badge">{s}</span>
                ))}
                {concentrations.map((c) => (
                  <span key={c} className="product-attribute-badge">{c}</span>
                ))}
                {segments.map((s) => (
                  <span key={s} className="product-attribute-badge">{s}</span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div className={`product-stock ${stockStatus === 'in' ? 'in-stock' : stockStatus === 'low' ? 'low-stock' : 'out-of-stock'}`}>
              <Package size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
              {stockLabel}
            </div>

            <div className="product-divider" />

            {/* Add to Cart */}
            <button
              className="product-add-to-cart"
              disabled={stockStatus === 'out'}
            >
              <ShoppingBag size={16} />
              {stockStatus === 'out'
                ? (locale === 'vi' ? 'Hết hàng' : 'Out of Stock')
                : (locale === 'vi' ? 'Thêm vào giỏ' : 'Add to Cart')}
            </button>
          </div>
        </div>

        {/* ── Description ── */}
        {product.description && (
          <div className="product-fullwidth">
            <h2 className="product-section-title">
              {locale === 'vi' ? 'Mô tả sản phẩm' : 'Description'}
            </h2>
            <div className="product-description">{product.description}</div>
          </div>
        )}

        {/* ── AI Reports ── */}
        {(product.priceReport || product.sizeReport || product.discountReport) && (
          <div className="product-fullwidth">
            <h2 className="product-section-title">
              {locale === 'vi' ? 'Phân tích AI' : 'AI Analysis'}
            </h2>
            <div className="product-reports">
              <ReportCard
                title={locale === 'vi' ? 'Phân tích giá' : 'Price Analysis'}
                icon="💰"
                content={product.priceReport}
              />
              <ReportCard
                title={locale === 'vi' ? 'Gợi ý dung tích' : 'Size Recommendation'}
                icon="📏"
                content={product.sizeReport}
              />
              <ReportCard
                title={locale === 'vi' ? 'Chiến lược giảm giá' : 'Discount Strategy'}
                icon="🏷️"
                content={product.discountReport}
              />
            </div>
          </div>
        )}

        {/* ── Product Specs ── */}
        <div className="product-fullwidth">
          <h2 className="product-section-title">
            {locale === 'vi' ? 'Chi tiết sản phẩm' : 'Product Details'}
          </h2>
          <div className="product-specs-grid">
            {product.brand && (
              <SpecItem
                label={locale === 'vi' ? 'Thương hiệu' : 'Brand'}
                value={product.brand}
              />
            )}
            {product.categoryName && (
              <SpecItem
                label={locale === 'vi' ? 'Danh mục' : 'Category'}
                value={product.categoryName}
              />
            )}
            {parsedSizes.length > 0 && (
              <SpecItem
                label={locale === 'vi' ? 'Dung tích' : 'Sizes'}
                value={parsedSizes.map((s) => s.label).join(', ')}
              />
            )}
            {product.soldCount !== undefined && (
              <SpecItem
                label={locale === 'vi' ? 'Đã bán' : 'Sold'}
                value={product.soldCount.toLocaleString()}
              />
            )}
            {product.quantityInStock !== undefined && (
              <SpecItem
                label={locale === 'vi' ? 'Tồn kho' : 'Stock'}
                value={product.quantityInStock.toLocaleString()}
              />
            )}
            {product.createdAt && (
              <SpecItem
                label={locale === 'vi' ? 'Ngày tạo' : 'Created'}
                value={new Date(product.createdAt).toLocaleDateString(
                  locale === 'vi' ? 'vi-VN' : 'en-US'
                )}
              />
            )}
            {tags.length > 0 && (
              <div className="product-spec-item">
                <span className="product-spec-label">
                  {locale === 'vi' ? 'Thẻ' : 'Tags'}
                </span>
                <div className="product-keywords">
                  {tags.map((tag) => (
                    <span key={tag} className="product-keyword-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {product.keywords && product.keywords.length > 0 && (
              <div className="product-spec-item">
                <span className="product-spec-label">
                  {locale === 'vi' ? 'Từ khóa' : 'Keywords'}
                </span>
                <div className="product-keywords">
                  {product.keywords.map((kw) => (
                    <span key={kw} className="product-keyword-tag">{kw}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, icon, content }: { title: string; icon: string; content?: string | null }) {
  const [open, setOpen] = useState(true);
  if (!content) return null;
  return (
    <div className="product-report-card">
      <div className="product-report-header" onClick={() => setOpen(!open)}>
        <span className="product-report-icon">
          <span>{icon}</span>
          {title}
        </span>
        <ChevronDown size={16} className={`product-report-arrow ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="product-report-body">{content}</div>}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="product-spec-item">
      <span className="product-spec-label">{label}</span>
      <span className="product-spec-value">{value}</span>
    </div>
  );
}
