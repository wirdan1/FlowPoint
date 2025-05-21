const axios = require('axios');
const cheerio = require('cheerio');

async function snapdouyin(videoUrl) {
  try {
    const res = await axios.post(
      'https://snapdouyin.app/',
      new URLSearchParams({ url: videoUrl }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      }
    );

    const $ = cheerio.load(res.data);
    const link = $('.download-links a').attr('href');

    if (!link) throw new Error('Download link not found');

    return { success: true, download: link };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports = snapdouyin;
