// commands/instatiktok.js
// Fitur: .dlit <platform> <url>
// Download dari Instagram, TikTok, atau Facebook via instatiktok.com (scraping HTML).
// Format: .dlit tiktok https://vt.tiktok.com/xxxx

const axios = require('axios');
const cheerio = require('cheerio');
const { appLogger } = require('../lib/logger');

const SITE_URL = 'https://instatiktok.com/';
const VALID_PLATFORMS = ['instagram', 'tiktok', 'facebook'];

module.exports = {
  name: 'dlit',
  aliases: [],
  description: 'Download IG/TikTok/Facebook. Contoh: .dlit tiktok https://vt.tiktok.com/xxxx',

  async execute(sock, msg, args, from) {
    if (args.length < 2) {
      await sock.sendMessage(
        from,
        { text: 'Contoh:\n.dlit tiktok https://vt.tiktok.com/xxxx\n\nPlatform valid: instagram, tiktok, facebook' },
        { quoted: msg }
      );
      return;
    }

    const platform = args[0].toLowerCase();
    const inputUrl = args[1];

    if (!VALID_PLATFORMS.includes(platform)) {
      await sock.sendMessage(from, { text: '❌ Platform tidak valid! Gunakan: instagram, tiktok, atau facebook' }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(from, { react: { text: '🕒', key: msg.key } });

      const form = new URLSearchParams();
      form.append('url', inputUrl);
      form.append('platform', platform);
      form.append('siteurl', SITE_URL);

      const res = await axios.post(`${SITE_URL}api`, form.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Origin: SITE_URL,
          Referer: SITE_URL,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'X-Requested-With': 'XMLHttpRequest',
        },
        timeout: 20000,
      });

      const html = res?.data?.html;
      if (!html || res?.data?.status !== 'success') throw new Error('Gagal ambil data.');

      const $ = cheerio.load(html);
      const links = [];

      $('a.btn[href^="http"]').each((_, el) => {
        const link = $(el).attr('href');
        if (link && !links.includes(link)) links.push(link);
      });

      if (links.length === 0) throw new Error('Link download tidak ditemukan.');

      let download;
      if (platform === 'instagram') {
        download = links;
      } else if (platform === 'tiktok') {
        download = links.find((link) => /hdplay/.test(link)) || links[0];
      } else {
        download = links.at(-1);
      }

      const targets = Array.isArray(download) ? download : [download];
      for (const link of targets) {
        await sock.sendMessage(from, { video: { url: link }, caption: `✅ Hasil download dari ${platform}` }, { quoted: msg });
      }

      await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
    } catch (err) {
      appLogger.error('Error pada command .dlit:', err.message);
      await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
      await sock.sendMessage(from, { text: `❌ Gagal: ${err.message}` }, { quoted: msg });
    }
  },
};
