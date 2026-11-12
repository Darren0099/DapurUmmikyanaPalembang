/**
 * Historical offer references from index.php and DapurUmmikyanaPalembang.php.
 * Nothing here represents an active offer or a promise of availability.
 * Merchant approval is required before publishing live prices or conditions.
 */
export type Service = {
  slug: 'daily-catering'|'snack-box'|'tumpeng-mini'|'prasmanan-gubukan';
  name: string;
  kicker: string;
  description: string;
  overview: string;
  archivePrice: string;
  archiveSource: string;
  archiveNotes: string[];
  inquiryTips: string[];
  index: string;
  photo?: string;
  packages?: Array<{name:string;price:string;items:string[]}>;
};
export const services: Service[] = [
  {
    slug:'daily-catering',name:'Daily Catering',kicker:'Untuk rutinitas',
    description:'Pilihan katering harian yang dahulu ditawarkan untuk kebutuhan makan rutin.',
    overview:'Di website pertama, Daily Catering ditampilkan sebagai paket berlangganan enam hari. Detail hidangan, lokasi pengiriman, harga dan jadwal terkini perlu dikonfirmasi kepada pengelola.',
    archivePrice:'Rp150.000 / paket 6 hari', archiveSource:'Kartu Daily Catering pada index.php dan DapurUmmikyanaPalembang.php',
    archiveNotes:['Untuk 6 hari','Tercantum tanpa minimum order','Tercantum gratis alat makan dan gratis ongkir Palembang'],
    inquiryTips:['Jumlah porsi per hari','Tanggal mulai dan durasi','Alamat pengiriman serta jadwal penerimaan'],
    photo:'/archive/feature/hero-bp00.jpg',
    packages:[{name:'Paket Daily Catering',price:'Rp150.000 / 6 hari',items:['Berlangganan 6 hari','Ketentuan pengiriman dan kelengkapan adalah arsip']}],
    index:'01',
  },
  {
    slug:'snack-box',name:'Snack Box',kicker:'Untuk pertemuan',
    description:'Pilihan paket snack yang sebelumnya ditawarkan untuk pertemuan atau kegiatan.',
    overview:'Halaman Snack Box lengkap ditemukan kembali pada repo arsip errorrrr. Terdapat empat variasi paket dan pilihan jenis snack; seluruh informasi harga berikut merupakan arsip.',
    archivePrice:'Mulai Rp16.000 / snack',archiveSource:'Kartu 3D Snack Box pada index.php, tautan Snackbox/Snackbox.html',
    archiveNotes:['Harga paket 2025: isi 3 Rp16.000, isi 4 Rp21.000, isi 5 Rp25.000, isi 7 Rp30.000','Pilihan makanan dari arsip mencakup risol, martabak, pastel, kroket, roti isi, dan jajanan tradisional'],
    inquiryTips:['Jumlah box yang diperlukan','Tanggal dan lokasi acara','Preferensi isi snack dan kemasan'],
    packages:[
      {name:'Snack Box isi 3',price:'Rp16.000',items:['3 jenis makanan','Air mineral','Kotak kemasan']},
      {name:'Snack Box isi 4',price:'Rp21.000',items:['4 jenis makanan','Air mineral','Kotak kemasan']},
      {name:'Snack Box isi 5',price:'Rp25.000',items:['3 jenis makanan','Air mineral dan susu','Kotak kemasan']},
      {name:'Snack Box isi 7',price:'Rp30.000',items:['5 jenis makanan','Air mineral dan susu','Kotak kemasan']},
    ],
    index:'02',
  },
  {
    slug:'tumpeng-mini',name:'Tumpeng Mini',kicker:'Untuk perayaan',
    description:'Sajian tumpeng mini yang pernah ditawarkan untuk kebutuhan acara.',
    overview:'Website lama menampilkan Tumpeng Mini melalui kartu layanan dan kartu penawaran terpisah. Informasi harga arsipnya konsisten, namun jumlah minimum dan fasilitas pengiriman belum bisa dipastikan berlaku sekarang.',
    archivePrice:'Rp35.000 / pax (arsip)',archiveSource:'Kartu Tumpeng Mini pada index.php dan tautan NasiTumpeng/NasiTumpengMini.html',
    archiveNotes:['Tercantum minimum pesanan 30 pcs','Tercantum gratis alat makan dan gratis ongkir Palembang','Halaman rincian asli tersedia pada repo errorrrr'],
    inquiryTips:['Jumlah pax','Tanggal dan lokasi acara','Pilihan lauk serta kebutuhan kemasan'],
    photo:'/archive/services/tumpeng-mini.png',
    packages:[
      {name:'Tumpeng Mini A',price:'Rp35.000',items:['Nasi kuning','Ayam krispy dan perkedel kentang','Abon sapi, serundeng, kering tempe, telur rawis']},
      {name:'Tumpeng Mini B',price:'Rp36.000',items:['Nasi kuning','Ayam suwir pedas, serundeng, kering kentang pedas','Oseng kacang panjang teri, telur pindang, sambal']},
      {name:'Tumpeng Mini C',price:'Rp38.000',items:['Nasi putih dan empal suwir','Tahu bacem, ikan asin balado, mie goreng','Kering tempe dan sambal']},
    ],
    index:'03',
  },
  {
    slug:'prasmanan-gubukan',name:'Prasmanan & Gubukan',kicker:'Untuk acara besar',
    description:'Pilihan sajian prasmanan atau gubukan untuk acara dan rombongan.',
    overview:'Kode lama menampilkan dua jenis penawaran: kartu Prasmanan berharga per pax dan kartu Gubukan Prasmanan berharga per box. Keduanya dipertahankan sebagai referensi berbeda, bukan disamakan menjadi satu tarif.',
    archivePrice:'Rp32.000 / pax (Prasmanan) dan mulai Rp25.000 / box (Gubukan)',
    archiveSource:'Kartu Prasmanan + Gubukan Prasmanan pada index.php; tautan Pondokan/Ponfokan.html',
    archiveNotes:['Kartu Prasmanan mencantumkan minimum 300 pcs','Penawaran Gubukan menggunakan satuan per box','Tercantum gratis alat makan dan gratis ongkir Palembang','File Pondokan/Ponfokan.html ditemukan pada repo errorrrr'],
    inquiryTips:['Jenis acara dan jumlah tamu','Lokasi, tanggal, serta durasi penyajian','Pilihan prasmanan atau gubukan dan kebutuhan perlengkapan'],
    photo:'/archive/services/prasmanan.png',
    packages:[
      {name:'Menu Nusantara A',price:'Rp25.000/pax',items:['Contoh arsip: pempek, tekwan, model, martabak telur','Pilihan lain: bakso, batagor, siomay, mie Jawa, tengkleng']},
      {name:'Menu Nusantara B',price:'Rp25.000/pax',items:['Contoh arsip: soto ayam, bakso, soto mie','Pilihan lain: sate ayam, gado-gado, lontong sayur, rujak buah']},
      {name:'Menu Nusantara C',price:'Rp20.000/pax',items:['Contoh arsip: nasi uduk, sop buntut, gudeg','Pilihan lain: sate Padang, tongseng, mie ayam, sate lilit Bali']},
    ],
    index:'04',
  },
];
export function serviceBySlug(slug:string):Service|undefined { return services.find(service=>service.slug===slug); }
export function serviceInquiryUrl(service:Service):string {
  const message = `Halo Dapur Ummi Kyana, saya ingin menanyakan paket ${service.name}. Apakah layanan ini masih tersedia? Mohon informasi harga dan pilihan terbaru untuk jumlah pesanan, tanggal, serta lokasi acara. Terima kasih.`;
  return `https://wa.me/6281268552388?text=${encodeURIComponent(message)}`;
}
