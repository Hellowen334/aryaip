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
import HomeScreen from './screens/HomeScreen/HomeScreen';
import LiveTVScreen from './screens/LiveTVScreen/LiveTVScreen';
import MoviesScreen from './screens/MoviesScreen/MoviesScreen';
import SeriesCategoriesScreen from './screens/SeriesCategoriesScreen/SeriesCategoriesScreen';
import SeriesDetailScreen from './screens/SeriesDetailScreen/SeriesDetailScreen';
import PlayerScreen from './screens/PlayerScreen/PlayerScreen';

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

  // Seçili dizi kategorisi ve dizi ID'si
  var selectedCategoryState = useState(null);
  var selectedSeriesCategory = selectedCategoryState[0];
  var setSelectedSeriesCategory = selectedCategoryState[1];

  var selectedSeriesState = useState(null);
  var selectedSeriesId = selectedSeriesState[0];
  var setSelectedSeriesId = selectedSeriesState[1];

  // Live TV state preservation
  var liveFocusedCatIndexState = useState(1); // 'All' default
  var liveFocusedChIndexState = useState(0);
  var liveSelectedCatIdState = useState('all');
  var liveFocusZoneState = useState('channels');
  var liveSelectedChannelState = useState(null);

  // Movies state preservation
  var moviesFocusedCatIndexState = useState(1); // 'All' default
  var moviesFocusedGridIndexState = useState(0);
  var moviesSelectedCatIdState = useState('all');
  var moviesFocusZoneState = useState('grid');

  // Series state preservation
  var seriesFocusedCatIndexState = useState(1); // 'All' default
  var seriesFocusedGridIndexState = useState(0);
  var seriesSelectedCatIdState = useState('all');
  var seriesFocusZoneState = useState('grid');

  var playerParamsState = useState(null);
  var playerParams = playerParamsState[0];
  var setPlayerParams = playerParamsState[1];

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
        var isPlayer = nav.current === SCREENS.PLAYER;
        nav.pop();
        if (isPlayer) {
          setFocusZone('content');
        } else {
          setFocusZone('menu');
        }
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
      return (
        <HomeScreen
          isContentFocused={focusZone === 'content'}
          onExitLeft={handleExitLeft}
        />
      );
    }

    if (screen === SCREENS.LIVETV) {
      return (
        <LiveTVScreen
          isContentFocused={focusZone === 'content'}
          onExitLeft={handleExitLeft}
          onPlay={function(streamUrl, title, type) {
            setPlayerParams({ url: streamUrl, title: title, type: type });
            nav.push(SCREENS.PLAYER);
          }}
          focusedCatIndex={liveFocusedCatIndexState[0]}
          onFocusedCatIndexChange={liveFocusedCatIndexState[1]}
          focusedChIndex={liveFocusedChIndexState[0]}
          onFocusedChIndexChange={liveFocusedChIndexState[1]}
          selectedCategory={liveSelectedCatIdState[0]}
          onSelectedCategoryChange={liveSelectedCatIdState[1]}
          focusZone={liveFocusZoneState[0]}
          onFocusZoneChange={liveFocusZoneState[1]}
          selectedChannel={liveSelectedChannelState[0]}
          onSelectedChannelChange={liveSelectedChannelState[1]}
        />
      );
    }

    if (screen === SCREENS.MOVIES) {
      return (
        <MoviesScreen
          isContentFocused={focusZone === 'content'}
          onExitLeft={handleExitLeft}
          onPlay={function(streamUrl, title, type) {
            setPlayerParams({ url: streamUrl, title: title, type: type });
            nav.push(SCREENS.PLAYER);
          }}
          focusedCatIndex={moviesFocusedCatIndexState[0]}
          onFocusedCatIndexChange={moviesFocusedCatIndexState[1]}
          focusedGridIndex={moviesFocusedGridIndexState[0]}
          onFocusedGridIndexChange={moviesFocusedGridIndexState[1]}
          selectedCategory={moviesSelectedCatIdState[0]}
          onSelectedCategoryChange={moviesSelectedCatIdState[1]}
          focusZone={moviesFocusZoneState[0]}
          onFocusZoneChange={moviesFocusZoneState[1]}
        />
      );
    }

    if (screen === SCREENS.SERIES) {
      return (
        <SeriesCategoriesScreen
          isContentFocused={focusZone === 'content'}
          onSelectSeries={function(series) {
            setSelectedSeriesId(series.id);
            nav.push(SCREENS.SERIES_DETAIL);
          }}
          onExitLeft={handleExitLeft}
          focusedCatIndex={seriesFocusedCatIndexState[0]}
          onFocusedCatIndexChange={seriesFocusedCatIndexState[1]}
          focusedGridIndex={seriesFocusedGridIndexState[0]}
          onFocusedGridIndexChange={seriesFocusedGridIndexState[1]}
          selectedCategory={seriesSelectedCatIdState[0]}
          onSelectedCategoryChange={seriesSelectedCatIdState[1]}
          focusZone={seriesFocusZoneState[0]}
          onFocusZoneChange={seriesFocusZoneState[1]}
        />
      );
    }

    if (screen === SCREENS.SERIES_DETAIL) {
      return (
        <SeriesDetailScreen
          seriesId={selectedSeriesId}
          isContentFocused={focusZone === 'content'}
          onExitLeft={function() {
            nav.pop();
          }}
          onPlay={function(streamUrl, title, type) {
            setPlayerParams({ url: streamUrl, title: title, type: type });
            nav.push(SCREENS.PLAYER);
          }}
        />
      );
    }

    if (screen === SCREENS.PLAYER) {
      return (
        <PlayerScreen
          streamUrl={playerParams ? playerParams.url : null}
          title={playerParams ? playerParams.title : null}
          type={playerParams ? playerParams.type : null}
          onExit={function() {
            nav.pop();
            setFocusZone('content');
          }}
        />
      );
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
