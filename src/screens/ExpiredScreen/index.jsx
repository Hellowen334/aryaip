/**
 * ExpiredScreen/index.jsx
 * Süresi dolmuş durumda TEK erişilebilir ekran.
 * SideMenu HİÇ render edilmez (App.jsx garantisi).
 * activation-mac-demo skill: sadece bu ekrana route edilir.
 *
 * Props:
 *   mac   string   — cihaz MAC adresi (QR URL için)
 */

import React, { useState } from 'react';
import StatusBanner from '../../components/StatusBanner/StatusBanner';
import PackageGrid from '../../components/PackageGrid/PackageGrid';
import QrCodeBox from '../ActivationScreen/QrCodeBox';
import './expired.css';

export default function ExpiredScreen(props) {
  var mac = props.mac || '';

  var selectedState = useState('12ay');
  var selectedPlan = selectedState[0];
  var setSelectedPlan = selectedState[1];

  var focusedState = useState('12ay');
  var focusedPlan = focusedState[0];
  var setFocusedPlan = focusedState[1];

  function handleSelect(plan) {
    setSelectedPlan(plan);
  }

  function handleFocusChange(plan) {
    setFocusedPlan(plan);
  }

  return (
    <>
      {/* Kalıcı expired banner — üstte sabit */}
      <StatusBanner variant="expired" />

      <div className="expired-screen fade-up">

        {/* Başlık */}
        <div className="expired-screen__header">
          <div className="expired-screen__icon" aria-hidden="true">⏰</div>
          <h1 className="expired-screen__title">Üyeliğinizin Süresi Doldu</h1>
          <p className="expired-screen__subtitle">
            İçeriklere erişmeye devam etmek için aşağıdan bir paket seçin.
            QR kodu tarayarak web sitesinden kolayca yenileyebilirsiniz.
          </p>
        </div>

        <div className="expired-screen__divider" aria-hidden="true" />

        {/* Paket seçimi */}
        <div className="expired-screen__packages">
          <PackageGrid
            featuredPlan="12ay"
            selectedPlan={selectedPlan}
            focusedPlan={focusedPlan}
            onSelect={handleSelect}
            onFocusChange={handleFocusChange}
            onExitLeft={null} /* Kök ekran — sol'a çıkış yok */
          />
        </div>

        {/* Seçili plana göre QR + info */}
        <div className="expired-screen__qr-row">
          <div className="expired-screen__qr-col">
            <QrCodeBox plan={selectedPlan} mac={mac} state="expired" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="expired-screen__plan-label">Seçili Paket</div>
            <div className="expired-screen__plan-value">{selectedPlan}</div>
            <div className="expired-screen__plan-label" style={{ marginTop: '8px' }}>
              QR kodu tarayın veya<br />
              <strong style={{ color: '#8892A4' }}>arya.tv/activate</strong> adresine gidin
            </div>
          </div>
        </div>

        {/* Destek linki */}
        <p className="expired-screen__support">
          Sorun mu yaşıyorsunuz? &nbsp;
          <span>arya.tv/destek</span>
        </p>
      </div>
    </>
  );
}
