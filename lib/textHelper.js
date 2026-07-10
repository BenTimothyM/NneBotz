// lib/textHelper.js
// Helper untuk mengambil teks polos dari pesan WhatsApp, termasuk dari pesan yang di-quote (reply).

/**
 * Ambil teks polos dari sebuah object "message" (msg.message).
 */
function extractText(message) {
  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    ''
  );
}

/**
 * Ambil teks dari pesan yang di-quote/reply oleh pengguna (jika ada).
 * Berguna untuk command seperti .brat yang menerima teks lewat reply.
 */
function extractQuotedText(msg) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = contextInfo?.quotedMessage;
  if (!quoted) return null;
  return extractText(quoted) || null;
}

/**
 * Ambil teks input untuk command: dari argumen yang diketik, atau jika kosong,
 * dari teks pesan yang di-reply/quote. Mengembalikan null jika tidak ada keduanya.
 */
function resolveTextInput(args, msg) {
  const typed = (args || []).join(' ').trim();
  if (typed) return typed;
  return extractQuotedText(msg);
}

module.exports = { extractText, extractQuotedText, resolveTextInput };
