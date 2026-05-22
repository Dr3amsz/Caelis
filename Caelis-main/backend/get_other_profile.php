<?php
// backend/get_other_profile.php
header('Content-Type: application/json');
session_start();
require 'config.php';

if(!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$current_user_id = $_SESSION['user_id'];
$target_user_id = $_GET['id'] ?? null;

if(!$target_user_id) {
    echo json_encode(['status' => 'error', 'message' => 'ID User tidak valid']);
    exit;
}

try {
    // 1. Ambil data profil user yang diklik
    $stmt = $pdo->prepare("SELECT id, name, profile_img FROM users WHERE id = ?");
    $stmt->execute([$target_user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if(!$user) {
        echo json_encode(['status' => 'error', 'message' => 'User tidak ditemukan']);
        exit;
    }

    // 2. Cek apakah Anda sudah mem-follow user ini
    $stmtFollow = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?");
    $stmtFollow->execute([$current_user_id, $target_user_id]);
    $is_following = $stmtFollow->fetchColumn() > 0;

    // 3. Ambil HANYA postingan dari user yang diklik
    $postSql = "
        SELECT p.id as post_id, p.content, p.image_url, p.created_at, 
               u.id as user_id, u.name as user_name, u.profile_img,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?
        ORDER BY p.created_at DESC
    ";
    $postStmt = $pdo->prepare($postSql);
    $postStmt->execute([$current_user_id, $target_user_id]);
    $posts = $postStmt->fetchAll(PDO::FETCH_ASSOC);

    // Ambil komentar untuk tiap postingannya
    foreach ($posts as &$post) {
        $commentSql = "SELECT c.content, c.created_at, u.name as user_name 
                       FROM comments c JOIN users u ON c.user_id = u.id
                       WHERE c.post_id = ? ORDER BY c.created_at ASC";
        $commentStmt = $pdo->prepare($commentSql);
        $commentStmt->execute([$post['post_id']]);
        $post['comments'] = $commentStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        'status' => 'success',
        'user' => $user,
        'is_following' => $is_following,
        'posts' => $posts,
        'current_user_id' => $current_user_id
    ]);

} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>