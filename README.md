# Nnebotz 🤖

WhatsApp Bot berbasis **Node.js** + **@whiskeysockets/baileys**, dibangun dengan pola **Command Handler** yang modular. Semua command wajib menggunakan prefix titik (`.`), contoh: `.menu`, `.sticker`.

---

## 1. Struktur Proyek

```
nnebotz/
├── index.js                # Entry point: koneksi Baileys, QR code, routing pesan -> command
├── config.js                # Pusat konfigurasi
├── package.json
├── lib/
│   ├── commandHandler.js    # Loader dinamis semua file di /commands
│   ├── mediaHelper.js       # Helper download media (untuk fitur .sticker)
│   └── logger.js            # Logger sederhana (pino + console)
└── commands/
    ├── sticker.js            # .sticker
    ├── brat.js               # .brat
    ├── bratcolor.js          # .bratcolor
    ├── brathd.js             # .brathd
    ├── bratimg.js            # .bratimg
    ├── bratvid.js            # .bratvid
    ├── credit.js             # .credit
    └── menu.js               # .menu
```

**Cara kerja Command Handler Pattern:**
Setiap file di `commands/` meng-export object `{ name, aliases, description, execute(sock, msg, args, from, commandMap) }`. Saat bot start, `lib/commandHandler.js` membaca seluruh file tersebut secara otomatis dan mendaftarkannya ke dalam sebuah `Map`. Saat ada pesan masuk berprefix `.`, `index.js` cukup mencari command yang cocok di `Map` tersebut lalu memanggil `execute()`-nya — **menambah fitur baru cukup dengan menambah 1 file baru di folder `commands/`, tanpa mengubah `index.js`.**

---

## 2. Daftar Fitur

| Command | Fungsi |
|---|---|
| `.sticker` | Ubah gambar/video (kirim atau reply) < 10 detik menjadi stiker WA |
| `.brat` | Ubah teks jadi stiker gaya "brat". Contoh: .brat halo dunia (atau reply pesan teks) |
| `.bratcolor` | Stiker teks gaya "brat" dengan warna custom. Contoh: .bratcolor halo | merah | putih |
| `.brathd` | Ubah teks jadi stiker "brat" versi HD. Contoh: .brathd halo dunia (atau reply pesan teks) |
| `.bratimg` | Ubah teks jadi stiker gaya "brat" (varian img). Contoh: .bratimg halo dunia (atau reply pesan teks) |
| `.bratvid` | Ubah teks jadi stiker animasi "brat". Contoh: .bratvid halo dunia (atau reply pesan teks) |
| `.credit` | Info pembuat bot |
| `.menu` | Tampilkan semua command yang tersedia |

---

## 3. Panduan Instalasi (dari Nol)

### 3.1 Prasyarat Sistem

- **Node.js** versi **18 LTS atau lebih baru** (cek dengan `node -v`)
- **npm** (terpasang otomatis bersama Node.js)
- **ffmpeg** wajib terpasang di sistem operasi (dipakai untuk konversi stiker video/GIF):
  - **Windows**: unduh dari https://ffmpeg.org/download.html, lalu tambahkan ke PATH
  - **macOS**: `brew install ffmpeg`
  - **Linux (Debian/Ubuntu)**: `sudo apt update && sudo apt install ffmpeg -y`
- Nomor WhatsApp aktif (untuk scan QR Code)

### 3.2 Instalasi Dependencies

```bash
# 1. Masuk ke folder proyek
cd nnebotz

# 2. Install semua dependencies
npm install
```

Jika `wa-sticker-formatter`/`sharp` gagal saat instalasi di Linux, pastikan `build-essential` & `python3` sudah terpasang:
```bash
sudo apt install -y build-essential python3
```

# 3. Menjalankan Bot

```bash
npm start
# atau
node index.js
```

Setelah dijalankan, sebuah **QR Code akan muncul di terminal**. Buka WhatsApp di HP Anda:

1. Buka **WhatsApp** → **Setelan** → **Perangkat Tertaut** (Linked Devices)
2. Ketuk **Tautkan Perangkat**
3. Scan QR Code yang muncul di terminal

Setelah berhasil, terminal akan menampilkan log:
```
✅ Nnebotz berhasil terhubung ke WhatsApp!
```

Bot siap digunakan. Coba kirim `.menu` ke chat pribadi Anda sendiri (nomor yang di-scan) untuk memastikan bot merespons.

> **Catatan sesi login:** Kredensial autentikasi tersimpan otomatis di folder `auth/`. Selama folder ini tidak dihapus, Anda **tidak perlu scan ulang QR Code** setiap kali menjalankan bot.

---

## 4. Troubleshooting Singkat

- **Stiker gagal dibuat** → pastikan `ffmpeg` sudah terpasang dan bisa dipanggil dari terminal (`ffmpeg -version`).
- **QR Code terus muncul ulang / gagal connect** → hapus folder `auth/` lalu jalankan ulang `node index.js` untuk sesi baru.
- **Bot tidak merespons command** → pastikan pesan diawali prefix `.` dan command sesuai daftar di `.menu`.

---

Dibuat oleh **Nneb.dev** (https://nneb.is-a.dev) — Developer: **Ben Timothy** (https://github.com/BenTimothyM)
