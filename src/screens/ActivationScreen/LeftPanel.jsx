/**
 * LeftPanel.jsx
 * Sol panel: AppLogo, MacAddressCard, StepList, StatusBadge
 */

import React from 'react';
import MacAddressCard from './MacAddressCard';
import StepList from './StepList';
import StatusBadge from './StatusBadge';

export default function LeftPanel({ mac, state, daysLeft }) {
  const isLoading = state === 'loading';

  return (
    <div className="left-panel">
      {/* Logo */}
      <div className="app-logo">
        <div className="app-logo__icon" aria-hidden="true">📺</div>
        <span className="app-logo__name">Arya IPTV</span>
      </div>

      {/* MAC Adresi */}
      <MacAddressCard mac={mac} isLoading={isLoading} />

      {/* Talimatlar */}
      <StepList />

      {/* State rozeti */}
      <StatusBadge state={state} daysLeft={daysLeft} />
    </div>
  );
}
