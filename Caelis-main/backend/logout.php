<?php
session_start();

// Hapus semua variabel session
session_unset();

// Hancurkan session
session_destroy();

// Kirim respon sukses ke JavaScript
header('Content-Type: application/json');
echo json_encode(['status' => 'success', 'message' => 'Berhasil logout']);
?>