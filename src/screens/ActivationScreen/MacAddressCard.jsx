/**
 * MacAddressCard.jsx
 * MAC adresini büyük monospace yazıyla gösterir.
 * Yükleme sırasında pulse animasyonu gösterir.
 */

import React from 'react';

export default function MacAddressCard({ mac, isLoading }) {
  return (
    <div className="mac-card">
      <p className="mac-card__label">Cihaz Kodu</p>
      <p className={`mac-card__value${isLoading ? ' mac-card__value--loading' : ''}`}>
        {isLoading || !mac ? 'XX:XX:XX:XX:XX:XX' : mac}
      </p>
    </div>
  );
}
