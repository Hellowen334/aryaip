/**
 * HomeScreen.jsx — Anasayfa
 *
 * Üst bar (logo bölgesi + SearchBar + SortDropdown) + kategori satırları (Live, Movies).
 * Diziler satırı bu fazda YOK.
 *
 * Fokus yönetimi:
 *   focusedRow: 0 = Live satırı, 1 = Movies satırı
 *   Her satırda kendi focusedIndex'i var.
 *   ↑/↓: satırlar arası
 *   ←/→: satır içi kartlar arası
 *   İlk karttan ←: onExitLeft → SideMenu
 *
 * Props:
 *   liveChannels    Array   — live kategori öğeleri
 *   movies          Array   — VOD öğeleri
 *   isContentFocused boolean
 *   onExitLeft      () => void — SideMenu'ye geç
 */

import React, { useState, useEffect, useCallback } from 'react';
import ContentRow from '../../components/ContentRow/ContentRow';
import SearchBar from '../../components/SearchBar/SearchBar';
import SortDropdown from '../../components/SortDropdown/SortDropdown';
import './HomeScreen.css';

// Demo veri (gerçek veri bağlantısı sonraki fazda)
var DEMO_LIVE = [];
var DEMO_MOVIES = [];

(function generateDemoData() {
  var liveNames = ['Demo News 1', 'Demo News 2', 'Demo Nature 1', 'Demo Nature 2', 'Demo Nature 3'];
  var movieNames = ['Demo News 1', 'Demo News 2', 'Demo Nature 1', 'Demo Nature 2', 'Demo Nature 3', 'Demo Animals 1', 'Demo Animals 2'];

  for (var i = 0; i < liveNames.length; i++) {
    DEMO_LIVE.push({ id: 'live-' + i, title: liveNames[i], thumbnail: null, rating: null });
  }
  for (var j = 0; j < movieNames.length; j++) {
    DEMO_MOVIES.push({ id: 'movie-' + j, title: movieNames[j], thumbnail: null, rating: '3.5' });
  }
})();

var ROWS = [
  { id: 'live',   title: 'Live' },
  { id: 'movies', title: 'Movies' },
];

export default function HomeScreen(props) {
  var liveChannels     = props.liveChannels || DEMO_LIVE;
  var movies           = props.movies || DEMO_MOVIES;
  var isContentFocused = props.isContentFocused || false;
  var onExitLeft       = props.onExitLeft;

  // Fokuslu satır index'i
  var rowState = useState(0);
  var focusedRow = rowState[0];
  var setFocusedRow = rowState[1];

  // Her satır için kart fokus index'i
  var cardFocusState0 = useState(0);
  var cardFocus0 = cardFocusState0[0];
  var setCardFocus0 = cardFocusState0[1];

  var cardFocusState1 = useState(0);
  var cardFocus1 = cardFocusState1[0];
  var setCardFocus1 = cardFocusState1[1];

  // Satır verisi
  var rowData = [liveChannels, movies];
  var cardFocuses = [cardFocus0, cardFocus1];
  var setCardFocuses = [setCardFocus0, setCardFocus1];

  var handleExitUp = useCallback(function() {
    if (focusedRow > 0) setFocusedRow(focusedRow - 1);
  }, [focusedRow]);

  var handleExitDown = useCallback(function() {
    if (focusedRow < ROWS.length - 1) setFocusedRow(focusedRow + 1);
  }, [focusedRow]);

  return (
    <div className="home-screen">
      {/* Üst bar */}
      <div className="screen-header">
        <SearchBar placeholder="Search..." />
        <div className="screen-header__spacer" />
        <SortDropdown label="Order by number" />
      </div>

      {/* İçerik satırları */}
      <div className="home-screen__content">
        {ROWS.map(function(row, rIdx) {
          return (
            <ContentRow
              key={row.id}
              rowId={row.id}
              title={row.title}
              items={rowData[rIdx]}
              focusedIndex={cardFocuses[rIdx]}
              isFocused={isContentFocused && focusedRow === rIdx}
              onFocusChange={setCardFocuses[rIdx]}
              onExitUp={rIdx === 0 ? undefined : handleExitUp}
              onExitDown={rIdx === ROWS.length - 1 ? undefined : handleExitDown}
              onExitLeft={onExitLeft}
              onSelect={function(item) {
                // TODO: navigate to item detail
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
