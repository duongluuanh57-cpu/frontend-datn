'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Gift, Sparkles, Brain } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string;
  timeEstimate: string;
  index: number;
  playsLeft: number;
  cooldown: number;
  onPlay: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  wheel: <Gamepad2 size={28} className="text-white" />,
  scratch: <Gift size={28} className="text-white" />,
  dice: <Sparkles size={28} className="text-white" />,
  quiz: <Brain size={28} className="text-white" />,
};

export function GameCard({
  id,
  title,
  description,
  icon,
  gradient,
  timeEstimate,
  index,
  playsLeft,
  cooldown,
  onPlay,
}: GameCardProps) {
  const isDisabled = playsLeft <= 0 || cooldown > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Gradient header */}
      <div className={`h-32 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
        <div className="relative z-10 w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
          {iconMap[icon] || <Gamepad2 size={28} className="text-white" />}
        </div>
        <span className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
          {timeEstimate}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-text-primary mb-1.5">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">{description}</p>

        <button
          onClick={onPlay}
          disabled={isDisabled}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${isDisabled
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r ' + gradient + ' text-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'
            }`}
        >
          {isDisabled ? (
            <>
              <Clock size={16} />
              {cooldown > 0 ? `Cho ${cooldown}s` : 'Het luot choi'}
            </>
          ) : (
            <>
              <Gamepad2 size={16} />
              Choi ngay
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function Clock(props: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
