const axios = require('axios');
const cheerio = require('cheerio');

async function searchLyrics(query) {
  try {
    const { data } = await axios.get(`https://lirik.web.id/search/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);
    const results = [];

    // Coba berbagai selector untuk hasil pencarian
    $('.lyric-list article, .search-results article, .post').each((i, el) => {
      const title = $(el).find('h2 a, h3 a, .title a').first();
      if (title.length) {
        results.push({
          title: title.text().trim(),
          url: title.attr('href')
        });
      }
      if (results.length >= 5) return false;
    });

    return {
      status: true,
      creator: "Hookrest - Danz",
      result: results.length > 0 ? results : null
    };
  } catch (error) {
    return {
      status: false,
      creator: "Hookrest - Danz",
      error: error.message,
      result: null
    };
  }
}

module.exports = searchLyrics;
