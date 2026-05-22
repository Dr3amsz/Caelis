<?php
session_start();
header('Content-Type: application/json');
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Belum login']);
    exit;
}

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'] ?? null;

if (!$post_id) {
    echo json_encode(['status' => 'error', 'message' => 'ID Postingan tidak valid']);
    exit;
}

try {
    // Pastikan user hanya bisa menghapus postingannya sendiri
    $stmt = $pdo->prepare("DELETE FROM posts WHERE id = ? AND user_id = ?");
    $stmt->execute([$post_id, $user_id]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(['status' => 'success', 'message' => 'Postingan berhasil dihapus']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Postingan tidak ditemukan atau Anda tidak memiliki akses']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>