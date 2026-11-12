# Audit menyeluruh: Dapur Ummi Kyana PHP asli vs versi modern

Tanggal audit: 12 November 2026. Sumber: repository `Darren0099/DapurUmmikyanaPalembang` (`main`) dan arsip commit GitHub; tinjauan statis, **bukan** penetration test ataupun uji transaksi nyata.

## 1. Struktur utama dan konten penjualan
| File atau modul | Fungsi yang terlihat | Temuan |
|---|---|---|
| `index.php` | Beranda statis, banner, keunggulan, promo ongkir, 5 bestseller, 20 kartu menu, galeri, penawaran 3D, 3 paket harga, testimoni, footer | Menautkan banyak gambar `assets/images/*` yang tidak di-commit. |
| `DapurUmmikyanaPalembang.php` | Variasi landing page 1.819 baris | Berisi formulir POST keranjang per menu, lalu mengarah ke `keranjang.php`. |
| `Order.php` | Dashboard bertema Boxicons | Berisi pesanan/pelanggan contoh (seperti Nancy/Florida); bukan sumber data order faktual. |
| `keranjang.php` | Keranjang berbasis session dan ubah kuantitas | Perlu validasi harga langsung dari DB pada backend baru. |
| `pembayaran.php`, `12.php`, `view_message.php` | Beberapa versi form pembayaran dan insert order | Duplikasi bisnis; tidak dijadikan implementasi pembayaran merchant siap pakai. |
| `pembayaran_dana.php` | QR Dana simulasi | Menghasilkan URL dengan generator QR pihak ketiga; tidak membuat transaksi DANA resmi. |
| `status.php`, `struk.php` | Status pemesanan dan struk | Sumber status berasal dari tabel MySQL lama. |

### 20 kartu menu lama, 18 nama unik
Ayam Saos Padang; Nasi Ayam Balado; Nasi Ayam Bakar (2 kartu); Nasi Ayam Bawang; Nasi Ayam Goreng Lengkuas; Nasi Ayam Cabe Hijau; Nasi Kerang Rica (2 kartu, dengan harga arsip berbeda); Nasi Ayam Madu; Nasi Bakar; Nasi Gulai Cumi; Nasi Ayam Lengkuas; Nasi Cumi Asin; Nasi Peda Cabe Ijo; Nasi Ayam Geprek; Nasi Ayam Suwir; Nasi Lele Goreng; Nasi Lele Krispi; Nasi Gulai Cumi Isi Tahu.

Bestseller banner menyebut Nasi Ayam Bakar, Nasi Britani, Rice Bowl Ayam Madu, Nasi Gulai Cumi isi Tahu, dan Nasi Bakar. Nasi Britani/Rice Bowl Ayam Madu tidak boleh otomatis diberi harga karena tidak muncul dengan harga di 20 kartu menu utama.

### Paket khusus dan referensi URL lama
- `Daily Catering`: kartu paket mencantumkan Rp150.000/6 hari; tanpa minimum order, free ongkir Palembang, gratis alat makan (semua **arsip**, bukan promosi aktif).
- `Snack Box`: kartu 3D menampilkan harga mulai Rp16.000/snack, dan `href="Snackbox/Snackbox.html"`. File/folder tujuan tersebut **tidak ada** di repository.
- `Tumpeng Mini`: kartu paket Rp35.000/pax, minimum 30 pcs; kartu 3D `href="NasiTumpeng/NasiTumpengMini.html"`. File tujuan **tidak ada**.
- `Prasmanan`: paket Rp32.000/pax, minimum 300 pcs, dan gratis alat makan/ongkir Palembang adalah **arsip**.
- `Gubukan Prasmanan`: kartu 3D dari Rp25.000/box, `href="Pondokan/Ponfokan.html"`. File tujuan **tidak ada**.
- Bagian belakang kartu 3D lama masih berisi teks/template `Camping`, tarif dolar, dan gambar dari Codepen; jangan dianggap layanan UMKM.
- Tidak ada file khusus produk roti/bakery di pohon repository yang ditinjau.

## 2. Modul admin
| File | Fungsi |
|---|---|
| `hal_admin.php` | KPI orders/users/income, filter bulan, daftar pesanan, update status pesanan & pembayaran, notifikasi pembayaran. |
| `haladmin/hal_user.php` | Tabel pelanggan, pencarian, top user berdasarkan order, hapus pengguna. |
| `haladmin/hal_pembayaran.php` | KPI pending/completed/failed, daftar pembayaran, ubah status manual. |
| `haladmin/hal_shipment.php` | Monitor status pengiriman, status pesanan, hapus pesanan. |
| `haladmin/hal_stats.php` | Statistik pesanan dan pemasukan, Chart.js. |
| `haladmin/tes.php`, `1.php` | Percobaan layar administrasi/notifikasi, termasuk pembaruan status pembayaran. |

Panel admin modern `web/app/admin/page.tsx` sudah memiliki menu dashboard/pesanan/menu/pembayaran/analitik/pengaturan dan icon Lucide; login membutuhkan Supabase proyek toko. Belum seluruh fitur admin lama (filter periode, pengguna, pengiriman terpisah, balasan pesan, unggah gambar produk) dimigrasikan. Jangan mengklaim modul-modul ini telah siap tanpa database.

## 3. Akun, komunikasi, dan keamanan lama
- `login.php`, `proses_login.php`, `register.php` memakai session PHP, login/registrasi mengandung query SQL dengan input yang digabung langsung dan password SHA-1.
- `login2.php` mempunyai contoh kredensial statis langsung di source. Sangat tidak layak untuk produksi.
- `send.php`, `send_message.php`, `senadm.php`, `view_message.php`, `mark_as_read.php`, `delete_order.php` berisi fitur pesan, balasan, bukti file, notifikasi, dan operasi perubahan data dengan pemeriksaan akses yang tidak konsisten.
- Beberapa tautan dan file tujuan tidak tersedia: `Pondokan/Ponfokan.html`, `Snackbox/Snackbox.html`, `NasiTumpeng/NasiTumpengMini.html`, `checkout.php`, dan berbagai direktori aset.
- `koneksi.php`, `db.php`, `haladmin/koneksi.php` menggunakan MySQL lokal. File export schema/data MySQL tidak disertakan.

## 4. Pembayaran
- `composer.json` mencantumkan `dana-id/php_client`; itu bukan bukti integrasi aktif.
- `pembayaran_dana.php` memakai QR URL *simulasi*. Tidak boleh dipakai untuk menerima pembayaran.
- **Bukti di luar repository** (email Midtrans bertanggal Januari 2025) menunjukkan merchant Dapur Ummi Kyana pernah mempunyai transaksi QRIS berstatus berhasil. Ini tidak membuktikan server key saat ini tersedia/merchant masih aktif atau API telah terintegrasi ke repo.
- Target aman: Midtrans server-side Snap/QRIS, verifikasi notifikasi melalui signature dan pencocokan total, idempotensi, status order ditulis dari server, bukan browser. Tetap dalam mode pratinjau hingga database toko dan kredensial terpasang dan sandbox lulus.

## 5. Gambar, visual, dan performa
- `index.php` menggunakan banyak nama file di `assets/images/*` (foto makanan, ornamen, logo, galeri), **folder tersebut tidak berada di git history yang dapat dibaca**.
- Hanya aset lain dalam `asset/*` yang ada di Git; banyak berupa GIF animasi demo umum berukuran 1–3 MB, bukan foto makanan original yang dapat diverifikasi.
- Animasi baru sebaiknya memakai CSS `transform`/`opacity`, tidak memakai GIF 2MB atau motion berat, dan menghormati `prefers-reduced-motion`.
- Layanan pada v2 memiliki halaman detail masing-masing di `/layanan/[slug]`; info dan syarat lama ditandai jelas sebagai arsip, CTA menuju konfirmasi WhatsApp.

## 6. Arsitektur dan prioritas berikutnya
- Beranda modern Vercel + Next.js (jalan dalam mode pratinjau) dipertahankan.
- Proyek Supabase PostgreSQL **khusus toko** belum dibuat; jangan menumpangkan pada database HR.
- Jika memilih Laravel di Railway sebagai REST API terpisah, gunakan Docker dan PostgreSQL Supabase; buat migrasi, otorisasi yang konsisten, transaksi atomik, dan service Midtrans yang memverifikasi webhook.
- Untuk tahap berikutnya: aset/foto asli dan harga aktif dari merchant, database toko, pengelolaan foto lewat storage, rekanan Midtrans beserta sandbox, tes akhir transaksi, serta admin modules users/pengiriman/galeri.

**Status verifikasi:** audit statis kode repo, bukan hasil uji merchant live.
