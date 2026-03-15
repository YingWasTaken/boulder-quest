import fs from 'fs';
import https from 'https';

const translate = (text, tl) => {
  return new Promise((resolve) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && Array.isArray(json[0])) {
            resolve(json[0].map(item => item[0]).join(''));
          } else {
            resolve(text);
          }
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

const main = async () => {
  const file = fs.readFileSync('./src/data/cards_es.json', 'utf8');
  const data = JSON.parse(file);
  const langs = ['en', 'fr', 'ja', 'pt'];
  
  for (const lang of langs) {
    process.stdout.write(`Translating to ${lang}... `);
    const translatedData = JSON.parse(JSON.stringify(data));
    
    for (let i = 0; i < translatedData.length; i++) {
        const card = translatedData[i];
        if (card.title) {
           card.title = await translate(card.title, lang);
        }
        if (card.description) {
           card.description = await translate(card.description, lang);
        }
        await delay(50); // 50ms delay
    }
    
    fs.writeFileSync(`./src/data/cards_${lang}.json`, JSON.stringify(translatedData, null, 2));
    console.log(`[DONE]`);
  }
};

main();
