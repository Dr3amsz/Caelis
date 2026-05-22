<?php
session_start();
require 'config.php';

// Pastikan PHP bisa menerima input dari fetch FormData
if (empty($_POST) && strpos($_SERVER["CONTENT_TYPE"], "application/json") !== false) {
    $_POST = json_decode(file_get_contents("php://input"), true);
}

// Gunakan trim untuk menghapus spasi tak sengaja
$email = isset($_POST['email']) ? trim($_POST['email']) : null;
$password = isset($_POST['password']) ? $_POST['password'] : null;

if($email && $password) {
    $stmt = $pdo->prepare("SELECT id, name, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        echo "sukses";
    } else {
        echo "Email atau Password salah!";
    }
} else {
    echo "Data tidak lengkap! PHP menerima: " . json_encode($_POST);
}
?>