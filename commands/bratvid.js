// commands/bratvid.js
// Fitur: .bratvid <teks> (atau reply pesan teks)
// Sama seperti .brat, tapi hasilnya stiker animasi (GIF).
//
// CATATAN: memakai endpoint pihak ketiga tidak resmi (brat.siputzx.my.id).
// Anggap sebagai fitur best-effort, bisa berhenti berfungsi sewaktu-waktu.
// Konversi animasi butuh waktu & resource lebih besar dibanding stiker statis.

const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

module.exports = {
  name: 'bratvid',
  aliases: [],
  description: 'Ubah teks jadi stiker animasi "brat". Contoh: .bratvid halo dunia (atau reply pesan teks)',

  async execute(sock, msg, args, from) {
    const text = resolveTextInput(args, msg);

    if (!text) {
      await sock.sendMessage(from, { text: '✨ Masukin teks dong!\nContoh: .bratvid halo hilman' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(text)}`;
      const { data: gifBuffer } = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000 });

      const sticker = new Sticker(gifBuffer, {
        pack: 'Nnebotz',
        author: 'Nneb.dev',
        type: StickerTypes.FULL,
        quality: 70,
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .bratvid:', err.message);
      await sock.sendMessage(from, { text: '❌ Gagal membuat stiker bratvid. Layanan pihak ketiga mungkin sedang down.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  },
};
