// commands/ttmusic.js
// Fitur: .ttmusic / .tiktokmusic / .ttmp3 <url atau kata kunci>
// Download audio saja dari TikTok, via tikwm.com.

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
    throw new Error('Hasil tidak ditemukan.');
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
  name: 'ttmusic',
  aliases: ['tiktokmusic', 'ttmp3'],
  description: 'Download audio TikTok saja. Contoh: .ttmusic <url> atau .ttmusic kata kunci',

  async execute(sock, msg, args, from) {
    const input = resolveTextInput(args, msg);

    if (!input) {
      await sock.sendMessage(
        from,
        { text: 'Contoh:\n.ttmusic https://vt.tiktok.com/xxxx\n.ttmusic kata kunci' },
        { quoted: msg }
      );
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🎵', key: msg.key } });

      const url = /^https?:\/\//i.test(input) ? input : await searchTikTok(input);
      const res = await getTikTok(url);

      if (!res.music) throw new Error('Audio TikTok tidak ditemukan.');

      const title = (res.title || '-').replace(/\s+/g, ' ').trim();
      const uploader = res.author?.nickname || res.author?.unique_id || '-';
      const duration = formatDuration(res.duration);

      const caption =
        `— TIKTOK MUSIC —\n\n` +
        `❀ Judul   : ${title.length > 80 ? title.slice(0, 80) + '...' : title}\n` +
        `❀ Uploader: ${uploader}\n` +
        `❀ Durasi  : ${duration}`;

      await sock.sendMessage(
        from,
        { audio: { url: res.music }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` },
        { quoted: msg }
      );
      await sock.sendMessage(from, { text: caption }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .ttmusic:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ ${err.message}` }, { quoted: msg });
    }
  },
};
