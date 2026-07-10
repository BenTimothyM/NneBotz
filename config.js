// config.js
// Memuat semua konfigurasi & environment variable secara terpusat
// sehingga tidak ada file lain yang perlu memanggil dotenv berulang kali.

require('dotenv').config();

module.exports = {
  // Prefix wajib untuk semua command bot
  PREFIX: process.env.BOT_PREFIX || '.',

  // Nama folder session auth Baileys
  SESSION_NAME: process.env.SESSION_NAME || 'nnebotz-session',

  // Info credit bot (fitur .credit)
  CREATOR: {
    studio: 'Nneb.dev',
    studioLink: 'https://nneb.is-a.dev',
    developer: 'Ben Timothy',
    githubLink: 'https://github.com/BenTimothyM',
  },
};
