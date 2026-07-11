// commands/ig.js
// Fitur: .ig / .igdl / .instagram <url>
// Download foto/video/carousel Instagram via snapinsta.top (scraping HTML).

const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

async function igdl(url) {
  const form = new FormData();
  form.append('url', url);
  form.append('action', 'post');

  const res = await axios.post('https://snapinsta.top/action.php', form, {
    headers: {
      ...form.getHeaders(),
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      accept: '*/*',
      origin: 'https://snapinsta.top',
      referer: 'https://snapinsta.top/',
    },
    timeout: 20000,
  });

  const $ = cheerio.load(res.data);
  const downloads = [];

  $('.download-items__btn a').each((_, el) => {
    let path = $(el).attr('href');
    if (!path) return;
    if (!path.startsWith('http')) path = 'https://snapinsta.top' + path;
    downloads.push(path);
  });

  return downloads;
}

module.exports = {
  name: 'ig',
  aliases: ['igdl', 'instagram'],
  description: 'Download foto/video/carousel Instagram. Contoh: .ig https://www.instagram.com/p/xxxx/',

  async execute(sock, msg, args, from) {
    const url = resolveTextInput(args, msg);

    if (!url) {
      await sock.sendMessage(from, { text: 'Contoh: .ig https://www.instagram.com/p/xxxx/' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const links = await igdl(url);
      if (!links.length) throw new Error('Media tidak ditemukan.');

      for (const mediaUrl of links) {
        const { data: buf } = await axios.get(mediaUrl, { responseType: 'arraybuffer', timeout: 30000 });
        const buffer = Buffer.from(buf);

        const isVideo = buffer.subarray(4, 8).toString() === 'ftyp';
        await sock.sendMessage(
          from,
          isVideo ? { video: buffer } : { image: buffer },
          { quoted: msg }
        );
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .ig:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ ${err.message}` }, { quoted: msg });
    }
  },
};
