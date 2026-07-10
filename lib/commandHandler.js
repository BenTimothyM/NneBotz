// lib/commandHandler.js
// Bertugas memuat semua command dari folder /commands secara otomatis (dinamis)
// dan menyediakan fungsi dispatch untuk mengeksekusi command yang cocok.

const fs = require('fs');
const path = require('path');
const { appLogger } = require('./logger');

function loadCommands() {
  const commandsDir = path.join(__dirname, '..', 'commands');
  const commandMap = new Map(); // key: nama command / alias -> value: module command

  const files = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    try {
      const commandModule = require(path.join(commandsDir, file));

      if (!commandModule?.name || typeof commandModule.execute !== 'function') {
        appLogger.warn(`Command di file "${file}" dilewati (format tidak valid).`);
        continue;
      }

      commandMap.set(commandModule.name.toLowerCase(), commandModule);

      // Daftarkan juga semua alias jika ada
      (commandModule.aliases || []).forEach((alias) => {
        commandMap.set(alias.toLowerCase(), commandModule);
      });

      appLogger.info(`Command dimuat: ${commandModule.name}`);
    } catch (err) {
      appLogger.error(`Gagal memuat command dari file "${file}":`, err.message);
    }
  }

  return commandMap;
}

module.exports = { loadCommands };
