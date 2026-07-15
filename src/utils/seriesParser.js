/**
 * seriesParser.js — M3U Playlist parser ve dizi algılama/gruplama motoru
 *
 * ES5 uyumlu olarak yazılmıştır (WebOS TV uyumluluğu için).
 */

var SEASON_EPISODE_PATTERN = /^(.*?)\s+(?:s(?:eason|ezon)?\s*(\d+)\s*[\s\-_.]?\s*(?:e(?:pisode)?|b(?:ölüm)?)\s*(\d+))(?:\s*-\s*|\s+)?(.*)$/i;
var XX_X_PATTERN = /^(.*?)\s+(\d+)\s*x\s*(\d+)(?:\s*-\s*|\s+)?(.*)$/i;
var ONLY_EPISODE_PATTERN = /^(.*?)\s+(?:bölüm|episode|ep|e)\s*(\d+)(?:\s*-\s*|\s+)?(.*)$/i;

/**
 * Başlıktan dizi ismi, sezon, bölüm ve bölüm başlığını çeker.
 * @param {string} title
 * @returns {{seriesName: string, season: number, episode: number, episodeTitle: string} | null}
 */
function parseEpisodeInfo(title) {
  if (!title) return null;
  var name = title.trim();

  // 1. Season + Episode match (S01E01, Sezon 1 Bölüm 2, S1-E2, vb.)
  var match = name.match(SEASON_EPISODE_PATTERN);
  if (match) {
    var seriesName = match[1].replace(/[\s\-_.]+$/, '').trim();
    var seasonNum = parseInt(match[2], 10);
    var episodeNum = parseInt(match[3], 10);
    var epTitle = match[4] ? match[4].replace(/^[\s\-_.\/]+/, '').trim() : '';

    if (!epTitle) {
      epTitle = 'Bölüm ' + episodeNum;
    }

    return {
      seriesName: seriesName,
      season: isNaN(seasonNum) ? 1 : seasonNum,
      episode: isNaN(episodeNum) ? 1 : episodeNum,
      episodeTitle: epTitle
    };
  }

  // 2. xx x xx Match (Örn: 1x02)
  match = name.match(XX_X_PATTERN);
  if (match) {
    var seriesName = match[1].replace(/[\s\-_.]+$/, '').trim();
    var seasonNum = parseInt(match[2], 10);
    var episodeNum = parseInt(match[3], 10);
    var epTitle = match[4] ? match[4].replace(/^[\s\-_.\/]+/, '').trim() : '';

    if (!epTitle) {
      epTitle = 'Bölüm ' + episodeNum;
    }

    return {
      seriesName: seriesName,
      season: isNaN(seasonNum) ? 1 : seasonNum,
      episode: isNaN(episodeNum) ? 1 : episodeNum,
      episodeTitle: epTitle
    };
  }

  // 3. Sadece Bölüm Eşleşmesi (Sezon 1 varsayılır. Örn: Bölüm 01)
  match = name.match(ONLY_EPISODE_PATTERN);
  if (match) {
    var seriesName = match[1].replace(/[\s\-_.]+$/, '').trim();
    var episodeNum = parseInt(match[2], 10);
    var epTitle = match[3] ? match[3].replace(/^[\s\-_.\/]+/, '').trim() : '';

    if (!epTitle) {
      epTitle = 'Bölüm ' + episodeNum;
    }

    return {
      seriesName: seriesName,
      season: 1,
      episode: isNaN(episodeNum) ? 1 : episodeNum,
      episodeTitle: epTitle
    };
  }

  return null;
}

/**
 * group-title özniteliğini güvenli şekilde parse eder.
 * Örn: group-title="TR | DIZILER" -> "TR | DIZILER"
 */
function parseAttribute(line, attrName) {
  var regex = new RegExp(attrName + '="([^"]+)"', 'i');
  var match = line.match(regex);
  if (match) return match[1];
  
  // Tırnaksız fallback (örn: group-title=TR)
  var regexNoQuotes = new RegExp(attrName + '=([^\\s,]+)', 'i');
  var matchNoQuotes = line.match(regexNoQuotes);
  if (matchNoQuotes) return matchNoQuotes[1];
  
  return '';
}

/**
 * Ham M3U içeriğini okuyup Canlı, Film ve Dizi olarak sınıflandırır.
 * Dizileri ise Seviye 1 (Kategori) -> Seviye 2 (Dizi) -> Seviye 3 (Sezon/Bölüm) olarak gruplar.
 *
 * @param {string} m3uText
 * @returns {{ categories: Array, series: Object }}
 */
function parseM3uPlaylist(m3uText) {
  var lines = m3uText.split(/\r?\n/);
  var categoriesMap = {}; // { catId: { id, name, count } }
  var seriesMap = {};     // { catId: { seriesId: { id, name, cover, categoryId, seasonsMap: { seasonNum: [episodes] } } } }

  var currentMeta = null;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (!line) continue;

    if (line.indexOf('#EXTINF:') === 0) {
      // Bilgileri çıkar
      var commaIdx = line.indexOf(',');
      var displayName = commaIdx !== -1 ? line.substring(commaIdx + 1).trim() : 'Bilinmeyen Kanal';
      var logo = parseAttribute(line, 'tvg-logo');
      var groupTitle = parseAttribute(line, 'group-title') || 'Diğer';

      currentMeta = {
        name: displayName,
        logo: logo || null,
        groupTitle: groupTitle
      };
    } else if (line.indexOf('#') !== 0 && currentMeta) {
      // Bu satır yayın URL'sidir
      var streamUrl = line;
      var groupTitle = currentMeta.groupTitle;

      // Dizi mi?
      var isSeriesGroup = /series|dizi|diziler|tv-show|show|season|sezon/i.test(groupTitle);
      var parsedEp = parseEpisodeInfo(currentMeta.name);

      // Kategori ID normalize et
      var catId = groupTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
      if (!catId) catId = 'diger';

      if (isSeriesGroup || parsedEp) {
        // Kategori ekle/güncelle
        if (!categoriesMap[catId]) {
          categoriesMap[catId] = {
            id: catId,
            name: groupTitle,
            count: 0
          };
        }

        var seriesName = parsedEp ? parsedEp.seriesName : currentMeta.name;
        var seasonNum = parsedEp ? parsedEp.season : 1;
        var episodeNum = parsedEp ? parsedEp.episode : 1;
        var episodeTitle = parsedEp ? parsedEp.episodeTitle : currentMeta.name;

        var seriesId = catId + '_' + seriesName.toLowerCase().replace(/[^a-z0-9]/g, '_');

        if (!seriesMap[catId]) {
          seriesMap[catId] = {};
        }

        if (!seriesMap[catId][seriesId]) {
          seriesMap[catId][seriesId] = {
            id: seriesId,
            name: seriesName,
            cover: currentMeta.logo,
            categoryId: catId,
            seasonsMap: {}
          };
          categoriesMap[catId].count++;
        }

        var sMap = seriesMap[catId][seriesId].seasonsMap;
        if (!sMap[seasonNum]) {
          sMap[seasonNum] = [];
        }

        sMap[seasonNum].push({
          id: seriesId + '_s' + seasonNum + 'e' + episodeNum + '_' + Math.random().toString(36).substr(2, 5),
          episode_num: episodeNum,
          title: episodeTitle,
          streamUrl: streamUrl,
          cover: currentMeta.logo
        });
      }

      currentMeta = null; // Sıfırla
    }
  }

  // Kategorileri array'e dönüştür
  var categoriesList = [];
  for (var k in categoriesMap) {
    if (categoriesMap.hasOwnProperty(k)) {
      categoriesList.push(categoriesMap[k]);
    }
  }

  // Dizi bölümlerini kendi içinde sırala (artan bölüm numarasına göre)
  for (var cId in seriesMap) {
    if (seriesMap.hasOwnProperty(cId)) {
      for (var sId in seriesMap[cId]) {
        if (seriesMap[cId].hasOwnProperty(sId)) {
          var seasons = seriesMap[cId][sId].seasonsMap;
          for (var sNum in seasons) {
            if (seasons.hasOwnProperty(sNum)) {
              seasons[sNum].sort(function(a, b) {
                return a.episode_num - b.episode_num;
              });
            }
          }
        }
      }
    }
  }

  return {
    categories: categoriesList,
    series: seriesMap
  };
}

module.exports = {
  parseEpisodeInfo: parseEpisodeInfo,
  parseM3uPlaylist: parseM3uPlaylist
};
