// commands/twitter.js
// Fitur: .twitter / .tw / .xdl <url>
// Download video dari X/Twitter via savetwitter.net (scraping HTML respons).
// Hanya mendukung video (bukan gambar/GIF).

const axios = require('axios');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'twitter',
  aliases: ['tw', 'xdl'],
  description: 'Download video dari X/Twitter. Contoh: .twitter https://x.com/...',

  async execute(sock, msg, args, from) {
    const url = resolveTextInput(args, msg);

    if (!url) {
      await sock.sendMessage(from, { text: 'Contoh: .twitter https://x.com/...' }, { quoted: msg });
      return;
    }

    await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });

    try {
      const body = new URLSearchParams({ q: url, lang: 'id', cftoken: '' });

      const { data: json } = await axios.post('https://savetwitter.net/api/ajaxSearch', body, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
          Origin: 'https://savetwitter.net',
          Referer: 'https://savetwitter.net/id3',
        },
        timeout: 20000,
      });

      const html = json?.data;
      if (!html) throw new Error('Gagal mengambil data video.');

      const title = html.match(/<h3>(.*?)<\/h3>/)?.[1]?.trim() || 'Twitter Video';
      const duration = html.match(/<p>(\d+:\d+)<\/p>/)?.[1] || '-';
      const thumbnail = html.match(/<img src="([^"]+)"/)?.[1];

      const mp4 = [...html.matchAll(/href="(https:\/\/dl\.snapcdn\.app\/get\?token=[^"]+)".*?MP4\s*\(([^)]+)\)/g)].map(
        (v) => ({ quality: v[2], url: v[1] })
      );

      if (!mp4.length) throw new Error('Video tidak ditemukan.');

      const best = mp4[0];
      const caption = `*🐦 Twitter Downloader*\n\n*📌 Judul:* ${title}\n*⏱️ Durasi:* ${duration}\n*🎞️ Kualitas:* ${best.quality}`;

      let jpegThumbnail;
      if (thumbnail) {
        try {
          const { data: thumbBuf } = await axios.get(thumbnail, { responseType: 'arraybuffer', timeout: 10000 });
          jpegThumbnail = thumbBuf;
        } catch {
          jpegThumbnail = undefined; // thumbnail opsional, jangan sampai gagalkan seluruh proses
        }
      }

      await sock.sendMessage(from, { video: { url: best.url }, caption, jpegThumbnail }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .twitter:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `*Terjadi kesalahan saat memproses video 🍂*\n\n${err.message}` }, { quoted: msg });
    }
  },
};
