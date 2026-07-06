/**
 * useMacAddress.js
 * Luna servis wrapper: luna://com.webos.service.connectionmanager getinfo
 * Aktif interface'e (wifi > wired) göre MAC adresini döner.
 *
 * webOS Luna çağrısı yalnızca webOS ortamında çalışır.
 * Geliştirme ortamında MOCK_MAC env değişkeni veya fallback kullanılır.
 */

/**
 * Luna servisini Promise wrapper'ı ile çağırır.
 * @param {string} uri   — luna servis URI
 * @param {string} method — servis metodu
 * @param {object} params — parametre objesi
 * @returns {Promise<object>}
 */
function callLuna(uri, method, params) {
  var lunaParams = params || {};
  return new Promise(function(resolve, reject) {
    if (typeof window.webOSDev === 'undefined' && typeof window.PalmServiceBridge === 'undefined') {
      // Geliştirme ortamı — fallback
      reject(new Error('Luna not available (non-webOS env)'));
      return;
    }
    var fullUri = uri + '/' + method;



    // webOS 3.x+ için PalmServiceBridge
    if (typeof window.PalmServiceBridge !== 'undefined') {
      var bridge = new window.PalmServiceBridge();
      bridge.onservicecallback = function(msg) {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.returnValue === false) {
            reject(new Error(parsed.errorText || 'Luna call failed'));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          reject(e);
        }
      };
      bridge.call(fullUri, JSON.stringify(lunaParams));
      return;
    }

    // webOSDev fallback (bazı modeller)
    if (typeof window.webOSDev !== 'undefined') {
      window.webOSDev.LUNA.call({
        service: uri,
        method: method,
        parameters: lunaParams,
        onSuccess: resolve,
        onFailure: function(err) { reject(new Error(err.errorText || 'Luna call failed')); },
      });
    }
  });
}

/**
 * connectionmanager getinfo'dan MAC adresini okur.
 * Önce wifi (isConnected && ipAddress), yoksa wired dener.
 *
 * @returns {Promise<string>} MAC adresi (XX:XX:XX:XX:XX:XX) veya 'UNKNOWN'
 */
export function readMacAddress() {
  // Geliştirme ortamı fallback
  if (typeof window.PalmServiceBridge === 'undefined' && typeof window.webOSDev === 'undefined') {
    var devMac = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_DEV_MAC)
      ? process.env.REACT_APP_DEV_MAC
      : 'AA:BB:CC:DD:EE:FF';
    console.warn('[useMacAddress] Non-webOS env — using dev MAC:', devMac);
    return Promise.resolve(devMac);
  }

  return callLuna(
    'luna://com.webos.service.connectionmanager',
    'getInfo',
    {}
  ).then(function(info) {
    // Öncelikle wired tercih edilir
    var wiredMac = info && info.wiredInfo && info.wiredInfo.macAddress;
    if (wiredMac) {
      return wiredMac.toUpperCase();
    }

    // Fallback olarak wifi
    var wifiMac = info && info.wifiInfo && info.wifiInfo.macAddress;
    if (wifiMac) {
      return wifiMac.toUpperCase();
    }

    console.warn('[useMacAddress] connectionmanager getInfo returned no MAC:', info);
    return 'UNKNOWN';
  }).catch(function(err) {
    console.error('[useMacAddress] Luna call failed:', err);
    return 'UNKNOWN';
  });
}

