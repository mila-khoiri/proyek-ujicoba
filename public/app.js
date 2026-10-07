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

        if(!res.ok) {
            throw new Error(`Server error: ${res.status}`);
        }

        allProducts = await res.json();

        if(Array.isArray(allProducts)) {
            renderProducts(allProducts);
        } else {
            console.error('Data produk bukan array:', allProducts);
        }
    } catch(err) {
        console.error('Gagal mengambil data produk: ', err);
    }
}

function handleSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();

    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(keyword)
    );

    if(Array.isArray(filteredProducts)) {
        renderProducts(filteredProducts);
    }
}

function renderProducts(products) {
    const container = document.getElementById('product-list');

    if(!container) {
        console.warn("Elemen #product-list belum dimuat di DOM.");
        return;
    }

    if(!Array.isArray(products)) {
        console.error("Data yang dikirim ke renderProducts bukan Array:", products);
        return;
    }

    container.innerHTML = '';

    products.forEach(product => {
        const imgUrl = product.image || 'https://placehold.co/150';
        container.innerHTML += `
            <div class="card" style="width: 18rem; margin: 10px;">
                <img src="${imgUrl}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">Rp ${product.price}</p>
                    <p>${product.description}</p>
                </div>
            </div>
        `;
    });
}

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        const productListContainer = document.getElementById('product-list');
        if(!productListContainer) return;

        productListContainer.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; max-width: 200px;"/>
                <h3>${product.name}</h3>
                <p>Rp ${product.price}</p>
                <p>${product.description}</p>
            `;
            productListContainer.appendChild(card);
        });
    } catch(error) {
        console.error('Error loading products:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadProducts);

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image');

    if(!imageFile.files[0]) {
        alert('Silakan pilih foto terlebih dahulu!');
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('image', imageFile.files[0]);

    try {
        const token = localStorage.getItem('adminToken');

        const response = await fetch('/api/products', {
            method:'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        const data = await response.json();

        if(response.ok) {
            alert('Produk berhasil ditambahkan!');
            document.getElementById('addProductForm').reset();
            loadProducts();
        } else {
            const errData = await response.json();
            alert('Gagal menambah produk: ' + (data.error || 'Terjadi kesalahan'));
        }
    } catch(error) {
        console.error('Error uploading product: ', error);
        alert('Terjadi kesalahan saat upload.');
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

async function editProduct(id, currentName, currentPrice) {
    const newPrice = prompt(`Edit harga untuk "${currentName}":`, currentPrice);
    if(newPrice === null) return;

    const updatedData = {
        price: Number(newPrice)
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

async function editProduct(id, currentName, currentPrice) {
    const token = localStorage.getItem('adminToken');
    if(!token) return alert('Silakan login terlebih dahulu!');

    const newPrice = prompt(`Edit harga untuk "${currentName}":`, currentPrice);
    if(newPrice === null) return;

    const updatedData = {
        price: Number(newPrice)
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
