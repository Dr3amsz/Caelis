<?php
session_start();
header('Content-Type: application/json');
require 'config.php';

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'];

// Cek apakah sudah di-like
$check = $pdo->prepare("SELECT id FROM likes WHERE user_id = ? AND post_id = ?");
$check->execute([$user_id, $post_id]);

if ($check->fetch()) {
    // Jika sudah ada, hapus (Unlike)
    $stmt = $pdo->prepare("DELETE FROM likes WHERE user_id = ? AND post_id = ?");
    $stmt->execute([$user_id, $post_id]);
    $status = 'unliked';
} else {
    // Jika belum ada, tambah (Like)
    $stmt = $pdo->prepare("INSERT INTO likes (user_id, post_id) VALUES (?, ?)");
    $stmt->execute([$user_id, $post_id]);
    $status = 'liked';
}

// Ambil jumlah like terbaru
$countStmt = $pdo->prepare("SELECT COUNT(*) FROM likes WHERE post_id = ?");
$countStmt->execute([$post_id]);
$total = $countStmt->fetchColumn();

echo json_encode([
    'status' => $status, 
    'total_likes' => (int)$total // Pastikan nama variabelnya total_likes
]);