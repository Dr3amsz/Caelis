<?php
// backend/config.php
ob_start(); // Buffer output untuk mencegah kebocoran teks
$host = 'localhost';
$dbname = 'caelis_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    // Jika koneksi gagal, jangan echo teks acak
    $output = json_encode(['status' => 'error', 'message' => 'DB Failure']);
    header('Content-Type: application/json');
    die($output);
}