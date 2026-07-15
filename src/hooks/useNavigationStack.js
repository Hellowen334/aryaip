/**
 * useNavigationStack.js
 * Stack-tabanlı ekran yönetimi — React Router kullanılmaz.
 *
 * API:
 *   current  string          — şu anki ekran adı
 *   stack    string[]        — tam yığın
 *   push(screen)             — yeni ekrana git
 *   pop()                    — önceki ekrana dön (stack boşsa no-op)
 *   replace(screen)          — mevcut ekranı değiştir
 *   reset(screen?)           — yığını sıfırla ('home' veya verilen ekrana)
 *   canPop  boolean          — pop yapılabilir mi (stack.length > 1)
 *
 * Back tuşu (461) entegrasyonu App.jsx'te yapılır:
 *   canPop → pop()
 *   !canPop → ExitPopup aç
 *
 * Ekran adları (sabitler aşağıda):
 *   'home' | 'livetv' | 'movies' | 'series' | 'settings' | 'membership' | 'restricted'
 */

import { useState, useCallback } from 'react';

// Geçerli ekran adları (tip güvenliği için — JS'de enum yoktur)
export var SCREENS = {
  HOME: 'home',
  LIVETV: 'livetv',
  MOVIES: 'movies',
  SERIES: 'series',
  SERIES_GRID: 'series_grid',
  SERIES_DETAIL: 'series_detail',
  SETTINGS: 'settings',
  MEMBERSHIP: 'membership',
  RESTRICTED: 'restricted',
  PLAYER: 'player',
};

/**
 * @param {string} initialScreen — başlangıç ekranı (default: 'home')
 */
export function useNavigationStack(initialScreen) {
  var start = initialScreen || SCREENS.HOME;
  var stackState = useState([start]);
  var stack = stackState[0];
  var setStack = stackState[1];

  var current = stack[stack.length - 1];
  var canPop = stack.length > 1;

  // ── push: yığına yeni ekran ekle ─────────────────────────────────────────
  var push = useCallback(function push(screen) {
    setStack(function(prev) {
      // Aynı ekranı tekrar push etme
      if (prev[prev.length - 1] === screen) return prev;
      return prev.concat([screen]);
    });
  }, []);

  // ── pop: bir önceki ekrana dön ────────────────────────────────────────────
  var pop = useCallback(function pop() {
    setStack(function(prev) {
      if (prev.length <= 1) return prev; // root'tan pop yapılamaz
      return prev.slice(0, prev.length - 1);
    });
  }, []);

  // ── replace: mevcut ekranı değiştir (history'ye ekleme) ──────────────────
  var replace = useCallback(function replace(screen) {
    setStack(function(prev) {
      var base = prev.slice(0, prev.length - 1);
      return base.concat([screen]);
    });
  }, []);

  // ── reset: yığını tamamen sıfırla ─────────────────────────────────────────
  var reset = useCallback(function reset(screen) {
    setStack([screen || SCREENS.HOME]);
  }, []);

  return { stack: stack, current: current, canPop: canPop, push: push, pop: pop, replace: replace, reset: reset };
}
