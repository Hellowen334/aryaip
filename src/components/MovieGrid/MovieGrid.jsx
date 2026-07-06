/**
 * MovieGrid.jsx — Virtualized film grid'i (Filmler ekranı)
 *
 * Grid layout'ta sadece viewport'taki satırları render eder.
 * TV donanımı için optimize — 1000+ filmde bile akıcı.
 *
 * Props:
 *   movies        Array   — [{id, title, thumbnail, rating}]
 *   focusedIndex  number  — fokuslu film index'i (flat)
 *   isFocused     boolean — grid fokuslu mu
 *   onFocusChange (index) => void
 *   onSelect      (movie) => void
 *   onExitLeft    () => void — sola: CategoryPanel'e geç
 *   columns       number  — sütun sayısı (default: 6)
 *   containerHeight number — grid container yüksekliği
 */

import React, { useEffect, useRef, useState } from 'react';
import ContentCard from '../ContentCard/ContentCard';
import './MovieGrid.css';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

var CARD_HEIGHT = 260; // kart + başlık + gap
var CARD_GAP    = 12;
var BUFFER_ROWS = 2;

export default function MovieGrid(props) {
  var movies         = props.movies || [];
  var focusedIndex   = props.focusedIndex || 0;
  var isFocused      = props.isFocused || false;
  var onFocusChange  = props.onFocusChange;
  var onSelect       = props.onSelect;
  var onExitLeft     = props.onExitLeft;
  var columns        = props.columns || 6;
  var containerHeight = props.containerHeight || 500;

  var containerRef = useRef(null);
  var scrollTopState = useState(0);
  var scrollTop = scrollTopState[0];
  var setScrollTop = scrollTopState[1];

  var rowHeight = CARD_HEIGHT + CARD_GAP;
  var totalRows = Math.ceil(movies.length / columns);
  var totalHeight = totalRows * rowHeight;

  // Fokuslu kartı görünür alana getir
  useEffect(function() {
    if (!isFocused) return;
    var row = Math.floor(focusedIndex / columns);
    var rowTop = row * rowHeight;
    var rowBottom = rowTop + rowHeight;

    if (rowTop < scrollTop) {
      setScrollTop(rowTop);
    } else if (rowBottom > scrollTop + containerHeight) {
      setScrollTop(rowBottom - containerHeight);
    }
  }, [isFocused, focusedIndex, columns, containerHeight]);

  // Görünen satırları hesapla
  var startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
  var endRow   = Math.min(totalRows - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + BUFFER_ROWS);

  var visibleItems = [];
  for (var r = startRow; r <= endRow; r++) {
    for (var c = 0; c < columns; c++) {
      var idx = r * columns + c;
      if (idx < movies.length) {
        visibleItems.push({ movie: movies[idx], index: idx, row: r, col: c });
      }
    }
  }

  // Klavye navigasyonu (2D spatial)
  useEffect(function() {
    if (!isFocused) return;

    function handleKey(e) {
      var row = Math.floor(focusedIndex / columns);
      var col = focusedIndex % columns;

      if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (col > 0) {
          if (onFocusChange) onFocusChange(focusedIndex - 1);
        } else {
          if (onExitLeft) onExitLeft();
        }
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (col < columns - 1 && focusedIndex + 1 < movies.length) {
          if (onFocusChange) onFocusChange(focusedIndex + 1);
        }
      } else if (e.keyCode === KEY_UP) {
        e.preventDefault();
        if (row > 0) {
          var target = focusedIndex - columns;
          if (onFocusChange) onFocusChange(target);
        }
      } else if (e.keyCode === KEY_DOWN) {
        e.preventDefault();
        var targetDown = focusedIndex + columns;
        if (targetDown < movies.length) {
          if (onFocusChange) onFocusChange(targetDown);
        }
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        if (onSelect && movies[focusedIndex]) {
          onSelect(movies[focusedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedIndex, movies, columns, onFocusChange, onSelect, onExitLeft]);

  return (
    <div
      className="movie-grid"
      ref={containerRef}
      style={{ height: containerHeight + 'px' }}
    >
      <div className="movie-grid__viewport" style={{ height: totalHeight + 'px' }}>
        {visibleItems.map(function(entry) {
          var m = entry.movie;
          var i = entry.index;
          var cardStyle = {
            position: 'absolute',
            top: (entry.row * rowHeight) + 'px',
            left: (entry.col * (160 + CARD_GAP)) + 'px',
            width: '160px',
          };

          return (
            <ContentCard
              key={m.id || ('movie-' + i)}
              id={'movie-card-' + i}
              title={m.title}
              thumbnail={m.thumbnail}
              rating={m.rating}
              focused={isFocused && i === focusedIndex}
              onSelect={function() {
                if (onSelect) onSelect(m);
              }}
              style={cardStyle}
            />
          );
        })}
      </div>
    </div>
  );
}
