// commands/brat.js
// Fitur: .brat <teks> (atau reply pesan berisi teks)
// Mengubah teks menjadi gambar bergaya "brat" lalu dijadikan stiker.
//
// CATATAN: menggunakan endpoint pihak ketiga tidak resmi (Hugging Face Space,
// bukan API resmi/berbayar). Bisa berhenti berfungsi/berubah sewaktu-waktu
// di luar kendali kita, jadi anggap fitur ini "best-effort".

const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'brat',
  aliases: [],
  description: 'Ubah teks jadi stiker gaya "brat". Contoh: .brat halo dunia (atau reply pesan teks)',

  async execute(sock, msg, args, from) {
    const text = resolveTextInput(args, msg);

    if (!text) {
      await sock.sendMessage(
        from,
        { text: '⚠️ Reply pesan berisi teks, atau gunakan format: *.brat <teks>*\nContoh: .brat halo hilman' },
        { quoted: msg }
      );
      return;
    }

    try {
      // Reaksi "sedang diproses"
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
      appLogger.error('Error pada command .brat:', err.message);
      await sock.sendMessage(from, { text: '❌ Gagal membuat stiker brat. Layanan pihak ketiga mungkin sedang down.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  },
};
