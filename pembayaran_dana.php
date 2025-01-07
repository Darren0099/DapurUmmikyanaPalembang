<?php
// Periksa apakah ada ID pemesanan yang diteruskan
if (!isset($_GET['id_pemesanan'])) {
    echo "<script>alert('ID Pemesanan tidak ditemukan!'); window.location='status.php';</script>";
    exit;
}

$id_pemesanan = $_GET['id_pemesanan'];

// Simulasi URL untuk barcode QR Dana
$qr_code_url = "https://www.qr-code-generator.com/wp-content/themes/qr/new_structure/create-qr-code.php?d=https://dana.id/pay/$id_pemesanan";  // Ganti dengan URL yang sesuai

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Barcode Pembayaran</title>
    <style>
        body {
            text-align: center;
            margin-top: 50px;
        }
        img {
            width: 200px;
            height: 200px;
        }
    </style>
</head>
<body>
    <h2>Scan Barcode untuk Pembayaran Dana</h2>
    <img src="<?= $qr_code_url ?>" alt="QR Code Pembayaran Dana">
    <p>Gunakan aplikasi Dana untuk memindai kode ini.</p>
</body>
</html>
