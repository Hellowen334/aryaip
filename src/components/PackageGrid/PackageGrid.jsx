/**
 * PackageGrid.jsx
 * 3 PackageCard'ı yatay olarak sıralar.
 * Yön tuşu (Sol/Sağ) ile kart navigasyonu, Enter ile seçim.
 * remote-focus-nav: Sol tuş ile ilk karttayken menüye dönülebilir.
 *
 * Props:
 *   featuredPlan  string    — hangi plan featured (default '12ay')
 *   selectedPlan  string    — seçili plan (dışarıdan kontrol)
 *   focusedPlan   string    — hangi kart odaklı
 *   isActive      boolean   — false iken keydown handler devre dışı (focusZone guard)
 *   onSelect      (plan) => void
 *   onFocusChange (plan) => void   — fokus değişince bildir
 *   onExitLeft    () => void       — ilk kartta Left → menüye dön
 */

import React, { useEffect, useRef, useCallback } from 'react';
import PackageCard from '../PackageCard/PackageCard';

var PLANS = ['3ay', '6ay', '12ay'];

var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

export default function PackageGrid(props) {
  var featuredPlan  = props.featuredPlan  || '12ay';
  var selectedPlan  = props.selectedPlan  || null;
  var focusedPlan   = props.focusedPlan   || null;
  // isActive: false olduğunda keydown handler sessiz kalır.
  // focusZone 'menu' iken PackageGrid'in handler'larının SideMenu ile çakışmasını önler.
  var isActive      = props.isActive !== false;
  var onSelect      = props.onSelect;
  var onFocusChange = props.onFocusChange;
  var onExitLeft    = props.onExitLeft;

  var containerRef = useRef(null);

  // İlk kez grid'e girilince featuredPlan'a odaklan
  var focusCard = useCallback(function focusCard(plan) {
    if (!containerRef.current) return;
    var el = containerRef.current.querySelector('[data-plan="' + plan + '"]');
    if (el) {
      el.focus({ preventScroll: true });
      if (onFocusChange) onFocusChange(plan);
    }
  }, [onFocusChange]);

  // Dışarıdan tetiklenebilen ilk fokus
  useEffect(function() {
    if (focusedPlan) {
      focusCard(focusedPlan);
    }
  }, []); // eslint-disable-line

  // Yön tuşu navigasyonu
  useEffect(function() {
    function handleKey(e) {
      // focusZone guard: isActive false iken devre dışı
      if (!isActive) return;
      if (!containerRef.current) return;
      // Grid içinde mi?
      if (!containerRef.current.contains(document.activeElement)) return;

      var currentIndex = PLANS.indexOf(focusedPlan || featuredPlan);
      if (currentIndex < 0) currentIndex = 0;

      if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        var next = Math.min(currentIndex + 1, PLANS.length - 1);
        focusCard(PLANS[next]);
      } else if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (currentIndex === 0) {
          // En sol kartta Left → menüye çık
          if (onExitLeft) onExitLeft();
        } else {
          focusCard(PLANS[currentIndex - 1]);
        }
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        var plan = focusedPlan || PLANS[currentIndex];
        if (onSelect) onSelect(plan);
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [focusedPlan, featuredPlan, focusCard, onExitLeft, onSelect, isActive]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexWrap: 'nowrap',
      }}
      role="group"
      aria-label="Paket seçenekleri"
    >
      {PLANS.map(function(plan) {
        return (
          <PackageCard
            key={plan}
            plan={plan}
            featured={plan === featuredPlan}
            selected={plan === selectedPlan}
            focused={plan === focusedPlan}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
