<?php
session_start();
require 'config.php';

if(!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit;
}

if(isset($_POST['following_id'])) {
    $follower_id = $_SESSION['user_id'];
    $following_id = $_POST['following_id'];

    // Jangan biarkan user follow dirinya sendiri
    if($follower_id == $following_id) {
        echo "Tidak bisa follow diri sendiri.";
        exit;
    }

    // Cek apakah sudah follow
    $stmt = $pdo->prepare("SELECT * FROM follows WHERE follower_id = ? AND following_id = ?");
    $stmt->execute([$follower_id, $following_id]);
    
    if($stmt->rowCount() > 0) {
        // Jika sudah follow, maka Unfollow (Hapus data)
        $delete = $pdo->prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?");
        $delete->execute([$follower_id, $following_id]);
        echo "unfollowed";
    } else {
        // Jika belum follow, maka Follow (Tambah data)
        $insert = $pdo->prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)");
        $insert->execute([$follower_id, $following_id]);
        echo "followed";
    }
}
?>