/**
 * ContentRow.jsx — Yatay scroll kart satırı
 *
 * Anasayfa'da Live ve Movies satırları için kullanılır.
 * Fokus takibi: aktif kart viewport'a scroll edilir.
 *
 * Props:
 *   title         string            — satır başlığı (ör. "Live", "Movies")
 *   items         Array             — [{id, title, thumbnail, rating}]
 *   focusedIndex  number            — o an fokuslu kart index'i
 *   isFocused     boolean           — bu satır fokuslu mu
 *   onFocusChange (index) => void   — kart fokus değiştiğinde
 *   onSelect      (item) => void    — OK tuşuyla seçilince
 *   onExitUp      () => void        — ilk satırda yukarı
 *   onExitDown    () => void        — son satırda aşağı
 *   onExitLeft    () => void        — ilk kartta sol
 *   rowId         string            — unique row identifier
 */

import React, { useEffect, useRef, useCallback } from 'react';
import ContentCard from '../ContentCard/ContentCard';
import './ContentRow.scss';

var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

export default function ContentRow(props) {
  var title         = props.title || '';
  var items         = props.items || [];
  var focusedIndex  = props.focusedIndex || 0;
  var isFocused     = props.isFocused || false;
  var onFocusChange = props.onFocusChange;
  var onSelect      = props.onSelect;
  var onExitUp      = props.onExitUp;
  var onExitDown    = props.onExitDown;
  var onExitLeft    = props.onExitLeft;
  var rowId         = props.rowId || 'row';

  var scrollRef = useRef(null);

  // Fokuslu kartı görünür alana scroll et
  useEffect(function() {
    if (!isFocused || !scrollRef.current) return;
    var cardEl = scrollRef.current.children[focusedIndex];
    if (cardEl) {
      // scrollIntoView TV'de pahalı olabilir, manuel offset hesapla
      var containerLeft = scrollRef.current.scrollLeft;
      var containerWidth = scrollRef.current.clientWidth;
      var cardLeft = cardEl.offsetLeft;
      var cardWidth = cardEl.offsetWidth;

      if (cardLeft < containerLeft) {
        scrollRef.current.scrollLeft = cardLeft - 16;
      } else if (cardLeft + cardWidth > containerLeft + containerWidth) {
        scrollRef.current.scrollLeft = cardLeft + cardWidth - containerWidth + 16;
      }
    }
  }, [isFocused, focusedIndex]);

  // Klavye navigasyonu
  useEffect(function() {
    if (!isFocused) return;

    function handleKey(e) {
      if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (focusedIndex > 0) {
          if (onFocusChange) onFocusChange(focusedIndex - 1);
        } else {
          if (onExitLeft) onExitLeft();
        }
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (focusedIndex < items.length - 1) {
          if (onFocusChange) onFocusChange(focusedIndex + 1);
        }
        // Son kartta → durur (wrap yok)
      } else if (e.keyCode === 38) { // UP
        e.preventDefault();
        if (onExitUp) onExitUp();
      } else if (e.keyCode === 40) { // DOWN
        e.preventDefault();
        if (onExitDown) onExitDown();
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        if (onSelect && items[focusedIndex]) {
          onSelect(items[focusedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedIndex, items, onFocusChange, onSelect, onExitUp, onExitDown, onExitLeft]);

  return (
    <div className="content-row">
      <h2 className="content-row__title">{title}</h2>
      <div className="content-row__scroll" ref={scrollRef}>
        {items.map(function(item, idx) {
          return (
            <ContentCard
              key={item.id || (rowId + '-' + idx)}
              id={rowId + '-card-' + idx}
              title={item.title}
              thumbnail={item.thumbnail}
              rating={item.rating}
              focused={isFocused && idx === focusedIndex}
              onSelect={function() {
                if (onSelect) onSelect(item);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
