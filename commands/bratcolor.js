// commands/bratcolor.js
// Fitur: .bratcolor <teks> | <background> | <warna_teks>
// Sama seperti .brat, tapi warna background & teks bisa dikustomisasi.
//
// CATATAN: memakai endpoint pihak ketiga tidak resmi (brat.siputzx.my.id).
// Anggap sebagai fitur best-effort, bisa berhenti berfungsi sewaktu-waktu.

const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

const COLOR_MAP = {
  putih: '#ffffff',
  hitam: '#000000',
  merah: '#ff0000',
  hijau: '#00ff00',
  biru: '#0000ff',
  kuning: '#ffff00',
  ungu: '#800080',
  pink: '#ff69b4',
  abu: '#808080',
  orange: '#ffa500',
};

module.exports = {
  name: 'bratcolor',
  aliases: [],
  description: 'Stiker teks gaya "brat" dengan warna custom. Contoh: .bratcolor halo | merah | putih',

  async execute(sock, msg, args, from) {
    const rawInput = resolveTextInput(args, msg);

    if (!rawInput) {
      const warnaList = Object.keys(COLOR_MAP).map((v) => `- ${v}`).join('\n');
      await sock.sendMessage(
        from,
        {
          text:
            `⚠️ Contoh penggunaan:\n*.bratcolor halo hilman | merah | biru*\n\n` +
            `🎨 List nama warna yang bisa dipakai (atau pakai kode hex sendiri, contoh #ff00aa):\n${warnaList}`,
        },
        { quoted: msg }
      );
      return;
    }

    // Format input: "teks | background | warna_teks"
    const [teksRaw, backgroundRaw, colorRaw] = rawInput.split('|').map((v) => v?.trim());

    if (!teksRaw) {
      await sock.sendMessage(from, { text: '⚠️ Masukkan teks! Contoh: .bratcolor halo | merah | putih' }, { quoted: msg });
      return;
    }

    const background = COLOR_MAP[backgroundRaw?.toLowerCase()] || backgroundRaw || '#ffffff';
    const color = COLOR_MAP[colorRaw?.toLowerCase()] || colorRaw || '#000000';

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const url = `https://brat.siputzx.my.id/image?text=${encodeURIComponent(teksRaw)}&background=${encodeURIComponent(background)}&color=${encodeURIComponent(color)}&emojiStyle=apple`;

      const { data: imageBuffer } = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });

      const sticker = new Sticker(imageBuffer, {
        pack: 'Nnebotz',
        author: 'Nneb.dev',
        type: StickerTypes.FULL,
        quality: 80,
      });

      const stickerBuffer = await sticker.toBuffer();

      await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .bratcolor:', err.message);
      await sock.sendMessage(from, { text: '❌ Gagal membuat stiker bratcolor. Layanan pihak ketiga mungkin sedang down.' }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
    }
  },
};
