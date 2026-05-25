'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from '@/navigation';
import { pingBackend } from '@/lib/api';
import { PixelRunner } from '@/components/game/PixelRunner';
import { RefreshCw, Home, Gamepad2 } from 'lucide-react';
import './backend-warmup-legacy.css';

export function BackendWarmupLegacy() {
  const params = useParams();
  const rawPathname = usePathname();
  const locale = (params?.locale as string) || 'vi';

  const [mounted, setMounted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const statusText = useMemo(() => {
    const texts = {
      vi: [
        { threshold: 20, text: 'Đang khởi tạo thế giới pixel...' },
        { threshold: 40, text: 'Đang nạp đồ họa 8-bit...' },
        { threshold: 60, text: 'Đang kết nối máy chủ...' },
        { threshold: 80, text: 'Sắp xong rồi...' },
        { threshold: 95, text: 'Hoàn thiện...' },
        { threshold: 100, text: 'Sẵn sàng!' },
      ],
      en: [
        { threshold: 20, text: 'Initializing pixel world...' },
        { threshold: 40, text: 'Loading 8-bit graphics...' },
        { threshold: 60, text: 'Connecting to server...' },
        { threshold: 80, text: 'Almost there...' },
        { threshold: 95, text: 'Finishing up...' },
        { threshold: 100, text: 'Ready!' },
      ],
    };
    const currentLocale = locale === 'en' ? 'en' : 'vi';
    const list = texts[currentLocale];
    return list.find((item) => percentage <= item.threshold)?.text || list[list.length - 1].text;
  }, [percentage, locale]);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [errorGrace, setErrorGrace] = useState(false);
  const [warmupDone, setWarmupDone] = useState(false);

  const percentageRef = useRef(0);
  const isPreloaderFadingOutRef = useRef(false);
  const backendReadyRef = useRef(false);
  const warmupDoneRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const hasShown = sessionStorage.getItem('preloader_shown');
    const isHomepage = rawPathname === '/';

    if (!hasShown && isHomepage) {
      setShowPreloader(true);
      document.body.style.overflow = 'hidden';
      document.body.style.opacity = '1';
    } else {
      document.body.style.opacity = '1';
      void pingBackend();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [rawPathname]);

  useEffect(() => {
    if (!showPreloader || !mounted) return;

    let animationFrameId: number;
    let pollAttempts = 0;
    const MAX_POLL_ATTEMPTS = 12;

    const pollBackend = async () => {
      pollAttempts++;
      const ok = await pingBackend();
      if (ok) {
        clearInterval(pollInterval);
        setTimeout(() => {
          backendReadyRef.current = true;
        }, 800);
      } else if (pollAttempts >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollInterval);
        setTimeout(() => {
          backendReadyRef.current = true;
        }, 500);
      }
    };

    void pollBackend();
    const pollInterval = setInterval(pollBackend, 5000);

    const fallbackTimeout = setTimeout(() => {
      setErrorGrace(true);
    }, 15000);

    const updateProgress = () => {
      const currentVal = percentageRef.current;

      if (currentVal >= 100) {
        if (!isPreloaderFadingOutRef.current) {
          isPreloaderFadingOutRef.current = true;
          warmupDoneRef.current = true;
          setWarmupDone(true);
        }
        return;
      }

      let increment = 0;

      if (backendReadyRef.current) {
        increment = 1.2;
      } else {
        if (currentVal < 30) {
          increment = 0.8;
        } else if (currentVal < 60) {
          increment = 0.4;
        } else if (currentVal < 88) {
          increment = 0.15;
        } else {
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
  }, [showPreloader, mounted]);

  const handleGoHome = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowPreloader(false);
      sessionStorage.setItem('preloader_shown', 'true');
      document.body.style.overflow = '';
    }, 500);
  };

  const handleKeepPlaying = () => {
    setWarmupDone(false);
    warmupDoneRef.current = false;
    isPreloaderFadingOutRef.current = false;
    percentageRef.current = 99;
    setPercentage(99);
    backendReadyRef.current = true;
  };

  const handleSkip = () => {
    backendReadyRef.current = true;
    percentageRef.current = 100;
    setPercentage(100);
    setWarmupDone(true);
    warmupDoneRef.current = true;
    isPreloaderFadingOutRef.current = true;
  };

  if (!mounted) return null;
  if (!showPreloader) return null;

  return (
    <div className={`warmup-overlay ${isFadingOut ? 'is-fading-out' : 'is-visible'}`}>
      <PixelRunner />

      <div className="warmup-content">
        {!warmupDone ? (
          <>
            <h1 className="warmup-title">
              {locale === 'en' ? 'LOADING...' : 'ĐANG TẢI...'}
            </h1>
            <div className="warmup-subtitle">
              {locale === 'en' ? 'pixel warmup' : 'khởi động pixel'}
            </div>

            <div className="warmup-percentage-display">
              {percentage}
              <span className="warmup-percentage-symbol">%</span>
            </div>

            <div className="warmup-progress-track">
              <div
                className="warmup-progress-fill"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>

            <div className="warmup-status-text">
              <span>{statusText}</span>
            </div>

            {errorGrace && (
              <button onClick={handleSkip} className="warmup-fallback-btn">
                <RefreshCw size={12} />
                {locale === 'en' ? 'Skip & Explore' : 'Bỏ qua & Khám phá'}
              </button>
            )}
          </>
        ) : (
          <div className="warmup-done">
            <div className="warmup-done-icon">&#9733;</div>
            <h2 className="warmup-done-title">
              {locale === 'en' ? 'Backend Ready!' : 'Backend đã sẵn sàng!'}
            </h2>
            <div className="warmup-done-actions">
              <button onClick={handleGoHome} className="warmup-done-btn warmup-done-btn-primary">
                <Home size={14} />
                {locale === 'en' ? 'Home' : 'Về trang chủ'}
              </button>
              <button onClick={handleKeepPlaying} className="warmup-done-btn warmup-done-btn-secondary">
                <Gamepad2 size={14} />
                {locale === 'en' ? 'Keep Playing' : 'Chơi tiếp'}
              </button>
            </div>
            <p className="warmup-wasd-hint">
              W A S D &mdash; {locale === 'en' ? 'move' : 'di chuyển'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
