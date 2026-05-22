<?php
require 'config.php';

if(isset($_POST['name']) && isset($_POST['email']) && isset($_POST['password'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // Cek email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if($stmt->rowCount() > 0) {
        echo "Email sudah terdaftar!";
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
    
    if($stmt->execute([$name, $email, $hashed_password])) {
        echo "sukses"; // Trigger untuk JS
    } else {
        echo "Gagal membuat akun.";
    }
} else {
    echo "Mohon lengkapi semua data.";
}
?>