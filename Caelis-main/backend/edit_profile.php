<?php
// backend/edit_profile.php
session_start();
require 'config.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesi berakhir']);
    exit;
}

try {
    $user_id = $_SESSION['user_id'];
    $name = $_POST['name'] ?? '';
    $bio = $_POST['bio'] ?? '';

    // Proses Upload Foto jika ada
    if (isset($_FILES['profile_img']) && $_FILES['profile_img']['error'] === 0) {
        $ext = pathinfo($_FILES['profile_img']['name'], PATHINFO_EXTENSION);
        $new_name = "profile_" . $user_id . "_" . time() . "." . $ext;
        move_uploaded_file($_FILES['profile_img']['tmp_name'], "uploads/" . $new_name);

        // Update database dengan foto baru
        $stmt = $pdo->prepare("UPDATE users SET name = ?, bio = ?, profile_img = ? WHERE id = ?");
        $stmt->execute([$name, $bio, $new_name, $user_id]);
    } else {
        // Update teks saja
        $stmt = $pdo->prepare("UPDATE users SET name = ?, bio = ? WHERE id = ?");
        $stmt->execute([$name, $bio, $user_id]);
    }

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}