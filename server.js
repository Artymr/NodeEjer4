const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el ${PORT}`);
});

app.get('/scrape', async (req, res) => {
  const url = req.query.url;

  try {
    const response = await axios.get(url);
    const data = response.data;
    const $ = cheerio.load(data);

    
    const title = $('title').text();
    const headings = [];
    $('h1, h2, h3').each((i, elem) => {
      headings.push($(elem).text());
    });

    res.json({ title, headings });
  } catch (error) {
    console.error('Error scraping:', error);
    res.status(500).send('URL invalida probablemente');
  }
});

//Una vez ejecutado el node server.js
//se puede acceder a la ruta /scrape pasando como query la url a scrapear
//Ejemplo: http://localhost:3000/scrape?url=https://mobalytics.gg