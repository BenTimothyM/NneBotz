// commands/soundcloud.js
// Fitur: .soundcloud / .soundcloudplay / .scdl <judul lagu atau link>
// Cari & download lagu dari SoundCloud via kaizenapi.my.id.

const axios = require('axios');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'soundcloud',
  aliases: ['soundcloudplay', 'scdl'],
  description: 'Cari & download lagu SoundCloud. Contoh: .soundcloud judul lagu / link SoundCloud',

  async execute(sock, msg, args, from) {
    const query = resolveTextInput(args, msg);

    if (!query) {
      await sock.sendMessage(from, { text: '⚠️ Masukkan judul lagu atau link SoundCloud!' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const { data: json } = await axios.get('https://kaizenapi.my.id/api/downloader/soundcloud', {
        params: { limit: 1, query },
        timeout: 20000,
      });

      if (!json.status || !json.result?.length) throw new Error('Lagu tidak ditemukan.');

      const data = json.result[0];

      const caption =
        `SOUNDCLOUD DOWNLOADER\n\n` +
        `Judul: ${data.title}\n` +
        `Artis: ${data.artist}\n` +
        `Plays: ${data.plays}\n` +
        `Durasi: ${data.duration_seconds}s\n` +
        `URL: ${data.url}`;

      await sock.sendMessage(from, { image: { url: data.artwork }, caption }, { quoted: msg });
      await sock.sendMessage(
        from,
        { audio: { url: data.stream_url }, mimetype: 'audio/mpeg', fileName: `${data.title}.mp3` },
        { quoted: msg }
      );

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .soundcloud:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: '❌ Gagal mengambil lagu dari SoundCloud.' }, { quoted: msg });
    }
  },
};
