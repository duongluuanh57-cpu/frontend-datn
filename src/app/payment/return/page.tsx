'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getActiveOriginSync } from '@/lib/backendDiscovery';
import { CheckCircle, XCircle, Loader2, ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'pending';

export default function PaymentReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [transactionNo, setTransactionNo] = useState<string | null>(null);

  const verifyPayment = useCallback(async () => {
    try {
      // Collect all params from URL (VNPAY returns query params)
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Check if there's a vnp_ResponseCode
      const responseCode = params['vnp_ResponseCode'];
      const txnRef = params['vnp_TxnRef'];

      if (!responseCode) {
        setStatus('failed');
        setMessage('Không nhận được phản hồi từ VNPAY');
        return;
      }

      // Gọi backend verify
      const origin = getActiveOriginSync();
      const res = await fetch(`${origin.replace(/\/+$/, '')}/api/payments/vnpay-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();

      if (json.success) {
        if (json.data?.pending) {
          // IPN chưa xử lý kịp → poll
          setStatus('pending');
          setMessage('Đang xử lý giao dịch...');
          // Poll mỗi 2s, tối đa 10 lần
          let attempts = 0;
          const pollInterval = setInterval(async () => {
            attempts++;
            if (attempts > 10) {
              clearInterval(pollInterval);
              setStatus('pending');
              setMessage('Giao dịch đang được xử lý. Vui lòng kiểm tra đơn hàng sau ít phút.');
              return;
            }
            try {
              const pollRes = await fetch(`${origin.replace(/\/+$/, '')}/api/payments/vnpay-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
              });
              const pollJson = await pollRes.json();
              if (pollJson.success && pollJson.data?.orderId) {
                clearInterval(pollInterval);
                setStatus('success');
                setMessage('Thanh toán thành công!');
                setOrderId(pollJson.data.orderId);
                setAmount(pollJson.data.amount || 0);
                setTransactionNo(pollJson.data.transactionNo || txnRef);
              }
            } catch {
              // ignore poll errors
            }
          }, 2000);
        } else {
          setStatus('success');
          setMessage('Thanh toán thành công!');
          setOrderId(json.data?.orderId);
          setAmount(json.data?.amount || 0);
          setTransactionNo(json.data?.transactionNo || txnRef);
        }
      } else {
        setStatus('failed');
        setMessage(json.message || 'Thanh toán thất bại');
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setStatus('failed');
      setMessage('Có lỗi xảy ra khi xác thực thanh toán');
    }
  }, [searchParams]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center px-4 -mt-16 md:-mt-20">
      <div className="max-w-md w-full">
        {/* Status Card */}
        <div className="bg-surface rounded-2xl shadow-sm ring-1 ring-black/5 p-8 text-center">
          {status === 'loading' && (
            <div className="space-y-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-text-muted/10 mx-auto" />
              <div className="h-7 w-56 bg-text-muted/10 rounded-lg mx-auto" />
              <div className="h-4 w-40 bg-text-muted/10 rounded mx-auto" />
            </div>
          )}

          {status === 'pending' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto ring-1 ring-amber-200/40">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Đang xử lý giao dịch</h2>
              <p className="text-sm text-text-secondary">{message}</p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Vui lòng không đóng trang này</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold text-text-primary">Thanh toán thành công!</h2>
              <p className="text-sm text-text-secondary">{message}</p>

              {amount > 0 && (
                <div className="bg-green-50 rounded-xl p-4 ring-1 ring-green-200/40 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Số tiền</span>
                    <span className="font-bold text-green-800">{formatPrice(amount)}</span>
                  </div>
                  {transactionNo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Mã giao dịch</span>
                      <span className="font-medium text-green-800">{transactionNo}</span>
                    </div>
                  )}
                  {orderId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">Mã đơn hàng</span>
                      <span className="font-medium text-green-800">{orderId.substring(0, 8).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/profile"
                  className="w-full py-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-rich-black font-semibold rounded-xl transition-all text-sm text-center"
                >
                  Xem đơn hàng
                </Link>
                <Link
                  href="/"
                  className="w-full py-3 border border-border hover:bg-background active:scale-[0.98] text-text-primary font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} />
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <h2 className="text-xl font-bold text-text-primary">Thanh toán thất bại</h2>
              <p className="text-sm text-text-secondary">{message}</p>

              <div className="bg-red-50 rounded-xl p-4 ring-1 ring-red-200/40">
                <p className="text-xs text-red-600 leading-relaxed">
                  Giao dịch không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                  Nếu số tiền đã bị trừ, tiền sẽ được hoàn lại trong vòng 24h.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-rich-black font-semibold rounded-xl transition-all text-sm text-center"
                >
                  Thanh toán lại
                </Link>
                <Link
                  href="/"
                  className="w-full py-3 border border-border hover:bg-background active:scale-[0.98] text-text-primary font-medium rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={14} />
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-muted/60 mt-6">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Giao dịch được bảo mật bởi VNPAY</span>
        </div>
      </div>
    </div>
  );
}