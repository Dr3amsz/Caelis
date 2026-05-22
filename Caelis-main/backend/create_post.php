<?php
session_start();
require 'config.php';

// Pastikan user sudah login
if(!isset($_SESSION['user_id'])) {
    echo "Anda harus login terlebih dahulu!";
    exit;
}

$user_id = $_SESSION['user_id'];
$content = isset($_POST['content']) ? trim($_POST['content']) : '';
$image_url = null;

// Cek jika ada file gambar yang diupload
if(isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
    $target_dir = "../uploads/"; // Mundur satu folder, lalu masuk ke uploads
    $file_extension = pathinfo($_FILES["image"]["name"], PATHINFO_EXTENSION);
    // Buat nama file unik agar tidak bentrok
    $file_name = time() . '_' . uniqid() . '.' . $file_extension;
    $target_file = $target_dir . $file_name;
    
    // Pindahkan file dari penyimpanan sementara ke folder uploads
    if(move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
        $image_url = $file_name;
    } else {
        echo "Gagal mengunggah gambar.";
        exit;
    }
}

// Minimal harus ada teks atau gambar
if(empty($content) && empty($image_url)) {
    echo "Postingan tidak boleh kosong!";
    exit;
}

// Simpan ke database
$stmt = $pdo->prepare("INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)");
if($stmt->execute([$user_id, $content, $image_url])) {
    echo "sukses";
} else {
    echo "Gagal membuat postingan.";
}
?>