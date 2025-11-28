<?php
require_once 'config.php';

// Enable CORS if needed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$conn = getDBConnection();
if (!$conn) {
    sendResponse(false, 'Database connection failed');
}

$action = $_REQUEST['action'] ?? '';

switch ($action) {
    case 'login':
        handleLogin();
        break;
    
    case 'getProducts':
        getProducts();
        break;
    
    case 'getAllProducts':
        getAllProducts();
        break;
    
    case 'getProduct':
        getProduct();
        break;
    
    case 'addProduct':
        addProduct();
        break;
    
    case 'updateProduct':
        updateProduct();
        break;
    
    case 'deleteProduct':
        deleteProduct();
        break;
    
    default:
        sendResponse(false, 'Invalid action');
}

// Admin Login
function handleLogin() {
    $password = $_POST['password'] ?? '';
    
    if ($password === ADMIN_PASSWORD) {
        sendResponse(true, 'Login successful');
    } else {
        sendResponse(false, 'Invalid password');
    }
}

// Get Products by Gender
function getProducts() {
    global $conn;
    
    $gender = $_GET['gender'] ?? '';
    
    if (empty($gender)) {
        sendResponse(false, 'Gender is required');
    }
    
    try {
        $stmt = $conn->prepare("
            SELECT * FROM products 
            WHERE gender = :gender 
            ORDER BY created_at DESC
        ");
        $stmt->execute(['gender' => $gender]);
        $products = $stmt->fetchAll();
        
        sendResponse(true, '', ['products' => $products]);
    } catch (PDOException $e) {
        sendResponse(false, 'Error fetching products: ' . $e->getMessage());
    }
}

// Get All Products (Admin)
function getAllProducts() {
    global $conn;
    
    try {
        $stmt = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        
        sendResponse(true, '', ['products' => $products]);
    } catch (PDOException $e) {
        sendResponse(false, 'Error fetching products: ' . $e->getMessage());
    }
}

// Get Single Product
function getProduct() {
    global $conn;
    
    $id = $_GET['id'] ?? '';
    
    if (empty($id)) {
        sendResponse(false, 'Product ID is required');
    }
    
    try {
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch();
        
        if ($product) {
            sendResponse(true, '', ['product' => $product]);
        } else {
            sendResponse(false, 'Product not found');
        }
    } catch (PDOException $e) {
        sendResponse(false, 'Error fetching product: ' . $e->getMessage());
    }
}

// Add Product
function addProduct() {
    global $conn;
    
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? '';
    $description = $_POST['description'] ?? '';
    $category = $_POST['category'] ?? 'ტანსაცმელი';
    $gender = $_POST['gender'] ?? 'male';
    $sizes = $_POST['sizes'] ?? 'S, M, L, XL';
    $in_stock = isset($_POST['in_stock']) ? (int)$_POST['in_stock'] : 1;
    
    if (empty($name) || empty($price)) {
        sendResponse(false, 'Name and price are required');
    }
    
    // Handle image upload
    $imagePath = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imagePath = uploadImage($_FILES['image']);
        if (!$imagePath) {
            sendResponse(false, 'Error uploading image');
        }
    } else {
        sendResponse(false, 'Image is required');
    }
    
    try {
        $stmt = $conn->prepare("
            INSERT INTO products (name, price, description, category, gender, sizes, image, in_stock, created_at)
            VALUES (:name, :price, :description, :category, :gender, :sizes, :image, :in_stock, NOW())
        ");
        
        $stmt->execute([
            'name' => $name,
            'price' => $price,
            'description' => $description,
            'category' => $category,
            'gender' => $gender,
            'sizes' => $sizes,
            'image' => $imagePath,
            'in_stock' => $in_stock
        ]);
        
        sendResponse(true, 'Product added successfully', ['id' => $conn->lastInsertId()]);
    } catch (PDOException $e) {
        sendResponse(false, 'Error adding product: ' . $e->getMessage());
    }
}

// Update Product
function updateProduct() {
    global $conn;
    
    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $price = $_POST['price'] ?? '';
    $description = $_POST['description'] ?? '';
    $category = $_POST['category'] ?? 'ტანსაცმელი';
    $gender = $_POST['gender'] ?? 'male';
    $sizes = $_POST['sizes'] ?? 'S, M, L, XL';
    $in_stock = isset($_POST['in_stock']) ? (int)$_POST['in_stock'] : 1;
    
    if (empty($id) || empty($name) || empty($price)) {
        sendResponse(false, 'ID, name and price are required');
    }
    
    // Get current product data
    $stmt = $conn->prepare("SELECT image FROM products WHERE id = :id");
    $stmt->execute(['id' => $id]);
    $currentProduct = $stmt->fetch();
    
    if (!$currentProduct) {
        sendResponse(false, 'Product not found');
    }
    
    $imagePath = $currentProduct['image'];
    
    // Handle new image upload if provided
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $newImagePath = uploadImage($_FILES['image']);
        if ($newImagePath) {
            // Delete old image
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
            $imagePath = $newImagePath;
        }
    }
    
    try {
        $stmt = $conn->prepare("
            UPDATE products 
            SET name = :name, 
                price = :price, 
                description = :description, 
                category = :category, 
                gender = :gender, 
                sizes = :sizes, 
                image = :image, 
                in_stock = :in_stock
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'name' => $name,
            'price' => $price,
            'description' => $description,
            'category' => $category,
            'gender' => $gender,
            'sizes' => $sizes,
            'image' => $imagePath,
            'in_stock' => $in_stock
        ]);
        
        sendResponse(true, 'Product updated successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Error updating product: ' . $e->getMessage());
    }
}

// Delete Product
function deleteProduct() {
    global $conn;
    
    $id = $_POST['id'] ?? '';
    
    if (empty($id)) {
        sendResponse(false, 'Product ID is required');
    }
    
    try {
        // Get product image path
        $stmt = $conn->prepare("SELECT image FROM products WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $product = $stmt->fetch();
        
        if (!$product) {
            sendResponse(false, 'Product not found');
        }
        
        // Delete image file
        if (file_exists($product['image'])) {
            unlink($product['image']);
        }
        
        // Delete from database
        $stmt = $conn->prepare("DELETE FROM products WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        sendResponse(true, 'Product deleted successfully');
    } catch (PDOException $e) {
        sendResponse(false, 'Error deleting product: ' . $e->getMessage());
    }
}

// Upload Image Helper Function
function uploadImage($file) {
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowed_types)) {
        return false;
    }
    
    if ($file['size'] > $max_size) {
        return false;
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid() . '_' . time() . '.' . $extension;
    $filepath = UPLOAD_DIR . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        return $filepath;
    }
    
    return false;
}
?>