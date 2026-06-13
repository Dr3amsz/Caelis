# Proyek Akhir Pemrograman Berbasis Web - Caelis

Sistem Jaringan Sosial Berbasis Web yang menghubungkan pengguna melalui interaksi berbagi konten teks, gambar, dan komunikasi interaktif.

## Daftar Anggota Kelompok
* Immanuel Simon Petrus Siboro (24106311076) - Front End
* Ori Suhana (2410631170162) - Bagian Dokumentasi dan menyusun laporan
* Reysa Dwi Putra (2410631170046) - Back End

## Deskripsi dan Tujuan Website
Caelis adalah sebuah platform media sosial berbasis web yang dirancang untuk memberikan wadah interaksi digital yang dinamis, bersih, dan estetik bagi para pengguna. Mengusung konsep antarmuka modern yang terinspired dari nuansa elemen langit, Caelis bertujuan untuk memfasilitasi pengguna dalam mengekspresikan pemikiran, membagikan momen melalui visual, serta membangun jejaring pertemanan secara seketika. Proyek ini dibangun sebagai implementasi nyata dari integrasi teknologi pengembangan web sisi depan (Frontend) yang responsif serta pengelolaan logika sisi belakang (Backend) yang aman dan terstruktur.

## Fitur-Fitur Utama Website
* Sistem Autentikasi Pengguna: Fasilitas registrasi akun baru serta enkripsi keamanan kata sandi pada halaman masuk akun.
* Aliran Konten Dinamis (Feed): Halaman utama yang menampilkan susunan kiriman status teks dan unggahan gambar dari seluruh pengguna berdasarkan waktu terbaru.
* Berbagi Media Komprehensif: Kemampuan mengunggah gambar pendukung postingan dengan sistem pembatasan ukuran berkas otomatis maksimal dua megabita demi efisiensi penyimpanan.
* Interaksi Seketika (Suka & Komentar): Fitur memberikan tanda suka melalui ikon hati dan kolom tanggapan komentar di bawah kiriman yang diperbarui secara langsung tanpa memuat ulang halaman.
* Manajemen Profil Mandiri: Halaman khusus untuk memperbarui foto profil, mengubah biografi diri, serta memantau statistik total pengikut dan daftar kiriman pribadi.
* Manajemen Konten Pengguna: Hak penuh bagi pemilik kiriman untuk menghapus status atau gambar mereka sendiri dari sistem kapan saja.
* Pencarian dan Jejaring Sosial: Bilah pencarian akun pengguna lain secara spesifik dilengkapi dengan tombol ikuti untuk menambahkan ke daftar pertemanan serta panel rekomendasi akun baru.

## Struktur Project dan Penjelasan
Berikut adalah susunan struktur direktori proyek Caelis beserta penjelasan fungsi komponen penting di dalamnya:
```
Caelis-main/
├── assets/                  # Menyimpan aset pustaka eksternal untuk mendukung antarmuka
│   ├── css/                 # Berkas penataan dari Bootstrap untuk komponen tata letak responsif
│   └── js/                  # Berkas logika komponen Bootstrap untuk interaksi elemen visual
├── backend/                 # Ruang kerja Backend PHP yang mengolah logika dan pangkalan data
│   ├── uploads/             # Loker penyimpanan berkas gambar foto profil milik pengguna
│   ├── config.php           # Berkas koneksi dan kredensial utama menuju pangkalan data MySQL
│   ├── login.php            # Memproses validasi kredensial pengguna saat masuk akun
│   ├── register.php         # Mengolah pendaftaran akun baru ke dalam pangkalan data
│   ├── create_post.php      # Menangani proses pembuatan postingan status baru beserta unggahan media
│   ├── get_feed.php         # Mengambil dan menyusun data aliran kiriman untuk ditampilkan ke layar
│   └── toggle_like.php      # Memproses penambahan atau pengurangan tanda suka pada kiriman
├── uploads/                 # Folder fisik utama untuk menyimpan seluruh gambar dari postingan pengguna
├── index.html               # Halaman pembuka atau gerbang utama web Caelis
├── login.html               # Formulir antarmuka bagi pengguna untuk masuk ke dalam sistem
├── register.html            # Formulir antarmuka untuk pembuatan akun baru pengguna
├── feed.html                # Halaman utama media sosial tempat menampilkan seluruh aliran konten
├── profile.html             # Halaman data diri pengguna yang memuat detail kiriman pribadi
├── style.css                # Berkas desainer interior utama yang mengatur pewarnaan, tipografi, dan estetika web
└── script.js                # Pelayan utama berbasis JavaScript untuk menangani interaksi dinamis dan komunikasi data
```
## Cara Menjalankan Aplikasi
1. Pengguna dapat langsung mengakses web Caelis secara daring tanpa perlu memasang server lokal.
2. Silakan pindai (scan) kode QR yang tersedia pada PowerPoint presentasi proyek kami.
3. Sebagai alternatif, pengguna juga dapat langsung mengeklik atau mengetikkan tautan berikut pada peramban web: [https://caelis.free.nf/](https://caelis.free.nf/)

## Link Video Presentasi Project
[https://drive.google.com/drive/folders/1DNJYXmCrEm1LTE7CKEulcvgxRBzazd1M?usp=sharing](https://drive.google.com/drive/folders/1DNJYXmCrEm1LTE7CKEulcvgxRBzazd1M?usp=sharing)
