<?php
session_start();
include 'koneksi.php';

// Periksa apakah user telah login
if (!isset($_SESSION['id_user'])) {
    echo "<script>alert('Anda harus login terlebih dahulu!'); window.location='login.php';</script>";
    exit;
}

// Periksa apakah keranjang tidak kosong
if (empty($_SESSION['cart'])) {
    echo "<script>alert('Keranjang belanja kosong!'); window.location='keranjang.php';</script>";
    exit;
}

$id_user = $_SESSION['id_user']; // Ambil ID user yang login

// Validasi produk di keranjang dan ambil menu_id
$produk_id = [];
$produk_qty = [];
foreach ($_SESSION['cart'] as $item) {
    $produk_name = $item['name'];
    $query_check = $conn->prepare("SELECT menu_id FROM tblmenu WHERE menu_name = ?");
    $query_check->bind_param("s", $produk_name);
    $query_check->execute();
    $query_check->bind_result($menu_id);
    $query_check->fetch();
    $query_check->close();

    if ($menu_id) {
        $produk_id[] = $menu_id;
        $produk_qty[] = $item['quantity']; // Menyimpan jumlah produk untuk setiap menu
    } else {
        echo "<script>alert('Produk tidak valid: $produk_name'); window.location='keranjang.php';</script>";
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nama_pemesan = mysqli_real_escape_string($conn, $_POST['nama_pemesan']);
    $alamat_pemesan = mysqli_real_escape_string($conn, $_POST['alamat_pemesan']);
    $telepon_pemesan = mysqli_real_escape_string($conn, $_POST['telepon_pemesan']);
    $metode_pembayaran = mysqli_real_escape_string($conn, $_POST['metode_pembayaran']);

    // Hitung total pembayaran
    $total_pembayaran = 0;
    foreach ($_SESSION['cart'] as $item) {
        $total_pembayaran += $item['price'] * $item['quantity'];
    }

    // Insert data ke tblpemesanan
    $query_pemesanan = $conn->prepare("INSERT INTO tblpemesanan (nama_pemesan, alamat_pemesan, telepon_pemesan, jumlah_pemesanan, id_user) 
    VALUES (?, ?, ?, ?, ?)");
    $query_pemesanan->bind_param("sssii", $nama_pemesan, $alamat_pemesan, $telepon_pemesan, $total_pembayaran, $id_user);

    if ($query_pemesanan->execute()) {
        $id_pemesanan = $conn->insert_id; // Dapatkan ID pemesanan terakhir

        // Insert data ke tblpemesanan_detail untuk setiap produk yang dipesan
        foreach ($produk_id as $index => $id_menu) {
            $jumlah = $produk_qty[$index];
            $query_detail = $conn->prepare("INSERT INTO tblpemesanan_detail (id_pemesanan, produk_id, jumlah_produk) 
            VALUES (?, ?, ?)");
            $query_detail->bind_param("iii", $id_pemesanan, $id_menu, $jumlah);
            $query_detail->execute();
        }

        // Insert data ke tblpembayaran
        $query_pembayaran = $conn->prepare("INSERT INTO tblpembayaran (id_user, total_pembayaran, metode_pembayaran, id_pemesanan, is_notified, deskripsi_notifikasi) 
                                            VALUES (?, ?, ?, ?, ?, ?)");
        $is_notified = 0; // Set default notifikasi ke "Belum dilihat"
        $deskripsi_notifikasi = ''; // Dapat disesuaikan
        $query_pembayaran->bind_param("idssis", $id_user, $total_pembayaran, $metode_pembayaran, $id_pemesanan, $is_notified, $deskripsi_notifikasi);

        if ($query_pembayaran->execute()) {
            // Hapus keranjang setelah berhasil
            unset($_SESSION['cart']);
            echo "<script>alert('Pembayaran berhasil!'); window.location='status.php';</script>";
            exit;
        } else {
            error_log("Error pembayaran: " . $query_pembayaran->error);
            echo "<script>alert('Gagal memproses pembayaran!'); window.location='pembayaran.php';</script>";
            exit;
        }
    } else {
        error_log("Error pemesanan: " . $query_pemesanan->error);
        echo "<script>alert('Gagal menyimpan data pemesanan!'); window.location='pembayaran.php';</script>";
        exit;
    }
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment and Invoice</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
   
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=acute" />
    <style>
        /* General Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #1ca34a;
        }

        .container {
            display: flex;
            width: 900px;
            position: relative;
            background: white;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }

        .invoice-card {
            background: #2cb15b;
            color: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            width: 400px;
            height: 600px;
            bottom: -30px;
            z-index: 2;
        }

        .invoice-card h2 {
            font-size: 32px;
            margin-bottom: 15px;
        }

        .invoice-card p {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            font-size: 14px;
        }

        .invoice-card p span {
            flex: 1;
            text-align: right;
            margin-left: 10px;
        }

        hr {
            border: none;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            margin: 15px 0;
        }

        .icon-text {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding-right: 200px;
            margin-bottom: 10px;
        }

        .icon-text h1 {
            margin-top: 5px;
            text-align: center;
            font-size: 18px;
            font-weight: normal;
        }

        .icon-text img {
            width: 16px;
            height: 16px;
        }

        /* Payment Section */
        .payment-section {
            background: white;
            width: 70%;
            height: 600px;
            padding: 40px;
            border-radius: 0 10px 10px 0;
            z-index: 3;
            box-shadow: -10px 0px 20px rgba(0, 0, 0, 0.1);
        }

        .payment-section h2 {
            margin-bottom: 20px;
            font-size: 22px;
        }

        .tabs span {
            margin-right: 15px;
            font-size: 14px;
            opacity: 0.7;
            cursor: pointer;
        }

        .tabs .active {
            border-bottom: 2px solid #1ca34a;
            font-weight: bold;
            opacity: 1;
        }

        .tab-content {
            margin-top: 20px;
        }

        .tab-content div {
            display: none;
        }

        .tab-content .active {
            display: block;
        }

        form {
            margin-top: 30px;
        }

        form div {
            margin-bottom: 15px;
        }

        form label {
            display: block;
            font-weight: bold;
            margin-bottom: 5px;
        }

        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }

        .pay-button {
            background: #1ca34a;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 5px;
            width: 100%;
            cursor: pointer;
            font-size: 16px;
        }

        .pay-button:hover {
            background: #179f3f;
        }
    </style>
</head>

<img src="<?= htmlspecialchars($item['image']) ?>" alt="<?= htmlspecialchars($item['name']) ?>">
<body>
    <div class="container">
        
        <!-- Invoice Section -->

        <div class="invoice-card"> 
            <?php
                $total_pembayaran = 0; 
                foreach ($_SESSION['cart'] as $item):
                    $total_pembayaran += $item['price'] * $item['quantity'];
                ?>
                    <li><?= htmlspecialchars($item['name']) ?> x<?= $item['quantity'] ?> - Rp. <?= number_format($item['price'] * $item['quantity'], 0, ',', '.') ?></li>
            <?php endforeach; ?>
            
            <p><strong>Total Pembayaran: Rp. <?= number_format($total_pembayaran, 0, ',', '.') ?></strong></p>
            
            <hr>
            <div class="icon-text">
                <span class="material-icons-sharp">
                    receipt_long
                </span>
                <p>Invoice ID:
                    
                </p>
                
            </div>
            <h3>SN8478042099</h3>

            <div class="icon-text">
                <span class="material-icons-sharp">
                    calendar_today
                </span>
                <p>Tanggal Pemesanan:</p>
            </div>
            <h3><?php echo date('d F, Y'); ?></h3>

            <div class="icon-text" style="padding-top: 65px;">
                <span class="material-icons-sharp">
                    forum
                </span>
                <p>Customer Support:</p>
            </div>
            <h3>Terima Kasih sudah Membeli!</h3>
           
        </div>
        

        <!-- Payment Section -->
        <div class="payment-section">
            <h2>Payment methods</h2>
            <div class="tabs">
                <span class="active" data-target="credit-card">Credit Card</span>
                <span data-target="mobile-payment">Mobile Payment</span>
                <span data-target="dana">Dana</span>
            </div>

            <div class="tab-content" id="metode_pembayaran">
                <div id="credit-card" class="active">
                    <h3>Credit Card</h3>
                    <p class="number"><strong>5136 1845 5468 3894</strong></p>
                </div>
                <div id="mobile-payment">
                    <h3>Mobile Payment</h3>
                    <p class="number"><strong>OVO: 081234567890</strong></p>
                </div>
                <div id="dana">
                    <h3>DANA</h3>
                    <p class="number"><strong>DANA: 081234567891</strong></p>
                    <div class="image">
                        <img src="asset/dana.jpg" alt="QR Code DANA" style="max-width: 200px; height: auto; margin-top: 10px;">
                    </div>
                </div>

            </div>

            <form action="pembayaran.php" method="post">
                <input type="hidden" name="metode_pembayaran" id="metode_pembayaran_input">

                <div>
                    <label for="nama_pemesan">Name:</label>
                    <input type="text" name="nama_pemesan" id="nama_pemesan" placeholder="Your Name" required>
                </div>
                <div>
                    <label for="alamat_pemesan">Address:</label>
                    <input type="text" name="alamat_pemesan" id="alamat_pemesan" placeholder="Your Address" required>
                </div>
                <div>
                    <label for="telepon_pemesan">Phone:</label>
                    <input type="text" name="telepon_pemesan" id="telepon_pemesan" placeholder="Your Phone Number" required>
                </div>
                <button class="pay-button"><p><strong>Bayar Rp. <?= number_format($total_pembayaran, 0, ',', '.') ?></strong></p></button>
            </form>
        </div>
    </div>

    <script>
        const tabs = document.querySelectorAll('.tabs span');
        const tabContent = document.querySelectorAll('.tab-content div');
        const metodePembayaranInput = document.getElementById('metode_pembayaran_input');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and tab contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContent.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).classList.add('active');

                // Update the hidden input with the selected payment method
                metodePembayaranInput.value = tab.textContent.trim();
            });
        });

       
        metodePembayaranInput.value = document.querySelector('.tabs .active').textContent.trim();
    </script>
</body>
</html>
