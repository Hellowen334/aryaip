/**
 * PackageCard.jsx
 * Ortak paket kartı — RestrictedAccessScreen, ExpiredScreen, MembershipScreen'de reuse.
 *
 * premium-subscription skill kuralları:
 *   ✅ Sadece süre gösterilir (3/6/12 Ay) — fiyat YOK
 *   ✅ "Fiyat için web sitesini ziyaret edin" notu
 *   ✅ 12ay kartı default featured: "En Avantajlı" rozeti
 *   ✅ data-focusable="true" (remote-focus-nav)
 *
 * Props:
 *   plan      '3ay' | '6ay' | '12ay'
 *   featured  boolean   — "En Avantajlı" rozetini göster
 *   selected  boolean   — seçili kart (QR güncellendi)
 *   focused   boolean   — FocusManager'dan gelen fokus state'i (data-focused)
 *   onSelect  (plan) => void
 */

import React from 'react';
import './PackageCard.css';

// Kart yapılandırması
var CARD_CONFIG = {
  '3ay':  { duration: '3',  unit: 'Ay',  label: '3 Aylık Paket' },
  '6ay':  { duration: '6',  unit: 'Ay',  label: '6 Aylık Paket' },
  '12ay': { duration: '12', unit: 'Ay',  label: '12 Aylık Paket' },
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export default function PackageCard(props) {
  var plan = props.plan;
  var featured = props.featured || false;
  var selected = props.selected || false;
  var focused = props.focused || false;
  var onSelect = props.onSelect;

  var config = CARD_CONFIG[plan];
  if (!config) return null;

  var classNames = ['package-card'];
  if (featured) classNames.push('package-card--featured');
  if (selected) classNames.push('package-card--selected');

  function handleClick() {
    if (onSelect) onSelect(plan);
  }

  function handleKeyDown(e) {
    // Enter / OK (13) ile seçim
    if (e.keyCode === 13) {
      e.preventDefault();
      if (onSelect) onSelect(plan);
    }
  }

  return (
    <div
      className={classNames.join(' ')}
      data-focusable="true"
      data-focused={focused ? 'true' : undefined}
      data-plan={plan}
      role="button"
      tabIndex={0}
      aria-label={config.label + (selected ? ', seçili' : '') + (featured ? ', en avantajlı' : '')}
      aria-pressed={selected}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* "En Avantajlı" rozeti */}
      {featured && (
        <span className="package-card__badge" aria-hidden="true">
          En Avantajlı
        </span>
      )}

      {/* Süre */}
      <div className="package-card__duration" aria-hidden="true">
        {config.duration}
      </div>
      <div className="package-card__unit" aria-hidden="true">
        {config.unit}
      </div>

      <div className="package-card__divider" aria-hidden="true" />

      {/* Web sitesi notu — fiyat YOK */}
      <p className="package-card__cta">
        Fiyat ve kampanyalar için<br />
        <strong>arya.tv/activate</strong>
      </p>

      {/* Seçim göstergesi */}
      <div className="package-card__check" aria-hidden="true">
        <CheckIcon />
      </div>
    </div>
  );
}
