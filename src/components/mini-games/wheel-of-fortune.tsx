'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import type { GameResult } from '@/app/mini-games/page';

interface WheelOfFortuneProps {
  onEnd: (result: GameResult) => void;
  onClose: () => void;
}

const SEGMENTS = [
  { label: '10%', value: 10, type: 'percentage' as const, color: '#f97316' },
  { label: '20%', value: 20, type: 'percentage' as const, color: '#eab308' },
  { label: '50k', value: 50000, type: 'fixed' as const, color: '#22c55e' },
  { label: '5%', value: 5, type: 'percentage' as const, color: '#3b82f6' },
  { label: 'May mắn', value: 0, type: 'percentage' as const, color: '#6b7280' },
  { label: '15%', value: 15, type: 'percentage' as const, color: '#a855f7' },
  { label: '100k', value: 100000, type: 'fixed' as const, color: '#ec4899' },
  { label: '8%', value: 8, type: 'percentage' as const, color: '#14b8a6' },
];

export function WheelOfFortune({ onEnd, onClose }: WheelOfFortuneProps) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    const segmentAngle = 360 / SEGMENTS.length;
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const randomOffset = Math.floor(Math.random() * SEGMENTS.length) * segmentAngle;
    const totalRotation = extraSpins + randomOffset;

    const startRotation = rotation;
    const endRotation = startRotation + totalRotation;
    setRotation(endRotation);

    setTimeout(() => {
      const normalizedAngle = endRotation % 360;
      const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
      const segment = SEGMENTS[segmentIndex];
      const won = segment.value > 0;

      if (!won) {
        onEnd({ won: false, message: 'Chúc bạn may mắn lần sau!' });
      } else {
        const voucherCode = generateVoucherCode();
        onEnd({
          won: true,
          voucherCode,
          discountAmount: segment.value,
          discountType: segment.type,
          message: `Chuc mung! Ban da trung thuong ${segment.type === 'percentage' ? segment.value + '%' : segment.value.toLocaleString() + 'd'}!`,
        });
      }
      setSpinning(false);
    }, 4500);
  }, [spinning, rotation, onEnd]);

  const segmentAngle = 360 / SEGMENTS.length;
  const radius = 140;
  const center = 160;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
          <X size={18} />
        </button>
        <h2 className="text-xl font-bold text-text-primary text-center mb-2">Vong Quay May Man</h2>
        <p className="text-sm text-text-secondary text-center mb-6">Quay de trung voucher giam gia ngay!</p>

        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>
          <svg width={320} height={320} viewBox="0 0 320 320"
            style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}
          >
            {SEGMENTS.map((seg, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;
              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);
              const x1 = center + radius * Math.cos(startRad);
              const y1 = center + radius * Math.sin(startRad);
              const x2 = center + radius * Math.cos(endRad);
              const y2 = center + radius * Math.sin(endRad);
              const largeArc = segmentAngle > 180 ? 1 : 0;
              const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
              const textAngle = (startAngle + endAngle) / 2;
              const textRad = (textAngle - 90) * (Math.PI / 180);
              const textR = radius * 0.65;
              const tx = center + textR * Math.cos(textRad);
              const ty = center + textR * Math.sin(textRad);
              return (
                <g key={i}>
                  <path d={path} fill={seg.color} stroke="white" strokeWidth="2" />
                  <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
                    transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                    className="text-white font-bold" fontSize="14" fill="white">{seg.label}</text>
                </g>
              );
            })}
            <circle cx={center} cy={center} r={20} fill="white" stroke="#e5e7eb" strokeWidth="2" />
          </svg>
        </div>

        <button onClick={spin} disabled={spinning}
          className={`w-full py-3 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all ${spinning ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          <RotateCcw size={18} className={spinning ? 'animate-spin' : ''} />
          {spinning ? 'Dang quay...' : 'QUAY NGAY!'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'MG';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}