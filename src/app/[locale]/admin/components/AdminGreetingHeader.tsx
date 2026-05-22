'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function AdminGreetingHeader() {
  const t = useTranslations('Admin.dashboard');
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) {
    return (
      <div className="admin-page-header__greeting">
        <h1 className="admin-page-header__title">{t('greeting', { timeOfDay: '...' })}</h1>
        <p className="admin-page-header__clock">--:--:--</p>
      </div>
    );
  }

  const hour = now.getHours();
  let timeOfDayKey = 'morning';
  if (hour >= 11 && hour < 13) timeOfDayKey = 'noon';
  else if (hour >= 13 && hour < 18) timeOfDayKey = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDayKey = 'evening';
  else if (hour >= 22 || hour < 5) timeOfDayKey = 'night';

  const timeText = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const dateText = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="admin-page-header__greeting">
      <h1 className="admin-page-header__title">
        {t('greeting', { timeOfDay: t(`timeOfDay.${timeOfDayKey}`) })}
      </h1>
      <p className="admin-page-header__clock" aria-live="polite">
        {timeText}
      </p>
      <p className="admin-page-header__date">{dateText}</p>
    </div>
  );
}
