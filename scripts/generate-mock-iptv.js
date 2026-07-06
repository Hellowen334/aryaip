const fs = require('fs');
const path = require('path');

// Hedef klasör (src/data/) yoksa oluştur
const dataDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const CATEGORY_COUNT = 50;
const CHANNELS_PER_CATEGORY = 40;

const categories = [];
const channels = [];

console.log('Generating mock IPTV data...');

for (let c = 1; c <= CATEGORY_COUNT; c++) {
  const catId = `cat_${c}`;
  categories.push({
    id: catId,
    name: `Category ${c}`,
    count: CHANNELS_PER_CATEGORY
  });

  for (let i = 1; i <= CHANNELS_PER_CATEGORY; i++) {
    const chId = `ch_${c}_${i}`;
    const globalNum = ((c - 1) * CHANNELS_PER_CATEGORY) + i;
    
    channels.push({
      id: chId,
      num: globalNum,
      name: `Test Channel ${c}-${i}`,
      icon: null,
      isLive: Math.random() > 0.8, // %20 ihtimalle canlı
      categoryId: catId,
      streamUrl: `http://example.com/stream/${chId}.m3u8`
    });
  }
}

const db = { categories, channels };
const dbPath = path.join(dataDir, 'mockIptv.json');

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

console.log(`Successfully generated ${CATEGORY_COUNT} categories and ${CATEGORY_COUNT * CHANNELS_PER_CATEGORY} channels.`);
