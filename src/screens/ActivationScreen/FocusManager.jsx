/**
 * FocusManager.jsx
 * remote-focus-nav skill kuralları:
 *   - data-focusable="true" öğeler arasında yön tuşu navigasyonu
 *   - Yön tuşları: ArrowLeft(37) ArrowUp(38) ArrowRight(39) ArrowDown(40)
 *     NOT: webOS key code'larını varsayım yapma — resmi dokümana göre
 *     standart DOM key code'ları (37-40) webOS'ta geçerlidir ancak
 *     test edilmeli. webOS 6+ KeyboardEvent.key kullanımına geç.
 *   - Back tuşu (webOS key 461):
 *     Kök ekranda webOS.platformBack() KULLANILMAZ — custom exit popup aç.
 *   - Fokuslu eleman görsel olarak belirgin (CSS outline/scale)
 *
 * Props:
 *   containerRef  — React ref, navigasyonun sınırlı olduğu kapsayıcı element
 *   onBack        — Back tuşu callback (exit popup'ı açmak için)
 *   onFocusChange — (focusedId: string) => void
 */

import { useEffect, useCallback } from 'react';

// webOS Back tuşu key code (webOS 3.x-6.x)
const WEBOS_BACK_KEY = 461;

// Standart yön tuşu key code'ları
const KEY_LEFT  = 37;
const KEY_UP    = 38;
const KEY_RIGHT = 39;
const KEY_DOWN  = 40;
const KEY_OK    = 13; // Enter / OK butonu

export default function FocusManager({ containerRef, onBack, onFocusChange }) {
  /**
   * Kapsayıcı içindeki tüm focusable öğeleri döner.
   */
  const getFocusableElements = useCallback(function getFocusableElements() {
    if (!containerRef || !containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll('[data-focusable="true"]:not([disabled])')
    );
  }, [containerRef]);

  /**
   * Şu an odaklanan öğenin index'ini döner.
   */
  const getCurrentIndex = useCallback((elements) => {
    const active = document.activeElement;
    return elements.findIndex((el) => el === active || el.contains(active));
  }, []);

  /**
   * Hedef öğeye fokus ver ve callback'i çağır.
   */
  const focusElement = useCallback(function focusElement(el) {
    if (!el) return;
    el.focus({ preventScroll: true });
    if (onFocusChange) onFocusChange(el.id || null);
  }, [onFocusChange]);

  const handleKeyDown = useCallback((e) => {
    const { keyCode } = e;

    // Back tuşu — custom popup, platformBack() yok
    if (keyCode === WEBOS_BACK_KEY) {
      e.preventDefault();
      e.stopPropagation();
      if (onBack) onBack();
      return;
    }

    const elements = getFocusableElements();
    if (elements.length === 0) return;

    const currentIndex = getCurrentIndex(elements);
    const safeIndex = currentIndex < 0 ? 0 : currentIndex;

    let nextIndex = safeIndex;

    // Navigasyon: şu an tek eksen (dikey liste) — yatay da destekleniyor
    switch (keyCode) {
      case KEY_UP:
      case KEY_LEFT:
        e.preventDefault();
        nextIndex = safeIndex > 0 ? safeIndex - 1 : elements.length - 1;
        break;

      case KEY_DOWN:
      case KEY_RIGHT:
        e.preventDefault();
        nextIndex = safeIndex < elements.length - 1 ? safeIndex + 1 : 0;
        break;

      case KEY_OK:
        e.preventDefault();
        // Enter tuşu şu an odaklı elemana tıkla
        elements[safeIndex]?.click();
        return;

      default:
        return; // Diğer tuşlara müdahale etme
    }

    focusElement(elements[nextIndex]);
  }, [getFocusableElements, getCurrentIndex, focusElement, onBack]);

  // Ekran mount olduğunda ilk focusable öğeye otomatik fokus ver
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = getFocusableElements();
      if (elements.length > 0) {
        focusElement(elements[0]);
      }
    }, 100); // CSS animasyonunun bitmesini bekle

    return () => clearTimeout(timer);
  }, [getFocusableElements, focusElement]);

  // Global keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // Render yok, sadece davranış
}
