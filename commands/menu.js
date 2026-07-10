// commands/menu.js
// Fitur: .menu / .help
// Menampilkan daftar semua command yang tersedia beserta deskripsi singkat.

const config = require('../config');

module.exports = {
  name: 'menu',
  aliases: ['help'],
  description: 'Tampilkan menu daftar command.',

  async execute(sock, msg, args, from, commandMap) {
    const prefix = config.PREFIX;

    const uniqueCommands = [...new Set(commandMap.values())];

    let list = uniqueCommands
      .map((cmd) => `[▢] *${prefix}${cmd.name}*\n   _${cmd.description}_`)
      .join('\n\n');

    const text =
      '𝗡 𝗡 𝗘 𝗕 𝗢 𝗧 𝗭\n' +
      '𝘉𝘺 𝘉𝘦𝘯 𝘛𝘪𝘮𝘰𝘵𝘩𝘺 | 𝘕𝘯𝘦𝘣.𝘥𝘦𝘷\n\n' +
      `Menu:\n\n` +
      `${list}\n\n`;

    await sock.sendMessage(from, { text }, { quoted: msg });
  },
};
