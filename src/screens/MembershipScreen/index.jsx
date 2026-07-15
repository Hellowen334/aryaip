/**
 * MembershipScreen/index.jsx
 * Üyelik ekranı — her zaman erişilebilir (active ve grace'te).
 * CurrentPlanCard + erken yenileme PackageGrid + ActivationInfo (MAC referans).
 *
 * Props:
 *   mac               string
 *   plan              'demo' | '3ay' | '6ay' | '12ay'
 *   daysLeft          number
 *   activationState   'active' | 'grace'
 *   isContentFocused  boolean
 *   onExitLeft        () => void
 */

import React, { useState } from 'react';
import CurrentPlanCard from './CurrentPlanCard';
import ActivationInfo from './ActivationInfo';
import PackageGrid from '../../components/PackageGrid/PackageGrid';
import QrCodeBox from '../ActivationScreen/QrCodeBox';
import './membership.scss';

export default function MembershipScreen(props) {
  var mac              = props.mac || '';
  var plan             = props.plan || 'demo';
  var daysLeft         = props.daysLeft || 0;
  var activationState  = props.activationState || 'active';
  var isContentFocused = props.isContentFocused !== false;
  var onExitLeft       = props.onExitLeft;

  // CurrentPlanCard'a iletilen durum (active / grace)
  var planStatus = activationState === 'grace' ? 'grace' : 'active';

  var selectedState = useState(null);
  var selectedPlan = selectedState[0];
  var setSelectedPlan = selectedState[1];

  var focusedState = useState('12ay');
  var focusedPlan = focusedState[0];
  var setFocusedPlan = focusedState[1];

  function handleSelect(p) {
    setSelectedPlan(p);
  }

  function handleFocusChange(p) {
    setFocusedPlan(p);
  }

  return (
    <div className="membership-screen fade-up">
      <h1 className="membership-screen__title">Üyelik</h1>

      {/* Mevcut plan */}
      <CurrentPlanCard plan={plan} daysLeft={daysLeft} status={planStatus} />

      {/* Cihaz kodu referans */}
      <ActivationInfo mac={mac} />

      {/* Erken yenileme */}
      <div className="membership-screen__section-title">Paket Yenile</div>

      <PackageGrid
        featuredPlan="12ay"
        selectedPlan={selectedPlan}
        focusedPlan={isContentFocused ? focusedPlan : null}
        isActive={isContentFocused}
        onSelect={handleSelect}
        onFocusChange={handleFocusChange}
        onExitLeft={onExitLeft}
      />

      {/* Paket seçilince QR göster */}
      {selectedPlan && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <QrCodeBox plan={selectedPlan} mac={mac} state="active" />
          <p style={{ fontSize: '0.8rem', color: '#8892A4' }}>
            Seçili paket: <strong style={{ color: '#F4821F' }}>{selectedPlan}</strong> ·
            QR kodu tarayın veya <strong>arya.tv/activate</strong>
          </p>
        </div>
      )}

      {!selectedPlan && (
        <p style={{ fontSize: '0.85rem', color: '#4B5568', textAlign: 'center' }}>
          Yenilemek için yukarıdan bir paket seçin
        </p>
      )}
    </div>
  );
}
