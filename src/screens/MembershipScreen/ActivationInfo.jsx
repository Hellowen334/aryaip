/**
 * ActivationInfo.jsx
 * MAC adresini referans olarak gösterir.
 * MacAddressCard'ın basitleştirilmiş versiyonu (MembershipScreen'e özgü).
 *
 * Props:
 *   mac  string
 */

import React from 'react';

export default function ActivationInfo(props) {
  var mac = props.mac || 'XX:XX:XX:XX:XX:XX';

  return (
    <div className="activation-info">
      <span className="activation-info__label">Cihaz Kodu</span>
      <span className="activation-info__mac">{mac}</span>
    </div>
  );
}
