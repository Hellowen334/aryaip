/**
 * SeriesCategoryGrid.jsx — Seviye 1: Dizi Kategorileri Grid Bileşeni
 *
 * Sadece ekranda görünen satırları render eden virtualized grid yapısı.
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

import React, { useEffect, useRef, useState } from 'react';
import './SeriesCategoryGrid.css';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

var BUFFER_ROWS = 2;

export default function SeriesCategoryGrid(props) {
  var categories     = props.categories || [];
  var focusedIndex   = props.focusedIndex || 0;
  var isFocused      = props.isFocused || false;
  var onFocusChange  = props.onFocusChange;
  var onSelect       = props.onSelect;
  var onExitLeft     = props.onExitLeft;
  var columns        = props.columns || 4;
  var containerHeight = props.containerHeight || 520;

  var CARD_GAP       = 16;
  var CARD_WIDTH     = 220;
  var CARD_HEIGHT    = 120;
  var rowHeight      = CARD_HEIGHT + CARD_GAP;

  var containerRef = useRef(null);
  var scrollTopState = useState(0);
  var scrollTop = scrollTopState[0];
  var setScrollTop = scrollTopState[1];

  var totalRows = Math.ceil(categories.length / columns);
  var totalHeight = totalRows * rowHeight;

  // Odaklanan kartı viewport içine kaydır
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
  }, [isFocused, focusedIndex, columns, containerHeight, rowHeight, scrollTop]);

  // Görünen satırları hesapla
  var startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - BUFFER_ROWS);
  var endRow   = Math.min(totalRows - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + BUFFER_ROWS);

  var visibleItems = [];
  for (var r = startRow; r <= endRow; r++) {
    for (var c = 0; c < columns; c++) {
      var idx = r * columns + c;
      if (idx < categories.length) {
        visibleItems.push({ category: categories[idx], index: idx, row: r, col: c });
      }
    }
  }

  // Yön tuşu navigasyonu (2D spatial)
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
        if (col < columns - 1 && focusedIndex + 1 < categories.length) {
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
        if (targetDown < categories.length) {
          if (onFocusChange) onFocusChange(targetDown);
        }
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        if (onSelect && categories[focusedIndex]) {
          onSelect(categories[focusedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedIndex, categories, columns, onFocusChange, onSelect, onExitLeft]);

  return (
    <div
      className="series-category-grid"
      ref={containerRef}
      style={{ height: containerHeight + 'px' }}
    >
      <div
        className="series-category-grid__viewport"
        style={{
          height: totalHeight + 'px',
          transform: 'translateY(' + (-scrollTop) + 'px)'
        }}
      >
        {visibleItems.map(function(entry) {
          var cat = entry.category;
          var i = entry.index;
          var focused = isFocused && i === focusedIndex;

          var cardStyle = {
            position: 'absolute',
            top: (entry.row * rowHeight) + 'px',
            left: (entry.col * (CARD_WIDTH + CARD_GAP)) + 'px',
            width: CARD_WIDTH + 'px',
            height: CARD_HEIGHT + 'px'
          };

          return (
            <div
              key={cat.id || ('cat-' + i)}
              id={'cat-card-' + i}
              className={'category-card' + (focused ? ' category-card--focused' : '')}
              data-focusable="true"
              data-focused={focused ? 'true' : undefined}
              onClick={function() {
                if (onSelect) onSelect(cat);
              }}
              style={cardStyle}
              role="button"
              tabIndex={0}
              aria-label={cat.name + (cat.count ? ', ' + cat.count + ' dizi' : '')}
            >
              <div className="category-card__name">{cat.name}</div>
              {cat.count > 0 && (
                <div className="category-card__count">{cat.count} Dizi</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
