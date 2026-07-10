// lib/mediaHelper.js
// Helper untuk mengambil buffer media (gambar/video) baik dari pesan yang
// langsung dikirim bersama command, maupun dari pesan yang di-quote (reply).

const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { appLogger } = require('./logger');

/**
 * Mengambil object message yang relevan untuk diunduh:
 * - Jika pesan saat ini mengandung media, pakai itu.
 * - Jika tidak, cek apakah pesan tersebut me-reply/quote pesan lain yang mengandung media.
 */
function extractMediaMessage(msg) {
  const message = msg.message;
  if (!message) return null;

  // Media langsung pada pesan (caption command dikirim bareng gambar/video)
  if (message.imageMessage) return { type: 'image', node: message.imageMessage, raw: { message } };
  if (message.videoMessage) return { type: 'video', node: message.videoMessage, raw: { message } };
  if (message.stickerMessage) return { type: 'sticker', node: message.stickerMessage, raw: { message } };

  // Media dari pesan yang di-quote (reply)
  const contextInfo =
    message.extendedTextMessage?.contextInfo ||
    message.imageMessage?.contextInfo ||
    message.videoMessage?.contextInfo;

  const quoted = contextInfo?.quotedMessage;
  if (!quoted) return null;

  if (quoted.imageMessage) return { type: 'image', node: quoted.imageMessage, raw: { message: quoted } };
  if (quoted.videoMessage) return { type: 'video', node: quoted.videoMessage, raw: { message: quoted } };
  if (quoted.stickerMessage) return { type: 'sticker', node: quoted.stickerMessage, raw: { message: quoted } };

  return null;
}

/**
 * Mengunduh buffer media dari pesan (baik langsung maupun quoted).
 * Mengembalikan { type, buffer } atau null jika tidak ada media.
 */
async function getMediaBuffer(msg, sock) {
  const media = extractMediaMessage(msg);
  if (!media) return null;

  try {
    const buffer = await downloadMediaMessage(
      media.raw,
      'buffer',
      {},
      { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
    );
    return { type: media.type, buffer, node: media.node };
  } catch (err) {
    appLogger.error('Gagal mengunduh media:', err.message);
    return null;
  }
}

module.exports = { getMediaBuffer };
