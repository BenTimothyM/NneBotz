// commands/ig3.js
// Fitur: .ig3 / .igdl3 / .instagram3 <url>
// Provider alternatif untuk download Instagram, via api.nexray.eu.cc.
//
// CATATAN: blok "annotations/embeddedMusic" di script asli (link promosi
// channel WhatsApp pembuat script lain, disisipkan diam-diam ke setiap
// media yang dikirim) SUDAH DIHAPUS di sini.

const axios = require('axios');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

function cleanText(text = '') {
  return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = {
  name: 'ig3',
  aliases: ['igdl3', 'instagram3'],
  description: 'Download Instagram (provider cadangan). Contoh: .ig3 https://instagram.com/...',

  async execute(sock, msg, args, from) {
    const input = resolveTextInput(args, msg);

    if (!input) {
      await sock.sendMessage(from, { text: 'Contoh: .ig3 https://instagram.com/...' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '✨', key: msg.key } });

      const { data } = await axios.get('https://api.nexray.eu.cc/downloader/v2/instagram', {
        params: { url: input },
        timeout: 20000,
      });

      if (!data.status || !data.result?.media?.length) {
        throw new Error('Media tidak ditemukan.');
      }

      const res = data.result;

      const caption =
        `— instagram downloader —\n\n` +
        `❀ author : ${cleanText(res.username)}\n` +
        `❀ likes  : ${(res.likes || 0).toLocaleString('id-ID')}\n\n` +
        `❀ title :\n${cleanText(res.title || '-')}`;

      const images = res.media.filter((item) => item.type !== 'mp4').map((item) => item.url);
      const videos = res.media.filter((item) => item.type === 'mp4').map((item) => item.url);

      if (images.length) {
        await sock.sendMessage(
          from,
          { album: images.map((url, i) => ({ image: { url }, caption: i === 0 ? caption : '' })) },
          { quoted: msg }
        );
      }

      for (const url of videos) {
        await sock.sendMessage(from, { video: { url }, caption }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .ig3:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ Gagal: ${err.message}` }, { quoted: msg });
    }
  },
};
