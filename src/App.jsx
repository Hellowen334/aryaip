/**
 * App.jsx — Uygulama kökü
 *
 * Routing mantığı (React Router yok):
 *   loading | pending → <ActivationScreen>
 *   expired           → <ExpiredScreen> (TAM EKRAN, SideMenu YOK)
 *   active | grace    → SideMenu + içerik (grace'te StatusBanner + kilitler)
 *
 * Back tuşu (461) global handler:
 *   - loading/pending'de ActivationScreen'in kendi FocusManager'ı yönetir
 *   - active/expired/grace'de App.jsx yönetir:
 *     canPop → pop()
 *     !canPop → ExitPopup
 *
 * Fokus bölgesi (focusZone):
 *   'menu'    → SideMenu Up/Down navigasyonu aktif
 *   'content' → İçerik ekranı kendi navigasyonunu yönetir
 *   SideMenu'de Right → 'content'
 *   İçerikte ilk kartta Left (PackageGrid.onExitLeft) → 'menu'
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useActivationStatus } from './hooks/useActivationStatus';
import { useNavigationStack, SCREENS } from './hooks/useNavigationStack';

import ActivationScreen from './screens/ActivationScreen/index';
import ExpiredScreen from './screens/ExpiredScreen/index';
import RestrictedAccessScreen from './screens/RestrictedAccessScreen/index';
import MembershipScreen from './screens/MembershipScreen/index';

import SideMenu from './components/SideMenu/SideMenu';
import StatusBanner from './components/StatusBanner/StatusBanner';
import ExitPopup from './components/ExitPopup/ExitPopup';

import './styles/app.css';

// ─── Placeholder ekranlar (henüz yazılmamış) ────────────────────────────────
function PlaceholderScreen(props) {
  return (
    <div className="screen-center" style={{ color: '#8892A4' }}>
      <div style={{ fontSize: '3rem' }}>{props.icon || '🚧'}</div>
      <h2 style={{ fontSize: '1.5rem', color: '#EAECF0' }}>{props.title}</h2>
      <p style={{ fontSize: '0.9rem' }}>Bu ekran henüz hazırlanıyor.</p>
    </div>
  );
}

// ─── Ekran haritası ─────────────────────────────────────────────────────────
var KEY_BACK = 461;

export default function App() {
  var status = useActivationStatus();
  var mac            = status.mac;
  var activationState = status.activationState;
  var plan           = status.plan;
  var daysLeft       = status.daysLeft;
  var graceHoursLeft = status.graceHoursLeft;
  var refresh        = status.refresh;

  var nav = useNavigationStack(SCREENS.HOME);

  // Fokus bölgesi: 'menu' | 'content'
  var focusZoneState = useState('menu');
  var focusZone = focusZoneState[0];
  var setFocusZone = focusZoneState[1];

  // Aktif menü item'ı odağı
  var menuFocusState = useState('menu-home');
  var menuFocusedId = menuFocusState[0];
  var setMenuFocusedId = menuFocusState[1];

  // ExitPopup
  var exitOpenState = useState(false);
  var exitOpen = exitOpenState[0];
  var setExitOpen = exitOpenState[1];

  var isGrace   = activationState === 'grace';
  var isExpired = activationState === 'expired';

  // ── Global Back (461) — sadece main app veya expired'da aktif ──────────────
  useEffect(function() {
    if (activationState === 'loading' || activationState === 'pending') return;

    function handleBack(e) {
      if (e.keyCode !== KEY_BACK) return;
      e.preventDefault();
      e.stopPropagation();

      if (nav.canPop) {
        nav.pop();
        setFocusZone('menu'); // pop sonrası menüye dön
      } else {
        setExitOpen(true);
      }
    }

    window.addEventListener('keydown', handleBack);
    return function() { window.removeEventListener('keydown', handleBack); };
  }, [activationState, nav]);

  // ── Menü navigasyonu ────────────────────────────────────────────────────────
  var handleNavigate = useCallback(function handleNavigate(screen) {
    nav.push(screen);
    setFocusZone('content');
  }, [nav]);

  var handleLockedClick = useCallback(function handleLockedClick() {
    // Kilitli item'a tıklandı → RestrictedAccessScreen'e git
    nav.push(SCREENS.RESTRICTED);
    setFocusZone('content');
  }, [nav]);

  var handleEnterContent = useCallback(function handleEnterContent() {
    setFocusZone('content');
  }, []);

  var handleExitLeft = useCallback(function handleExitLeft() {
    setFocusZone('menu');
  }, []);

  // ── Aktif içerik ekranı ─────────────────────────────────────────────────────
  function renderContent() {
    var screen = nav.current;

    if (screen === SCREENS.MEMBERSHIP) {
      return (
        <MembershipScreen
          mac={mac}
          plan={plan}
          daysLeft={daysLeft}
          activationState={activationState}
          isContentFocused={focusZone === 'content'}
          onExitLeft={handleExitLeft}
        />
      );
    }

    if (screen === SCREENS.RESTRICTED) {
      return (
        <RestrictedAccessScreen
          mac={mac}
          isContentFocused={focusZone === 'content'}
          onExitLeft={handleExitLeft}
        />
      );
    }

    if (screen === SCREENS.HOME) {
      return <PlaceholderScreen icon="🏠" title="Anasayfa" />;
    }

    if (screen === SCREENS.LIVETV) {
      return <PlaceholderScreen icon="📡" title="Canlı TV" />;
    }

    if (screen === SCREENS.MOVIES) {
      return <PlaceholderScreen icon="🎬" title="Filmler" />;
    }

    if (screen === SCREENS.SERIES) {
      return <PlaceholderScreen icon="📺" title="Diziler" />;
    }

    if (screen === SCREENS.SETTINGS) {
      return <PlaceholderScreen icon="⚙️" title="Ayarlar" />;
    }

    return <PlaceholderScreen title={screen} />;
  }

  // ── ActivationScreen (loading | pending) ────────────────────────────────────
  if (activationState === 'loading' || activationState === 'pending') {
    return (
      <ActivationScreen onActivated={refresh} />
    );
  }

  // ── ExpiredScreen — TAM EKRAN, SideMenu YOK ─────────────────────────────────
  if (isExpired) {
    return (
      <>
        <ExpiredScreen mac={mac} />
        <ExitPopup
          isOpen={exitOpen}
          onClose={function() { setExitOpen(false); }}
        />
      </>
    );
  }

  // ── Ana uygulama (active | grace) ──────────────────────────────────────────
  return (
    <>
      {/* Grace: kalıcı uyarı şeridi — kapatılamaz */}
      {isGrace && (
        <StatusBanner variant="grace" hoursLeft={graceHoursLeft} />
      )}

      <div className={'app-root' + (isGrace ? ' app-root--with-banner' : '')}>
        <div className="app-body">
          {/* Sol Sidebar */}
          <SideMenu
            currentScreen={nav.current}
            isGrace={isGrace}
            isFocused={focusZone === 'menu'}
            plan={plan}
            daysLeft={daysLeft}
            graceHoursLeft={graceHoursLeft}
            onNavigate={handleNavigate}
            onLockedClick={handleLockedClick}
            onEnterContent={handleEnterContent}
            focusedId={menuFocusedId}
            onFocusChange={setMenuFocusedId}
          />

          {/* İçerik Alanı */}
          <main className="app-content" aria-label="İçerik alanı">
            {renderContent()}
          </main>
        </div>
      </div>

      <ExitPopup
        isOpen={exitOpen}
        onClose={function() { setExitOpen(false); }}
      />
    </>
  );
}
