/**
 * SeriesDetailScreen.jsx — Seviye 3: Dizi Detay, Sezon ve Bölüm Ekranı
 *
 * Netflix tarzı düzen: Banner + Sezon Seçici (Yatay) + Bölüm Listesi (Dikey).
 * Odak bölgeleri 'seasons' ve 'episodes' arasında yumuşak geçiş yapar.
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import IptvService from '../../services/iptvService';
import LazyImage from '../../components/LazyImage/LazyImage';
import './SeriesDetailScreen.css';

var KEY_UP    = 38;
var KEY_DOWN  = 40;
var KEY_LEFT  = 37;
var KEY_RIGHT = 39;
var KEY_OK    = 13;

// ─── 1. SeasonSelector Component ──────────────────────────────────────────────
function SeasonSelector(props) {
  var seasons         = props.seasons || [];
  var selectedSeason  = props.selectedSeason;
  var focusedIndex    = props.focusedIndex;
  var isActive        = props.isActive;
  var onSelectSeason  = props.onSelectSeason;
  var onFocusChange   = props.onFocusChange;
  var onExitDown      = props.onExitDown;
  var onExitLeft      = props.onExitLeft;

  var containerRef = useRef(null);

  // Sol/Sağ navigasyon ve Aşağı tuş geçişi
  useEffect(function() {
    if (!isActive) return;

    function handleKey(e) {
      if (seasons.length === 0) return;

      if (e.keyCode === KEY_LEFT) {
        e.preventDefault();
        if (focusedIndex > 0) {
          if (onFocusChange) onFocusChange(focusedIndex - 1);
        } else {
          if (onExitLeft) onExitLeft();
        }
      } else if (e.keyCode === KEY_RIGHT) {
        e.preventDefault();
        if (focusedIndex < seasons.length - 1) {
          if (onFocusChange) onFocusChange(focusedIndex + 1);
        }
      } else if (e.keyCode === KEY_DOWN) {
        e.preventDefault();
        if (onExitDown) onExitDown();
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        var targetSeason = seasons[focusedIndex];
        if (targetSeason && onSelectSeason) {
          onSelectSeason(targetSeason.season_number);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isActive, focusedIndex, seasons, onFocusChange, onSelectSeason, onExitDown, onExitLeft]);

  return (
    <div className="season-selector" ref={containerRef} role="tablist">
      {seasons.map(function(s, idx) {
        var isSelected = s.season_number === selectedSeason;
        var isFocused = isActive && idx === focusedIndex;
        var tabClass = 'season-tab';
        if (isSelected) tabClass += ' season-tab--active';
        if (isFocused) tabClass += ' season-tab--focused';

        return (
          <button
            key={s.season_number}
            className={tabClass}
            role="tab"
            aria-selected={isSelected}
            data-focusable="true"
            data-focused={isFocused ? 'true' : undefined}
            onClick={function() {
              if (onSelectSeason) onSelectSeason(s.season_number);
            }}
          >
            {s.name}
          </button>
        );
      })}
    </div>
  );
}

// ─── 2. EpisodeList Component ─────────────────────────────────────────────────
function EpisodeList(props) {
  var episodes        = props.episodes || [];
  var focusedIndex    = props.focusedIndex;
  var isActive        = props.isActive;
  var onFocusChange   = props.onFocusChange;
  var onSelectEpisode = props.onSelectEpisode;
  var onExitUp        = props.onExitUp;

  var containerRef = useRef(null);
  var scrollTopState = useState(0);
  var scrollTop = scrollTopState[0];
  var setScrollTop = scrollTopState[1];

  var containerHeight = 250;
  var rowHeight = 88; // 84px card + 4px gap

  // Sezon/bölüm listesi değiştiğinde scroll konumunu sıfırla
  useEffect(function() {
    setScrollTop(0);
  }, [episodes]);

  // Fokus kaydırma
  useEffect(function() {
    if (!isActive || episodes.length === 0) return;
    var top = focusedIndex * rowHeight;
    var bottom = top + rowHeight;

    if (top < scrollTop) {
      setScrollTop(top);
    } else if (bottom > scrollTop + containerHeight) {
      setScrollTop(bottom - containerHeight);
    }
  }, [isActive, focusedIndex, rowHeight, scrollTop, episodes.length]);

  // Yukarı/Aşağı navigasyon ve Enter/OK
  useEffect(function() {
    if (!isActive) return;

    function handleKey(e) {
      if (episodes.length === 0) return;

      if (e.keyCode === KEY_UP) {
        e.preventDefault();
        if (focusedIndex > 0) {
          if (onFocusChange) onFocusChange(focusedIndex - 1);
        } else {
          if (onExitUp) onExitUp();
        }
      } else if (e.keyCode === KEY_DOWN) {
        e.preventDefault();
        if (focusedIndex < episodes.length - 1) {
          if (onFocusChange) onFocusChange(focusedIndex + 1);
        }
      } else if (e.keyCode === KEY_OK) {
        e.preventDefault();
        var targetEp = episodes[focusedIndex];
        if (targetEp && onSelectEpisode) {
          onSelectEpisode(targetEp);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return function() { window.removeEventListener('keydown', handleKey); };
  }, [isActive, focusedIndex, episodes, onFocusChange, onSelectEpisode, onExitUp]);

  var totalHeight = episodes.length * rowHeight;

  var startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
  var endIdx   = Math.min(episodes.length - 1, Math.ceil((scrollTop + containerHeight) / rowHeight) + 1);

  var visibleEpisodes = [];
  for (var idx = startIdx; idx <= endIdx; idx++) {
    visibleEpisodes.push({ ep: episodes[idx], index: idx });
  }

  return (
    <div className="episode-list" ref={containerRef} style={{ height: containerHeight + 'px' }}>
      <div
        className="episode-list__viewport"
        style={{
          height: totalHeight + 'px',
          transform: 'translateY(' + (-scrollTop) + 'px)'
        }}
      >
        {visibleEpisodes.map(function(item) {
          var ep = item.ep;
          var idx = item.index;
          var isFocused = isActive && idx === focusedIndex;
          var cardClass = 'episode-card';
          if (isFocused) cardClass += ' episode-card--focused';

          return (
            <div
              key={ep.id || ('ep-' + idx)}
              className={cardClass}
              data-focusable="true"
              data-focused={isFocused ? 'true' : undefined}
              onClick={function() {
                if (onSelectEpisode) onSelectEpisode(ep);
              }}
              style={{
                position: 'absolute',
                top: (idx * rowHeight) + 'px',
                height: '80px',
                width: '100%'
              }}
              role="button"
              tabIndex={0}
              aria-label={'Bölüm ' + ep.episode_num + ': ' + ep.title + ', Süre: ' + ep.duration}
            >
              <div className="episode-card__number">{ep.episode_num}</div>
              <div className="episode-card__image-container">
                <LazyImage src={ep.cover} alt={ep.title} />
              </div>
              <div className="episode-card__details">
                <div className="episode-card__title">{ep.title}</div>
                <div className="episode-card__duration">{ep.duration}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. Main Screen Component ────────────────────────────────────────────────
export default function SeriesDetailScreen(props) {
  var seriesId         = props.seriesId;
  var isContentFocused = props.isContentFocused || false;
  var onExitLeft       = props.onExitLeft;

  // Çekilen dizi detay bilgisi
  var dataState = useState(null);
  var detailData = dataState[0];
  var setDetailData = dataState[1];

  var loadingState = useState(true);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var errState = useState(null);
  var error = errState[0];
  var setError = errState[1];

  // Aktif Odak Bölgesi: 'seasons' | 'episodes'
  var zoneState = useState('seasons');
  var currentZone = zoneState[0];
  var setCurrentZone = zoneState[1];

  // Sezon Seçimleri
  var activeSeasonState = useState(1);
  var selectedSeason = activeSeasonState[0];
  var setSelectedSeason = activeSeasonState[1];

  // Odak İndeksleri
  var seasonFocusState = useState(0);
  var seasonFocusedIndex = seasonFocusState[0];
  var setSeasonFocusedIndex = seasonFocusState[1];

  var epFocusState = useState(0);
  var epFocusedIndex = epFocusState[0];
  var setEpFocusedIndex = epFocusState[1];

  // Veriyi çek
  useEffect(function() {
    setIsLoading(true);
    setError(null);
    
    // Uygulama global playlist config (yoksa null verir, mock döner)
    var iptvConfig = window.iptvConfig || null;

    IptvService.getSeriesDetail(iptvConfig, seriesId)
      .then(function(result) {
        if (result) {
          setDetailData(result);
          if (result.seasons && result.seasons.length > 0) {
            setSelectedSeason(result.seasons[0].season_number);
          }
        } else {
          setError('Dizi ayrıntıları bulunamadı.');
        }
        setIsLoading(false);
      })
      .catch(function(err) {
        console.error('[SeriesDetailScreen] Fetch detail error:', err);
        setError('Bağlantı hatası oluştu.');
        setIsLoading(false);
      });
  }, [seriesId]);

  // Sezon değiştiğinde bölüm odağını sıfırla
  var handleSeasonSelect = useCallback(function(seasonNum) {
    setSelectedSeason(seasonNum);
    setEpFocusedIndex(0);
  }, []);

  // Zone Geçiş Tetikleyicileri
  var handleExitDownToEpisodes = useCallback(function() {
    setCurrentZone('episodes');
  }, []);

  var handleExitUpToSeasons = useCallback(function() {
    setCurrentZone('seasons');
  }, []);

  if (isLoading) {
    return (
      <div className="series-detail-screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="lazy-image-spinner" style={{ width: '40px', height: '40px' }}></div>
        <p style={{ marginTop: '12px', fontSize: '0.95rem', color: '#9ca3af' }}>Yükleniyor...</p>
      </div>
    );
  }

  if (error || !detailData) {
    return (
      <div className="series-detail-screen" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <span style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚧</span>
        <p style={{ color: '#ef4444', fontSize: '1rem' }}>{error || 'Bir hata oluştu'}</p>
        <button
          className="season-tab season-tab--focused"
          style={{ marginTop: '16px' }}
          onClick={onExitLeft}
        >
          Geri Dön
        </button>
      </div>
    );
  }

  var info = detailData.info || {};
  var seasons = detailData.seasons || [];
  var episodes = [];
  if (detailData.episodes && selectedSeason !== undefined && selectedSeason !== null) {
    episodes = detailData.episodes[selectedSeason] || 
               detailData.episodes[selectedSeason.toString()] || 
               detailData.episodes[parseInt(selectedSeason, 10)] || [];
  }

  return (
    <div className="series-detail-screen">
      {/* Üst Banner Bölümü */}
      <div className="series-banner">
        <div className="series-banner__cover">
          <LazyImage src={info.cover} alt={info.name} />
        </div>
        <div className="series-banner__info">
          <h1 className="series-banner__title">{info.name}</h1>
          <div className="series-banner__meta-row">
            {info.rating && (
              <span className="series-banner__rating">★ {info.rating}</span>
            )}
            {info.genre && (
              <span className="series-banner__genre">{info.genre}</span>
            )}
          </div>
          <p className="series-banner__plot">{info.plot}</p>
          {(info.cast || info.director) && (
            <div className="series-banner__crew">
              {info.director && (
                <div style={{ marginBottom: '4px' }}>Yönetmen: <span>{info.director}</span></div>
              )}
              {info.cast && (
                <div>Oyuncular: <span>{info.cast}</span></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sezon Seçici (SeasonSelector) */}
      <SeasonSelector
        seasons={seasons}
        selectedSeason={selectedSeason}
        focusedIndex={seasonFocusedIndex}
        isActive={isContentFocused && currentZone === 'seasons'}
        onSelectSeason={handleSeasonSelect}
        onFocusChange={setSeasonFocusedIndex}
        onExitDown={handleExitDownToEpisodes}
        onExitLeft={onExitLeft}
      />

      {/* Bölüm Listesi (EpisodeList) */}
      <EpisodeList
        episodes={episodes}
        focusedIndex={epFocusedIndex}
        isActive={isContentFocused && currentZone === 'episodes'}
        onFocusChange={setEpFocusedIndex}
        onExitUp={handleExitUpToSeasons}
        onSelectEpisode={function(ep) {
          if (props.onPlay && ep.streamUrl) {
            var fullTitle = (detailData && detailData.info ? detailData.info.name : 'Dizi') + 
                            ' - S' + selectedSeason + 'E' + ep.episode_num + ': ' + ep.title;
            props.onPlay(ep.streamUrl, fullTitle, 'episode');
          }
        }}
      />
    </div>
  );
}
