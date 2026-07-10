// commands/credit.js
// Fitur: .credit
// Menampilkan informasi pembuat bot.

const config = require('../config');

module.exports = {
  name: 'credit',
  aliases: ['creator', 'about'],
  description: 'Tampilkan info pembuat bot Nnebotz.',

  async execute(sock, msg, args, from) {
    const { studio, studioLink, developer, githubLink } = config.CREATOR;

    const text =
      `𝗡 𝗡 𝗘 𝗕 𝗢 𝗧 𝗭\n\n` +
      `_Created by:_ *${studio}*\n` +
      `🔗 *${studioLink}*\n` +
      `_Developer:_ *${developer}*\n` +
      `🔗 *${githubLink}*\n\n` +
      `Terima kasih sudah menggunakan Nnebotz!`;

    await sock.sendMessage(from, { text }, { quoted: msg });
  },
};
