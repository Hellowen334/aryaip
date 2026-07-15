/**
 * LivePreview.jsx — Canlı yayın ön izleme paneli
 *
 * Canlı TV ekranının sağ tarafında: seçili kanalın canlı yayın önizlemesi,
 * kanal adı ve EPG/Favorite butonları.
 * Bu fazda hls.js entegrasyonu yapılmaz — sadece placeholder görünüm.
 *
 * Props:
 *   channel       object|null — {id, name, icon, streamUrl}
 *   isFocused     boolean     — preview paneli fokuslu mu
 *   focusedButton number      — hangi buton fokuslu (0=EPG, 1=Favorite)
 *   onFocusChange (index) => void
 *   onExitLeft    () => void  — sola: ChannelList'e geç
 *   onToggleFavorite () => void
 *   onOpenEPG     () => void
 */

import React, { useEffect } from 'react';
import { useChannelPreview } from '../../hooks/useChannelPreview';
import './LivePreview.scss';

var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

export default function LivePreview(props) {
  var channel       = props.channel || null;
  var isFocused     = props.isFocused || false;
  var focusedButton = props.focusedButton || 0;
  var onFocusChange = props.onFocusChange;
  var onExitLeft    = props.onExitLeft;
  var onToggleFavorite = props.onToggleFavorite;
  var onOpenEPG     = props.onOpenEPG;
  var onPlay        = props.onPlay;

  var preview = useChannelPreview(channel);

  // Klavye navigasyonu (butonlar arası)
  useEffect(function() {
    if (!isFocused) return;

    function handleKey(e) {
      if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (focusedButton > 0) {
          if (onFocusChange) onFocusChange(focusedButton - 1);
        } else {
          if (onExitLeft) onExitLeft();
        }
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (focusedButton < 2) {
          if (onFocusChange) onFocusChange(focusedButton + 1);
        }
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        if (focusedButton === 0 && onPlay && channel && channel.streamUrl) {
          onPlay(channel.streamUrl, channel.name, 'live');
        } else if (focusedButton === 1 && onOpenEPG) {
          onOpenEPG();
        } else if (focusedButton === 2 && onToggleFavorite) {
          onToggleFavorite();
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isFocused, focusedButton, onFocusChange, onExitLeft, onOpenEPG, onToggleFavorite]);

  if (!channel) {
    return (
      <div className="live-preview live-preview--empty">
        <div className="live-preview__placeholder">
          <span className="live-preview__placeholder-text">Kanal seçin</span>
        </div>
      </div>
    );
  }

  return (
    <div className="live-preview">
      {/* Video alanı */}
      <div className="live-preview__video">
        {preview.error ? (
          <div className="live-preview__video-fallback">
            {channel.icon ? (
              <img className="live-preview__video-fallback-img" src={channel.icon} alt="" />
            ) : (
              <div className="live-preview__video-fallback-placeholder" aria-hidden="true">📡</div>
            )}
            <div className="live-preview__video-error-badge">
              <span className="live-preview__video-error-icon" aria-hidden="true">⚠️</span>
              <span>Yayın yüklenemedi</span>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={preview.videoRef}
              className="live-preview__video-player"
              muted
              autoPlay
              playsInline
              style={{ display: preview.isPlaying ? 'block' : 'none' }}
            />
            {(preview.isLoading || !preview.isPlaying) && (
              <div className="live-preview__video-loader">
                <span className="live-preview__loader-spinner" />
                <span className="live-preview__video-text">Bağlanıyor...</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Kanal bilgisi */}
      <div className="live-preview__info">
        {channel.icon && (
          <img className="live-preview__channel-icon" src={channel.icon} alt="" />
        )}
        <span className="live-preview__channel-name">{channel.name}</span>
      </div>

      {/* Aksiyon butonları */}
      <div className="live-preview__actions">
        <button
          className={'live-preview__btn' + (isFocused && focusedButton === 0 ? ' live-preview__btn--focused' : '')}
          data-focusable="true"
          data-focused={isFocused && focusedButton === 0 ? 'true' : undefined}
          tabIndex={isFocused && focusedButton === 0 ? 0 : -1}
          onClick={function() {
            if (onPlay && channel && channel.streamUrl) onPlay(channel.streamUrl, channel.name, 'live');
          }}
        >
          <span aria-hidden="true">▶</span> Oynat
        </button>
        <button
          className={'live-preview__btn' + (isFocused && focusedButton === 1 ? ' live-preview__btn--focused' : '')}
          data-focusable="true"
          data-focused={isFocused && focusedButton === 1 ? 'true' : undefined}
          tabIndex={isFocused && focusedButton === 1 ? 0 : -1}
          onClick={onOpenEPG}
        >
          <span aria-hidden="true">📋</span> EPG
        </button>
        <button
          className={'live-preview__btn' + (isFocused && focusedButton === 2 ? ' live-preview__btn--focused' : '')}
          data-focusable="true"
          data-focused={isFocused && focusedButton === 2 ? 'true' : undefined}
          tabIndex={isFocused && focusedButton === 2 ? 0 : -1}
          onClick={onToggleFavorite}
        >
          <span aria-hidden="true">💛</span> Favorite
        </button>
      </div>
    </div>
  );
}
