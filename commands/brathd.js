// commands/brathd.js
// Fitur: .brathd <teks> (atau reply pesan teks)
// Versi "HD" dari .brat, memakai endpoint API berbeda.
//
// CATATAN: memakai endpoint pihak ketiga tidak resmi (api-faa.my.id).
// Anggap sebagai fitur best-effort, bisa berhenti berfungsi sewaktu-waktu.

const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'brathd',
  aliases: [],
  description: 'Ubah teks jadi stiker "brat" versi HD. Contoh: .brathd halo dunia (atau reply pesan teks)',

  async execute(sock, msg, args, from) {
    const text = resolveTextInput(args, msg);

    if (!text) {
      await sock.sendMessage(from, { text: '⚠️ Reply atau masukkan teks!\nContoh: .brathd halo hilman' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const imageUrl = `https://api-faa.my.id/faa/brathd?text=${encodeURIComponent(text)}`;

      const sticker = new Sticker(imageUrl, {
        type: StickerTypes.CROPPED,
        pack: 'Nnebotz',
        author: 'Nneb.dev',
        quality: 70,
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .brathd:', err.message);
      await sock.sendMessage(from, { text: '❌ Gagal membuat stiker brathd. Layanan pihak ketiga mungkin sedang down.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  },
};
