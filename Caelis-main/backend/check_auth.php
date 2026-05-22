<?php
// backend/check_auth.php
ob_start();
session_start();
header('Content-Type: application/json');
require 'config.php'; 

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    try {
        // Ambil data user dasar
        $stmt = $pdo->prepare("SELECT id, name, email, bio, profile_img FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            // HITUNG POSTINGAN (Sesuai gambar database posts Anda)
            $stmtCount = $pdo->prepare("SELECT COUNT(*) FROM posts WHERE user_id = ?");
            $stmtCount->execute([$user_id]);
            $user['total_posts'] = (int)$stmtCount->fetchColumn();

            // HITUNG FOLLOWERS & FOLLOWING (Sesuai tabel follows Anda)
            $stmtFollowers = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE following_id = ?");
            $stmtFollowers->execute([$user_id]);
            $user['total_followers'] = (int)$stmtFollowers->fetchColumn();

            $stmtFollowing = $pdo->prepare("SELECT COUNT(*) FROM follows WHERE follower_id = ?");
            $stmtFollowing->execute([$user_id]);
            $user['total_following'] = (int)$stmtFollowing->fetchColumn();

            echo json_encode(['status' => 'logged_in', 'user' => $user]);
        } else {
            echo json_encode(['status' => 'not_logged_in']);
        }
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'not_logged_in']);
}
ob_end_flush();