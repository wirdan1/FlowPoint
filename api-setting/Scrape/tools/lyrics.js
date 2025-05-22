const axios = require('axios');
const cheerio = require('cheerio');

async function searchLyrics(query) {
  try {
    const { data } = await axios.get(`https://lirik.web.id/?s=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const results = [];

    $('article, .search-result').each((i, el) => {
      const title = $(el).find('h2 a, h3 a').first();
      if (title.length) {
        results.push({
          title: title.text().trim(),
          url: title.attr('href')
        });
      }
      if (results.length >= 5) return false; // Limit to 5 results
    });

    return {
      status: true,
      creator: "Your Name",
      result: results
    };
  } catch (error) {
    return {
      status: false,
      creator: "Your Name",
      error: error.message,
      result: []
    };
  }
}

module.exports = searchLyrics;
