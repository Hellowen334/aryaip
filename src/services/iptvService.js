/**
 * iptvService.js — IPTV API ve Playlist Servisi
 *
 * Xtream Codes API ve M3U playlist entegrasyonu sağlar.
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

var seriesParser = require('../utils/seriesParser');

// M3U Playlist Cache'i
var m3uCache = null;

// Mock Veriler (Fallback için)
var MOCK_CATEGORIES = [
  { id: 'hbo', name: 'Mock HBO', count: 2 },
  { id: 'netflix', name: 'Mock Netflix', count: 2 }
];

var MOCK_SERIES = {
  hbo: [
    { id: 'got', name: 'Game of Thrones', cover: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=260&h=380&fit=crop', rating: '9.3', categoryId: 'hbo' },
    { id: 'westworld', name: 'Westworld', cover: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=260&h=380&fit=crop', rating: '8.6', categoryId: 'hbo' }
  ],
  netflix: [
    { id: 'stranger_things', name: 'Stranger Things', cover: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=260&h=380&fit=crop', rating: '8.7', categoryId: 'netflix' },
    { id: 'dark', name: 'Dark', cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=260&h=380&fit=crop', rating: '8.8', categoryId: 'netflix' }
  ]
};

var MOCK_DETAILS = {
  got: {
    info: {
      name: 'Game of Thrones',
      cover: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=600&h=350&fit=crop',
      plot: 'Dokuz asil aile, efsanevi Westeros topraklarının kontrolünü ele geçirmek için savaşırken, binlerce yıldır uykuda olan antik bir düşman geri dönüyor.',
      rating: '9.3',
      genre: 'Aksiyon, Macera, Drama',
      cast: 'Emilia Clarke, Kit Harington, Peter Dinklage',
      director: 'David Benioff, D.B. Weiss'
    },
    seasons: [
      { season_number: 1, name: 'Sezon 1' },
      { season_number: 2, name: 'Sezon 2' }
    ],
    episodes: {
      1: [
        { id: 'got_s1e1', episode_num: 1, title: 'Winter Is Coming', duration: '62 dk', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
        { id: 'got_s1e2', episode_num: 2, title: 'The Kingsroad', duration: '56 dk', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ],
      2: [
        { id: 'got_s2e1', episode_num: 1, title: 'The North Remembers', duration: '53 dk', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    }
  },
  westworld: {
    info: {
      name: 'Westworld',
      cover: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=350&fit=crop',
      plot: 'Yapay zekanın yükselişini ve karanlık arzuların yaşandığı fütüristik bir vahşi batı eğlence parkını konu alan karanlık bir macera.',
      rating: '8.6',
      genre: 'Bilim Kurgu, Gizem',
      cast: 'Evan Rachel Wood, Jeffrey Wright, Ed Harris',
      director: 'Jonathan Nolan, Lisa Joy'
    },
    seasons: [
      { season_number: 1, name: 'Sezon 1' }
    ],
    episodes: {
      1: [
        { id: 'ww_s1e1', episode_num: 1, title: 'The Original', duration: '68 dk', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    }
  },
  stranger_things: {
    info: {
      name: 'Stranger Things',
      cover: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600&h=350&fit=crop',
      plot: 'Küçük bir kasabada bir çocuk kaybolduğunda, kasaba halkı gizemli deneyler, doğaüstü güçler ve küçük, tuhaf bir kızı içeren bir sırrı ortaya çıkarır.',
      rating: '8.7',
      genre: 'Dram, Fantezi, Korku',
      cast: 'Millie Bobby Brown, Finn Wolfhard, Winona Ryder',
      director: 'Matt Duffer, Ross Duffer'
    },
    seasons: [
      { season_number: 1, name: 'Sezon 1' }
    ],
    episodes: {
      1: [
        { id: 'st_s1e1', episode_num: 1, title: 'Chapter One: The Vanishing of Will Byers', duration: '47 dk', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    }
  },
  dark: {
    info: {
      name: 'Dark',
      cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&h=350&fit=crop',
      plot: 'İki küçük çocuğun kaybolması, dört aile arasındaki kopuk ilişkileri, çifte yaşamları ve üç nesle yayılan gizemli geçmişi ortaya çıkarır.',
      rating: '8.8',
      genre: 'Suç, Dram, Gizem',
      cast: 'Louis Hofmann, Maja Schöne, Oliver Masucci',
      director: 'Baran bo Odar, Jantje Friese'
    },
    seasons: [
      { season_number: 1, name: 'Sezon 1' }
    ],
    episodes: {
      1: [
        { id: 'dark_s1e1', episode_num: 1, title: 'Secrets', duration: '51 dk', streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' }
      ]
    }
  }
};

/**
 * XMLHttpRequest tabanlı HTTP get isteği
 */
function httpGet(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.timeout = 15000;
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(new Error('HTTP Error: ' + xhr.status));
        }
      }
    };
    xhr.ontimeout = function() {
      reject(new Error('Bağlantı zaman aşımına uğradı'));
    };
    xhr.open('GET', url, true);
    xhr.send();
  });
}

/**
 * M3U listesini yükler ve parse eder
 */
var m3uPromise = null;
function loadAndCacheM3u(m3uUrl) {
  if (m3uCache) return Promise.resolve(m3uCache);
  if (m3uPromise) return m3uPromise;
  
  m3uPromise = httpGet(m3uUrl).then(function(text) {
    m3uCache = seriesParser.parseM3uPlaylist(text);
    m3uPromise = null;
    return m3uCache;
  }).catch(function(err) {
    m3uPromise = null;
    throw err;
  });
  
  return m3uPromise;
}

/**
 * Servis API Nesnesi
 */
var IptvService = {
  /**
   * Dizi Kategorilerini Alır
   */
  getSeriesCategories: function(config) {
    if (!config || !config.url) {
      // Mock Fallback
      return Promise.resolve(MOCK_CATEGORIES);
    }

    if (config.type === 'm3u') {
      return loadAndCacheM3u(config.url).then(function(cache) {
        return cache.categories;
      });
    }

    // Xtream Codes
    var url = config.url + '/player_api.php?username=' + encodeURIComponent(config.username) +
              '&password=' + encodeURIComponent(config.password) + '&action=get_series_categories';
    
    return httpGet(url).then(function(text) {
      var categories = JSON.parse(text);
      return categories.map(function(c) {
        return {
          id: String(c.category_id),
          name: c.category_name,
          count: 0
        };
      });
    });
  },

  /**
   * Belirli bir kategorideki dizileri alır
   */
  getSeriesList: function(config, categoryId) {
    if (!config || !config.url) {
      // Mock Fallback
      if (categoryId === 'all') {
        var allMock = [];
        for (var cKey in MOCK_SERIES) {
          if (MOCK_SERIES.hasOwnProperty(cKey)) {
            allMock = allMock.concat(MOCK_SERIES[cKey]);
          }
        }
        return Promise.resolve(allMock);
      }
      return Promise.resolve(MOCK_SERIES[categoryId] || []);
    }

    if (config.type === 'm3u') {
      return loadAndCacheM3u(config.url).then(function(cache) {
        var list = [];
        if (categoryId === 'all') {
          for (var cat in cache.series) {
            if (cache.series.hasOwnProperty(cat)) {
              var sGroup = cache.series[cat];
              for (var key in sGroup) {
                if (sGroup.hasOwnProperty(key)) {
                  list.push({
                    id: sGroup[key].id,
                    name: sGroup[key].name,
                    cover: sGroup[key].cover,
                    categoryId: sGroup[key].categoryId
                  });
                }
              }
            }
          }
        } else {
          var seriesGroup = cache.series[categoryId] || {};
          for (var key in seriesGroup) {
            if (seriesGroup.hasOwnProperty(key)) {
              var s = seriesGroup[key];
              list.push({
                id: s.id,
                name: s.name,
                cover: s.cover,
                categoryId: s.categoryId
              });
            }
          }
        }
        return list;
      });
    }

    // Xtream Codes
    var catParam = (categoryId === 'all' || categoryId === 'favorite' || categoryId === 'resume-to') ? '' : '&category_id=' + encodeURIComponent(categoryId);
    var url = config.url + '/player_api.php?username=' + encodeURIComponent(config.username) +
              '&password=' + encodeURIComponent(config.password) + '&action=get_series' + catParam;
              
    return httpGet(url).then(function(text) {
      var list = JSON.parse(text);
      return list.map(function(s) {
        return {
          id: String(s.series_id),
          name: s.name,
          cover: s.cover,
          rating: s.rating,
          categoryId: String(s.category_id)
        };
      });
    });
  },

  /**
   * Dizi detaylarını, sezonlarını ve bölümlerini alır
   */
  getSeriesDetail: function(config, seriesId) {
    if (!config || !config.url) {
      // Mock Fallback
      return Promise.resolve(MOCK_DETAILS[seriesId] || null);
    }

    if (config.type === 'm3u') {
      return loadAndCacheM3u(config.url).then(function(cache) {
        // Cache araması yap
        var foundSeries = null;
        for (var catId in cache.series) {
          if (cache.series.hasOwnProperty(catId)) {
            if (cache.series[catId][seriesId]) {
              foundSeries = cache.series[catId][seriesId];
              break;
            }
          }
        }

        if (!foundSeries) return null;

        var seasonsList = [];
        var episodesMap = {};
        for (var sNum in foundSeries.seasonsMap) {
          if (foundSeries.seasonsMap.hasOwnProperty(sNum)) {
            var seasonInt = parseInt(sNum, 10);
            seasonsList.push({
              season_number: seasonInt,
              name: 'Sezon ' + seasonInt
            });
            episodesMap[seasonInt] = foundSeries.seasonsMap[sNum];
          }
        }

        seasonsList.sort(function(a, b) { return a.season_number - b.season_number; });

        return {
          info: {
            name: foundSeries.name,
            cover: foundSeries.cover,
            plot: 'M3U çalma listesinden içe aktarıldı.',
            rating: '7.5',
            genre: foundSeries.categoryId.toUpperCase()
          },
          seasons: seasonsList,
          episodes: episodesMap
        };
      });
    }

    // Xtream Codes
    var url = config.url + '/player_api.php?username=' + encodeURIComponent(config.username) +
              '&password=' + encodeURIComponent(config.password) + '&action=get_series_info&series_id=' + encodeURIComponent(seriesId);
              
    return httpGet(url).then(function(text) {
      var data = JSON.parse(text);
      var seasons = data.seasons || [];
      var episodesSource = data.episodes || {};
      
      // Seasons listesini normalize et
      var seasonsList = seasons.map(function(s) {
        return {
          season_number: parseInt(s.season_number || s.id, 10),
          name: s.name || ('Sezon ' + (s.season_number || s.id))
        };
      }).sort(function(a, b) { return a.season_number - b.season_number; });

      // Episodes eşlemesini ve stream URL'lerini oluştur
      var episodesMap = {};
      for (var sKey in episodesSource) {
        if (episodesSource.hasOwnProperty(sKey)) {
          var eps = episodesSource[sKey];
          var sNum = parseInt(sKey, 10);
          episodesMap[sNum] = eps.map(function(e) {
            // Xtream Codes Dizi Bölüm yayın URL formatı:
            // http://domain:port/series/username/password/id.container_extension
            var streamUrl = config.url + '/series/' + config.username + '/' + config.password +
                            '/' + e.id + '.' + (e.container_extension || 'mp4');
                            
            return {
              id: String(e.id),
              episode_num: parseInt(e.episode_num || e.title.match(/\d+/), 10) || 1,
              title: e.title || ('Bölüm ' + (e.episode_num || 1)),
              duration: e.info && e.info.duration ? e.info.duration : 'N/A',
              streamUrl: streamUrl,
              cover: e.info && e.info.movie_image ? e.info.movie_image : null
            };
          });
        }
      }

      return {
        info: {
          name: data.info.name || '',
          cover: data.info.cover || '',
          plot: data.info.plot || '',
          rating: data.info.rating || '',
          genre: data.info.genre || '',
          cast: data.info.cast || '',
          director: data.info.director || ''
        },
        seasons: seasonsList,
        episodes: episodesMap
      };
    });
  },

  /**
   * Cache temizleme
   */
  clearCache: function() {
    m3uCache = null;
  }
};

module.exports = IptvService;
