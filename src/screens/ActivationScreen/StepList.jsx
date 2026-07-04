/**
 * StepList.jsx
 * Numaralı talimat adımları (1-2-3).
 * State'e göre hangi adımın vurgulandığını gösterir.
 */

import React from 'react';

const STEPS = [
  {
    num: 1,
    text: (
      <>
        <strong>Web sitesini aç:</strong> arya.tv/activate
      </>
    ),
  },
  {
    num: 2,
    text: (
      <>
        <strong>Cihaz kodunu gir</strong> — yukarıdaki kodu aynen yaz
      </>
    ),
  },
  {
    num: 3,
    text: (
      <>
        <strong>Listeni yükle</strong> ve aktivasyonu tamamla
      </>
    ),
  },
];

export default function StepList() {
  return (
    <div className="step-list">
      <p className="step-list__title">Nasıl Aktifleştirilir?</p>
      {STEPS.map((step) => (
        <div key={step.num} className="step-item">
          <span className="step-item__num">{step.num}</span>
          <p className="step-item__text">{step.text}</p>
        </div>
      ))}
    </div>
  );
}
