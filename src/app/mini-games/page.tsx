'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Gift, Sparkles, Clock, Trophy } from 'lucide-react';
import { GameCard } from '@/components/mini-games/game-card';
import { WheelOfFortune } from '@/components/mini-games/wheel-of-fortune';
import { GameResultModal } from '@/components/mini-games/game-result-modal';

export interface GameResult {
  won: boolean;
  voucherCode?: string;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  message: string;
}

type GameType = 'wheel' | 'scratch' | 'dice' | 'quiz';

export default function MiniGamesPage() {
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [playsLeft, setPlaysLeft] = useState(3);
  const [cooldown, setCooldown] = useState(0);

  const games = [
    {
      id: 'wheel' as GameType,
      title: 'Vòng Quay May Mắn',
      description: 'Quay số trúng ngay voucher giảm giá lên đến 20%',
      icon: 'wheel',
      gradient: 'from-amber-400 to-orange-500',
      timeEstimate: '10 giây',
    },
    {
      id: 'scratch' as GameType,
      title: 'Thẻ Cào Trúng Thưởng',
      description: 'Cào lớp phủ bạc để khám phá phần thưởng bên trong',
      icon: 'scratch',
      gradient: 'from-rose-400 to-pink-500',
      timeEstimate: '15 giây',
    },
    {
      id: 'dice' as GameType,
      title: 'Xúc Xắc May Mắn',
      description: 'Lắc xúc xắc và nhân đôi phần thưởng với điểm số cao',
      icon: 'dice',
      gradient: 'from-violet-400 to-purple-500',
      timeEstimate: '5 giây',
    },
    {
      id: 'quiz' as GameType,
      title: 'Đố Vui Nước Hoa',
      description: 'Trả lời đúng 4/5 câu hỏi về nước hoa để nhận voucher',
      icon: 'quiz',
      gradient: 'from-emerald-400 to-teal-500',
      timeEstimate: '2 phút',
    },
  ];

  const handlePlay = useCallback((gameId: GameType) => {
    if (playsLeft <= 0 || cooldown > 0) return;
    setActiveGame(gameId);
  }, [playsLeft, cooldown]);

  const handleGameEnd = useCallback((gameResult: GameResult) => {
    setActiveGame(null);
    setResult(gameResult);
    setPlaysLeft((prev) => Math.max(0, prev - 1));
    setCooldown(60);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleCloseResult = useCallback(() => setResult(null), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-surface to-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary-light/5 to-background py-12 md:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-300/10 rounded-full blur-3xl" />
        </div>
        <div className="section-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-2xl mb-6">
              <Gamepad2 size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">Mini Games</h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
              Chơi game thử vận may - nhận ngay voucher ưu đãi cho đơn hàng tiếp theo của bạn!
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-text-secondary">
                <Trophy size={18} className="text-primary" />
                <span className="text-sm">
                  Còn <strong className="text-text-primary">{playsLeft}</strong> lượt chơi
                </span>
              </div>
              {cooldown > 0 && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock size={18} className="text-amber-500" />
                  <span className="text-sm">
                    Chờ <strong className="text-amber-500">{cooldown}s</strong>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Game Grid */}
      <section className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {games.map((game, i) => (
            <GameCard
              key={game.id}
              {...game}
              index={i}
              playsLeft={playsLeft}
              cooldown={cooldown}
              onPlay={() => handlePlay(game.id)}
            />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface/50 border-y border-border py-12 mb-12">
        <div className="section-container">
          <h2 className="text-xl font-semibold text-text-primary text-center mb-8">
            Cách thức hoạt động
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: '01', title: 'Chọn game', desc: 'Chọn 1 trong 4 mini game yêu thích', icon: Gamepad2 },
              { step: '02', title: 'Chơi & thắng', desc: 'Hoàn thành thử thách và nhận voucher', icon: Sparkles },
              { step: '03', title: 'Áp dụng ngay', desc: 'Dùng mã voucher khi thanh toán để giảm giá', icon: Gift },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon size={20} className="text-primary" />
                </div>
                <div className="text-sm font-bold text-primary mb-1">Bước {item.step}</div>
                <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modals */}
      <AnimatePresence>
        {activeGame === 'wheel' && (
          <WheelOfFortune onEnd={handleGameEnd} onClose={() => setActiveGame(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {result && <GameResultModal result={result} onClose={handleCloseResult} />}
      </AnimatePresence>
    </div>
  );
}
