const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'https://www.abc.es/';
const SCRAPE_INTERVAL = 60 * 60 * 1000; //cada 1 hora
const DATA_FILE = path.join(__dirname, 'data.json');

let latestData = [];

function saveData(data) {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, data };

  let previous = [];
  if (fs.existsSync(DATA_FILE)) {
    previous = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }

  previous.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(previous, null, 2));
}

function readHistory() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return [];
}

async function scrapeWebsite() {
  try {
    console.log(`Iniciando scraping de ${TARGET_URL}...`);
    const { data } = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SistemasWebBot/1.0)',
      },
    });

    const $ = cheerio.load(data);

    const titles = [];
    $('h2 a, h3 a').each((i, el) => {
      const title = $(el).text().trim();
      if (title) titles.push(title);
    });

    latestData = titles;
    saveData(titles);

    console.log(`Scraping completado --> (${titles.length} titulares extraídos).`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

scrapeWebsite();
setInterval(scrapeWebsite, SCRAPE_INTERVAL);

app.get('/data', (req, res) => {
  if (latestData.length > 0) {
    res.json({ data: latestData });
  } else {
    res.status(404).json({ error: 'No hay datos disponibles aún' });
  }
});

app.get('/history', (req, res) => {
  const history = readHistory();
  if (history.length > 0) {
    res.json(history);
  } else {
    res.status(404).json({ error: 'No hay histórico guardado' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

