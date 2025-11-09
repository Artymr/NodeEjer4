const http = require('http');
const axios = require('axios');
const cheerio = require('cheerio');

const PORT = 3000;
const TARGET_URL = 'https://www.abc.es';
let scrapedData = null;

const scrapeWebsite = async () => {
  try {
    const { data } = await axios.get(TARGET_URL);
    const $ = cheerio.load(data);

    const titles = [];
    $('h2 a, h3 a').each((i, el) => {
      const text = $(el).text().trim();
      if (text) titles.push(text);
    });

    scrapedData = titles;
    console.log('Datos extraídos:', scrapedData.slice(0,5), '...');
  } catch (err) {
    console.error('Error al scrapear la web:', err.message);
  }
};

scrapeWebsite();
setInterval(scrapeWebsite, 60 * 60 * 1000);

const server = http.createServer((req, res) => {
  if (req.url === '/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ fuente: TARGET_URL, data: scrapedData }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Ruta no encontrada');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

//Al ejecutar el servidor, se puede acceder a los datos scrapados en http://localhost:3000/data
//En la terminal se muestran los primeros 5 titulares extraídos cada vez que se realiza un scraping.
