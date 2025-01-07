<?php
session_start();
include 'koneksi.php';

// Pastikan pengguna sudah login
if (!isset($_SESSION['id_user'])) {
    header("Location: login.php"); // Redirect ke login jika belum login
    exit();
}

$id_user = $_SESSION['id_user'];

// Hitung jumlah order berdasarkan tblpemesanan
$query_daily_views = "
    SELECT COUNT(*) AS total_orders 
    FROM tblpemesanan 
    WHERE id_user = ?
";
$stmt_daily_views = mysqli_prepare($conn, $query_daily_views);
mysqli_stmt_bind_param($stmt_daily_views, "i", $id_user);
mysqli_stmt_execute($stmt_daily_views);
$result_daily_views = mysqli_stmt_get_result($stmt_daily_views);
$total_orders = $result_daily_views ? mysqli_fetch_assoc($result_daily_views)['total_orders'] : 0;

// Hitung jumlah pesanan sedang diantar
$query_delivery = "
    SELECT COUNT(*) AS total_delivery
    FROM tblpemesanan p
    LEFT JOIN tblstatuspemesanan s ON p.id_pemesanan = s.id_pemesanan
    WHERE p.id_user = ? AND s.status_pemesanan = 'diantar'
";
$stmt_delivery = mysqli_prepare($conn, $query_delivery);
mysqli_stmt_bind_param($stmt_delivery, "i", $id_user);
mysqli_stmt_execute($stmt_delivery);
$result_delivery = mysqli_stmt_get_result($stmt_delivery);
$total_delivery = $result_delivery ? mysqli_fetch_assoc($result_delivery)['total_delivery'] : 0;

// Hitung jumlah pesanan yang telah selesai
$query_sales = "
    SELECT COUNT(*) AS total_completed
    FROM tblpemesanan p
    LEFT JOIN tblstatuspemesanan s ON p.id_pemesanan = s.id_pemesanan
    WHERE p.id_user = ? AND s.status_pemesanan = 'selesai'
";
$stmt_sales = mysqli_prepare($conn, $query_sales);
mysqli_stmt_bind_param($stmt_sales, "i", $id_user);
mysqli_stmt_execute($stmt_sales);
$result_sales = mysqli_stmt_get_result($stmt_sales);
$total_completed = $result_sales ? mysqli_fetch_assoc($result_sales)['total_completed'] : 0;

// Query untuk mengambil data pesanan pengguna
$query = "
    SELECT 
        m.menu_name, 
        p.jumlah_pemesanan, 
        p.alamat_pemesan, 
        p.tanggal_pemesanan,
        MAX(s.status_pemesanan) AS status_pemesanan,
        b.status_pembayaran
    FROM tblpemesanan p
    JOIN tblmenu m ON p.produk_id = m.menu_id
    LEFT JOIN tblstatuspemesanan s ON p.id_pemesanan = s.id_pemesanan
    LEFT JOIN tblpembayaran b ON p.id_user = b.id_user
    WHERE p.id_user = ?
    GROUP BY p.id_pemesanan
    ORDER BY p.tanggal_pemesanan DESC
";
$stmt_orders = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt_orders, "i", $id_user);
mysqli_stmt_execute($stmt_orders);
$result = mysqli_stmt_get_result($stmt_orders);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>

    <link rel="stylesheet" href="css/order.css">
    <link rel="stylesheet" href="https://unpkg.com/boxicons@latest/css/boxicons.min.css">
</head>
<body>
    <div class="container">
    <div class="navigation">
            <ul>
                <li>
                    <a href="#">
                        <span class="icon"><i class='bx bxs-lemon'></i></span>
                        <span class="title">MyOrder</span>
                    </a>
                </li>
                <li>
                    <a href="#">
                        <span class="icon"><i class='bx bx-home-alt-2'></i></span>
                        <span class="title">Status Order</span>
                    </a>
                </li>
                <li>
                    <a href="keranjang.php">
                          <div class="icon"><i class='bx bx-cart'></i></div>
                        <span class="title">Keranjang</span>
                    </a>
                </li>
                <li>
                    <a href="send.php">
                          <div class="icon"><i class='bx bx-cart'></i></div>
                        <span class="title">Chat</span>
                    </a>
                </li>
                <li>
                    <a href="DapurUmmikyanaPalembang.php">
                        <span class="icon"><i class='bx bx-log-in'></i></span>
                        <span class="title">Lanjut Belanja</span>
                    </a>
                </li>
            </ul>
        </div>
        <div class="main">
        <div class="topbar">
                <div class="toggle">
                    <i class='bx bx-menu'></i>
                </div>
                <div class="search">
                    <label>
                        <input type="text" id="searchInput" placeholder="Search here" onkeyup="searchData()">
                        <i class='bx bx-search'></i>
                    </label>
                </div>
                <div class="user">
                    <img src="img/user.png" alt="user foto">
                </div>
            </div>
            <div class="cardBox">
                <div class="card">
                    <div>
                        <div class="numbers"><?= $total_orders ?></div>
                        <div class="cardName">Total Pesanan</div>
                    </div>
                    <div class="iconBox"><i class='bx bx-cart'></i></div>
                </div>
                <div class="card">
                    <div>
                        <div class="numbers"><?= $total_delivery ?></div>
                        <div class="cardName">Sedang Diantar</div>
                    </div>
                    <div class="iconBox"><i class='bx bx-truck'></i></div>
                </div>
                <div class="card">
                    <div>
                        <div class="numbers"><?= $total_completed ?></div>
                        <div class="cardName">Sudah Selesai</div>
                    </div>
                    <div class="iconBox"><i class='bx bx-check-double'></i></div>
                </div>
            </div>

            <div class="details">
                <div class="recentOrders" style="width: 1000px; min-height: 200px;">
                    <div class="cardHeader">
                        <h2>Recent Orders</h2>
                        <a href="#" class="btn">View All</a>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <td>Produk</td>
                                <td>Jumlah</td>
                                <td>Alamat</td>
                                <td>Tanggal</td>
                                <td>Status</td>
                                <td>Status Pembayaran</td>
                            </tr>
                        </thead><tbody>
    <?php if (mysqli_num_rows($result) > 0): ?>
        <?php while ($row = mysqli_fetch_assoc($result)): ?>
            <tr>
                <td><?= htmlspecialchars($row['menu_name']) ?></td>
                <td><?= htmlspecialchars($row['jumlah_pemesanan']) ?></td>
                <td><?= htmlspecialchars($row['alamat_pemesan']) ?></td>
                <td><?= htmlspecialchars($row['tanggal_pemesanan']) ?></td>
                <td>
                    <?php 
                        $status_pemesanan = htmlspecialchars($row['status_pemesanan']);
                        if ($status_pemesanan == 'ongoing') {
                            echo '<span class="status" style="color: red;">' . $status_pemesanan . '</span>';
                        } elseif ($status_pemesanan == 'diantar') {
                            echo '<span class="status" style="color: orange;">' . $status_pemesanan . '</span>';
                        } elseif ($status_pemesanan == 'selesai') {
                            echo '<span class="status" style="color: green;">' . $status_pemesanan . '</span>';
                        } else {
                            echo '<span class="status">' . $status_pemesanan . '</span>';
                        }
                    ?>
                </td>
                <td>
                    <?php 
                        $status_pembayaran = htmlspecialchars($row['status_pembayaran']);
                        if ($status_pembayaran == 'pending') {
                            echo '<span class="status" style="color: orange;">' . $status_pembayaran . '</span>';
                        } elseif ($status_pembayaran == 'completed') {
                            echo '<span class="status" style="color: green;">' . $status_pembayaran . '</span>';
                        } elseif ($status_pembayaran == 'failed') {
                            echo '<span class="status" style="color: red;">' . $status_pembayaran . '</span>';
                        } else {
                            echo '<span class="status">' . $status_pembayaran . '</span>';
                        }
                    ?>
                </td>
            </tr>
        <?php endwhile; ?>
    <?php else: ?>
        <tr>
            <td colspan="6" class="text-center">Tidak ada data ditemukan.</td>
        </tr>
    <?php endif; ?>
</tbody>

                    </table>
                </div>
            </div>
        </div>
    </div>
   
    <script>
        let toggle = document.querySelector('.toggle');
        let navigation = document.querySelector('.navigation');
        let main = document.querySelector('.main');

        toggle.onclick = function () {
            navigation.classList.toggle('active');
            main.classList.toggle('active');
        }

        let list = document.querySelectorAll('.navigation li');
        function activeLink() {
            list.forEach((item) =>
                item.classList.remove('hovered'));
            this.classList.add('hovered');
        }
        list.forEach((item) =>
            item.addEventListener('mouseover', activeLink));


            function searchData() {
        let input = document.getElementById("searchInput");
        let filter = input.value.toLowerCase();
        let table = document.querySelector("table");
        let rows = table.querySelectorAll("tbody tr");

        rows.forEach(function(row) {
            let productNameCell = row.cells[0];  // Kolom Produk (Nama Produk)
            let statusPemesananCell = row.cells[4];  // Kolom Status Pemesanan
            let statusPembayaranCell = row.cells[5]; // Kolom Status Pembayaran

            let productNameText = productNameCell.textContent || productNameCell.innerText;
            let statusPemesananText = statusPemesananCell.textContent || statusPemesananCell.innerText;
            let statusPembayaranText = statusPembayaranCell.textContent || statusPembayaranCell.innerText;

            // Pencarian dapat dilakukan di kolom Produk, Status Pemesanan, atau Status Pembayaran
            if (productNameText.toLowerCase().indexOf(filter) > -1 || 
                statusPemesananText.toLowerCase().indexOf(filter) > -1 || 
                statusPembayaranText.toLowerCase().indexOf(filter) > -1) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }
    </script>
</body>
</html>
