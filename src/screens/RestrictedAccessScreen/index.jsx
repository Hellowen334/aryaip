/**
 * RestrictedAccessScreen/index.jsx
 * Grace döneminde Filmler/Diziler'e tıklandığında gösterilir.
 * PackageGrid — seçilen plan QrCodeBox'ı günceller.
 *
 * Props:
 *   mac               string
 *   isContentFocused  boolean
 *   onExitLeft        () => void  — ilk kartta Left → menüye dön
 */

import React, { useState } from 'react';
import PackageGrid from '../../components/PackageGrid/PackageGrid';
import QrCodeBox from '../ActivationScreen/QrCodeBox';

var STYLES = {
  screen: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '48px',
    gap: '36px',
    background: '#10121A',
  },
  lockIcon: {
    fontSize: '3.5rem',
    marginBottom: '0',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#EAECF0',
    textAlign: 'center',
  },
  desc: {
    fontSize: '0.95rem',
    color: '#8892A4',
    textAlign: 'center',
    lineHeight: '1.6',
    maxWidth: '480px',
  },
  divider: {
    width: '48px',
    height: '2px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '1px',
  },
  qrRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  qrNote: {
    fontSize: '0.8rem',
    color: '#8892A4',
  },
};

export default function RestrictedAccessScreen(props) {
  var mac              = props.mac || '';
  var isContentFocused = props.isContentFocused !== false;
  var onExitLeft       = props.onExitLeft;

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
    <div style={STYLES.screen} className="fade-up">
      <div style={STYLES.lockIcon} aria-hidden="true">🔒</div>

      <h1 style={STYLES.title}>Bu bölüm üyelik gerektirir</h1>

      <p style={STYLES.desc}>
        Filmler ve Diziler'e erişmek için aktif bir üyelik paketi satın almanız gerekiyor.
        Aşağıdan bir paket seçin ve QR kodu tarayarak devam edin.
      </p>

      <div style={STYLES.divider} aria-hidden="true" />

      {/* Paket seçimi */}
      <PackageGrid
        featuredPlan="12ay"
        selectedPlan={selectedPlan}
        focusedPlan={isContentFocused ? focusedPlan : null}
        isActive={isContentFocused}
        onSelect={handleSelect}
        onFocusChange={handleFocusChange}
        onExitLeft={onExitLeft}
      />

      {/* Seçili plana göre QR */}
      <div style={STYLES.qrRow}>
        <QrCodeBox plan={selectedPlan} mac={mac} state="pending" />
        <p style={STYLES.qrNote}>Seçili paket: <strong style={{ color: '#F4821F' }}>{selectedPlan}</strong></p>
      </div>
    </div>
  );
}
