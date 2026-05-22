<?php
// backend/get_feed.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

session_start();
require 'config.php';

if(!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // RUMUS GLOBAL FEED: Ambil semua postingan dari siapa sahaja
    // Tanpa had 'WHERE' supaya post dari akaun lain turut muncul
    $sql = "
        SELECT p.id as post_id, p.content, p.image_url, p.created_at, 
               u.id as user_id, u.name as user_name, u.profile_img,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as total_likes,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    
    // Memandangkan tanda soal (?) hanya ada 1 untuk 'is_liked', kita hanya letak satu $user_id
    $stmt->execute([$user_id]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ambil komen untuk setiap postingan
    foreach ($posts as &$post) {
        $commentSql = "
            SELECT c.content, c.created_at, u.name as user_name 
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at ASC
        ";
        $commentStmt = $pdo->prepare($commentSql);
        $commentStmt->execute([$post['post_id']]);
        $post['comments'] = $commentStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['status' => 'success', 'posts' => $posts, 'current_user_id' => $user_id]);

} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>