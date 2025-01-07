<?php

// Tandai notifikasi sudah diberitahukan
$data = json_decode(file_get_contents("php://input"), true);
if (isset($data['id_pembayaran'])) {
    $id_pembayaran = $data['id_pembayaran'];
    $query = "UPDATE tblpembayaran SET is_notified = 1 WHERE id_pembayaran = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $id_pembayaran);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
?>
