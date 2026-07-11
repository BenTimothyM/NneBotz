// commands/tiktok.js
// Fitur: .tiktok / .tt <url atau kata kunci>
// Download video/slideshow TikTok (+ audio-nya) via tikwm.com.
// Bisa juga cari video lewat kata kunci jika input bukan URL.
//
// CATATAN: tikwm.com adalah layanan publik pihak ketiga (bukan API resmi TikTok).

const axios = require('axios');
const { resolveTextInput } = require('../lib/textHelper');
const { appLogger } = require('../lib/logger');

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

async function searchTikTok(query) {
  const { data } = await axios.get('https://tikwm.com/api/feed/search', {
    params: { keywords: query, count: 1 },
    timeout: 20000,
  });

  if (!data || data.code !== 0 || !data.data?.videos?.length) {
    throw new Error('Hasil pencarian tidak ditemukan.');
  }

  const v = data.data.videos[0];
  return `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`;
}

async function getTikTok(url) {
  const { data } = await axios.get('https://tikwm.com/api/', {
    params: { url, hd: 1 },
    timeout: 20000,
  });

  if (!data || data.code !== 0) {
    throw new Error('Gagal mengambil data TikTok.');
  }

  return data.data;
}

module.exports = {
  name: 'tiktok',
  aliases: ['tt'],
  description: 'Download video/slideshow TikTok + audio. Contoh: .tiktok <url> atau .tiktok kata kunci',

  async execute(sock, msg, args, from) {
    const input = resolveTextInput(args, msg);

    if (!input) {
      await sock.sendMessage(
        from,
        { text: 'Contoh:\n.tiktok https://vt.tiktok.com/xxxx\n.tiktok kata kunci pencarian' },
        { quoted: msg }
      );
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '✨', key: msg.key } });

      const url = /^https?:\/\//i.test(input) ? input : await searchTikTok(input);
      const res = await getTikTok(url);

      const title = (res.title || '-').replace(/\s+/g, ' ').trim();
      const uploader = res.author?.nickname || res.author?.unique_id || '-';
      const duration = formatDuration(res.duration);
      const views = Number(res.play_count || res.play || res.views || 0).toLocaleString('id-ID');

      const caption =
        `— DOWNLOADER TIKTOK —\n\n` +
        `❀ Judul   : ${title.length > 80 ? title.slice(0, 80) + '...' : title}\n` +
        `❀ Uploader: ${uploader}\n` +
        `❀ Durasi  : ${duration}\n` +
        `❀ Views   : ${views}`;

      if (Array.isArray(res.images) && res.images.length > 0) {
        // Slideshow foto -> kirim sebagai album
        await sock.sendMessage(
          from,
          { album: res.images.map((img, i) => ({ image: { url: img }, caption: i === 0 ? caption : '' })) },
          { quoted: msg }
        );
        if (res.music) {
          await sock.sendMessage(from, { audio: { url: res.music }, mimetype: 'audio/mpeg' }, { quoted: msg });
        }
      } else if (res.play) {
        await sock.sendMessage(from, { video: { url: res.play }, caption }, { quoted: msg });
        if (res.music) {
          await sock.sendMessage(from, { audio: { url: res.music }, mimetype: 'audio/mpeg' }, { quoted: msg });
        }
      } else {
        throw new Error('Media tidak ditemukan pada hasil.');
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .tiktok:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ Gagal: ${err.message}` }, { quoted: msg });
    }
  },
};
