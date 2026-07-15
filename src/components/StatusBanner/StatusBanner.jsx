/**
 * StatusBanner.jsx
 * Kalıcı üst uyarı şeridi — kapatılamaz (premium-subscription skill kuralı).
 *
 * Props:
 *   variant     'grace' | 'expired'
 *   hoursLeft   number  — grace variant'ında kalan saat
 */

import React from 'react';
import './StatusBanner.scss';

export default function StatusBanner(props) {
  var variant = props.variant || 'grace';
  var hoursLeft = props.hoursLeft || 0;

  var icon = variant === 'expired' ? '🔒' : '⚠️';

  return (
    <div
      className={'status-banner status-banner--' + variant}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="status-banner__icon" aria-hidden="true">{icon}</span>

      {variant === 'grace' && (
        <div className="status-banner__text">
          <span>Üyeliğiniz sona erdi</span>
          <span className="status-banner__separator">·</span>
          <span className="status-banner__highlight">
            {hoursLeft > 0 ? hoursLeft + ' saat içinde yenileyin' : 'Süre dolmak üzere'}
          </span>
          <span className="status-banner__separator">·</span>
          <span>Filmler ve Diziler kısıtlandı</span>
        </div>
      )}

      {variant === 'expired' && (
        <div className="status-banner__text">
          <span>Erişiminiz kısıtlandı</span>
          <span className="status-banner__separator">·</span>
          <span>Devam etmek için bir paket seçin</span>
        </div>
      )}
    </div>
  );
}
