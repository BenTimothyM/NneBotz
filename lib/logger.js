// lib/logger.js
// Logger sederhana berbasis pino, dipakai oleh index.js (untuk Baileys)
// dan boleh dipakai command lain untuk mencatat error dengan rapi.

const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'silent', // 'silent' agar log internal Baileys tidak berisik
  transport: undefined,
});

// Logger khusus untuk console output kita sendiri (bukan log internal Baileys)
const appLogger = {
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

module.exports = { baileysLogger: logger, appLogger };
