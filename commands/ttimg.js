// commands/ttimg.js
// Fitur: .ttimg / .tiktokimg <url>
// Download slideshow foto TikTok via tikwm.com.
//
// PERUBAHAN DARI SCRIPT ASLI: script asli menampilkan hasil sebagai
// "interactive carousel message" memakai API level-rendah dari Baileys
// (proto.Message.InteractiveMessage, generateWAMessageFromContent, dst).
// Fitur itu sangat bergantung pada versi Baileys & versi WhatsApp yang
// dipakai, dan gampang berubah/rusak di update berikutnya. Di sini saya
// sederhanakan jadi format "album" biasa (dipakai juga oleh .tiktok &
// fitur downloader lain di project ini) supaya jauh lebih stabil.
// Kalau Anda tetap ingin versi carousel interaktif yang asli, beri tahu
// saya dan saya akan buatkan sebagai opsi terpisah.

const axios = require('axios');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'ttimg',
  aliases: ['tiktokimg'],
  description: 'Download slideshow foto TikTok. Contoh: .ttimg https://vt.tiktok.com/xxxx',

  async execute(sock, msg, args, from) {
    const url = resolveTextInput(args, msg);

    if (!url) {
      await sock.sendMessage(from, { text: 'Contoh:\n.ttimg https://vt.tiktok.com/xxxx' }, { quoted: msg });
      return;
    }

    const regex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/;
    const matched = url.match(regex)?.[0];

    if (!matched) {
      await sock.sendMessage(from, { text: '❌ Link TikTok tidak valid.' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '✨', key: msg.key } });

      const { data } = await axios.get('https://www.tikwm.com/api/', {
        params: { url: matched, hd: 1 },
        timeout: 20000,
      });

      const result = data?.data;
      const images = result?.images || [];

      if (!images.length) {
        throw new Error('Post ini bukan slideshow foto (tidak ada gambar).');
      }

      const caption =
        `✨ *TIKTOK PHOTO*\n\n` +
        `Judul: ${result.title || '-'}\n` +
        `Uploader: ${result.author?.nickname || '-'}\n` +
        `Total: ${images.length} foto`;

      await sock.sendMessage(
        from,
        { album: images.map((img, i) => ({ image: { url: img }, caption: i === 0 ? caption : '' })) },
        { quoted: msg }
      );

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .ttimg:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ Gagal mengambil slide: ${err.message}` }, { quoted: msg });
    }
  },
};
