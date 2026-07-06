/**
 * ChannelList.jsx — Virtualized kanal listesi (Canlı TV)
 *
 * 100+ kanal olabileceğinden, yalnızca görünen + buffer kadar DOM öğesi render edilir.
 * 3. parti kütüphane kullanılmaz — absolute-position tabanlı basit virtualization.
 *
 * Props:
 *   channels      Array   — [{id, num, name, icon, isLive}]
 *   selectedId    string  — seçili kanal id'si
 *   focusedIndex  number  — fokuslu kanal index'i
 *   isFocused     boolean — bu liste fokuslu mu
 *   onFocusChange (index) => void
 *   onSelect      (channel) => void — OK ile seçim
 *   onExitLeft    () => void — sola: CategoryPanel'e geç
 *   onExitRight   () => void — sağa: LivePreview'e geç
 *   listHeight    number  — container yüksekliği (px)
 */

import React, { useEffect, useRef, useState } from 'react';
import ChannelListItem from './ChannelListItem';
import './ChannelList.css';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

var ITEM_HEIGHT = 44; // px — her kanal satırının yüksekliği
var BUFFER_SIZE = 5;  // ekran dışında render edilen ekstra öğe sayısı

export default function ChannelList(props) {
  var channels      = props.channels || [];
  var selectedId    = props.selectedId || null;
  var focusedIndex  = props.focusedIndex || 0;
  var isFocused     = props.isFocused || false;
  var onFocusChange = props.onFocusChange;
  var onSelect      = props.onSelect;
  var onExitLeft    = props.onExitLeft;
  var onExitRight   = props.onExitRight;
  var listHeight    = props.listHeight || 400;

  var containerRef  = useRef(null);
  var scrollTopState = useState(0);
  var scrollTop = scrollTopState[0];
  var setScrollTop = scrollTopState[1];

  var totalHeight = channels.length * ITEM_HEIGHT;

  // Fokuslu öğeyi görünür alana getir
  useEffect(function() {
    if (!isFocused) return;
    var itemTop = focusedIndex * ITEM_HEIGHT;
    var itemBottom = itemTop + ITEM_HEIGHT;

    if (itemTop < scrollTop) {
      setScrollTop(itemTop);
    } else if (itemBottom > scrollTop + listHeight) {
      setScrollTop(itemBottom - listHeight);
    }
  }, [isFocused, focusedIndex, listHeight]);

  // Görünen öğeleri hesapla
  var startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
  var endIndex   = Math.min(channels.length - 1, Math.ceil((scrollTop + listHeight) / ITEM_HEIGHT) + BUFFER_SIZE);

  var visibleItems = [];
  for (var i = startIndex; i <= endIndex; i++) {
    visibleItems.push({ channel: channels[i], index: i });
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
        if (focusedIndex < channels.length - 1) {
          if (onFocusChange) onFocusChange(focusedIndex + 1);
        }
      } else if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (onExitLeft) onExitLeft();
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (onExitRight) onExitRight();
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        if (onSelect && channels[focusedIndex]) {
          onSelect(channels[focusedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedIndex, channels, onFocusChange, onSelect, onExitLeft, onExitRight]);

  return (
    <div
      className="channel-list"
      ref={containerRef}
      style={{ height: listHeight + 'px' }}
      role="listbox"
      aria-label="Kanal listesi"
    >
      <div className="channel-list__viewport" style={{ height: totalHeight + 'px' }}>
        {visibleItems.map(function(entry) {
          var ch = entry.channel;
          var idx = entry.index;
          return (
            <ChannelListItem
              key={ch.id || ('ch-' + idx)}
              num={ch.num || (idx + 1)}
              name={ch.name}
              icon={ch.icon}
              isLive={ch.isLive}
              focused={isFocused && idx === focusedIndex}
              selected={ch.id === selectedId}
              style={{
                position: 'absolute',
                top: (idx * ITEM_HEIGHT) + 'px',
                left: 0,
                right: 0,
                height: ITEM_HEIGHT + 'px',
              }}
              onSelect={function() {
                if (onSelect) onSelect(ch);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
