# Audit UI/UX Sebelum Redesign (Final Update)

Laporan ini mengidentifikasi kelemahan antarmuka awal (sebelum total perombakan streaming) yang membuat aplikasi terkesan seperti template dashboard AI generik.

## Temuan Utama & Analisis Kelemahan

### 1. Ketiadaan Dukungan Multi-Tema (Light/Dark Mode)
- **Masalah**: Aplikasi terkunci dalam mode gelap statis. Tidak ada opsi pergantian tema untuk kenyamanan mata pengguna di kondisi pencahayaan berbeda.

### 2. Penggunaan Emoji Bendera yang Tidak Konsisten (OS Dependent)
- **Masalah**: Emoji bendera (seperti 🇲🇽 atau 🇺🇸) dirender secara berbeda di setiap sistem operasi. Hal ini merusak tampilan antarmuka visual secara drastis pada sistem operasi Windows (yang hanya merender singkatan teks seperti MX/US) dan terkesan murahan.

### 3. Layout Dashboard yang Generik ("AI Dashboard Look")
- **Masalah**: Penggunaan layout grid vertikal/kolom tradisional dengan kartu-kartu kecil dan banyak ikon/statistik bertumpuk. Layout ini sangat menjauh dari tampilan asli platform streaming komersial (Netflix, ESPN+, DAZN) yang berfokus pada konten video visual.

### 4. Kurangnya Fitur Video Player Custom
- **Masalah**: Pemutar video HLS hanya memiliki tombol Play/Pause/Mute dasar. Tidak ada volume slider, toggle Picture-in-Picture, latency control, maupun hotkeys keyboard yang merupakan standar wajib aplikasi video streaming premium modern.

### 5. Spacing dan Tipografi Datar
- **Masalah**: Spacing kaku dan tipografi tanpa negative tracking (penyebab utama visual terkesan tidak digarap matang).

### 6. Desain Footer yang Amatir
- **Masalah**: Bagian footer sebelumnya hanya berupa baris tipis yang memuat teks hak cipta, sangat mirip dengan susunan navbar sederhana. Ini membuat aplikasi terasa tidak lengkap dan tidak seperti aplikasi komersial nyata.

### 7. Scrolling List yang Terlalu Panjang
- **Masalah**: Jadwal penuh dan leaderboard top scorers memuat puluhan item sekaligus, memaksa pengguna melakukan scroll yang sangat panjang (infinite scrolling) untuk sekadar membaca informasi terbawah.
