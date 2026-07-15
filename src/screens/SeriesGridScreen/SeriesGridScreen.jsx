/**
 * SeriesGridScreen.jsx — Seviye 2 Ekranı
 *
 * Seçilen dizi kategorisindeki dizi posterlerini listeler.
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

import React, { useState, useEffect } from 'react';
import IptvService from '../../services/iptvService';
import SeriesGrid from '../../components/SeriesGrid/SeriesGrid';
import SearchBar from '../../components/SearchBar/SearchBar';
import SortDropdown from '../../components/SortDropdown/SortDropdown';
import '../../components/SeriesGrid/SeriesGrid.css';

export default function SeriesGridScreen(props) {
  var category         = props.category;
  var isContentFocused = props.isContentFocused || false;
  var onSelectSeries   = props.onSelectSeries;
  var onExitLeft       = props.onExitLeft;

  var seriesListState = useState([]);
  var seriesList = seriesListState[0];
  var setSeriesList = seriesListState[1];

  var loadingState = useState(true);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var focusIndexState = useState(0);
  var focusedIndex = focusIndexState[0];
  var setFocusedIndex = focusIndexState[1];

  useEffect(function() {
    if (!category) return;
    setIsLoading(true);
    
    // Uygulama global playlist config
    var iptvConfig = window.iptvConfig || null;

    IptvService.getSeriesList(iptvConfig, category.id)
      .then(function(result) {
        setSeriesList(result || []);
        setIsLoading(false);
      })
      .catch(function(err) {
        console.error('[SeriesGridScreen] Error fetching series list:', err);
        setIsLoading(false);
      });
  }, [category]);

  var categoryName = category ? category.name : 'Diziler';

  return (
    <div className="series-grid-screen">
      {/* Üst Bar */}
      <div className="screen-header">
        <h1 className="screen-header__title">Diziler — {categoryName}</h1>
        <SearchBar placeholder="Dizi Ara..." />
        <div className="screen-header__spacer" />
        <SortDropdown label="Yıla Göre" />
      </div>

      {/* Grid İçeriği */}
      {isLoading ? (
        <div className="screen-center">
          <div className="lazy-image-spinner" style={{ width: '32px', height: '32px' }}></div>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Diziler yükleniyor...</p>
        </div>
      ) : seriesList.length === 0 ? (
        <div className="screen-center">
          <span style={{ fontSize: '2rem' }}>📺</span>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>Bu kategoride dizi bulunamadı.</p>
          <button
            className="season-tab season-tab--focused"
            style={{ marginTop: '16px' }}
            onClick={onExitLeft}
          >
            Geri Dön
          </button>
        </div>
      ) : (
        <SeriesGrid
          seriesList={seriesList}
          focusedIndex={focusedIndex}
          isFocused={isContentFocused}
          onFocusChange={setFocusedIndex}
          onSelect={onSelectSeries}
          onExitLeft={onExitLeft}
          containerHeight={520}
        />
      )}
    </div>
  );
}
