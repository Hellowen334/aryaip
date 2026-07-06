/**
 * useActivationStatus.js  (v2 — premium subscription entegrasyonu)
 *
 * Dönen state:
 *   'loading'  — ilk yükleme / manuel yenileme
 *   'pending'  — kayıt yok / onay bekleniyor
 *   'active'   — aktif (demo veya premium)
 *   'grace'    — süre doldu, 1 günlük tolerans, Filmler/Diziler kilitli
 *   'expired'  — tam kilitli, yalnızca ExpiredScreen
 *
 * Hook döner:
 *   mac            string   — cihaz MAC adresi
 *   activationState string  — yukarıdaki 5 state
 *   plan           string   — 'demo' | '3ay' | '6ay' | '12ay'
 *   daysLeft       number   — aktif durumda kalan gün
 *   graceHoursLeft number   — grace durumunda kalan saat
 *   error          string|null
 *   refresh()      function — throttle korumalı (min 5 sn)
 *
 * Backend response (genişletilmiş):
 *   {
 *     durum:          'aktif' | 'grace' | 'süresi_dolmuş' | 'bekliyor'
 *     kalanGun:       number
 *     paketTipi:      'demo' | '3ay' | '6ay' | '12ay'
 *     graceKalanSaat: number  (yalnızca grace'te dolu)
 *   }
 *
 * Güvenlik: source of truth HER ZAMAN backend — localStorage'a yazılmaz.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { readMacAddress } from './useMacAddress';

// ─── Sabitler ────────────────────────────────────────────────────────────────
var THROTTLE_MS = 5000;
var BACKGROUND_POLL_MS = 5 * 60 * 1000; // 5 dk
var API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';

// ─── Backend durumu → state map ──────────────────────────────────────────────
var STATE_MAP = {
  aktif: 'active',
  grace: 'grace',
  'süresi_dolmuş': 'expired',
  bekliyor: 'pending',
};

// ─── Backend çağrısı ─────────────────────────────────────────────────────────
/**
 * @param {string} mac
 * @returns {Promise<{ state, plan, daysLeft, graceHoursLeft }>}
 */
function fetchActivationStatus(mac) {
  // --- DEV BYPASS: Geliştirme aşaması için aktivasyon atlanıyor ---
  return Promise.resolve({ state: 'active', plan: 'demo', daysLeft: 7, graceHoursLeft: 0 });

  if (!mac || mac === 'UNKNOWN') {
    return Promise.resolve({ state: 'pending', plan: 'demo', daysLeft: 0, graceHoursLeft: 0 });
  }

  var url = API_BASE + '/api/activation/status?mac=' + encodeURIComponent(mac);

  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 10000; // 10 saniye zaman aşımı

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            var data = JSON.parse(xhr.responseText);
            resolve({
              state: STATE_MAP[data.durum] || 'pending',
              plan: data.paketTipi || 'demo',
              daysLeft: typeof data.kalanGun === 'number' ? data.kalanGun : 0,
              graceHoursLeft: typeof data.graceKalanSaat === 'number' ? data.graceKalanSaat : 0,
            });
          } catch (e) {
            reject(new Error('Geçersiz JSON yanıtı'));
          }
        } else if (xhr.status === 404) {
          resolve({ state: 'pending', plan: 'demo', daysLeft: 0, graceHoursLeft: 0 });
        } else {
          reject(new Error('HTTP ' + xhr.status));
        }
      }
    };

    xhr.ontimeout = function() {
      reject(new Error('Bağlantı zaman aşımına uğradı.'));
    };

    xhr.onerror = function() {
      reject(new Error('Ağ hatası.'));
    };

    xhr.open('GET', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useActivationStatus() {
  var _useState0 = useState('');
  var mac = _useState0[0];
  var setMac = _useState0[1];

  var _useState1 = useState('loading');
  var activationState = _useState1[0];
  var setActivationState = _useState1[1];

  var _useState2 = useState('demo');
  var plan = _useState2[0];
  var setPlan = _useState2[1];

  var _useState3 = useState(0);
  var daysLeft = _useState3[0];
  var setDaysLeft = _useState3[1];

  var _useState4 = useState(0);
  var graceHoursLeft = _useState4[0];
  var setGraceHoursLeft = _useState4[1];

  var _useState5 = useState(null);
  var error = _useState5[0];
  var setError = _useState5[1];

  var lastRefreshRef = useRef(0);
  var pollTimerRef = useRef(null);
  var macRef = useRef(''); // polling closure'ı için

  // ── Durum sorgulama ────────────────────────────────────────────────────────
  var checkStatus = useCallback(function checkStatus(currentMac) {
    setActivationState('loading');
    setError(null);

    return fetchActivationStatus(currentMac).then(function(result) {
      setActivationState(result.state);
      setPlan(result.plan);
      setDaysLeft(result.daysLeft);
      setGraceHoursLeft(result.graceHoursLeft);
    }).catch(function(err) {
      console.error('[useActivationStatus] fetch error:', err);
      setError(err.message || 'Bağlantı hatası. Lütfen tekrar deneyin.');
      setActivationState('pending');
    });
  }, []);

  // ── İlk yükleme: MAC oku → backend sorgula → polling başlat ───────────────
  useEffect(function() {
    var cancelled = false;

    function init() {
      return readMacAddress().then(function(macAddr) {
        if (cancelled) return;
        setMac(macAddr);
        macRef.current = macAddr;

        return checkStatus(macAddr).then(function() {
          if (!cancelled) {
            pollTimerRef.current = setInterval(function() {
              checkStatus(macRef.current);
            }, BACKGROUND_POLL_MS);
          }
        });
      });
    }

    init();

    return function() {
      cancelled = true;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [checkStatus]);

  // ── Manuel refresh (throttle korumalı) ────────────────────────────────────
  var refresh = useCallback(function refresh() {
    var now = Date.now();
    if (now - lastRefreshRef.current < THROTTLE_MS) {
      console.warn('[useActivationStatus] Refresh throttled.');
      return;
    }
    lastRefreshRef.current = now;
    checkStatus(macRef.current);
  }, [checkStatus]);

  return { mac, activationState, plan, daysLeft, graceHoursLeft, error, refresh };
}
