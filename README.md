# Dapur Ummi Kyana — Website Pemesanan & Admin UMKM Kuliner

Pengembangan sistem web untuk usaha kuliner **Dapur Ummi Kyana Palembang**. Berbeda dengan landing page promosi, repository ini memuat alur pengguna dan modul administrasi untuk pengelolaan pemesanan.

## Kebutuhan yang ditangani

Usaha kuliner memerlukan cara menyajikan menu, menerima pesanan, memantau pembayaran, dan melihat ringkasan operasional dalam satu aplikasi.

## Modul pada repository

- **Halaman katalog kuliner** dengan daftar menu, produk unggulan, dan penawaran.
- **Akun pengguna**: halaman register, login, serta pengelolaan sesi.
- **Keranjang dan pemesanan**: pengumpulan menu dan proses pesanan.
- **Pembayaran serta struk**: halaman pembayaran, opsi DANA di kode, dan tampilan bukti transaksi.
- **Admin dashboard**: ringkasan pesanan, jumlah pengguna, total pemasukan, transaksi terbaru, serta navigasi pembayaran/pengiriman.
- **Informasi pesanan**: status pembayaran dan pengiriman untuk pemantauan operasional.

## Teknologi

**PHP**, **MySQL**, **HTML**, **CSS**, **JavaScript**, serta aset **Bootstrap** dan plugin UI untuk tampilan katalog. `composer.json` juga mencatat dependensi klien PHP DANA.

## Hasil & catatan

Repository ini menunjukkan implementasi **website e-commerce UMKM berbasis PHP** dengan pemisahan modul pengguna dan admin. Alur integrasi pembayaran tidak diklaim tersertifikasi atau siap transaksi nyata tanpa audit dan pengujian lebih lanjut.

**Berkas penting:** `index.php`, `keranjang.php`, `Order.php`, `pembayaran.php`, `struk.php`, `hal_admin.php` dan `haladmin/`.

> Beberapa berkas merupakan iterasi lama dan perlu evaluasi keamanan sebelum aplikasi digunakan di lingkungan produksi.
