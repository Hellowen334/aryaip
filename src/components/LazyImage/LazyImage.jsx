/**
 * LazyImage.jsx — Görsel ertelemeli yükleme bileşeni
 *
 * IntersectionObserver desteği olan cihazlarda görünür olana kadar yüklemeyi erteler.
 * Eski WebOS cihazlarda doğrudan yükler.
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

import React, { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

export default function LazyImage(props) {
  var src       = props.src;
  var alt       = props.alt || '';
  var className = props.className || '';

  var containerRef = useRef(null);

  // IntersectionObserver desteğine göre ilk durum
  var supportsObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window;
  
  var intersectState = useState(!supportsObserver);
  var isIntersecting = intersectState[0];
  var setIsIntersecting = intersectState[1];

  var loadState = useState(false);
  var isLoaded = loadState[0];
  var setIsLoaded = loadState[1];

  var errorState = useState(false);
  var hasError = errorState[0];
  var setHasError = errorState[1];

  useEffect(function() {
    if (!supportsObserver || isIntersecting) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '100px' // Ekrana yaklaşırken önceden yükle
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return function() {
      observer.disconnect();
    };
  }, [supportsObserver, isIntersecting]);

  function handleImageLoad() {
    setIsLoaded(true);
  }

  function handleImageError() {
    setHasError(true);
  }

  return (
    <div className={'lazy-image-container ' + className} ref={containerRef}>
      {isIntersecting && !hasError && src ? (
        <img
          src={src}
          alt={alt}
          className={'lazy-image' + (isLoaded ? ' lazy-image--loaded' : '')}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : null}

      {/* Yükleniyor veya Boş Durum Görünümü */}
      {!isLoaded && !hasError && (
        <div className="lazy-image-placeholder">
          <div className="lazy-image-spinner"></div>
        </div>
      )}

      {/* Hata Durumu Görünümü */}
      {hasError && (
        <div className="lazy-image-placeholder">
          <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🎬</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Yüklenemedi</span>
        </div>
      )}
    </div>
  );
}
