/**
 * PlayerScreen.jsx — Tam Ekran Medya Oynatıcı
 *
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 * Hls.js veya native HTML5 video elementi kullanarak akışı oynatır.
 * Çoklu ses parçası ve altyazı desteğini dinamik olarak algılar.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import './PlayerScreen.css';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;
var KEY_BACK  = 461;

export default function PlayerScreen(props) {
  var streamUrl = props.streamUrl;
  var title     = props.title || 'Video Oynatıcı';
  var type      = props.type || 'movie'; // 'live' | 'movie' | 'episode'
  var onExit    = props.onExit;

  var videoRef = useRef(null);
  var hlsRef   = useRef(null);
  var hudTimerRef = useRef(null);

  // Oynatıcı Durumları
  var playingState = useState(false);
  var isPlaying = playingState[0];
  var setIsPlaying = playingState[1];

  var loadingState = useState(true);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var errorState = useState(false);
  var hasError = errorState[0];
  var setHasError = errorState[1];

  var errorMsgState = useState('');
  var errorMessage = errorMsgState[0];
  var setErrorMessage = errorMsgState[1];

  var curTimeState = useState(0);
  var currentTime = curTimeState[0];
  var setCurrentTime = curTimeState[1];

  var durState = useState(0);
  var duration = durState[0];
  var setDuration = durState[1];

  // HUD Görünürlük Durumu
  var hudState = useState(true);
  var showHud = hudState[0];
  var setShowHud = hudState[1];

  // Fokus ve Alan Durumları: 'hud' | 'audio_modal' | 'subtitle_modal'
  var zoneState = useState('hud');
  var activeZone = zoneState[0];
  var setActiveZone = zoneState[1];

  // HUD içindeki odaklanmış eleman ID'si: 'back' | 'play' | 'audio' | 'subtitle'
  var hudFocusState = useState('play');
  var hudFocusedId = hudFocusState[0];
  var setHudFocusedId = hudFocusState[1];

  // Ses/Altyazı Listeleri
  var audioState = useState([]);
  var audioTracks = audioState[0];
  var setAudioTracks = audioState[1];

  var subState = useState([]);
  var subtitleTracks = subState[0];
  var setSubtitleTracks = subState[1];

  // Modallardaki Odak Index'i
  var modalFocusState = useState(0);
  var modalFocusedIndex = modalFocusState[0];
  var setModalFocusedIndex = modalFocusState[1];

  var isLive = type === 'live';

  // ── HUD Zamanlayıcı Yönetimi ───────────────────────────────────────────────
  var resetHudTimer = useCallback(function() {
    setShowHud(true);
    if (hudTimerRef.current) {
      clearTimeout(hudTimerRef.current);
    }
    // Modallar açıksa HUD gizlenmemeli
    if (activeZone !== 'hud') return;

    hudTimerRef.current = setTimeout(function() {
      setShowHud(false);
    }, 5000); // 5 saniye hareketsizlik
  }, [activeZone]);

  useEffect(function() {
    resetHudTimer();
    return function() {
      if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    };
  }, [resetHudTimer]);

  // ── Ses ve Altyazı Parçalarını Sorgula ──────────────────────────────────────
  var queryTracks = useCallback(function() {
    var video = videoRef.current;
    if (!video) return;

    // 1. Ses Parçaları Kontrolü
    var nativeAudioTracks = video.audioTracks;
    var tracks = [];
    if (nativeAudioTracks && nativeAudioTracks.length > 0) {
      for (var i = 0; i < nativeAudioTracks.length; i++) {
        tracks.push({
          index: i,
          id: nativeAudioTracks[i].id,
          language: nativeAudioTracks[i].language,
          label: nativeAudioTracks[i].label || nativeAudioTracks[i].language || ('Ses Parçası ' + (i + 1)),
          enabled: nativeAudioTracks[i].enabled
        });
      }
    }
    setAudioTracks(tracks);

    // 2. Altyazı Parçaları Kontrolü
    var nativeTextTracks = video.textTracks;
    var subs = [];
    if (nativeTextTracks && nativeTextTracks.length > 0) {
      var visibleIdx = 0;
      for (var j = 0; j < nativeTextTracks.length; j++) {
        // Sadece altyazı (subtitles/captions) tipindekileri al
        var kind = nativeTextTracks[j].kind;
        if (kind === 'subtitles' || kind === 'captions') {
          subs.push({
            index: j,
            id: nativeTextTracks[j].id || ('sub-' + j),
            language: nativeTextTracks[j].language,
            label: nativeTextTracks[j].label || nativeTextTracks[j].language || ('Altyazı ' + (visibleIdx + 1)),
            mode: nativeTextTracks[j].mode
          });
          visibleIdx++;
        }
      }
    }
    setSubtitleTracks(subs);
  }, []);

  // ── Ses/Altyazı Değiştirme Fonksiyonları ─────────────────────────────────────
  var selectAudioTrack = useCallback(function(index) {
    var video = videoRef.current;
    if (!video || !video.audioTracks) return;

    try {
      var nativeTracks = video.audioTracks;
      if (index >= 0 && index < nativeTracks.length) {
        for (var i = 0; i < nativeTracks.length; i++) {
          nativeTracks[i].enabled = (i === index);
        }
        console.log('[PlayerScreen] Audio track changed to index:', index);
        queryTracks();
      }
    } catch (e) {
      console.error('Error switching audio track:', e);
    }
  }, [queryTracks]);

  var selectSubtitleTrack = useCallback(function(index) {
    var video = videoRef.current;
    if (!video || !video.textTracks) return;

    try {
      var nativeTracks = video.textTracks;
      // index = -1 -> Altyazıyı kapat
      if (index === -1) {
        for (var i = 0; i < nativeTracks.length; i++) {
          nativeTracks[i].mode = 'disabled';
        }
        console.log('[PlayerScreen] Subtitles disabled');
      } else if (index >= 0 && index < nativeTracks.length) {
        for (var j = 0; j < nativeTracks.length; j++) {
          nativeTracks[j].mode = (j === index) ? 'showing' : 'disabled';
        }
        console.log('[PlayerScreen] Subtitle track changed to index:', index);
      }
      queryTracks();
    } catch (e) {
      console.error('Error switching subtitle track:', e);
    }
  }, [queryTracks]);

  // ── Oynatıcı Lifecycle / Kurulum ───────────────────────────────────────────
  useEffect(function() {
    if (!streamUrl) {
      setHasError(true);
      setErrorMessage('Yayına ait URL adresi bulunamadı.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setIsPlaying(false);

    var video = videoRef.current;
    if (!video) return;

    // Temizlik fonksiyonu
    function cleanUpPlayer() {
      if (hlsRef.current) {
        try {
          hlsRef.current.detachMedia();
          hlsRef.current.destroy();
        } catch (e) {
          console.error('[PlayerScreen] Hls destroy error:', e);
        }
        hlsRef.current = null;
      }

      try {
        video.pause();
        video.removeAttribute('src');
        video.load();
      } catch (e) {
        console.error('[PlayerScreen] Video element cleanup error:', e);
      }
    }

    function handleLoadedMetadata() {
      setDuration(video.duration || 0);
      setIsLoading(false);
      queryTracks();
    }

    function handleTimeUpdate() {
      setCurrentTime(video.currentTime || 0);
    }

    function handlePlaying() {
      setIsPlaying(true);
      setIsLoading(false);
    }

    function handlePause() {
      setIsPlaying(false);
    }

    function handleVideoError(e) {
      console.error('[PlayerScreen] Video native error event:', video.error || e);
      var code = video.error ? video.error.code : 0;
      var msg = 'Bilinmeyen bir hata nedeniyle oynatılamıyor.';
      if (code === 1) msg = 'Oynatma işlemi kullanıcı tarafından iptal edildi.';
      if (code === 2) msg = 'Ağ hatası nedeniyle akış yarıda kesildi.';
      if (code === 3) msg = 'Medya kod çözme (decoding) hatası oluştu.';
      if (code === 4) msg = 'Bu akış biçimi cihaz tarafından desteklenmiyor.';
      
      setErrorMessage(msg);
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleVideoError);

    // Hls.js Kontrolü (.m3u8 ise)
    var isHls = streamUrl.toLowerCase().indexOf('.m3u8') !== -1;

    if (isHls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: false, // Eski webOS TV'lerde worker sızıntısı olmaması için
        lowLatencyMode: isLive
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function(err) {
          console.warn('[PlayerScreen] Autoplay block or play error:', err);
        });
      });

      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          console.error('[PlayerScreen] Hls fatal error:', data);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setErrorMessage('HLS oynatıcı hatası nedeniyle akış yüklenemedi.');
            setHasError(true);
            setIsLoading(false);
            cleanUpPlayer();
          }
        }
      });
    } else {
      // Native MP4/MKV veya Native HLS desteği (bazı TV'lerde tarayıcı m3u8 oynatabilir)
      video.src = streamUrl;
      video.load();
      video.play().catch(function(err) {
        console.warn('[PlayerScreen] Native play error:', err);
      });
    }

    return function() {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleVideoError);
      cleanUpPlayer();
    };
  }, [streamUrl, isLive, queryTracks]);

  // ── Buton Aktiflik Durumları ──────────────────────────────────────────────
  var isAudioSwitchable = audioTracks.length > 1;
  var isSubtitleAvailable = subtitleTracks.length > 0;

  // ── HUD Navigasyonu (Odaklanılabilir butonların sıradaki hedefini belirle) ───
  var getNextFocusableId = useCallback(function(currentId, direction) {
    if (direction === 'UP') {
      if (currentId !== 'back') return 'back';
      return 'back';
    }
    if (direction === 'DOWN') {
      if (currentId === 'back') return 'play';
      return currentId;
    }
    // Yatay navigasyon (play <-> audio <-> subtitle)
    var items = ['play'];
    if (isAudioSwitchable) items.push('audio');
    if (isSubtitleAvailable) items.push('subtitle');

    var idx = items.indexOf(currentId);
    if (idx === -1) return 'play'; // back ise ve yatay basıldıysa play'e odaklan

    if (direction === 'LEFT') {
      if (idx > 0) return items[idx - 1];
    }
    if (direction === 'RIGHT') {
      if (idx < items.length - 1) return items[idx + 1];
    }
    return currentId;
  }, [isAudioSwitchable, isSubtitleAvailable]);

  // ── HUD Buton Aksiyonları ──────────────────────────────────────────────────
  var triggerHudAction = useCallback(function(id) {
    var video = videoRef.current;
    if (!video) return;

    if (id === 'back') {
      if (onExit) onExit();
    } else if (id === 'play') {
      if (video.paused) {
        video.play().catch(function(err) { console.warn(err); });
      } else {
        video.pause();
      }
    } else if (id === 'audio') {
      if (isAudioSwitchable) {
        // Aktif parçayı bulup odakla
        var activeIdx = 0;
        for (var i = 0; i < audioTracks.length; i++) {
          if (audioTracks[i].enabled) {
            activeIdx = i;
            break;
          }
        }
        setModalFocusedIndex(activeIdx);
        setActiveZone('audio_modal');
      }
    } else if (id === 'subtitle') {
      if (isSubtitleAvailable) {
        // Aktif altyazıyı bulup odakla
        var activeSubIdx = 0; // default: Kapalı (index 0)
        for (var j = 0; j < subtitleTracks.length; j++) {
          if (subtitleTracks[j].mode === 'showing') {
            activeSubIdx = j + 1; // +1 kaydırma (çünkü 0. index 'Kapalı')
            break;
          }
        }
        setModalFocusedIndex(activeSubIdx);
        setActiveZone('subtitle_modal');
      }
    }
  }, [audioTracks, subtitleTracks, isAudioSwitchable, isSubtitleAvailable, onExit]);

  // ── Global Klavye Yönetimi ──────────────────────────────────────────────────
  useEffect(function() {
    function handleKey(e) {
      // 1. HUD kapalıysa: Herhangi bir tuş HUD'ı açar (BACK hariç)
      if (!showHud && activeZone === 'hud') {
        if (e.keyCode !== KEY_BACK) {
          e.preventDefault();
          resetHudTimer();
          return;
        }
      }

      // HUD açıkken veya modal aktifken resetle
      resetHudTimer();

      // ── ALAN 1: HUD Navigasyonu ────────────────────────────────────────────
      if (activeZone === 'hud') {
        if (e.keyCode === KEY_BACK) {
          e.preventDefault();
          if (onExit) onExit();
          return;
        }

        if (e.keyCode === KEY_LEFT) {
          e.preventDefault();
          setHudFocusedId(getNextFocusableId(hudFocusedId, 'LEFT'));
        } else if (e.keyCode === KEY_RIGHT) {
          e.preventDefault();
          setHudFocusedId(getNextFocusableId(hudFocusedId, 'RIGHT'));
        } else if (e.keyCode === KEY_UP) {
          e.preventDefault();
          setHudFocusedId(getNextFocusableId(hudFocusedId, 'UP'));
        } else if (e.keyCode === KEY_DOWN) {
          e.preventDefault();
          setHudFocusedId(getNextFocusableId(hudFocusedId, 'DOWN'));
        } else if (e.keyCode === KEY_OK) {
          e.preventDefault();
          triggerHudAction(hudFocusedId);
        }
        return;
      }

      // ── ALAN 2: Ses Seçim Modali ──────────────────────────────────────────
      if (activeZone === 'audio_modal') {
        if (e.keyCode === KEY_BACK) {
          e.preventDefault();
          setActiveZone('hud');
          return;
        }
        if (e.keyCode === KEY_UP) {
          e.preventDefault();
          setModalFocusedIndex(function(prev) {
            return prev > 0 ? prev - 1 : audioTracks.length - 1;
          });
        } else if (e.keyCode === KEY_DOWN) {
          e.preventDefault();
          setModalFocusedIndex(function(prev) {
            return prev < audioTracks.length - 1 ? prev + 1 : 0;
          });
        } else if (e.keyCode === KEY_OK) {
          e.preventDefault();
          selectAudioTrack(modalFocusedIndex);
          setActiveZone('hud');
        }
        return;
      }

      // ── ALAN 3: Altyazı Seçim Modali ────────────────────────────────────────
      if (activeZone === 'subtitle_modal') {
        // Altyazılarda ekstra "Kapat" seçeneği olduğu için boyut: tracks.length + 1
        var totalOptions = subtitleTracks.length + 1;

        if (e.keyCode === KEY_BACK) {
          e.preventDefault();
          setActiveZone('hud');
          return;
        }
        if (e.keyCode === KEY_UP) {
          e.preventDefault();
          setModalFocusedIndex(function(prev) {
            return prev > 0 ? prev - 1 : totalOptions - 1;
          });
        } else if (e.keyCode === KEY_DOWN) {
          e.preventDefault();
          setModalFocusedIndex(function(prev) {
            return prev < totalOptions - 1 ? prev + 1 : 0;
          });
        } else if (e.keyCode === KEY_OK) {
          e.preventDefault();
          if (modalFocusedIndex === 0) {
            selectSubtitleTrack(-1); // Kapalı
          } else {
            selectSubtitleTrack(modalFocusedIndex - 1); // Seçilen track
          }
          setActiveZone('hud');
        }
        return;
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [showHud, activeZone, hudFocusedId, audioTracks, subtitleTracks, modalFocusedIndex, getNextFocusableId, triggerHudAction, selectAudioTrack, selectSubtitleTrack, onExit, resetHudTimer]);

  // ── İlerleme Süresi Formatlayıcı ───────────────────────────────────────────
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    var hrs = Math.floor(seconds / 3600);
    var mins = Math.floor((seconds % 3600) / 60);
    var secs = Math.floor(seconds % 60);

    var minsStr = mins < 10 ? '0' + mins : mins;
    var secsStr = secs < 10 ? '0' + secs : secs;

    if (hrs > 0) {
      return hrs + ':' + minsStr + ':' + secsStr;
    }
    return minsStr + ':' + secsStr;
  }

  var progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-screen" onClick={resetHudTimer}>
      {/* Native HTML5 Video Element */}
      <video
        ref={videoRef}
        className="player-video"
        playsInline
      />

      {/* Yükleniyor / Yüklenme Bekleme Spinner'ı */}
      {isLoading && !hasError && (
        <div className="player-loader-overlay">
          <span className="player-spinner" />
          <div className="player-loader-text">Yükleniyor...</div>
        </div>
      )}

      {/* Hata Ekranı */}
      {hasError && (
        <div className="player-error-overlay">
          <span className="player-error-icon" aria-hidden="true">⚠️</span>
          <h2 className="player-error-title">Yayın Oynatılamadı</h2>
          <p className="player-error-desc">{errorMessage}</p>
          <button
            className="player-error-btn player-error-btn--focused"
            onClick={onExit}
          >
            Geri Dön
          </button>
        </div>
      )}

      {/* HUD (Heads-Up Display) Arayüzü */}
      {showHud && !hasError && (
        <div className="player-hud-overlay">
          {/* Üst Bar: Başlık ve Geri */}
          <div className="player-hud-header">
            <button
              className={'player-hud-btn-back' + (hudFocusedId === 'back' ? ' player-hud-btn--focused' : '')}
              data-focused={hudFocusedId === 'back' ? 'true' : undefined}
            >
              <span className="back-arrow" aria-hidden="true">←</span>
            </button>
            <div className="player-hud-title-text">{title}</div>
          </div>

          {/* Orta Kısım: Duraklatılmış İkonu */}
          {!isPlaying && !isLoading && (
            <div className="player-paused-indicator">
              <span className="paused-icon" aria-hidden="true">⏸</span>
            </div>
          )}

          {/* Alt Bar: Kontroller ve Süre */}
          <div className="player-hud-controls-container">
            {/* İlerleme Çubuğu (Live TV değilse gösterilir) */}
            {!isLive && (
              <div className="player-hud-seekbar-row">
                <span className="player-hud-time">{formatTime(currentTime)}</span>
                <div className="player-hud-seekbar-outer">
                  <div
                    className="player-hud-seekbar-inner"
                    style={{ width: progressPercentage + '%' }}
                  />
                </div>
                <span className="player-hud-time">{formatTime(duration)}</span>
              </div>
            )}

            {/* Kontrol Butonları */}
            <div className="player-hud-buttons-row">
              {/* Oynat / Duraklat */}
              <button
                className={'player-control-btn' + (hudFocusedId === 'play' ? ' player-control-btn--focused' : '')}
                data-focused={hudFocusedId === 'play' ? 'true' : undefined}
                aria-label={isPlaying ? 'Duraklat' : 'Oynat'}
              >
                {isPlaying ? '⏸ Duraklat' : '▶ Oynat'}
              </button>

              {/* Ses Seçim Butonu */}
              <button
                className={
                  'player-control-btn' + 
                  (hudFocusedId === 'audio' ? ' player-control-btn--focused' : '') +
                  (!isAudioSwitchable ? ' player-control-btn--disabled' : '')
                }
                data-focused={hudFocusedId === 'audio' ? 'true' : undefined}
                disabled={!isAudioSwitchable}
                aria-label="Ses Dili"
              >
                🔊 Ses Dili {!isAudioSwitchable && '(Tek Ses)'}
              </button>

              {/* Altyazı Seçim Butonu */}
              <button
                className={
                  'player-control-btn' + 
                  (hudFocusedId === 'subtitle' ? ' player-control-btn--focused' : '') +
                  (!isSubtitleAvailable ? ' player-control-btn--disabled' : '')
                }
                data-focused={hudFocusedId === 'subtitle' ? 'true' : undefined}
                disabled={!isSubtitleAvailable}
                aria-label="Altyazı"
              >
                💬 Altyazı {!isSubtitleAvailable && '(Yok)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ses Kanalı Seçim Modali ────────────────────────────────────────── */}
      {activeZone === 'audio_modal' && (
        <div className="player-modal-backdrop">
          <div className="player-modal-content">
            <h3 className="player-modal-title">Ses Dili Seçin</h3>
            <div className="player-modal-list" role="listbox">
              {audioTracks.map(function(track, idx) {
                var isSelected = track.enabled;
                var isFocused  = idx === modalFocusedIndex;
                var itemClass  = 'player-modal-item';
                if (isSelected) itemClass += ' player-modal-item--selected';
                if (isFocused)  itemClass += ' player-modal-item--focused';

                return (
                  <div
                    key={track.id || track.index}
                    className={itemClass}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="check-mark">{isSelected ? '✓' : ''}</span>
                    <span className="track-label">{track.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Altyazı Kanalı Seçim Modali ────────────────────────────────────── */}
      {activeZone === 'subtitle_modal' && (
        <div className="player-modal-backdrop">
          <div className="player-modal-content">
            <h3 className="player-modal-title">Altyazı Seçin</h3>
            <div className="player-modal-list" role="listbox">
              {/* index = 0 -> Altyazıyı Kapat Seçeneği */}
              <div
                className={
                  'player-modal-item' + 
                  (subtitleTracks.every(function(t) { return t.mode !== 'showing'; }) ? ' player-modal-item--selected' : '') +
                  (modalFocusedIndex === 0 ? ' player-modal-item--focused' : '')
                }
                role="option"
              >
                <span className="check-mark">
                  {subtitleTracks.every(function(t) { return t.mode !== 'showing'; }) ? '✓' : ''}
                </span>
                <span className="track-label">Altyazıyı Kapat</span>
              </div>

              {subtitleTracks.map(function(track, idx) {
                var isSelected = track.mode === 'showing';
                var listIdx    = idx + 1; // 0. index 'Altyazıyı Kapat' olduğu için kaydırma
                var isFocused  = listIdx === modalFocusedIndex;
                var itemClass  = 'player-modal-item';
                if (isSelected) itemClass += ' player-modal-item--selected';
                if (isFocused)  itemClass += ' player-modal-item--focused';

                return (
                  <div
                    key={track.id || track.index}
                    className={itemClass}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="check-mark">{isSelected ? '✓' : ''}</span>
                    <span className="track-label">{track.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
