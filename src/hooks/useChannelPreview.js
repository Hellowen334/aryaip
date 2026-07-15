/**
 * useChannelPreview.js — Canlı yayın önizleme hook'u
 *
 * Performans ve bellek yönetimi kuralları:
 * - 400ms debounce: Fokus değiştiğinde hemen yükleme yapılmaz, bekletilir.
 * - Tam dispose: Yeni preview başlamadan veya unmount durumunda önceki
 *   hls instance'ı yok edilir (hls.destroy()) ve video.src boşaltılır.
 * - Muted autoplay oynatılır.
 * - Hata durumlarında fail-silent olarak error state'ine dönülür.
 */

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export function useChannelPreview(channel) {
  var videoRef = useRef(null);
  var hlsRef = useRef(null);

  var loadingState = useState(false);
  var isLoading = loadingState[0];
  var setIsLoading = loadingState[1];

  var playingState = useState(false);
  var isPlaying = playingState[0];
  var setIsPlaying = playingState[1];

  var errorState = useState(false);
  var error = errorState[0];
  var setError = errorState[1];

  useEffect(function() {
    if (!channel || !channel.streamUrl) {
      setIsLoading(false);
      setIsPlaying(false);
      setError(false);
      return;
    }

    // Fokus değiştiği anda yükleme durumunu başlat ama video akışını beklet
    setIsLoading(true);
    setIsPlaying(false);
    setError(false);

    // 400ms debounce
    var timer = setTimeout(function() {
      var video = videoRef.current;
      if (!video) return;

      var streamUrl = channel.streamUrl;

      // Önceki herhangi bir kalıntıyı temizle (güvenlik önlemi)
      cleanUpPlayer();

      function handleError(err) {
        console.warn('Channel preview load error:', err);
        setError(true);
        setIsLoading(false);
        setIsPlaying(false);
        cleanUpPlayer();
      }

      function handlePlaying() {
        setIsPlaying(true);
        setIsLoading(false);
      }

      if (Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: false, // Eski webOS cihazlarda worker sızıntılarını önlemek için false
          lowLatencyMode: true
        });
        hlsRef.current = hls;

        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          try {
            var playPromise = video.play();
            if (playPromise !== undefined && typeof playPromise.then === 'function') {
              playPromise.then(handlePlaying).catch(handleError);
            } else {
              handlePlaying();
            }
          } catch (e) {
            handleError(e);
          }
        });

        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data.fatal) {
            handleError(data);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS desteği (Safari veya bazı webOS sürümleri)
        video.src = streamUrl;

        var onPlay = function() {
          handlePlaying();
        };

        var onErr = function(e) {
          handleError(e);
        };

        video.addEventListener('playing', onPlay);
        video.addEventListener('error', onErr);

        // Listener'ları temizlemek için referanslarını sakla
        video._nativeListeners = {
          playing: onPlay,
          error: onErr
        };

        try {
          var playPromise = video.play();
          if (playPromise !== undefined && typeof playPromise.then === 'function') {
            playPromise.then(handlePlaying).catch(handleError);
          } else {
            handlePlaying();
          }
        } catch (e) {
          handleError(e);
        }
      } else {
        // HLS desteği yoksa hata durumuna geç
        handleError('HLS not supported in this browser');
      }
    }, 400);

    function cleanUpPlayer() {
      // 1. Hls.js instance'ını tamamen yok et
      if (hlsRef.current) {
        try {
          hlsRef.current.detachMedia();
          hlsRef.current.destroy();
        } catch (e) {
          console.error('Error destroying Hls.js:', e);
        }
        hlsRef.current = null;
      }

      // 2. Video elementini durdur ve src temizle
      var video = videoRef.current;
      if (video) {
        try {
          video.pause();

          if (video._nativeListeners) {
            video.removeEventListener('playing', video._nativeListeners.playing);
            video.removeEventListener('error', video._nativeListeners.error);
            delete video._nativeListeners;
          }

          video.removeAttribute('src');
          video.load(); // Buffer'ı temizlemek için zorunlu
        } catch (e) {
          console.error('Error cleaning up video element:', e);
        }
      }
    }

    return function() {
      clearTimeout(timer);
      cleanUpPlayer();
    };
  }, [channel]);

  return {
    videoRef: videoRef,
    isLoading: isLoading,
    isPlaying: isPlaying,
    error: error
  };
}
