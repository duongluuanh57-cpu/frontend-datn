'use client';

import { motion } from 'framer-motion';
import { X, CheckCircle2, XCircle, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';
import type { GameResult } from '@/app/mini-games/page';

interface GameResultModalProps {
  result: GameResult;
  onClose: () => void;
}

export function GameResultModal({ result, onClose }: GameResultModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result.voucherCode) return;
    try {
      await navigator.clipboard.writeText(result.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = result.voucherCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <X size={18} />
        </button>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
        >
          {result.won ? (
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles size={40} className="text-white" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <XCircle size={40} className="text-gray-400" />
            </div>
          )}
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className={`text-2xl font-bold mb-2 ${result.won ? 'text-amber-600' : 'text-gray-500'}`}>
            {result.won ? 'Chuc mung!' : 'Chuc may man lan sau!'}
          </h3>
          <p className="text-text-secondary mb-6">{result.message}</p>
        </motion.div>

        {/* Voucher Code */}
        {result.won && result.voucherCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6"
          >
            <p className="text-xs text-amber-700 font-medium mb-2">Ma voucher cua ban</p>
            <div className="flex items-center justify-center gap-3">
              <code className="text-2xl font-bold tracking-widest text-amber-800 select-all">
                {result.voucherCode}
              </code>
              <button
                onClick={handleCopy}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-amber-200 hover:bg-amber-50 transition-colors"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} className="text-amber-600" />}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              {result.discountType === 'percentage'
                ? `Giam ${result.discountAmount}% don hang`
                : `Giam ${result.discountAmount?.toLocaleString()}d don hang`}
            </p>
          </motion.div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl font-semibold bg-gray-100 hover:bg-gray-200 text-text-primary transition-colors"
        >
          Dong
        </button>
      </motion.div>
    </motion.div>
  );
}
