// commands/bratimg.js
// Fitur: .bratimg <teks> (atau reply pesan teks)
//
// CATATAN: endpoint API-nya SAMA PERSIS dengan .brat (aqul-brat.hf.space),
// jadi secara fungsi command ini identik dengan .brat, hanya beda nama.
// Dipertahankan sebagai command terpisah sesuai permintaan; hapus salah satu
// (commands/brat.js atau commands/bratimg.js) jika Anda tidak butuh keduanya.

const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'bratimg',
  aliases: [],
  description: 'Ubah teks jadi stiker gaya "brat" (varian img). Contoh: .bratimg halo dunia (atau reply pesan teks)',

  async execute(sock, msg, args, from) {
    const text = resolveTextInput(args, msg);

    if (!text) {
      await sock.sendMessage(from, { text: '⚠️ Reply atau masukkan teks!\nContoh: .bratimg halo hilman' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const imageUrl = `https://aqul-brat.hf.space?text=${encodeURIComponent(text)}`;

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
      appLogger.error('Error pada command .bratimg:', err.message);
      await sock.sendMessage(from, { text: '❌ Gagal membuat stiker bratimg. Layanan pihak ketiga mungkin sedang down.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  },
};
