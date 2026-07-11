// commands/tiktokdl2.js
// Fitur: .tiktokdl2 <url>
// Provider alternatif untuk download TikTok, via twitterpicker.com.
// Dipertahankan sebagai command terpisah dari .tiktok karena pakai provider
// berbeda - berguna sebagai cadangan jika provider utama (tikwm.com) down.
//
// CATATAN: blok "annotations/embeddedMusic" pada script asli (yang menyisipkan
// link promosi channel WhatsApp milik pembuat script lain ke setiap video yang
// dikirim) SUDAH DIHAPUS di sini karena itu bukan fitur yang diminta.

const axios = require('axios');
const { appLogger } = require('../lib/logger');

async function getTiktokMedia(input) {
  let id = input;

  if (input.includes('tiktok.com')) {
    try {
      const res = await axios.get(input, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
      });
      const redirectUrl = res.headers.location || input;
      const match = redirectUrl.match(/video\/(\d+)/);
      id = match ? match[1] : redirectUrl.split('/').filter(Boolean).pop();
    } catch (err) {
      const redirectUrl = err.response?.headers?.location;
      if (redirectUrl) {
        const match = redirectUrl.match(/video\/(\d+)/);
        id = match ? match[1] : redirectUrl.split('/').filter(Boolean).pop();
      } else {
        throw err;
      }
    }
  }

  const { data } = await axios.get('https://api.twitterpicker.com/tiktok/mediav2', {
    params: { id },
    headers: { Accept: 'application/json' },
    timeout: 20000,
  });

  return {
    id: data.id,
    username: data.user?.username,
    video_nowm: data.video_no_watermark?.url,
    video_wm: data.video_watermark?.url,
    audio: data.audio?.url,
    images: data.images || null,
  };
}

module.exports = {
  name: 'tiktokdl2',
  aliases: [],
  description: 'Download TikTok (provider cadangan). Contoh: .tiktokdl2 https://vm.tiktok.com/xxxxx/',

  async execute(sock, msg, args, from) {
    const url = args[0];

    if (!url) {
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: 'Contoh:\n.tiktokdl2 https://vm.tiktok.com/xxxxx/' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '✨', key: msg.key } });

      const result = await getTiktokMedia(url);
      const caption = `— tiktok downloader —\n\n❀ author : ${result.username || '-'}`;

      if (result.video_nowm || result.video_wm) {
        await sock.sendMessage(
          from,
          { video: { url: result.video_nowm || result.video_wm }, caption },
          { quoted: msg }
        );
      } else if (Array.isArray(result.images) && result.images.length > 0) {
        let first = true;
        for (const img of result.images) {
          await sock.sendMessage(
            from,
            { image: { url: img.url || img }, caption: first ? caption : '' },
            { quoted: msg }
          );
          first = false;
        }
      } else {
        throw new Error('Media tidak ditemukan.');
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .tiktokdl2:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ Terjadi kesalahan: ${err.message}` }, { quoted: msg });
    }
  },
};
