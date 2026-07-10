// index.js
// Entry point Nnebotz. Bertugas:
// 1. Membuat koneksi socket ke WhatsApp via Baileys (multi-file auth state)
// 2. Menampilkan QR Code untuk autentikasi di terminal
// 3. Menangani reconnect otomatis
// 4. Menangkap pesan masuk, mem-parsing prefix & command, lalu mendispatch ke command handler

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

const config = require('./config');
const { baileysLogger, appLogger } = require('./lib/logger');
const { loadCommands } = require('./lib/commandHandler');
const { extractText } = require('./lib/textHelper');

// Muat semua command sekali di awal (dari folder /commands)
const commandMap = loadCommands();

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(`./auth/${config.SESSION_NAME}`);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: baileysLogger,
    printQRInTerminal: false, // kita tangani manual via event 'connection.update' agar lebih terkontrol
    browser: ['Nnebotz', 'Chrome', '1.0.0'],
  });

  // Simpan kredensial setiap kali berubah (wajib untuk multi-file auth state)
  sock.ev.on('creds.update', saveCreds);

  // Menangani status koneksi: QR code, connecting, open, close (+ reconnect)
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      appLogger.info('Silakan scan QR Code berikut dengan WhatsApp Anda:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      appLogger.warn(`Koneksi terputus. Reconnect: ${shouldReconnect}`);

      if (shouldReconnect) {
        startBot();
      } else {
        appLogger.error('Sesi logout. Hapus folder auth/ dan scan ulang QR Code untuk login kembali.');
      }
    } else if (connection === 'open') {
      appLogger.info('✅ Nnebotz berhasil terhubung ke WhatsApp!');
    }
  });

  // Menangani pesan masuk
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return; // abaikan pesan kosong / pesan dari bot sendiri

    const from = msg.key.remoteJid;
    const text = extractText(msg.message).trim();

    if (!text.startsWith(config.PREFIX)) return; // wajib prefix "."

    // Parsing command & argumen: ".cek-kurs USD IDR" -> command="cek-kurs", args=["USD","IDR"]
    const withoutPrefix = text.slice(config.PREFIX.length).trim();
    const [commandName, ...args] = withoutPrefix.split(/\s+/);

    if (!commandName) return;

    const command = commandMap.get(commandName.toLowerCase());

    if (!command) {
      // Command tidak dikenal -> diamkan saja agar bot tidak berisik di grup
      return;
    }

    try {
      await command.execute(sock, msg, args, from, commandMap);
    } catch (err) {
      // Error handling kuat: apapun yang terjadi di dalam command, bot TIDAK BOLEH crash.
      appLogger.error(`Error saat menjalankan command "${commandName}":`, err);
      try {
        await sock.sendMessage(
          from,
          { text: '❌ Terjadi kesalahan saat memproses perintah. Silakan coba lagi.' },
          { quoted: msg }
        );
      } catch (sendErr) {
        appLogger.error('Gagal mengirim pesan error ke user:', sendErr.message);
      }
    }
  });

  return sock;
}

// Menangkap error tak tertangani di level proses agar bot tidak mati total
process.on('unhandledRejection', (reason) => {
  appLogger.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  appLogger.error('Uncaught Exception:', err);
});

startBot().catch((err) => {
  appLogger.error('Gagal memulai Nnebotz:', err);
});
