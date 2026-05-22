<?php
session_start();
header('Content-Type: application/json');
require 'config.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Login dahulu']);
    exit;
}

$user_id = $_SESSION['user_id'];
$post_id = $_POST['post_id'] ?? null;
$content = trim($_POST['content'] ?? '');

if (!$post_id || empty($content)) {
    echo json_encode(['status' => 'error', 'message' => 'Isi komentar kosong']);
    exit;
}

try {
    // 1. Simpan ke database
    $stmt = $pdo->prepare("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)");
    $stmt->execute([$post_id, $user_id, $content]);

    // 2. Ambil nama user yang baru saja komentar untuk ditampilkan
    $userStmt = $pdo->prepare("SELECT name FROM users WHERE id = ?");
    $userStmt->execute([$user_id]);
    $userName = $userStmt->fetchColumn();

    echo json_encode([
        'status' => 'success',
        'user_name' => $userName,
        'content' => htmlspecialchars($content)
    ]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}