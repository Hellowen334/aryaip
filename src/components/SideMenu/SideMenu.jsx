/**
 * SideMenu.jsx
 * Sol sidebar navigasyon menüsü — Expand-on-focus overlay.
 *
 * Davranış (remote-focus-nav skill'inden):
 *   - Varsayılan: collapsed (72px), sadece ikonlar
 *   - Kullanıcı Sol tuşla menüye odaklanınca (isFocused=true):
 *     menü 220px'e genişler, etiketler görünür (overlay)
 *   - Sağ tuşla içeriğe geçince (isFocused=false):
 *     menü daralır, sadece ikonlar kalır
 *   - Content alanı KAYMAZ — menü position: absolute
 *
 * Props:
 *   currentScreen   string   — şu an aktif ekran (nav stack'ten)
 *   isGrace         boolean  — Filmler/Diziler kilitli mi
 *   isFocused       boolean  — App.jsx'ten gelen: menü fokus bölgesinde mi
 *   plan            string   — 'demo' | '3ay' | '6ay' | '12ay'
 *   daysLeft        number
 *   graceHoursLeft  number
 *   onNavigate      (screen) => void  — push(screen)
 *   onLockedClick   (screen) => void  — kilitli item tıklandığında
 *   onEnterContent  () => void        — Right tuşu ile içeriğe geç
 *   focusedId       string            — hangi item odaklı
 *   onFocusChange   (id) => void
 */

import React, { useEffect, useRef, useCallback } from 'react';
import MenuItem from './MenuItem';
import { SCREENS } from '../../hooks/useNavigationStack';
import './SideMenu.css';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

// Menü öğeleri sabit tanımı
var MENU_ITEMS = [
  { id: 'menu-home',       label: 'Anasayfa',  icon: '🏠', screen: SCREENS.HOME },
  { id: 'menu-livetv',     label: 'Canlı TV',  icon: '📡', screen: SCREENS.LIVETV },
  { id: 'menu-movies',     label: 'Filmler',   icon: '🎬', screen: SCREENS.MOVIES,     lockable: true },
  { id: 'menu-series',     label: 'Diziler',   icon: '📺', screen: SCREENS.SERIES,     lockable: true },
  { id: 'menu-settings',   label: 'Ayarlar',   icon: '⚙️', screen: SCREENS.SETTINGS },
  { id: 'menu-membership', label: 'Üyelik',    icon: '👑', screen: SCREENS.MEMBERSHIP, hasBadge: true },
];

export default function SideMenu(props) {
  var currentScreen  = props.currentScreen;
  var isGrace        = props.isGrace || false;
  var isFocused      = props.isFocused !== false; // default true
  var plan           = props.plan || 'demo';
  var daysLeft       = props.daysLeft || 0;
  var graceHoursLeft = props.graceHoursLeft || 0;
  var onNavigate     = props.onNavigate;
  var onLockedClick  = props.onLockedClick;
  var onEnterContent = props.onEnterContent;
  var focusedId      = props.focusedId;
  var onFocusChange  = props.onFocusChange;

  var containerRef = useRef(null);
  var prevIsFocusedRef = useRef(false);

  // Üyelik badge'i hesapla
  function getMembershipBadge() {
    if (isGrace) {
      return { text: '⚠ ' + graceHoursLeft + 's', variant: 'grace' };
    }
    if (plan !== 'demo' && daysLeft > 0 && daysLeft <= 7) {
      return { text: daysLeft + ' gün', variant: 'normal' };
    }
    return null;
  }

  var membershipBadge = getMembershipBadge();

  // Focusable item listesi
  var focusableIds = MENU_ITEMS.map(function(item) { return item.id; });

  var focusItemById = useCallback(function focusItemById(id) {
    if (!containerRef.current) return;
    var el = containerRef.current.querySelector('#' + id);
    if (el) {
      el.focus({ preventScroll: true });
      if (onFocusChange) onFocusChange(id);
    }
  }, [onFocusChange]);

  // Menüye odak gelince (false → true geçişi) hedef item'a odaklan
  useEffect(function() {
    var justBecameFocused = isFocused && !prevIsFocusedRef.current;
    prevIsFocusedRef.current = isFocused;
    if (!justBecameFocused) return;
    var targetId = focusedId || focusableIds[0];
    focusItemById(targetId);
  }, [isFocused, focusedId, focusItemById]);

  // Klavye navigasyonu
  useEffect(function() {
    if (!isFocused) return;

    function handleKey(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(document.activeElement)) return;

      var currentIndex = focusableIds.indexOf(focusedId || focusableIds[0]);
      if (currentIndex < 0) currentIndex = 0;

      if (e.keyCode === KEY_UP) {
        e.preventDefault();
        var prev = currentIndex > 0 ? currentIndex - 1 : focusableIds.length - 1;
        focusItemById(focusableIds[prev]);
      } else if (e.keyCode === KEY_DOWN) {
        e.preventDefault();
        var next = currentIndex < focusableIds.length - 1 ? currentIndex + 1 : 0;
        focusItemById(focusableIds[next]);
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (onEnterContent) onEnterContent();
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        var el = containerRef.current.querySelector('#' + (focusedId || focusableIds[0]));
        if (el) el.click();
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedId, focusableIds, focusItemById, onEnterContent]);

  // Menü öğesine tıklandığında
  function handleItemClick(screen, locked) {
    if (locked) {
      if (onLockedClick) onLockedClick(screen);
    } else {
      if (onNavigate) onNavigate(screen);
    }
  }

  // Menü sınıfı (artık sabit boyutlu)
  var menuClass = 'sidemenu';

  return (
    <nav
      ref={containerRef}
      className={menuClass}
      aria-label="Ana menü"
    >
      {/* Logo */}
      <div className="sidemenu__logo">
        <div className="sidemenu__logo-icon" aria-hidden="true">IPTV</div>
        <span className="sidemenu__logo-name">Arya IPTV</span>
      </div>

      {/* Nav öğeleri */}
      <div className="sidemenu__nav" role="list">
        {MENU_ITEMS.map(function(item) {
          var isLocked = item.lockable && isGrace;
          var badge = item.hasBadge && membershipBadge ? membershipBadge.text : null;
          var badgeVariant = item.hasBadge && membershipBadge ? membershipBadge.variant : 'normal';

          return (
            <MenuItem
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
              screen={item.screen}
              active={currentScreen === item.screen}
              locked={isLocked}
              badge={badge}
              badgeVariant={badgeVariant}
              focused={focusedId === item.id}
              onClick={handleItemClick}
            />
          );
        })}
      </div>
    </nav>
  );
}
