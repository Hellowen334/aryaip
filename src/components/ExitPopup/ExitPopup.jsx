/**
 * ExitPopup.jsx
 * Kök ekranda Back (461) tuşuna basıldığında gösterilen çıkış onay dialog'u.
 * webOS.platformBack() KULLANILMAZ — kullanıcı "Evet, Çık" seçerse
 * window.close() veya webOS native exit API'si çağrılır.
 *
 * remote-focus-nav: İki buton data-focusable, dialog açıldığında
 * "İptal" butonuna otomatik fokus verilir.
 *
 * Props:
 *   isOpen  — boolean
 *   onClose — dialog'u kapat (İptal)
 */

import React, { useEffect, useRef } from 'react';
import './ExitPopup.css';

const WEBOS_BACK_KEY = 461;
const KEY_OK = 13;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;

function handleExit() {
  // webOS uygulaması çıkışı
  if (typeof window.close === 'function') {
    window.close();
  }
  // Ek olarak webOS native API varsa kullan
  // window.webOS?.service?.request('luna://com.webos.applicationManager', { ... })
}

export default function ExitPopup({ isOpen, onClose }) {
  const cancelBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const focusedRef = useRef('cancel'); // 'cancel' | 'confirm'

  // Açıldığında İptal butonuna fokus ver
  useEffect(function() {
    if (isOpen) {
      focusedRef.current = 'cancel';
      if (cancelBtnRef.current) cancelBtnRef.current.focus();
    }
  }, [isOpen]);

  // Dialog içi navigasyon
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e) {
      const { keyCode } = e;

      if (keyCode === WEBOS_BACK_KEY) {
        e.preventDefault();
        e.stopPropagation();
        onClose(); // Back → dialog'u kapat
        return;
      }

      if (keyCode === KEY_LEFT || keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (focusedRef.current === 'cancel') {
          focusedRef.current = 'confirm';
          if (confirmBtnRef.current) confirmBtnRef.current.focus();
        } else {
          focusedRef.current = 'cancel';
          if (cancelBtnRef.current) cancelBtnRef.current.focus();
        }
      }

      if (keyCode === KEY_OK) {
        e.preventDefault();
        if (focusedRef.current === 'confirm') {
          handleExit();
        } else {
          onClose();
        }
      }
    }

    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="exit-popup-overlay" role="dialog" aria-modal="true" aria-label="Çıkış onayı">
      <div className="exit-popup">
        <span className="exit-popup__icon" aria-hidden="true">👋</span>
        <h2 className="exit-popup__title">Çıkmak istiyor musunuz?</h2>
        <p className="exit-popup__desc">
          Aktivasyon işleminiz tamamlanmadı.<br />
          Çıkarsanız tekrar bu ekrana yönlendirilirsiniz.
        </p>
        <div className="exit-popup__actions">
          <button
            ref={cancelBtnRef}
            id="exit-popup-cancel"
            className="btn btn--secondary"
            data-focusable="true"
            onClick={onClose}
            aria-label="İptal, uygulamada kal"
          >
            İptal
          </button>
          <button
            ref={confirmBtnRef}
            id="exit-popup-confirm"
            className="btn btn--danger"
            data-focusable="true"
            onClick={handleExit}
            aria-label="Evet, uygulamadan çık"
          >
            Evet, Çık
          </button>
        </div>
      </div>
    </div>
  );
}
