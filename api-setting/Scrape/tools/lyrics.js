const axios = require('axios');
const cheerio = require('cheerio');

async function lirikSearch(query) {
  try {
    // Search for lyrics
    const { data } = await axios.get(`https://lirik.web.id/search/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    // Extract search results
    $('.search-results article').each((i, el) => {
      const title = $(el).find('h2 a').text().trim();
      const url = $(el).find('h2 a').attr('href');
      results.push({ title, url });
    });

    // Get one top song from homepage
    const homeData = await axios.get('https://lirik.web.id', {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const home$ = cheerio.load(homeData.data);
    const topSong = {
      title: home$('.popular-posts li:first-child a').text().trim(),
      url: home$('.popular-posts li:first-child a').attr('href')
    };

    return {
      searchResults: results.slice(0, 5), // Limit to 5 results
      topSong
    };
  } catch (error) {
    throw new Error(`Lirik search failed: ${error.message}`);
  }
}

module.exports = lirikSearch;
