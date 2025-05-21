const axios = require('axios');

// Config headers yang bisa dipakai berulang
const baseHeaders = {
  'Content-Type': 'application/json',
  'Origin': 'https://y2mate-id.com',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
};

async function y2mateDownload(youtubeUrl) {
  try {
    // Request 1: Analisis Video
    const analyze = await axios.post(
      'https://y2mate-id.com/api/convert',
      { url: youtubeUrl },
      { headers: baseHeaders }
    );

    if (!analyze.data?.vid) throw new Error('Video tidak dikenali');

    // Request 2: Convert ke MP4
    const convert = await axios.post(
      'https://y2mate-id.com/api/mp4',
      { 
        vid: analyze.data.vid,
        k: 'mp4' 
      },
      { 
        headers: {
          ...baseHeaders, // Pakai baseHeaders
          'Referer': `https://y2mate-id.com/youtube-mp4/${analyze.data.vid}` // Hanya Referer yang beda
        }
      }
    );

    return {
      title: analyze.data.title,
      url: convert.data.url,
      quality: convert.data.quality || '720p'
    };

  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

module.exports = y2mateDownload;
