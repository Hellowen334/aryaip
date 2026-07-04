/**
 * QrCodeBox.jsx  (v2 — plan prop eklendi)
 * Web sitesi QR kodunu gösterir.
 *
 * Aktivasyon ekranı (plan yok): sabit URL
 * Premium paket seçimi: URL'e ?mac=&plan= query param eklenir
 * (premium-subscription skill kuralı: kullanıcı web'de tekrar seçim yapmasın)
 *
 * Props:
 *   state  'loading' | 'pending' | 'active' | 'expired'
 *   mac    string|undefined   — plan varsa zorunlu
 *   plan   string|undefined   — '3ay' | '6ay' | '12ay'
 */

import React from 'react';

var BASE_URL = 'https://arya.tv/activate';
var QR_API  = 'https://api.qrserver.com/v1/create-qr-code/?size=188x188&bgcolor=ffffff&color=000000&margin=0&data=';

function buildUrl(mac, plan) {
  var url = BASE_URL;
  var params = [];
  if (mac && mac !== 'UNKNOWN')  params.push('mac='  + encodeURIComponent(mac));
  if (plan)                       params.push('plan=' + encodeURIComponent(plan));
  if (params.length > 0) url = url + '?' + params.join('&');
  return url;
}

export default function QrCodeBox(props) {
  var state = props.state || 'pending';
  var mac   = props.mac   || '';
  var plan  = props.plan  || null;

  var isDimmed = state === 'active';
  var targetUrl = buildUrl(mac, plan);
  var qrSrc = QR_API + encodeURIComponent(targetUrl);

  return (
    <div className={'qr-box' + (isDimmed ? ' qr-box--dimmed' : '')}>
      <div className="qr-frame" aria-label="QR kod">
        <img
          src={qrSrc}
          alt={'QR kod — ' + targetUrl}
          width={188}
          height={188}
        />
      </div>
      <p className="qr-caption">
        veya tarayıcıda aç:<br />
        <strong>arya.tv/activate</strong>
      </p>
    </div>
  );
}
