/**
 * ActionArea.jsx
 * State'e göre doğru aksiyon butonunu render eder.
 * remote-focus-nav kuralı: her buton data-focusable="true" taşır.
 *
 * Props:
 *   state       — 'loading' | 'pending' | 'active' | 'expired'
 *   onRefresh   — "Sayfayı Yenile" butonu callback
 *   onStart     — "Uygulamaya Başla" butonu callback
 *   onReactivate — "Yeniden Aktifleştir" butonu callback
 *   error       — string | null (hata mesajı göstermek için)
 *   focusedId   — string (FocusManager'dan gelen aktif fokus id'si)
 */

import React from 'react';

function RefreshIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

export default function ActionArea({ state, onRefresh, onStart, onReactivate, error, focusedId }) {
  return (
    <div className="action-area">
      {/* Hata mesajı */}
      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      {/* loading — buton devre dışı */}
      {state === 'loading' && (
        <button
          className="btn btn--secondary btn--disabled"
          disabled
          aria-disabled="true"
          tabIndex={-1}
        >
          Kontrol ediliyor…
        </button>
      )}

      {/* pending — Sayfayı Yenile */}
      {state === 'pending' && (
        <button
          id="btn-refresh"
          className="btn btn--secondary"
          data-focusable="true"
          data-focused={focusedId === 'btn-refresh' ? 'true' : undefined}
          onClick={onRefresh}
          aria-label="Aktivasyon durumunu yenile"
        >
          <RefreshIcon />
          Sayfayı Yenile
        </button>
      )}

      {/* active — Uygulamaya Başla */}
      {state === 'active' && (
        <button
          id="btn-start"
          className="btn btn--primary"
          data-focusable="true"
          data-focused={focusedId === 'btn-start' ? 'true' : undefined}
          onClick={onStart}
          aria-label="Uygulamaya başla"
        >
          <ArrowIcon />
          Uygulamaya Başla
        </button>
      )}

      {/* expired — Yeniden Aktifleştir + destek */}
      {state === 'expired' && (
        <>
          <button
            id="btn-reactivate"
            className="btn btn--danger"
            data-focusable="true"
            data-focused={focusedId === 'btn-reactivate' ? 'true' : undefined}
            onClick={onReactivate}
            aria-label="Yeniden aktifleştir"
          >
            <RepeatIcon />
            Yeniden Aktifleştir
          </button>
          <span className="support-link" aria-label="Destek: arya.tv/destek">
            Yardım: arya.tv/destek
          </span>
        </>
      )}
    </div>
  );
}
