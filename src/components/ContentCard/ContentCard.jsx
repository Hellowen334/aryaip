/**
 * ContentCard.jsx — İçerik poster kartı
 *
 * Anasayfa, Filmler ve diğer grid/row bileşenlerinde kullanılır.
 * Thumbnail yoksa mor gradyan arka plan gösterir.
 * Fokusta: 3px beyaz border + scale(1.05)
 * Opsiyonel rating rozeti (sol üst köşe)
 *
 * Props:
 *   id          string          — unique focusable id
 *   title       string          — içerik başlığı
 *   thumbnail   string|null     — poster URL (yoksa mor gradyan)
 *   rating      string|number|null — TMDb puanı vb.
 *   focused     boolean         — fokus yöneticisinden gelen
 *   onSelect    () => void      — OK tuşu / click
 *   style       object          — opsiyonel inline stil (width/height override)
 */

import React from 'react';
import './ContentCard.css';

export default function ContentCard(props) {
  var id        = props.id;
  var title     = props.title || '';
  var thumbnail = props.thumbnail || null;
  var rating    = props.rating || null;
  var focused   = props.focused || false;
  var onSelect  = props.onSelect;
  var style     = props.style || {};

  function handleClick() {
    if (onSelect) onSelect();
  }

  function handleKeyDown(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      if (onSelect) onSelect();
    }
  }

  var cardClass = 'content-card';
  if (focused) cardClass = cardClass + ' content-card--focused';

  // Thumbnail yoksa mor gradyan arka planı inline style olarak ekle
  var posterStyle = {};
  if (thumbnail) {
    posterStyle.backgroundImage = 'url(' + thumbnail + ')';
    posterStyle.backgroundSize = 'cover';
    posterStyle.backgroundPosition = 'center';
  }

  return (
    <div
      id={id}
      className={cardClass}
      data-focusable="true"
      data-focused={focused ? 'true' : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={title + (rating ? ', puan: ' + rating : '')}
      style={style}
    >
      <div className="content-card__poster" style={posterStyle}>
        {!thumbnail && (
          <div className="content-card__placeholder">
            <span className="content-card__placeholder-icon" aria-hidden="true">🎬</span>
            <span className="content-card__placeholder-text">DemoVideo</span>
          </div>
        )}
        {rating && (
          <span className="content-card__rating">{rating}</span>
        )}
      </div>
      <div className="content-card__title">{title}</div>
    </div>
  );
}
