<?php
// Database Configuration
// შეცვალე ეს მონაცემები შენი ჰოსტინგის მონაცემებით

define('DB_HOST', 'localhost');      // Database Host (ჩვეულებრივ localhost)
define('DB_USER', 'root');            // Database Username (შენი username)
define('DB_PASS', '');                // Database Password (შენი პაროლი)
define('DB_NAME', 'fashion_store');   // Database Name (შენი database-ის სახელი)

// Admin Password - შეცვალე უსაფრთხო პაროლით!
define('ADMIN_PASSWORD', 'admin2024444');

// Upload Directory
define('UPLOAD_DIR', 'uploads/');

// Create uploads directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

// Database Connection
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch(PDOException $e) {
        error_log("Connection failed: " . $e->getMessage());
        return null;
    }
}

// Response Helper Function
function sendResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ] + $data);
    exit;
}
?><?php
// Database Configuration
// შეცვალე ეს მონაცემები შენი ჰოსტინგის მონაცემებით

define('DB_HOST', 'localhost');      // Database Host (ჩვეულებრივ localhost)
define('DB_USER', 'root');            // Database Username (შენი username)
define('DB_PASS', '');                // Database Password (შენი პაროლი)
define('DB_NAME', 'fashion_store');   // Database Name (შენი database-ის სახელი)

// Admin Password - შეცვალე უსაფრთხო პაროლით!
define('ADMIN_PASSWORD', 'admin2024');

// Upload Directory
define('UPLOAD_DIR', 'uploads/');

// Create uploads directory if it doesn't exist
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0777, true);
}

// Database Connection
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch(PDOException $e) {
        error_log("Connection failed: " . $e->getMessage());
        return null;
    }
}

// Response Helper Function
function sendResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ] + $data);
    exit;
}
?>