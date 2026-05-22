<?php
// backend/get_users.php
header('Content-Type: application/json');
session_start();
require 'config.php';

if(!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$current_user_id = $_SESSION['user_id'];

try {
    // 1. Ambil semua data user KECUALI diri sendiri
    $stmt = $pdo->prepare("SELECT id, name, profile_img FROM users WHERE id != ?");
    $stmt->execute([$current_user_id]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Ambil daftar ID user yang sudah di-follow oleh user yang sedang login
    $stmtFollow = $pdo->prepare("SELECT following_id FROM follows WHERE follower_id = ?");
    $stmtFollow->execute([$current_user_id]);
    $following = $stmtFollow->fetchAll(PDO::FETCH_COLUMN); // Mengembalikan array berisi ID saja

    echo json_encode([
        'status' => 'success', 
        'users' => $users, 
        'following' => $following
    ]);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>