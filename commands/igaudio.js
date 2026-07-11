// commands/igaudio.js
// Fitur: .igaudio / .igmp3 <url reel>
// Download audio saja dari Instagram Reel, via reelsvideo.io (scraping HTML).

const axios = require('axios');
const cheerio = require('cheerio');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'igaudio',
  aliases: ['igmp3'],
  description: 'Download audio dari Instagram Reel. Contoh: .igaudio https://www.instagram.com/reel/xxxxx/',

  async execute(sock, msg, args, from) {
    const url = resolveTextInput(args, msg);

    if (!url) {
      await sock.sendMessage(from, { text: 'Contoh: .igaudio https://www.instagram.com/reel/xxxxx/' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const { data } = await axios.post(
        'https://reelsvideo.io/reel/',
        new URLSearchParams({
          id: url,
          locale: 'id',
          'cf-turnstile-response': '',
          tt: 'a66b23d8bfa4878536d788ac3d33d1a6',
          ts: Math.floor(Date.now() / 1000),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'HX-Request': 'true',
            'HX-Trigger': 'main-form',
            'HX-Target': 'target',
            'HX-Current-URL': 'https://reelsvideo.io/id',
            'User-Agent': 'Mozilla/5.0',
            Referer: 'https://reelsvideo.io/id',
          },
          timeout: 20000,
        }
      );

      const $ = cheerio.load(data);
      const mp3Link = $('a.type_audio').attr('href');

      if (!mp3Link) throw new Error('Audio tidak tersedia di reel ini.');

      await sock.sendMessage(from, { audio: { url: mp3Link }, mimetype: 'audio/mpeg' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .igaudio:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ ${err.message || 'Gagal mengambil audio Instagram.'}` }, { quoted: msg });
    }
  },
};
