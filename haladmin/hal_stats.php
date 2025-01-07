<?php
session_start();
require 'koneksi.php'; // Include database connection

// Retrieve total number of orders
$totalOrdersQuery = "SELECT COUNT(*) as total_orders FROM tblpemesanan";
$totalOrdersResult = $conn->query($totalOrdersQuery);
$totalOrders = $totalOrdersResult && $totalOrdersResult->num_rows > 0
    ? $totalOrdersResult->fetch_assoc()['total_orders']
    : 0;

// Define date range for the current month
$currentMonthStart = date('Y-m-01'); // First day of the current month
$currentMonthEnd = date('Y-m-t');   // Last day of the current month

// Retrieve total income for the current month
$totalIncomeQuery = "
    SELECT SUM(total_pembayaran) as total_income 
    FROM tblpembayaran 
    WHERE DATE(tanggal_pembayaran) BETWEEN ? AND ?
";
$stmt = $conn->prepare($totalIncomeQuery);
$stmt->bind_param('ss', $currentMonthStart, $currentMonthEnd);
$stmt->execute();
$totalIncomeResult = $stmt->get_result();
$totalIncome = $totalIncomeResult && $totalIncomeResult->num_rows > 0
    ? $totalIncomeResult->fetch_assoc()['total_income']
    : 0;
$stmt->close();

// Format total income
$formattedTotalIncome = $totalIncome > 0
    ? number_format($totalIncome, 0, ',', '.')
    : '0,000';

// Define date range (7 days) for the chart
$startDate = isset($_GET['start_date']) ? $_GET['start_date'] : date('Y-m-d', strtotime('-6 days'));
$endDate = date('Y-m-d', strtotime($startDate . ' +6 days'));

// Retrieve daily order and income data for chart
$orderIncomeQuery = "
    SELECT 
        DATE(tanggal_pemesanan) as order_date,
        COUNT(*) as total_orders,
        SUM(total_pembayaran) as total_income
    FROM tblpemesanan
    LEFT JOIN tblpembayaran ON tblpemesanan.id_pemesanan = tblpembayaran.id_pemesanan
    WHERE DATE(tanggal_pemesanan) BETWEEN ? AND ?
    GROUP BY DATE(tanggal_pemesanan)
    ORDER BY DATE(tanggal_pemesanan)
";
$stmt = $conn->prepare($orderIncomeQuery);
$stmt->bind_param('ss', $startDate, $endDate);
$stmt->execute();
$result = $stmt->get_result();

$orderData = [];
$incomeData = [];
$dateLabels = [];
while ($row = $result->fetch_assoc()) {
    $orderData[$row['order_date']] = $row['total_orders'];
    $incomeData[$row['order_date']] = $row['total_income'] ?: 0;
    $dateLabels[] = $row['order_date'];
}
$stmt->close();

// Fill missing dates with zero values
$period = new DatePeriod(
    new DateTime($startDate),
    new DateInterval('P1D'),
    new DateTime($endDate . ' +1 day')
);
foreach ($period as $date) {
    $formattedDate = $date->format('Y-m-d');
    if (!isset($orderData[$formattedDate])) {
        $orderData[$formattedDate] = 0;
        $incomeData[$formattedDate] = 0;
    }
}
ksort($orderData);
ksort($incomeData);
$dateLabels = array_keys($orderData);
$orderValues = array_values($orderData);
$incomeValues = array_values($incomeData);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Sharp" rel="stylesheet">
    <title>Dashboard Payments</title>
</head>
<body>
    <main>
        <h1>Statistika</h1>
        <div class="analyse">
            <div class="status">
                <h3>Total Orders</h3>
                <h1><?= $totalOrders ?></h1>
            </div>
            <div class="status">
                <h3>Total Income</h3>
                <h1>Rp<?= $formattedTotalIncome ?></h1>
            </div>
        </div>

        <div class="chart-container">
            <canvas id="orderIncomeChart"></canvas>
        </div>

        <div class="navigation-buttons">
            <a href="?start_date=<?= date('Y-m-d', strtotime($startDate . ' -7 days')) ?>">Previous 7 Days</a>
            <a href="?start_date=<?= date('Y-m-d', strtotime($startDate . ' +7 days')) ?>">Next 7 Days</a>
        </div>
    </main>

    <script>
        const ctx = document.getElementById('orderIncomeChart').getContext('2d');
        const orderIncomeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: <?= json_encode($dateLabels) ?>,
                datasets: [
                    {
                        label: 'Total Orders',
                        data: <?= json_encode($orderValues) ?>,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Total Income (Rp)',
                        data: <?= json_encode($incomeValues) ?>,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.datasetIndex === 1
                                    ? `Total Income: Rp${tooltipItem.raw.toLocaleString()}`
                                    : `Total Orders: ${tooltipItem.raw}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString(); // Format numbers for better readability
                            }
                        }
                    }
                }
            }
        });
    </script>
</body>
</html>
