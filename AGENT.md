# AGENT.md — Birthday Website Interaktif (React + Vite + Tailwind CSS)

## 1. Ringkasan Proyek

Website ulang tahun satu halaman untuk seorang perempuan. Tujuannya: membuat dia kaget, senang, dan terkesan lewat alur cerita interaktif, animasi, musik, dan mini game.

**Alur utama saat ini:**

`Splash → Kata Pembuka → Match Image → Perjalanan Pertemuan → Happy Birthday → Make a Wish → Ucapan Dariku → Finale Happy Birthday`

Stage dikendalikan oleh state di `src/App.jsx`:

`["splash", "interlude", "game", "timeline", "hero", "wish", "message", "finale"]`

**Catatan revisi:** Hero memakai rangkaian typewriter + gacha angka khusus (lihat Section 5). Jangan mengubah timing atau urutan teks tanpa permintaan eksplisit.

## 2. Data dan Teks

Semua teks disimpan di `src/config.js`; jangan hardcode teks di komponen. Gunakan `interpolate()` untuk placeholder `{name}`, `{fromName}`, `{age}`, dan nilai tambahan seperti `{lives}`, `{moves}`, `{matched}`.

Data personal saat ini:

- `name`: `"Keysha"`
- `nicknames`: `["Keysha", "Key", "Jejut"]`
- `fromName`: `"Chan"`
- `age`: `21`
- `birthdayDate`: `"2005-11-09"`

Kelompok config utama:

- Splash: `splashSteps`, `splashLoading`, `splashReady`
- Interlude: `interludeLines`, `interludeSpeed`, `interludeHold`, `skipLabel`
- Mini game: `gameKicker`, `gameTitle`, `gameText`, `gameStart`, `gameRestart`, `gameNext`, `gameLives`, `gameLivesCount`, `gamePairs`, `gameMoves`, `gameHint`, `gameWinTitle`, `gameWinText`, `gameLoseTitle`, `gameLoseText`, `gameLoseNote`, `gameImages`
- Timeline: `timelineKicker`, `timelineTitle`, `timelineSubtitle`, `timelineScrollHint`, `timelineEmptyLabel`, `timelineMusicHint`, `timelineOutro`, `timelineNext`, `timeline`, `timelineMusic`, `timelineMusicVolume`
- Hero: `heroIntro`, `heroBirthdayTitle`, `heroBirthdayAgeLead`, `heroAgePretend`, `heroGreeting`, `heroNext`
- Wish: `wishKicker`, `wishTitle`, `wishText`, `wishPaperLabel`, `wishPaperHint`, `wishPaperLines`, `wishDialogTitle`, `wishDialogText`, `wishKeyHint`, `wishInputLabel`, `wishPlaceholder`, `wishSend`, `wishClose`, `wishSent`, `wishAutoNext`
- Message: `messageTitle`, `finalMessage`, `messageSpeed`, `messageSkip`, `signature`, `messageNext`
- Finale: `finaleKicker`, `finaleTitle`, `finaleText`, `finaleNote`, `finaleRestart`
- Audio: `music`/`musicVolume` untuk track awal; `timelineMusic`/`timelineMusicVolume` untuk track kedua yang mulai saat Timeline dan berlanjut sampai Finale. Saat ini track awal memakai `music2.mp3` dan track kedua memakai `music.mp3`.
- Audio/UI: `ui`, `themeColors`

`gameLivesCount` bernilai **10**. `photos`, config Bonus, dan config Ending sudah dihapus.

## 3. Tech Stack (Wajib)

- **React 18 + Vite** (JavaScript/JSX).
- **Tailwind CSS v4** lewat plugin `@tailwindcss/vite`; token warna, font, dan keyframes kustom di `src/index.css`.
- **GSAP** + `@gsap/react` (`useGSAP`) untuk animasi section dan kertas Wish.
- **canvas-confetti** untuk confetti; kembang api Finale memakai canvas sendiri.
- **Font**: `@fontsource/pacifico` dan `@fontsource/poppins`, bukan CDN.
- **Partikel**: `ParticlesBackground` berbasis canvas.

**Prinsip React:**

- Satu komponen per section; alur dikendalikan state `stage` di `App.jsx`.
- Animasi memakai `ref` + `useGSAP`, dengan cleanup timer/tween/listener.
- Posisi mouse/trail/parallax tidak disimpan di `useState`; gunakan `useRef` + RAF atau GSAP.
- Logika berulang dibuat hook (`useMousePosition`, `useParallax`, `useTypewriter`, `useReducedMotion`, `useGyroscope`, `useAudioState`).
- Jangan menyimpan harapan user ke server; Wish murni client-side.

## 4. Fitur Global

1. Custom cursor dan cursor trail.
2. Parallax mouse pada layer latar.
3. Background partikel bintang/bokeh.
4. Dua track musik: track awal dicoba autoplay saat halaman dibuka; jika browser memblokir audio bersuara, track mulai pada interaksi pertama (klik/tap di area mana pun selain tombol musik). Saat Timeline dibuka, track kedua menggantikannya dan tetap berjalan sampai Finale. Restart kembali ke track awal dari awal. Tombol musik di pojok kanan atas mengontrol track aktif.
5. Transisi antar stage: fade/scale, flash, dan `slideUp` dari splash; hindari animasi `filter: blur()` pada seluruh stage karena berat di resolusi 4K.
6. Mobile support dari 360px; layout tidak boleh overflow horizontal.
7. Hormati `prefers-reduced-motion`: animasi berat dikurangi/dimatikan.
8. `[data-stage]` pada wrapper stage untuk kebutuhan debugging/test.
9. Setiap stage baru wajib scroll ke atas.
10. Semua canvas memakai budget piksel lewat `src/utils/canvas.js`; jangan kembali memakai DPR 2 penuh untuk canvas full-screen.
11. Cursor trail hanya berjalan saat ada partikel; jangan membuat RAF full-screen terus-menerus saat idle.

## 5. Struktur Section

### Section 1 — Splash

- 5 langkah loading, masing-masing 2 detik, lalu hold 2 detik.
- Progress bar dan persentase berjalan otomatis sampai 100%.
- Ikon/teks berganti dengan animasi fade dan progress dot.
- Setelah selesai, confetti burst lalu otomatis masuk Interlude lewat transisi `slideUp`.
- Tidak ada tombol “Buka Kejutannya”; alur berjalan otomatis.

### Section 2 — Interlude (Kata Pembuka)

- Layar gelap dengan partikel halus.
- `CONFIG.interludeLines` diketik satu per satu dengan efek typewriter.
- Setelah baris terakhir, countdown besar `3 → 2 → 1` dengan pop + glow.
- Tombol **Skip** di pojok kanan bawah langsung masuk game.
- Setelah countdown, transisi flash ke Mini Game.

### Section 3 — Mini Game “Cocokkan Kenangan”

- Memory match 8 pasang foto dari `CONFIG.gameImages` (total 16 kartu, grid 4×4).
- Semua kartu tertutup di awal; user menekan **Mulai main**.
- Membuka dua kartu: cocok → kartu terbuka; salah → shake dan nyawa berkurang.
- **Nyawa awal 10** (`CONFIG.gameLivesCount`), ditampilkan sebagai `♥ 10` + bar 10 segmen.
- Progress pasangan `x / 8`, jumlah langkah, dan hint.
- Menang: modal hasil dengan langkah + sisa nyawa, tombol **Lanjut** dan **Ulangi**.
- Kalah: modal “Nyawa habis...” dan hanya tombol **Ulangi**; tidak bisa lanjut sebelum menang.
- Saat menang, `App.playGame` langsung memicu flash ke Timeline; hasil detail game tidak lagi ditampilkan di Hero.

### Section 4 — Timeline “Perjalanan Pertemuan”

- Kicker: **“Perjalanan pertemuan”**.
- `CONFIG.timeline` berisi 5 entri; mendukung `image` opsional, fallback ikon + “Foto menyusul”.
- Desktop: foto aktif sticky di kiri, daftar cerita scroll di kanan.
- Mobile: kartu foto ringkas di atas tiap cerita.
- Progress rail dan counter foto aktif mengikuti scroll.
- Track kedua mulai saat Timeline dibuka, menggantikan track awal, dan **tidak berhenti saat keluar Timeline**; terus berjalan sampai Finale.
- Jika track kedua diblokir browser, tampil tombol musik di Timeline; tombol musik global tetap bisa menyalakannya.
- Tombol **Lanjut** memicu flash ke Hero.

### Section 5 — Happy Birthday Hero

- Hero minimal: tanpa balon, confetti, badge tanggal, umur, subtitle lama, atau badge hasil game.
- Urutan typewriter + gacha:
  1. `anyway` diketik, ditahan, lalu dihapus karakter demi karakter.
  2. `Happy Birthday For U` diketik.
  3. Baris baru `yang ke-` diketik.
  4. Angka dua digit acak `10–99` berubah cepat seperti gacha selama ±2,6 detik; interval makin lambat, lalu settle di `31` (`heroAgePretend`).
  5. `31` ditahan tepat **3000ms**, lalu digit `3` slide ke bawah keluar dan `2` masuk dari atas, menghasilkan `21` (`CONFIG.age`).
  6. Ucapan `heroGreeting` diketik dengan typewriter.
  7. Setelah ucapan selesai, tombol **Lanjut** muncul dengan fade-up.
- Saat gacha, `data-hero-gacha="true"`; setelah settle `31`, `data-hero-gacha="false"` dan angka memakai layout roll dua digit.
- Angka `21` dan `31` tidak ditampilkan sebagai hasil acak sebelum settle, agar hasil akhir jelas.
- Tidak ada tombol skip; tombol hanya aktif setelah seluruh sequence selesai.
- Reduced motion: langsung tampil kondisi final `21`, ucapan, dan tombol tanpa gacha/animasi.
- Teks animasi diberi `aria-hidden`; versi final disediakan untuk screen reader.
- Tombol **Lanjut** menuju Make a Wish.

### Section 6 — Make a Wish

- 10 balon dekoratif naik pelan dari bawah dengan kertas kecil; tidak bisa diklik.
- Satu kertas krem besar di tengah sebagai pemicu utama (“Kertas harapanmu”).
- Klik kertas membuka modal portal glass:
  - textarea `#wish-input`
  - maksimal **160 karakter**
  - **Enter** mengirim, **Shift + Enter** baris baru
  - **Esc** atau klik backdrop menutup
  - harapan kosong tidak bisa dikirim
- Setelah submit:
  - modal tertutup
  - kertas terbang ke atas dengan GSAP selama **2200ms**
  - setelah kertas hilang, tunggu **3000ms**
  - otomatis pindah ke Message
- Tidak ada tombol Lanjut di Wish.
- Reduced motion: kertas tidak terbang, balon statis, auto-next setelah 3 detik.
- Harapan tidak disimpan/dikirim ke mana pun.

### Section 7 — Ucapan Dariku (Typewriter Message)

- Kartu glassmorphism dengan efek tilt.
- `CONFIG.finalMessage` diketik baris demi baris memakai `TypewriterText`.
- Kursor berkedip; tombol **Percepat** mempercepat pengetikan.
- Setelah selesai muncul signature `— {fromName}` dan tombol **Lanjut** manual ke Finale.

### Section 8 — Finale Happy Birthday

- Judul `finaleTitle` (“Happy Birthday, {name}!”) dengan glow.
- Kembang api canvas dari bawah ke atas:
  - roket meluncur dari bawah dengan trail
  - meledak menjadi partikel warna tema
  - beberapa roket awal diluncurkan sekaligus agar layar langsung ramai
  - canvas memakai `data-fireworks`
- Reduced motion: komponen `Fireworks` mengembalikan `null`; teks tetap tampil.
- Track kedua tetap aktif sampai Finale.
- Tombol **Ulangi dari awal** mengembalikan ke Splash dan memutar track awal dari awal.

### Section yang Dihapus

- Bonus (mini game lama, galeri, easter egg)
- Ending lama
- Kue dan tiup lilin (`Cake`, `useBlowDetection`)
- Util confetti `fireworks` lama

Jangan menambahkan kembali section/fitur tersebut kecuali diminta.

## 6. Panduan Animasi & Nuansa

- Nuansa: magical → ceria. Gelap dan dreamy di awal, hangat di Wish/Message, lalu perayaan di Finale.
- Easing: `power3.out`, `back.out(1.7)`, `elastic.out` untuk gerakan bouncy.
- Durasi transisi section: 0.7–1.0 detik.
- Hindari terlalu banyak efek bersamaan sampai teks susah dibaca.
- Teks utama harus tetap jelas di atas animasi latar.
- Selalu sediakan fallback reduced motion.
- Performa: jaga 60 FPS sampai viewport 4K. Canvas full-screen dibatasi ukuran pikselnya, background dirender maksimal 30 FPS, partikel dikurangi, dan `mix-blend-mode`/backdrop blur besar tidak dipakai untuk elemen yang bergerak terus.
- Jangan menambahkan kembali blur/filter pada wrapper stage, `backdrop-blur-md` full-screen, atau trail canvas yang berjalan saat idle.

## 7. Struktur Folder

```
birthday-site/
├── index.html
├── vite.config.js
├── package.json
├── public/
│   ├── music.mp3
│   ├── timeline-music.wav
│   └── img/
│       └── person1.jpeg ... person8.jpeg
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── config.js
    ├── components/
    │   ├── CustomCursor.jsx
    │   ├── CursorTrail.jsx
    │   ├── ParticlesBackground.jsx
    │   ├── MusicToggle.jsx
    │   ├── sections/
    │   │   ├── Splash.jsx
    │   │   ├── Interlude.jsx
    │   │   ├── Game.jsx
    │   │   ├── Timeline.jsx
    │   │   ├── Hero.jsx
    │   │   ├── Wish.jsx
    │   │   ├── Message.jsx
    │   │   └── Finale.jsx
    │   └── ui/
    │       ├── WishBalloon.jsx
    │       ├── Fireworks.jsx
    │       └── TypewriterText.jsx
    ├── hooks/
    │   ├── useAudioState.js
    │   ├── useGyroscope.js
    │   ├── useMousePosition.js
    │   ├── useParallax.js
    │   ├── useReducedMotion.js
    │   └── useTypewriter.js
    └── utils/
        ├── audio.js
        ├── canvas.js
        ├── confetti.js
        ├── math.js
        ├── pointer.js
        └── tilt.js
```

## 8. Kriteria Selesai

- [ ] Alur berjalan: Splash → Interlude → Mini Game → Timeline → Hero → Wish → Message → Finale.
- [ ] `npm install`, `npm run dev`, dan `npm run build` berhasil.
- [ ] Semua teks bisa diganti lewat `src/config.js`.
- [ ] Mini game 10 nyawa; hanya bisa lanjut setelah semua 8 pasangan ketemu.
- [ ] Hero menjalankan urutan `anyway` → hapus → `Happy Birthday For U` → `yang ke-` → gacha angka → `31` ditahan 3 detik → `21` → ucapan → tombol.
- [ ] Angka `31` lebih besar dari baris lain dan berubah ke `21` lewat slide ke bawah.
- [ ] Animasi tetap halus di viewport 4K; tidak ada lag saat mouse bergerak di Game, Wish, atau Finale.
- [ ] Tombol Lanjut baru muncul setelah typewriter ucapan selesai.
- [ ] Wish bisa dibuka, dikirim dengan Enter, tahan Shift+Enter, dan auto-next setelah kertas terbang + 3 detik.
- [ ] Wish tidak mengirim/menyimpan data ke server.
- [ ] Finale menampilkan kembang api bottom-to-top dan tombol restart.
- [ ] Reduced motion menonaktifkan kembang api, terbangnya kertas, dan animasi berat lain.
- [ ] Tidak ada overflow horizontal di 360px ke atas.
- [ ] Track awal mencoba autoplay saat halaman dibuka; jika browser memblokir, mulai pada interaksi pertama; tombol on/off berfungsi.
- [ ] Track kedua menggantikan track awal saat Timeline dibuka, tetap aktif sampai Finale, dan restart kembali ke track awal.
- [ ] Tidak ada error di console.
- [ ] Bonus, Ending, kue, dan tiup lilin tidak muncul kembali.

## 9. Catatan untuk Agent

- Mulai dari `src/App.jsx` dan `src/config.js` untuk memahami alur serta teks.
- Jangan hardcode teks atau data personal di komponen.
- Cleanup semua timer, tween, dan listener saat section unmount.
- Jangan menambah dependency baru tanpa kebutuhan jelas.
- Jangan menambah fitur di luar dokumen ini kecuali diminta.
- Tanyakan ke pemilik proyek untuk nama, warna, isi pesan, foto, atau lagu yang belum jelas; jangan mengarang data pribadi.
- Setelah perubahan, jalankan `npm run build` dan cek alur utama di browser.
