/**
 * CategoryPanel.jsx — Kategori filtre paneli (paylaşımlı)
 *
 * Canlı TV ve Filmler ekranlarında sol tarafta kullanılır.
 * Sabit filtreler (All, Favorite, Recently Viewed / Resume to) üstte,
 * dinamik kategoriler (sağlayıcıdan gelen) altta.
 * Her satır: kategori adı + sayaç.
 *
 * Props:
 *   categories    Array   — [{id, name, count}]
 *   selected      string  — seçili kategori id'si
 *   onSelect      (id) => void
 *   isFocused     boolean — bu panel fokuslu mu
 *   onExitRight   () => void — sağ tuşla listeye/gride geç
 *   onExitLeft    () => void — sol tuşla SideMenu'ye geç
 *   focusedIndex  number  — o an fokuslu satır index'i
 *   onFocusChange (index) => void
 *   type          string  — 'livetv' | 'movies' (sabit filtreler değişir)
 */

import React, { useEffect, useRef } from 'react';
import './CategoryPanel.scss';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

export default function CategoryPanel(props) {
  var categories    = props.categories || [];
  var selected      = props.selected || 'all';
  var onSelect      = props.onSelect;
  var isFocused     = props.isFocused || false;
  var onExitRight   = props.onExitRight;
  var onExitLeft    = props.onExitLeft;
  var focusedIndex  = props.focusedIndex || 0;
  var onFocusChange = props.onFocusChange;
  var type          = props.type || 'livetv';

  var containerRef = useRef(null);

  // Sabit filtreler (tip'e göre)
  var fixedFilters = [];
  if (type === 'livetv') {
    fixedFilters = [
      { id: 'recently-viewed', name: 'Recently Viewed', count: 0 },
    ];
  } else if (type === 'movies' || type === 'series') {
    fixedFilters = [
      { id: 'resume-to', name: 'Resume to', count: 0 },
    ];
  }
  fixedFilters = fixedFilters.concat([
    { id: 'all', name: 'All', count: 0 },
    { id: 'favorite', name: 'Favorite', count: 0 },
  ]);

  // Tüm görüntülenecek öğeler
  var allItems = fixedFilters.concat(categories);

  // "All" kategorisinin count'u = toplam içerik sayısı
  var totalCount = 0;
  for (var c = 0; c < categories.length; c++) {
    totalCount = totalCount + (categories[c].count || 0);
  }
  // allItems'taki 'all' öğesinin count'unu güncelle
  for (var a = 0; a < allItems.length; a++) {
    if (allItems[a].id === 'all') {
      allItems[a] = { id: 'all', name: 'All', count: totalCount };
    }
  }

  // Klavye navigasyonu
  useEffect(function() {
    if (!isFocused) return;

    function handleKey(e) {
      if (e.keyCode === KEY_UP) {
        e.preventDefault();
        if (focusedIndex > 0) {
          if (onFocusChange) onFocusChange(focusedIndex - 1);
        }
      } else if (e.keyCode === KEY_DOWN) {
        e.preventDefault();
        if (focusedIndex < allItems.length - 1) {
          if (onFocusChange) onFocusChange(focusedIndex + 1);
        }
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (onExitRight) onExitRight();
      } else if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (onExitLeft) onExitLeft();
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        var item = allItems[focusedIndex];
        if (item && onSelect) onSelect(item.id);
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedIndex, allItems, onFocusChange, onExitRight, onExitLeft, onSelect]);

  // Fokuslu kategori öğesini görünür alana kaydır
  useEffect(function() {
    if (!isFocused || !containerRef.current) return;
    var container = containerRef.current;
    var focusedEl = container.querySelector('.category-panel__item--focused');
    if (focusedEl) {
      var containerTop = container.scrollTop;
      var containerBottom = containerTop + container.clientHeight;
      var elemTop = focusedEl.offsetTop;
      var elemBottom = elemTop + focusedEl.offsetHeight;

      if (elemTop < containerTop) {
        container.scrollTop = elemTop;
      } else if (elemBottom > containerBottom) {
        container.scrollTop = elemBottom - container.clientHeight;
      }
    }
  }, [focusedIndex, isFocused]);

  // Separator index'i: sabit filtrelerin sonu
  var separatorAfter = fixedFilters.length - 1;

  return (
    <div className="category-panel" ref={containerRef} role="listbox" aria-label="Kategori filtresi">
      {allItems.map(function(item, idx) {
        var isSelected = selected === item.id;
        var isItemFocused = isFocused && idx === focusedIndex;

        var itemClass = 'category-panel__item';
        if (isSelected)    itemClass = itemClass + ' category-panel__item--selected';
        if (isItemFocused) itemClass = itemClass + ' category-panel__item--focused';

        var showSeparator = idx === separatorAfter;

        return (
          <React.Fragment key={item.id}>
            <div
              className={itemClass}
              data-focusable="true"
              data-focused={isItemFocused ? 'true' : undefined}
              role="option"
              aria-selected={isSelected ? 'true' : 'false'}
              tabIndex={isItemFocused ? 0 : -1}
              onClick={function() { if (onSelect) onSelect(item.id); }}
            >
              <span className="category-panel__name">{item.name}</span>
              <span className="category-panel__count">{item.count}</span>
              {isSelected && <span className="category-panel__indicator" aria-hidden="true" />}
            </div>
            {showSeparator && <div className="category-panel__separator" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
