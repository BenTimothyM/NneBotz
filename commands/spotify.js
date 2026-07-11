// commands/spotify.js
// Fitur: .spotifyplay / .spplay <judul lagu>
// Cari & download lagu dari Spotify via api.nexray.web.id, ditampilkan
// dengan kartu preview (link preview) bergaya Spotify.
//
// CATATAN: trik "linkPreview" custom di sini (memakai karakter tak-terlihat
// + objek linkPreviewMetadata) adalah teknik tampilan non-standar yang
// bergantung pada perilaku WhatsApp saat ini - bisa berhenti bekerja atau
// terlihat berbeda kapan saja setelah update WhatsApp/Baileys, di luar
// kendali kita. Fitur inti (cari + download lagu) tetap berjalan meski
// tampilan kartunya berubah/hilang.

const axios = require('axios');
const { prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

function formatNumber(num) {
  return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

module.exports = {
  name: 'spotifyplay',
  aliases: ['spplay'],
  description: 'Cari & download lagu Spotify. Contoh: .spotifyplay Payung Teduh Mari Bercerita',

  async execute(sock, msg, args, from) {
    const query = resolveTextInput(args, msg);

    if (!query) {
      await sock.sendMessage(from, { text: 'Contoh: .spotifyplay Payung Teduh Mari Bercerita' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const { data } = await axios.get('https://api.nexray.web.id/downloader/spotifyplay', {
        params: { q: query },
        timeout: 25000,
      });

      if (!data.status) throw new Error('Lagu tidak ditemukan.');

      const v = data.result;

      const caption =
        `— spotify play —\n\n` +
        `❀ title :\n${v.title}\n\n` +
        `❀ artist :\n${v.artist}\n\n` +
        `❀ album :\n${v.album}\n\n` +
        `❀ duration :\n${v.duration}\n\n` +
        `❀ popularity :\n${formatNumber(v.popularity)}\n\n` +
        `❀ release :\n${v.release_at}\n\n` +
        `❀ status :\notw kirim audio...`;

      const { data: thumbArrayBuffer } = await axios.get(v.thumbnail, { responseType: 'arraybuffer', timeout: 15000 });
      const thumbBuffer = Buffer.from(thumbArrayBuffer);

      const { imageMessage: image } = await prepareWAMessageMedia(
        { image: thumbBuffer },
        { upload: sock.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
      );

      image.width = 1280;
      image.height = 720;

      const invisible = '\u200B'.repeat(400);

      await sock.sendMessage(
        from,
        {
          text: `${v.url || 'https://open.spotify.com'}${invisible}\n\n${caption}`,
          linkPreview: {
            'matched-text': v.url || 'https://open.spotify.com',
            title: v.title,
            description: `${v.artist} • Spotify`,
            previewType: 0,
            jpegThumbnail: thumbBuffer,
            highQualityThumbnail: image,
            linkPreviewMetadata: { socialMediaPostType: 4, linkMediaDuration: 0 },
          },
        },
        { quoted: msg }
      );

      const head = await axios.head(v.download_url, { timeout: 15000 });
      const sizeMB = Number(head.headers['content-length'] || 0) / 1024 / 1024;

      if (sizeMB > 50) {
        await sock.sendMessage(
          from,
          { document: { url: v.download_url }, mimetype: 'audio/mpeg', fileName: v.title + '.mp3' },
          { quoted: msg }
        );
      } else {
        await sock.sendMessage(
          from,
          { audio: { url: v.download_url }, mimetype: 'audio/mpeg', fileName: v.title + '.mp3' },
          { quoted: msg }
        );
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .spotifyplay:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: '❌ Gagal mengambil lagu.' }, { quoted: msg });
    }
  },
};
