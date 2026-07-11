# NneBotz 🤖

WhatsApp Bot berbasis **Node.js** + **@whiskeysockets/baileys**, dibangun dengan pola **Command Handler** yang modular. Semua command wajib menggunakan prefix titik (`.`), contoh: `.menu`, `.sticker`, `.tiktok <url>`.

---

## 1. Struktur Proyek

```
nnebotz/
├── index.js                 # Entry point: koneksi Baileys, QR code, routing pesan -> command
├── config.js                 # Pusat konfigurasi (baca dari .env)
├── package.json
├── .env.example               # Template environment variable (salin jadi .env)
├── lib/
│   ├── commandHandler.js     # Loader dinamis semua file di /commands
│   ├── mediaHelper.js        # Helper download media (untuk fitur .sticker)
│   ├── textHelper.js         # Helper ambil teks dari argumen / pesan yang di-reply
│   └── logger.js             # Logger sederhana (pino + console)
└── commands/
    ├── sticker.js            # .sticker
    ├── brat.js                # .brat
    ├── bratcolor.js           # .bratcolor
    ├── brathd.js              # .brathd
    ├── bratimg.js             # .bratimg
    ├── bratvid.js             # .bratvid
    ├── tiktok.js               # .tiktok / .tt
    ├── tiktokdl2.js            # .tiktokdl2
    ├── ttimg.js                # .ttimg / .tiktokimg
    ├── ttmusic.js              # .ttmusic / .tiktokmusic / .ttmp3
    ├── ig.js                   # .ig / .igdl / .instagram
    ├── ig3.js                  # .ig3 / .igdl3 / .instagram3
    ├── igaudio.js              # .igaudio / .igmp3
    ├── instatiktok.js          # .dlit
    ├── twitter.js              # .twitter / .tw / .xdl
    ├── soundcloud.js           # .soundcloud / .soundcloudplay / .scdl
    ├── spotify.js               # .spotifyplay / .spplay
    ├── credit.js                # .credit
    └── menu.js                  # .menu / .help
```

**Cara kerja Command Handler Pattern:**
Setiap file di `commands/` meng-export object `{ name, aliases, description, execute(sock, msg, args, from, commandMap) }`. Saat bot start, `lib/commandHandler.js` membaca seluruh file tersebut secara otomatis dan mendaftarkannya ke dalam sebuah `Map`. Saat ada pesan masuk berprefix `.`, `index.js` cukup mencari command yang cocok di `Map` tersebut lalu memanggil `execute()`-nya — **menambah fitur baru cukup dengan menambah 1 file baru di folder `commands/`, tanpa mengubah `index.js`.**

Menghapus fitur juga sama mudahnya: **hapus saja file command-nya** di folder `commands/`, fitur otomatis hilang termasuk dari `.menu`.

---

## 2. Daftar Fitur

### Sticker & Brat
| Command | Fungsi |
|---|---|
| `.sticker` | Ubah gambar/video (kirim atau reply) < 10 detik menjadi stiker WA |
| `.brat <teks>` | Stiker teks gaya "brat" |
| `.bratcolor <teks> \| <bg> \| <warna>` | Sama seperti `.brat`, warna background & teks bisa dikustom |
| `.brathd <teks>` | Versi HD dari `.brat` |
| `.bratimg <teks>` | Varian lain dari `.brat` (API sama dengan `.brat`) |
| `.bratvid <teks>` | Versi animasi (GIF) |

### Downloader
| Command | Fungsi |
|---|---|
| `.tiktok <url/kata kunci>` | Download video/slideshow + audio TikTok (bisa cari via kata kunci) |
| `.tiktokdl2 <url>` | Download TikTok, provider cadangan |
| `.ttimg <url>` | Download slideshow foto TikTok |
| `.ttmusic <url/kata kunci>` | Download audio TikTok saja |
| `.ig <url>` | Download foto/video/carousel Instagram |
| `.ig3 <url>` | Download Instagram, provider cadangan |
| `.igaudio <url reel>` | Download audio dari Instagram Reel |
| `.dlit <platform> <url>` | Download IG/TikTok/Facebook dalam satu command |
| `.twitter <url>` | Download video dari X/Twitter |
| `.soundcloud <judul/link>` | Cari & download lagu SoundCloud |
| `.spotifyplay <judul lagu>` | Cari & download lagu Spotify |

### Lainnya
| Command | Fungsi |
|---|---|
| `.credit` | Info pembuat bot |
| `.menu` / `.help` | Tampilkan semua command yang tersedia |

> **Penting:** semua fitur downloader & brat di atas memakai **layanan pihak ketiga tidak resmi** (scraping/API publik gratis, bukan API resmi dari TikTok/Instagram/Twitter/SoundCloud/Spotify). Anggap sebagai fitur *best-effort* — endpoint bisa berubah atau berhenti berfungsi sewaktu-waktu di luar kendali kita, dan tidak butuh API key sama sekali.

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

### 3.3 Konfigurasi Environment (`.env`)

```bash
# Salin template environment
cp .env.example .env
```

Isi `.env` cukup ini (tidak ada API key yang dibutuhkan sama sekali untuk versi ini):

```env
BOT_PREFIX=.
SESSION_NAME=nnebotz-session
```

### 3.4 Menjalankan Bot

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

## 4. Menambah / Menghapus Fitur

- **Menambah fitur**: buat file baru di `commands/`, export `{ name, aliases, description, execute(sock, msg, args, from, commandMap) }`. Otomatis ter-load, otomatis muncul di `.menu`.
- **Menghapus fitur**: hapus file command-nya dari `commands/`, lalu restart bot.

---

## 5. Troubleshooting Singkat

- **Stiker gagal dibuat** → pastikan `ffmpeg` sudah terpasang dan bisa dipanggil dari terminal (`ffmpeg -version`).
- **Fitur downloader gagal terus** → endpoint pihak ketiga yang dipakai kemungkinan sedang down/berubah; coba command provider cadangan (misal `.tiktokdl2` jika `.tiktok` gagal, atau `.ig3` jika `.ig` gagal).
- **QR Code terus muncul ulang / gagal connect** → hapus folder `auth/` lalu jalankan ulang `node index.js` untuk sesi baru.
- **Bot tidak merespons command** → pastikan pesan diawali prefix `.` dan command sesuai daftar di `.menu`.

---

Dibuat oleh [**Nneb.dev**](https://nneb.is-a.dev) — Developer: [**Ben Timothy**](https://github.com/BenTimothyM)
