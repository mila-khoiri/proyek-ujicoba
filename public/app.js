let cart = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
});

async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch(err) {
        console.error('Gagal mengambil data produk: ', err);
    }
}

function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(keyword)
    );

    renderProducts(filteredProducts);
}

function renderProducts(products) {
    const productGrid = document.getElementById('productGrid');
    productGrid.innerHTML = '';

    if (products.length === 0) {
        productGrid.innerHTML = '<p style="grid-column: 1/-1; color: #64759c;">Produk tidak ditemukan.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p style="font-size: 0.85rem; color: #64748c;">${product.description}</p>
            <div class="price">Rp ${product.price.toLocaleString('id-ID')}</div>
            <p style="font-size: 0.8rem; margin-bottom: 8px;">Stok: ${product.stock}</p>

            <div style="display: flex; gap: 6px; flex-direction: column;">
                <button onclick= "addToCart('${product._id}', '${product.name}', ${product.price}, ${product.stock})">
                    + Keranjang
                </button>
                <div style="display: flex; gap: 6px;">
                    <button onclick="editProduct('${product._id}', '${product.name}', ${product.price}, ${product.stock})" style="background-color: #f59e1c; flex: 1;">
                        ✏️ Edit
                    </button>
                    <button onclick="deleteProduct('${product._id}')" style="background-color: #ef4455; flex: 1;">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

function addToCart(id, name, price, stock) {
    const existingItem = cart.find(item => item.product === id);

    if(existingItem) {
        if(existingItem.quantity >= stock) {
            alert('Stok produk tidak mencukupi!');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({product: id, name, price, quantity: 1});
    }

    updateCartUI();
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');

    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        count += item.quantity;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <div style="font-size: 0.85rem; color: #64748c;">
                    ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}
                </div>
                <button onclick="removeFromCart('${item.product}')" style="background:none; border:none; color:red; cursor:pointer;">✖️</button>
        `;
        cartItems.appendChild(div);
    });

    cartCount.innerText = count;
    cartTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.product !== id);
    updateCartUI();
}

document.getElementById('checkoutBtn').addEventListener('click', async() => {
    if(cart.length === 0) {
        alert('Keranjang belanja kamu masih kosong!');
        return;
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
        items: cart.map(item => ({product: item.product, quantity: item.quantity})),
        totalAmount
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(orderData)
        });

        if(res.ok) {
            alert('Pembelian berhasil! Terima kasih.');
            cart = [];
            updateCartUI();
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal checkout: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat checkout: ', err);
    }
});

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newProduct = {
        name: document.getElementById('name').value.trim(),
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        description: document.getElementById('description').value.trim()
    };

    try {
        const res = await fetch('/api/products', {
            method:'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newProduct)
        });

        if(res.ok) {
            alert('Produk berhasil ditambahkan!');
            document.getElementById('addProductForm').reset();
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal menambah produk: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat menambah produk: ', err);
    }
});

async function deleteProduct(id) {
    if(!confirm('Apakah kamu yakin ingin menghapus produk ini?')) return;

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        if(res.ok) {
            alert('Produk berhasil dihapus!');
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal menghapus: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat menghapus produk:', err);
    }
}

async function editProduct(id, currentName, currentPrice, currentStock) {
    const newPrice = prompt(`Edit harga untuk "${currentName}":`, currentPrice);
    if(newPrice === null) return;

    const newStock = prompt(`Edit stok untuk "${currentName}":`, currentStock);
    if(newStock === null) return;

    const updatedData = {
        price: Number(newPrice),
        stock: Number(newStock)
    };

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(updatedData)
        });

        if(res.ok) {
            alert('Produk berhasil diperbarui!');
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal mengedit produk: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat mengedit produk:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

function checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const userInfoContainer = document.getElementById('userInfoContainer');
    const adminProductForm = document.getElementById('adminProductForm');

    if(token) {
        loginFormContainer.style.display = 'none';
        userInfoContainer.style.display = 'flex';
        adminProductForm.style.display = 'block';
    } else {
        loginFormContainer.style.display = 'block';
        userInfoContainer.style.display = 'none';
        adminProductForm.style.display = 'none';
    }
}

document.getElementById('loginForm').addEventListener('submit', async(e) => {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value.trim();

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await res.json();

        if(res.ok && data.token) {
            localStorage.setItem('adminToken', data.token);
            alert('Login berhasil!');

            checkAuthStatus();
        } else {
            alert(data.message || 'Login gagal');
        }
    } catch(err) {
        console.error('Login error:', err);
    }
});

document.getElementById('registerBtn').addEventListener('click', async(e) => {
    e.preventDefault();

    const username = document.getElementById('authUsername').value;
    const password = document.getElementById('authPassword').value;

    if(!username || !password) {
        alert('Isi username dan password terlebih dahulu!');
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        const data = await res.json();
        alert(data.message);
    } catch(err) {
        console.error('Register error:', err);
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    checkAuthStatus();
    alert('Berhasil logout!');
});

document.getElementById('addProductForm').addEventListener('submit', async(e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');

    const newProduct = {
        name: document.getElementById('name').value.trim(),
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        imageUrl: document.getElementById('imageUrl').value.trim(),
        description: document.getElementById('description').value.trim(),
    };

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newProduct)
        });

        if(res.ok) {
            alert('Produk berhasil ditambahkan!');
            document.getElementById('addProductForm').reset();
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat menambahkan produk:', err);
    }
});

async function deleteProduct(id) {
    const token = localStorage.getItem('adminToken');
    if(!token) return alert('Silakan login terlebih dahulu!');

    if(!confirm('Yakin ingin menghapus produk ini?')) return;

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if(res.ok) {
            alert('Produk berhasil dihapus!');
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat menghapus produk:', err);
    }
}

async function editProduct(id, currentName, currentPrice, currentStock) {
    const token = localStorage.getItem('adminToken');
    if(!token) return alert('Silakan login terlebih dahulu!');

    const newPrice = prompt(`Edit harga untuk "${currentName}":`, currentPrice);
    if(newPrice === null) return;

    const newStock = prompt(`Edit stok untuk "${currentName}":`, currentStock);
    if(newStock === null) return;

    const updatedData = {
        price: Number(newPrice),
        stock: Number(newStock)
    };

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        if(res.ok) {
            alert('Produk berhasil diperbarui!');
            fetchProducts();
        } else {
            const errData = await res.json();
            alert(`Gagal mengedit produk: ${errData.message}`);
        }
    } catch(err) {
        console.error('Error saat mengedit produk:', err);
    }
}
