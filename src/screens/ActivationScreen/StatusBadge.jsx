/**
 * StatusBadge.jsx
 * Aktivasyon state'ine göre ikon + metin rozeti.
 * 4 state: loading, pending, active, expired
 */

import React from 'react';

function SpinnerIcon() {
  return <span className="spinner" aria-hidden="true" />;
}

function ClockIcon() {
  return (
    <svg className="status-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="status-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="status-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const BADGE_CONFIG = {
  loading: {
    modifier: 'loading',
    icon: SpinnerIcon,
    label: 'Kontrol ediliyor…',
  },
  pending: {
    modifier: 'pending',
    icon: ClockIcon,
    label: 'Aktivasyon bekleniyor',
  },
  active: {
    modifier: 'active',
    icon: CheckIcon,
    label: null, // daysLeft ile dinamik
  },
  expired: {
    modifier: 'expired',
    icon: WarningIcon,
    label: 'Süre Doldu',
  },
};

export default function StatusBadge({ state, daysLeft }) {
  const config = BADGE_CONFIG[state] ?? BADGE_CONFIG.loading;
  const Icon = config.icon;

  let label = config.label;
  if (state === 'active') {
    label = daysLeft > 0
      ? `Demo Aktif · ${daysLeft} gün kaldı`
      : 'Demo Aktif';
  }

  return (
    <div
      className={`status-badge status-badge--${config.modifier}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Icon />
      <span>{label}</span>
    </div>
  );
}
