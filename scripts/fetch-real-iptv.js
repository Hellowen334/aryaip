const http = require('http');
const fs = require('fs');
const path = require('path');

const url = "http://s196.k97d18.com/get.php?username=y79g59t88x68&password=x51x03052023&type=adv_m3u_icon&output=ts";

console.log("Fetching real IPTV M3U list...");

http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    parseM3U(data);
  });
}).on('error', err => {
  console.error("Error fetching M3U:", err);
});

function parseM3U(content) {
  const lines = content.split(/\r?\n/);
  
  const categoriesMap = new Map();
  const channels = [];
  
  let currentChannel = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (line.startsWith('#EXTINF:')) {
      currentChannel = {
        name: 'Unknown',
        icon: null,
        groupTitle: 'Genel'
      };
      
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) currentChannel.icon = logoMatch[1];
      
      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) currentChannel.groupTitle = groupMatch[1];
      
      const parts = line.split(',');
      if (parts.length > 1) {
        currentChannel.name = parts[parts.length - 1].trim();
      }
    } else if (!line.startsWith('#')) {
      if (currentChannel) {
        currentChannel.streamUrl = line;
        
        let catId = null;
        for (let [id, cat] of categoriesMap.entries()) {
          if (cat.name === currentChannel.groupTitle) {
            catId = id;
            break;
          }
        }
        
        if (!catId) {
          catId = 'cat_' + (categoriesMap.size + 1);
          categoriesMap.set(catId, {
            id: catId,
            name: currentChannel.groupTitle,
            count: 0
          });
        }
        
        categoriesMap.get(catId).count++;
        
        channels.push({
          id: 'ch_' + channels.length,
          num: channels.length + 1,
          name: currentChannel.name,
          icon: currentChannel.icon,
          isLive: true,
          categoryId: catId,
          streamUrl: currentChannel.streamUrl
        });
        
        currentChannel = null;
      }
    }
  }
  
  const db = {
    categories: Array.from(categoriesMap.values()),
    channels: channels
  };
  
  const dbPath = path.resolve(__dirname, '../src/data/mockIptv.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`Successfully parsed and saved ${db.categories.length} categories and ${db.channels.length} channels.`);
}
