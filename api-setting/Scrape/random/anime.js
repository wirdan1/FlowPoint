const axios = require('axios');

async function getAnimeQuote() {
  try {
    const response = await axios.get('https://animechan.xyz/api/random');
    return {
      quote: response.data.quote,
      character: response.data.character,
      anime: response.data.anime
    };
  } catch (error) {
    console.error('Gagal mengambil quote anime:', error.message);
    throw error;
  }
}

module.exports = getAnimeQuote;
