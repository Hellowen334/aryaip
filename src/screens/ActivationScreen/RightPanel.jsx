/**
 * RightPanel.jsx
 * Sağ panel: QrCodeBox, URL gösterimi, ActionArea
 */

import React from 'react';
import QrCodeBox from './QrCodeBox';
import ActionArea from './ActionArea';

export default function RightPanel({ state, onRefresh, onStart, onReactivate, error, focusedId }) {
  return (
    <div className="right-panel">
      {/* QR Kodu */}
      <QrCodeBox state={state} />

      {/* URL kutusu */}
      <div className="url-display" aria-label="Aktivasyon web sitesi">
        arya.tv/activate
      </div>

      {/* Aksiyon butonu */}
      <ActionArea
        state={state}
        onRefresh={onRefresh}
        onStart={onStart}
        onReactivate={onReactivate}
        error={error}
        focusedId={focusedId}
      />
    </div>
  );
}
