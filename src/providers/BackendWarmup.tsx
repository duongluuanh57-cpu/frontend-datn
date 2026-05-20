'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from '@/navigation';
import { pingBackend } from '@/lib/api';
import { Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

/**
 * Preloader and Warmup provider:
 * 1. Checks if it's the first time visiting the Homepage (/) in this session.
 * 2. If yes, displays a luxurious glassmorphic overlay.
 * 3. Simulates load progress (0% -> 100%) in real-time syncing with backend API wake-up status.
 * 4. Pings backend (GET /ping) every 2 seconds to check if active.
 * 5. Speeds up progress to 100% and smoothly fades out when backend is active.
 * 6. Graceful escape fallback button after 3 seconds if backend has issues waking up.
 */
export function BackendWarmup() {
  const params = useParams();
  const rawPathname = usePathname();
  const locale = (params?.locale as string) || 'vi';

  const [mounted, setMounted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [errorGrace, setErrorGrace] = useState(false);

  const percentageRef = useRef(0);
  const isPreloaderFadingOutRef = useRef(false);
  // Use a ref for backendReady so the animation loop always reads the latest
  // value without needing to restart (avoids spawning duplicate RAF loops).
  const backendReadyRef = useRef(false);

  // Status updates based on percentage & language
  useEffect(() => {
    if (!mounted) return;

    const texts = {
      vi: [
        { threshold: 20, text: "Đang tải không gian..." },
        { threshold: 40, text: "Đang chọn lọc nốt hương..." },
        { threshold: 60, text: "Đang kết hợp tinh dầu..." },
        { threshold: 80, text: "Chuẩn bị không gian L'essence..." },
        { threshold: 95, text: "Sẵn sàng..." },
        { threshold: 100, text: "Chào mừng bạn!" }
      ],
      en: [
        { threshold: 20, text: "Loading space..." },
        { threshold: 40, text: "Revealing scent notes..." },
        { threshold: 60, text: "Mixing essences..." },
        { threshold: 80, text: "Preparing L'essence..." },
        { threshold: 95, text: "Finishing up..." },
        { threshold: 100, text: "Welcome!" }
      ],
    };

    const currentLocale = locale === 'en' ? 'en' : 'vi';
    const list = texts[currentLocale];
    const match = list.find((item) => percentage <= item.threshold) || list[list.length - 1];
    setStatusText(match.text);
  }, [percentage, locale, mounted]);

  // Handle client-side mount & determine preloader state
  useEffect(() => {
    setMounted(true);

    const hasShown = sessionStorage.getItem('preloader_shown');
    // Only show preloader on the Homepage on initial session landing
    const isHomepage = rawPathname === '/';

    if (!hasShown && isHomepage) {
      setShowPreloader(true);
      // Disable scroll while preloader is active
      document.body.style.overflow = 'hidden';
      document.body.style.opacity = '1'; // Show body after preloader is ready
    } else {
      // If preloader not showing, still trigger backend warmup in background
      document.body.style.opacity = '1'; // Show body immediately
      void pingBackend();
    }

    return () => {
      // Re-enable scroll when component unmounts
      document.body.style.overflow = '';
    };
  }, [rawPathname]);

  // Main loader simulation and polling loop
  useEffect(() => {
    if (!showPreloader || !mounted) return;

    let pollInterval: NodeJS.Timeout;
    let animationFrameId: number;
    let fallbackTimeout: NodeJS.Timeout;

    // 1. Polling the backend (GET /ping)
    const pollBackend = async () => {
      const ok = await pingBackend();
      if (ok) {
        backendReadyRef.current = true;
        clearInterval(pollInterval);
      }
    };

    // Immediate check, then poll every 2 seconds
    void pollBackend();
    pollInterval = setInterval(pollBackend, 2000);

    // 2. Fallback grace button after 3s in case backend fails or takes too long to wake up
    fallbackTimeout = setTimeout(() => {
      setErrorGrace(true);
    }, 3000);

    // 3. Smooth percentage increment loop
    const updateProgress = () => {
      const currentVal = percentageRef.current;

      if (currentVal >= 100) {
        // Complete! Wait a moment, then fade out
        if (!isPreloaderFadingOutRef.current) {
          isPreloaderFadingOutRef.current = true;
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              setShowPreloader(false);
              sessionStorage.setItem('preloader_shown', 'true');
              document.body.style.overflow = '';
            }, 500); // match CSS fade-out transition duration (duration-500)
          }, 300); // hold at 100% for snappy yet smooth transition
        }
        return;
      }

      let increment = 0;

      if (backendReadyRef.current) {
        // Backend is awake — accelerate to 100% but cap at a sane speed
        // so the user can see the transition instead of skipping instantly.
        increment = 1.2;
      } else {
        // Simulated progress — slow crawl while waiting for backend
        if (currentVal < 30) {
          increment = 0.8;
        } else if (currentVal < 60) {
          increment = 0.4;
        } else if (currentVal < 88) {
          increment = 0.15;
        } else {
          // Creep very slowly at the end while waiting for backend response
          increment = 0.02;
        }
      }

      const nextVal = Math.min(100, currentVal + increment);
      percentageRef.current = nextVal;
      setPercentage(Math.floor(nextVal));

      animationFrameId = requestAnimationFrame(updateProgress);
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(fallbackTimeout);
      cancelAnimationFrame(animationFrameId);
    };
  // NOTE: backendReadyRef is intentionally NOT in the dep array —
  // we read its .current inside the loop without needing to restart the effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPreloader, mounted]);

  const handleSkip = () => {
    backendReadyRef.current = true;
    // Artificially boost loading to 100% to let user explore immediately
    percentageRef.current = 100;
    setPercentage(100);
  };

  if (!mounted) return null;
  if (!showPreloader) return null;

  return (
    <div
      className={`fixed inset-0 w-screen h-screen flex flex-col items-center justify-center z-[99999] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isFadingOut ? 'opacity-0 scale-[1.05] blur-[15px] pointer-events-none' : 'opacity-100 scale-100 blur-0'
        }`}
      style={{
        background: 'radial-gradient(circle at center, var(--color-background) 40%, var(--color-border) 100%)'
      }}
    >
      <style>{`
        /* Keep only complex core keyframe animations */
        .animate-drift1 {
          background: radial-gradient(circle, var(--color-primary) 0%, transparent 70%);
          animation: drift1 25s infinite alternate ease-in-out;
        }
        .animate-drift2 {
          background: radial-gradient(circle, var(--color-secondary) 0%, transparent 70%);
          animation: drift2 30s infinite alternate ease-in-out;
        }
        .animate-drift3 {
          background: radial-gradient(circle, var(--color-accent) 0%, transparent 70%);
          animation: drift3 20s infinite alternate ease-in-out;
        }

        @keyframes drift1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(8vw, 6vh) scale(1.15); }
        }
        @keyframes drift2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-6vw, -8vh) scale(1.1); }
        }
        @keyframes drift3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.12; }
          100% { transform: translate(4vw, -4vh) scale(0.95); opacity: 0.22; }
        }

        .animate-float-bottle {
          filter: drop-shadow(0 0 15px rgba(236, 72, 153, 0.12));
          animation: floatBottle 4s infinite ease-in-out;
        }

        @keyframes floatBottle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }

        @keyframes floatUp1 {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateY(-65px) scale(1.1); opacity: 0; }
        }
        @keyframes floatUp2 {
          0% { transform: translateY(0) scale(0.7); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(-55px) scale(1.2); opacity: 0; }
        }
        @keyframes floatUp3 {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateY(-45px) scale(1); opacity: 0; }
        }

        .bubble-1 { animation: floatUp1 3.2s infinite linear; animation-delay: 0.2s; }
        .bubble-2 { animation: floatUp2 2.6s infinite linear; animation-delay: 1.0s; }
        .bubble-3 { animation: floatUp3 3.8s infinite linear; animation-delay: 0.5s; }
        .bubble-4 { animation: floatUp1 2.9s infinite linear; animation-delay: 1.7s; }
        .bubble-5 { animation: floatUp2 3.4s infinite linear; animation-delay: 0.8s; }

        .shimmer-sweep {
          animation: shimmer 3s infinite linear;
        }

        @keyframes shimmer {
          0% { transform: skewX(-20deg) translate(-100px, 0); }
          100% { transform: skewX(-20deg) translate(150px, 0); }
        }

        .animate-title-glow {
          animation: titleGlow 4s infinite alternate ease-in-out;
        }

        @keyframes titleGlow {
          0% { filter: drop-shadow(0 2px 8px rgba(236, 72, 153, 0.12)); }
          100% { filter: drop-shadow(0 2px 22px rgba(236, 72, 153, 0.3)); }
        }

        .animate-button-fade-in {
          animation: buttonFadeIn 0.5s ease forwards;
        }

        @keyframes buttonFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Luxury Ambient Orbs using Tailwind and Custom Animations */}
      <div className="absolute rounded-full pointer-events-none opacity-15 blur-[130px] top-[-10%] left-[-10%] w-[50vw] h-[50vw] animate-drift1"></div>
      <div className="absolute rounded-full pointer-events-none opacity-15 blur-[130px] bottom-[-15%] right-[-10%] w-[60vw] h-[60vw] animate-drift2"></div>
      <div className="absolute rounded-full pointer-events-none opacity-15 blur-[130px] top-[30%] left-[20%] w-[45vw] h-[45vw] animate-drift3"></div>

      {/* Immersive Full-Page Content Wrapper */}
      <div className="flex flex-col items-center justify-center z-10 w-full max-w-[600px] text-center relative px-6">

        {/* Luxury animated perfume bottle SVG */}
        <svg width="100" height="150" viewBox="0 0 100 150" className="animate-float-bottle">
          <defs>
            <linearGradient id="liquidGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.85" />
              <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <clipPath id="bottleInside">
              <path d="M25,45 C25,45 20,50 20,60 L20,130 C20,135 25,140 30,140 L70,140 C75,140 80,135 80,130 L80,60 C80,50 75,45 75,45 Z" />
            </clipPath>
          </defs>

          {/* Spray Nozzle and Cap (Gold) */}
          <rect x="42" y="10" width="16" height="15" rx="2" fill="#d4af37" />
          <rect x="46" y="25" width="8" height="10" fill="#c59b27" />
          <ellipse cx="50" cy="10" rx="6" ry="3" fill="#f3e5ab" />
          <circle cx="50" cy="18" r="2" fill="#ffffff" opacity="0.6" />

          {/* Collar */}
          <rect x="35" y="35" width="30" height="8" rx="1" fill="#d4af37" />
          <line x1="35" y1="39" x2="65" y2="39" stroke="#f3e5ab" strokeWidth="1" />

          {/* Outer Outline */}
          <path d="M25,45 C25,45 20,50 20,60 L20,130 C20,135 25,140 30,140 L70,140 C75,140 80,135 80,130 L80,60 C80,50 75,45 75,45 Z"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            fill="rgba(255, 255, 255, 0.2)"
            style={{ opacity: 0.6 }} />

          {/* Liquid inside (Clipped) */}
          <g clipPath="url(#bottleInside)">
            {/* Liquid rect height varies with percentage */}
            <rect
              x="10"
              y={145 - (percentage / 100) * 105}
              width="80"
              height="110"
              fill="url(#liquidGrad)"
              style={{ transition: 'y 0.2s ease-out' }}
            />

            {/* Perfume bubbles floating inside liquid */}
            {percentage > 10 && (
              <>
                <circle cx="35" cy="130" r="2" fill="#ffffff" opacity="0.5" className="bubble-1" />
                <circle cx="65" cy="120" r="1.5" fill="#ffffff" opacity="0.6" className="bubble-2" />
                <circle cx="45" cy="110" r="2" fill="#ffffff" opacity="0.4" className="bubble-3" />
                <circle cx="55" cy="125" r="2.5" fill="#ffffff" opacity="0.5" className="bubble-4" />
                <circle cx="28" cy="115" r="1.5" fill="#ffffff" opacity="0.6" className="bubble-5" />
              </>
            )}

            {/* Light shine overlay sweep */}
            <rect x="0" y="40" width="100" height="110" fill="url(#shimmerGrad)" className="shimmer-sweep" />
          </g>

          {/* Elegant minimalist L'essence emblem on the glass */}
          <rect x="36" y="80" width="28" height="20" rx="1" fill="rgba(255, 255, 255, 0.95)" stroke="var(--color-border)" strokeWidth="0.75" />
          <text x="50" y="92" fill="var(--color-foreground)" fontSize="7" fontWeight="bold" textAnchor="middle" letterSpacing="1.2" fontFamily="var(--font-heading), serif">L'E</text>
        </svg>

        {/* Title & Brand */}
        <h1 className="font-heading font-light text-[2.6rem] tracking-[0.16em] uppercase mt-6 mb-1 bg-clip-text text-transparent bg-gradient-to-br from-[var(--color-foreground)] via-[var(--color-primary)] to-[var(--color-accent)] drop-shadow-[0_2px_8px_rgba(236,72,153,0.12)] animate-title-glow">
          L'essence
        </h1>
        <div className="text-[0.85rem] text-[var(--color-primary)] tracking-[0.25em] uppercase mb-6 font-normal opacity-85">
          haute parfumerie
        </div>

        {/* Percentage Counter */}
        <div className="text-[2.2rem] font-extralight font-sans text-[var(--color-foreground)] tracking-[-0.02em] mb-3 flex items-center justify-center gap-1 drop-shadow-[0_0_10px_rgba(236,72,153,0.12)]">
          {percentage}
          <span className="text-[1.1rem] text-[var(--color-primary)] self-start mt-1 opacity-85">%</span>
        </div>

        {/* Loading track & progress fill */}
        <div className="w-[280px] h-[4px] bg-[var(--color-primary)]/10 rounded-full overflow-hidden relative shadow-[inset_0_1px_2px_rgba(131,24,67,0.05)] mb-5">
          <div
            className="h-full bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-accent)] shadow-[0_0_12px_rgba(236,72,153,0.45)] rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        {/* Smooth descriptive message */}
        <div className="text-[0.9rem] text-[var(--color-foreground)] h-6 flex items-center justify-center gap-2 font-light transition-all duration-300 opacity-85">
          {percentage === 100 ? (
            <CheckCircle2 size={16} className="text-primary animate-pulse" style={{ color: 'var(--color-primary)' }} />
          ) : (
            <Sparkles size={14} className="text-accent animate-spin" style={{ color: 'var(--color-primary)', animationDuration: '3s' }} />
          )}
          <span>{statusText}</span>
        </div>

        {/* Fallback Grace Option (if backend is slow) */}
        {errorGrace && (
          <button
            onClick={handleSkip}
            className="mt-6 px-6 py-2.5 rounded-full border border-[var(--color-border)] bg-white/60 text-[var(--color-foreground)] text-[0.82rem] font-medium tracking-[0.06em] cursor-pointer transition-all duration-300 hover:bg-[var(--color-primary)]/5 hover:border-[var(--color-primary)] hover:shadow-[0_0_18px_rgba(236,72,153,0.2)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 z-[100] animate-button-fade-in"
          >
            <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
            {locale === 'en' ? 'Skip & Explore' : 'Bỏ qua & Khám phá'}
          </button>
        )}
      </div>
    </div>
  );
}
