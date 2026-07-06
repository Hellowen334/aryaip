/**
 * ChannelListItem.jsx — Tek kanal satırı
 *
 * Fokus stili: soldan sağa turuncu gradyan dolgu, metin koyu renge döner.
 * Canlı yayın ikonu (yayında ise kırmızı nokta).
 *
 * Props:
 *   num       number   — sıra numarası
 *   name      string   — kanal adı
 *   icon      string|null — kanal logosu URL
 *   isLive    boolean  — canlı yayında mı (kırmızı ikon)
 *   focused   boolean  — fokuslu mu
 *   selected  boolean  — seçili kanal mı
 *   style     object   — positioning (virtualization'dan)
 *   onSelect  () => void
 */

import React from 'react';

export default function ChannelListItem(props) {
  var num      = props.num || 1;
  var name     = props.name || '';
  var icon     = props.icon || null;
  var isLive   = props.isLive || false;
  var focused  = props.focused || false;
  var selected = props.selected || false;
  var style    = props.style || {};
  var onSelect = props.onSelect;

  var itemClass = 'channel-list-item';
  if (focused)  itemClass = itemClass + ' channel-list-item--focused';
  if (selected) itemClass = itemClass + ' channel-list-item--selected';

  return (
    <div
      className={itemClass}
      style={style}
      data-focusable="true"
      data-focused={focused ? 'true' : undefined}
      role="option"
      aria-selected={selected ? 'true' : 'false'}
      onClick={function() { if (onSelect) onSelect(); }}
    >
      <span className="channel-list-item__num">{num}</span>
      {icon ? (
        <img className="channel-list-item__icon" src={icon} alt="" />
      ) : (
        <span className="channel-list-item__icon-placeholder" aria-hidden="true">📺</span>
      )}
      <span className="channel-list-item__name">{name}</span>
      {isLive && (
        <span className="channel-list-item__live" aria-label="Canlı yayın">
          <span className="channel-list-item__live-dot" />
        </span>
      )}
    </div>
  );
}
