/**
 * CurrentPlanCard.jsx
 * Mevcut plan bilgisi: paket adı, kalan gün, progress bar, durum badge'i.
 *
 * Props:
 *   plan      'demo' | '3ay' | '6ay' | '12ay'
 *   daysLeft  number
 *   status    'active' | 'grace'
 */

import React from 'react';

var PLAN_LABELS = {
  demo:  'Demo',
  '3ay': '3 Aylık',
  '6ay': '6 Aylık',
  '12ay': '12 Aylık',
};

var PLAN_TOTAL_DAYS = {
  demo:  7,
  '3ay': 90,
  '6ay': 180,
  '12ay': 365,
};

export default function CurrentPlanCard(props) {
  var plan     = props.plan || 'demo';
  var daysLeft = props.daysLeft || 0;
  var status   = props.status || 'active';

  var planLabel   = PLAN_LABELS[plan] || plan;
  var totalDays   = PLAN_TOTAL_DAYS[plan] || 30;
  var usedDays    = Math.max(0, totalDays - daysLeft);
  var progressPct = Math.min(100, Math.round((usedDays / totalDays) * 100));

  var statusLabel   = status === 'grace' ? '⚠ Grace Dönemi' : '✓ Aktif';
  var statusClass   = 'current-plan-card__status current-plan-card__status--' + status;

  return (
    <div className="current-plan-card">
      <div className="current-plan-card__header">
        <div>
          <div className="current-plan-card__label">Mevcut Paket</div>
          <div className="current-plan-card__name">{planLabel} Üyelik</div>
        </div>
        <div className={statusClass}>{statusLabel}</div>
      </div>

      {/* Kalan gün */}
      <div className="current-plan-card__days">
        <strong>{daysLeft}</strong> gün kaldı
        <span style={{ marginLeft: '8px', opacity: 0.5 }}>({usedDays} / {totalDays} gün kullanıldı)</span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" aria-label={'Kullanım: ' + progressPct + '%'}>
        <div
          className="progress-bar__fill"
          style={{ width: progressPct + '%' }}
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
