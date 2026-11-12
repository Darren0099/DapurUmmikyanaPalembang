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
};
export const services: Service[] = [
  {
    slug:'daily-catering',name:'Daily Catering',kicker:'Untuk rutinitas',
    description:'Pilihan katering harian yang dahulu ditawarkan untuk kebutuhan makan rutin.',
    overview:'Di website pertama, Daily Catering ditampilkan sebagai paket berlangganan enam hari. Detail hidangan, lokasi pengiriman, harga dan jadwal terkini perlu dikonfirmasi kepada pengelola.',
    archivePrice:'Rp150.000 / paket 6 hari', archiveSource:'Kartu Daily Catering pada index.php dan DapurUmmikyanaPalembang.php',
    archiveNotes:['Untuk 6 hari','Tercantum tanpa minimum order','Tercantum gratis alat makan dan gratis ongkir Palembang'],
    inquiryTips:['Jumlah porsi per hari','Tanggal mulai dan durasi','Alamat pengiriman serta jadwal penerimaan'],
    index:'01',
  },
  {
    slug:'snack-box',name:'Snack Box',kicker:'Untuk pertemuan',
    description:'Pilihan paket snack yang sebelumnya ditawarkan untuk pertemuan atau kegiatan.',
    overview:'Halaman penawaran lama menyebut Snack Box dengan harga awal per snack, serta tautan ke halaman khusus. File halaman tersebut tidak ikut tersimpan dalam repo, sehingga komposisi paket belum bisa dipastikan.',
    archivePrice:'Mulai Rp16.000 / snack',archiveSource:'Kartu 3D Snack Box pada index.php, tautan Snackbox/Snackbox.html',
    archiveNotes:['Harga arsip merupakan titik awal, bukan harga final','Halaman rincian paket lama tidak ditemukan pada repository'],
    inquiryTips:['Jumlah box yang diperlukan','Tanggal dan lokasi acara','Preferensi isi snack dan kemasan'],
    index:'02',
  },
  {
    slug:'tumpeng-mini',name:'Tumpeng Mini',kicker:'Untuk perayaan',
    description:'Sajian tumpeng mini yang pernah ditawarkan untuk kebutuhan acara.',
    overview:'Website lama menampilkan Tumpeng Mini melalui kartu layanan dan kartu penawaran terpisah. Informasi harga arsipnya konsisten, namun jumlah minimum dan fasilitas pengiriman belum bisa dipastikan berlaku sekarang.',
    archivePrice:'Rp35.000 / pax (arsip)',archiveSource:'Kartu Tumpeng Mini pada index.php dan tautan NasiTumpeng/NasiTumpengMini.html',
    archiveNotes:['Tercantum minimum pesanan 30 pcs','Tercantum gratis alat makan dan gratis ongkir Palembang','File halaman rincian lama tidak tersedia di repo'],
    inquiryTips:['Jumlah pax','Tanggal dan lokasi acara','Pilihan lauk serta kebutuhan kemasan'],
    index:'03',
  },
  {
    slug:'prasmanan-gubukan',name:'Prasmanan & Gubukan',kicker:'Untuk acara besar',
    description:'Pilihan sajian prasmanan atau gubukan untuk acara dan rombongan.',
    overview:'Kode lama menampilkan dua jenis penawaran: kartu Prasmanan berharga per pax dan kartu Gubukan Prasmanan berharga per box. Keduanya dipertahankan sebagai referensi berbeda, bukan disamakan menjadi satu tarif.',
    archivePrice:'Rp32.000 / pax (Prasmanan) dan mulai Rp25.000 / box (Gubukan)',
    archiveSource:'Kartu Prasmanan + Gubukan Prasmanan pada index.php; tautan Pondokan/Ponfokan.html',
    archiveNotes:['Kartu Prasmanan mencantumkan minimum 300 pcs','Penawaran Gubukan menggunakan satuan per box','Tercantum gratis alat makan dan gratis ongkir Palembang','File halaman Pondokan/Ponfokan.html tidak ada di repo'],
    inquiryTips:['Jenis acara dan jumlah tamu','Lokasi, tanggal, serta durasi penyajian','Pilihan prasmanan atau gubukan dan kebutuhan perlengkapan'],
    index:'04',
  },
];
export function serviceBySlug(slug:string):Service|undefined { return services.find(service=>service.slug===slug); }
export function serviceInquiryUrl(service:Service):string {
  const message = `Halo Dapur Ummi Kyana, saya ingin menanyakan paket ${service.name}. Apakah layanan ini masih tersedia? Mohon informasi harga dan pilihan terbaru untuk jumlah pesanan, tanggal, serta lokasi acara. Terima kasih.`;
  return `https://wa.me/6281268552388?text=${encodeURIComponent(message)}`;
}
