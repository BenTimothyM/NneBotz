// commands/sticker.js
// Fitur: .sticker
// Mengubah gambar atau video pendek (<10 detik) yang dikirim/di-quote menjadi stiker WA.

const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { getMediaBuffer } = require('../lib/mediaHelper');
const { appLogger } = require('../lib/logger');

const MAX_VIDEO_DURATION_SEC = 10;

module.exports = {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  description: 'Ubah gambar/video (kirim atau reply) menjadi stiker. Contoh: .sticker (kirim/reply gambar)',

  async execute(sock, msg, args, from) {
    try {
      const media = await getMediaBuffer(msg, sock);

      if (!media) {
        await sock.sendMessage(
          from,
          { text: '⚠️ Kirim atau reply gambar/video (maks. 10 detik) dengan caption *.sticker*' },
          { quoted: msg }
        );
        return;
      }

      if (media.type !== 'image' && media.type !== 'video') {
        await sock.sendMessage(from, { text: '⚠️ Media harus berupa gambar atau video.' }, { quoted: msg });
        return;
      }

      // Validasi durasi video (jika ada info seconds pada node video)
      if (media.type === 'video') {
        const seconds = media.node?.seconds;
        if (seconds && seconds > MAX_VIDEO_DURATION_SEC) {
          await sock.sendMessage(
            from,
            { text: `⚠️ Video terlalu panjang. Maksimal ${MAX_VIDEO_DURATION_SEC} detik.` },
            { quoted: msg }
          );
          return;
        }
      }

      const sticker = new Sticker(media.buffer, {
        pack: 'Nnebotz',
        author: 'Nneb.dev',
        type: StickerTypes.FULL, // gunakan CROPPED jika ingin dipotong persegi
        quality: 70,
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
    } catch (err) {
      appLogger.error('Error pada command .sticker:', err.message);
      await sock.sendMessage(
        from,
        { text: '❌ Gagal membuat stiker. Pastikan ffmpeg terpasang di sistem dan media valid.' },
        { quoted: msg }
      );
    }
  },
};
