import fs from 'fs';
import https from 'https';

// Translates only the Spanish cards missing from each language file, so the
// translations already there are kept. Spanish is the source of truth.
const LANGS = ['en', 'fr', 'ja', 'pt'];
const DELAY_MS = 60;
const RETRIES = 4;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchTranslation = (text, tl) =>
  new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (!Array.isArray(json?.[0])) throw new Error('Unexpected response');
            resolve(json[0].map((item) => item[0]).join(''));
          } catch {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      })
      .on('error', reject);
  });

// Fails loudly instead of silently keeping Spanish text in another language.
const translate = async (text, tl) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetchTranslation(text, tl);
    } catch (err) {
      if (attempt >= RETRIES) throw err;
      await delay(1000 * 2 ** attempt);
    }
  }
};

const main = async () => {
  const source = JSON.parse(fs.readFileSync('./src/data/cards_es.json', 'utf8'));

  for (const lang of LANGS) {
    const path = `./src/data/cards_${lang}.json`;
    const existing = JSON.parse(fs.readFileSync(path, 'utf8'));
    const byId = new Map(existing.map((card) => [card.id, card]));
    const missing = source.filter((card) => !byId.has(card.id));
    console.log(`${lang}: ${missing.length} cards to translate`);

    // Saves whatever was translated even if the service cuts us off, so that
    // running the script again carries on from there.
    const save = () => {
      const merged = source.flatMap((card) => byId.get(card.id) ?? []);
      fs.writeFileSync(path, `${JSON.stringify(merged, null, 2)}\n`);
    };

    try {
      for (const card of missing) {
        byId.set(card.id, {
          ...card,
          title: await translate(card.title, lang),
          description: await translate(card.description, lang),
        });
        await delay(DELAY_MS);
      }
    } finally {
      save();
    }
    console.log(`${lang}: done`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
