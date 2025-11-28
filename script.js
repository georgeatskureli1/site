// Global Variables
let currentGender = null;
let allProducts = [];
let selectedSize = null;
let currentProduct = null;
let editingProductId = null;

// API Base URL - შეცვალე შენი სერვერის URL-ით
const API_URL = 'api.php';
const UPLOAD_URL = 'upload.php';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAdminSession();
});

// Gender Selection
function selectGender(gender) {
    currentGender = gender;
    document.getElementById('genderSelection').style.display = 'none';
    document.getElementById('mainStore').style.display = 'block';
    
    const badge = document.getElementById('genderBadge');
    badge.textContent = gender === 'male' ? '👔 ბიჭები' : '👗 გოგონები';
    
    loadProducts();
}

function changeGender() {
    currentGender = null;
    document.getElementById('mainStore').style.display = 'none';
    document.getElementById('genderSelection').style.display = 'flex';
}

// Load Products
async function loadProducts() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_URL}?action=getProducts&gender=${currentGender}`);
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            displayProducts(allProducts);
        } else {
            console.error('Error loading products:', data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (products.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    grid.innerHTML = products.map(product => `
        <div class="product-card" onclick="showProductDetail(${product.id})">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}">
                ${!product.in_stock ? '<div class="product-out-of-stock"><span>არ არის მარაგში</span></div>' : ''}
            </div>
            <div class="product-details">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-footer">
                    <span class="product-price">${product.price} ₾</span>
                    <button class="btn-like" onclick="event.stopPropagation()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        const matchesCategory = category === 'ყველა' || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filtered);
}

function showLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

// Product Detail Modal
async function showProductDetail(productId) {
    try {
        const response = await fetch(`${API_URL}?action=getProduct&id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            currentProduct = data.product;
            selectedSize = null;
            
            document.getElementById('modalProductImage').src = currentProduct.image;
            document.getElementById('modalCategory').textContent = currentProduct.category;
            document.getElementById('modalProductName').textContent = currentProduct.name;
            document.getElementById('modalProductPrice').textContent = `${currentProduct.price} ₾`;
            document.getElementById('modalProductDescription').textContent = currentProduct.description || '';
            
            // Show/hide out of stock overlay
            document.getElementById('modalOutOfStock').style.display = currentProduct.in_stock ? 'none' : 'flex';
            
            // Display sizes
            const sizes = currentProduct.sizes.split(',').map(s => s.trim());
            const sizesHtml = sizes.map(size => `
                <button class="size-btn" onclick="selectSize('${size}')" ${!currentProduct.in_stock ? 'disabled' : ''}>
                    ${size}
                </button>
            `).join('');
            document.getElementById('modalSizes').innerHTML = sizesHtml;
            
            // Update add to cart button
            updateAddToCartButton();
            
            document.getElementById('productModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    currentProduct = null;
    selectedSize = null;
}

function selectSize(size) {
    selectedSize = size;
    
    // Update UI
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    updateAddToCartButton();
}

function updateAddToCartButton() {
    const btn = document.getElementById('addToCartBtn');
    
    if (!currentProduct.in_stock) {
        btn.textContent = 'არ არის მარაგში';
        btn.disabled = true;
    } else if (!selectedSize) {
        btn.textContent = 'აირჩიე ზომა';
        btn.disabled = true;
    } else {
        btn.textContent = 'კალათაში დამატება';
        btn.disabled = false;
    }
}

function addToCart() {
    if (!currentProduct || !selectedSize) return;
    
    alert(`დაემატა კალათაში:\n${currentProduct.name}\nზომა: ${selectedSize}\nფასი: ${currentProduct.price} ₾`);
    closeProductModal();
}

// Admin Login
function showAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'flex';
}

function closeAdminLogin() {
    document.getElementById('adminLoginModal').style.display = 'none';
    document.getElementById('adminPasswordInput').value = '';
}

async function adminLogin() {
    const password = document.getElementById('adminPasswordInput').value;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=login&password=${encodeURIComponent(password)}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            closeAdminLogin();
            showAdminPanel();
        } else {
            alert('არასწორი პაროლი');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('შეცდომა');
    }
}

function checkAdminSession() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        // Admin is logged in, but don't show panel automatically
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('genderSelection').style.display = 'flex';
}

// Admin Panel
async function showAdminPanel() {
    document.getElementById('genderSelection').style.display = 'none';
    document.getElementById('mainStore').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    
    await loadAdminProducts();
}

async function loadAdminProducts() {
    try {
        const response = await fetch(`${API_URL}?action=getAllProducts`);
        const data = await response.json();
        
        if (data.success) {
            displayAdminProducts(data.products);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayAdminProducts(products) {
    const container = document.getElementById('adminProducts');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>პროდუქტები ჯერ არ არის დამატებული</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="admin-product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="admin-product-info">
                <h3>${product.name}</h3>
                <p>${product.category}</p>
                <p class="admin-product-price">${product.price} ₾</p>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        რედაქტირება
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add/Edit Product
function showAddProduct() {
    editingProductId = null;
    document.getElementById('editModalTitle').textContent = 'პროდუქტის დამატება';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('editProductModal').style.display = 'flex';
}

async function editProduct(productId) {
    editingProductId = productId;
    
    try {
        const response = await fetch(`${API_URL}?action=getProduct&id=${productId}`);
        const data = await response.json();
        
        if (data.success) {
            const product = data.product;
            
            document.getElementById('editModalTitle').textContent = 'პროდუქტის რედაქტირება';
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productGender').value = product.gender;
            document.getElementById('productSizes').value = product.sizes;
            document.getElementById('productInStock').checked = product.in_stock;
            
            // Show current image
            document.getElementById('imagePreview').innerHTML = `<img src="${product.image}" alt="${product.name}">`;
            
            document.getElementById('editProductModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function closeEditProduct() {
    document.getElementById('editProductModal').style.display = 'none';
    editingProductId = null;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
}

async function saveProduct(event) {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('action', editingProductId ? 'updateProduct' : 'addProduct');
    if (editingProductId) formData.append('id', editingProductId);
    formData.append('name', document.getElementById('productName').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('gender', document.getElementById('productGender').value);
    formData.append('sizes', document.getElementById('productSizes').value);
    formData.append('in_stock', document.getElementById('productInStock').checked ? 1 : 0);
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('პროდუქტი შენახულია!');
            closeEditProduct();
            loadAdminProducts();
        } else {
            alert('შეცდომა: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('შეცდომა პროდუქტის შენახვისას');
    }
}

async function deleteProduct(productId) {
    if (!confirm('დარწმუნებული ხართ რომ გსურთ პროდუქტის წაშლა?')) return;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=deleteProduct&id=${productId}`
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('პროდუქტი წაშლილია');
            loadAdminProducts();
        } else {
            alert('შეცდომა: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('შეცდომა პროდუქტის წაშლისას');
    }
}

// Close modals on outside click
window.onclick = function(event) {
    const modals = ['productModal', 'adminLoginModal', 'editProductModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}