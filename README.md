# Meg — Free Online Tools

> Download TikTok, Instagram, YouTube · Remove Background · Text Styler

Meg adalah kumpulan tools gratis berbasis web yang dibangun dengan **Next.js** dan di-deploy ke **Vercel**.

---

## Fitur

| Fitur | Keterangan | API |
|---|---|---|
| TikTok Downloader | Video (no watermark / WM) + Extract Audio | fromscratch.web.id |
| Instagram Downloader | Foto, Video, Reels, Carousel + Extract Audio | fromscratch.web.id |
| YouTube Downloader | Multi-format video + audio-only | RapidAPI yt-dlp |
| Remove Background | Hapus BG foto otomatis dengan AI | remove.bg |
| Text Styler | 14 gaya teks Unicode, real-time, copy 1 klik | Tidak perlu API |

---

## Struktur Project

```
meg/
├── components/
│   ├── AudioExtractor.js       # Ekstrak audio dari video (browser-side)
│   ├── Footer.js
│   ├── Layout.js
│   ├── Navbar.js
│   └── downloader/
│       ├── TikTokDownloader.js
│       ├── InstagramDownloader.js
│       └── YouTubeDownloader.js
├── pages/
│   ├── _app.js
│   ├── index.js                # Homepage
│   ├── download/index.js       # Halaman downloader (tab TikTok/IG/YT)
│   ├── remove-bg/index.js      # Halaman remove background
│   ├── text-styler/index.js    # Halaman text styler
│   └── api/
│       ├── tiktok.js           # API route TikTok
│       ├── instagram.js        # API route Instagram
│       ├── youtube.js          # API route YouTube
│       ├── remove-bg.js        # API route Remove Background
│       └── extract-audio.js    # Proxy video untuk ekstrak audio
├── styles/
│   └── globals.css             # Design system monochrome
├── vercel.json
├── next.config.js
└── package.json
```

---

## Setup & Deploy

### 1. Clone & Install

```bash
git clone https://github.com/username/Tools-Meg.git
cd Tools-Meg
npm install
```

### 2. Environment Variables

Buat file `.env.local` di root project:

```env
RAPIDAPI_KEY=isi_dengan_key_kamu
REMOVE_BG_API_KEY=isi_dengan_key_kamu
```

| Variable | Cara Dapat | Gratis |
|---|---|---|
| `REMOVE_BG_API_KEY` | Daftar di [remove.bg/api](https://www.remove.bg/api) | ✅ 50 foto/bulan |

> TikTok & Instagram tidak butuh API key — menggunakan endpoint sendiri.

### 3. Jalankan lokal

```bash
npm run dev
# buka http://localhost:3000
```

### 4. Deploy ke Vercel

```bash
# Install Vercel CLI (sekali saja)
npm i -g vercel

# Login & deploy
vercel

# Atau push ke GitHub → connect repo di vercel.com → otomatis deploy
```

Jangan lupa tambahkan environment variables di:
**Vercel Dashboard → Project → Settings → Environment Variables**

---

## Tech Stack

- **Framework:** Next.js 14
- **Styling:** CSS Variables + Google Fonts (Syne, DM Mono)
- **Icons:** Font Awesome 6 (CDN)
- **Deploy:** Vercel
- **Audio Extraction:** Web Audio API (browser-native, no library)

---

## Catatan

- Meg tidak menyimpan konten yang diproses oleh user.
- Hanya bisa download konten Instagram/TikTok yang **bersifat publik**.
- Download YouTube hanya untuk konten yang bebas hak cipta atau milik sendiri.
