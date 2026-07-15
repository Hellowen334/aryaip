/**
 * ActivationScreen/index.jsx
 * Kök bileşen — state machine sahibi.
 * useActivationStatus hook'undan gelen state'e göre tüm alt bileşenleri yönetir.
 *
 * State akışı:
 *   loading → pending | active | expired
 *   pending → (manuel refresh) → loading → ...
 *
 * activation-mac-demo skill kuralı:
 *   expired state'te SADECE bu ekran gösterilir,
 *   başka hiçbir route'a yönlendirme YAPILMAZ.
 */

import React, { useRef, useState, useCallback } from 'react';
import { useActivationStatus } from '../../hooks/useActivationStatus';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import FocusManager from './FocusManager';
import ExitPopup from '../../components/ExitPopup/ExitPopup';
import './activation.scss';

/**
 * Props:
 *   onActivated — (mac: string) => void  — aktifleştirme sonrası üst router callback
 */
export default function ActivationScreen({ onActivated }) {
  const { mac, activationState, daysLeft, error, refresh } = useActivationStatus();
  const containerRef = useRef(null);
  const [focusedId, setFocusedId] = useState(null);
  const [exitOpen, setExitOpen] = useState(false);

  // "Uygulamaya Başla" — üst router'a bildir
  const handleStart = useCallback(() => {
    if (activationState === 'active') {
      onActivated?.(mac);
    }
  }, [activationState, mac, onActivated]);

  // "Yeniden Aktifleştir" — pending state ile aynı URL'e yönlendir
  // TV ekranında URL açılamaz, kullanıcı QR/URL'e yönlendirilir
  // Burada sadece refresh yap ki backend yeni kayıt görülsün
  const handleReactivate = useCallback(() => {
    refresh();
  }, [refresh]);

  // Back tuşu (461) → exit popup
  const handleBack = useCallback(() => {
    setExitOpen(true);
  }, []);

  return (
    <>
      <main
        ref={containerRef}
        className="activation-screen"
        aria-label="Aktivasyon ekranı"
      >
        {/* Background gradient mesh */}
        <div className="split-layout">
          <LeftPanel
            mac={mac}
            state={activationState}
            daysLeft={daysLeft}
          />
          <RightPanel
            state={activationState}
            onRefresh={refresh}
            onStart={handleStart}
            onReactivate={handleReactivate}
            error={error}
            focusedId={focusedId}
          />
        </div>

        {/* Focus navigation handler */}
        <FocusManager
          containerRef={containerRef}
          onBack={handleBack}
          onFocusChange={setFocusedId}
        />
      </main>

      {/* Exit confirmation popup */}
      <ExitPopup
        isOpen={exitOpen}
        onClose={() => setExitOpen(false)}
      />
    </>
  );
}
