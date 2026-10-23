let allProducts = [];
let currentPage = 1;
const itemsPerPage = 4;

function renderProductCards(productsToRender) {
    const productListContainer = document.getElementById('product-list');
    if(!productListContainer) return;
    productListContainer.innerHTML = '';

    const token = localStorage.getItem('adminToken');

    if(productsToRender.length === 0) {
        productListContainer.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Produk tidak ditemukan.</p>';
        const paginationContainer = document.getElementById('pagination-container');
        if(paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = productsToRender.slice(startIndex, endIndex);

    paginatedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        let productHtml = `
            <img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; max-width: 200px;"/>
            <h3>${product.name}</h3>
            <p>Rp ${product.price}</p>
            <p>${product.description}</p>
        `;

        if(token && token !== "undefined" && token.trim() !== "") {
            productHtml += `
                <div class="admin-actions" style="margin-top: 10px;">
                    <button onclick="openEditModal('${product._id}', '${product.name}', ${product.price}, '${product.description}', '${product.imageUrl}')" style="margin-right: 5px;">Edit</button>
                    <button onclick="deleteProduct('${product._id}')" class="btn-delete" style="background-color: red; color: white;">Hapus</button>
                </div>
            `;
        }

        card.innerHTML = productHtml;
        productListContainer.appendChild(card);
    });

    renderPaginationButtons(productsToRender.length);
}

function renderPaginationButtons(totalItems) {
    const paginationContainer = document.getElementById('pagination-container');
    if(!paginationContainer) {
        console.log("Elemen pagination-container tidak ditemukan di HTML!");
        return;
    }

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    console.log("Total item:", totalItems, "| Total halaman:", totalPages);

    if(totalPages <= 1) return;

    for(let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.style.padding = '6px 12px';
        btn.style.cursor = 'pointer';
        btn.style.borderRadius = '4px';
        btn.style.border = '1px solid #ddd';

        if(i === currentPage) {
            btn.style.backgroundColor = '#118c00';
            btn.style.color = '#white';
            btn.style.borderColor = '#118c00';
        } else {
            btn.style.backgroundColor = '#555';
            btn.style.color = '#777';
        }

        btn.addEventListener('click', () => {
            console.log("Tombol halaman diklik, pindah ke halaman:", i);
            currentPage = 1;

            const searchInputElem = document.getElementById('searchInput');
            const keyword = searchInputElem ? searchInputElem.value.toLowerCase().trim() : '';

            const filtered = allProducts.filter(p => 
                p.name.toLowerCase().includes(keyword) ||
                p.description.toLowerCase().includes(keyword)
            );

            renderProductCards(filtered);
            window.scrollTo({top: 0, behavior: 'smooth'});
        });

        paginationContainer.appendChild(btn);
    }
}

async function loadProducts() {
    const productListContainer = document.getElementById('product-list');
    if(!productListContainer) return;

    productListContainer.innerHTML = '<p style="text-align: center; color: #777;">Sedang memuat produk...</p>';

    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        allProducts = products;

        renderProductCards(allProducts);

    } catch(error) {
        console.error('Error loading products:', error);
        productListContainer.innerHTML = '<p style="text-align: center; color: red;">Gagal memuat produk. Silakan coba lagi.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();

    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();

            currentPage = 1;

            const filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(keyword) ||
                product.description.toLowerCase().includes(keyword)
            );

            renderProductCards(filteredProducts);
        });
    }
});

const addProductForm = document.getElementById('addProductForm');
if(addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = addProductForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerText : 'Tambah Produk';

        if(submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = 'Sedang mengunggah...';
        }

        const name = document.getElementById('name').value;
        const price = document.getElementById('price').value;
        const description = document.getElementById('description').value;
        const imageFile = document.getElementById('image');

        if(!imageFile.files[0]) {
            alert('Silakan pilih foto terlebih dahulu!');
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
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
                body: formData
            });

            if(response.ok) {
                alert('Produk berhasil ditambahkan!');
                addProductForm.reset();

                const imagePreview = document.getElementById('imagePreview');
                if(imagePreview) {
                    imagePreview.src = '';
                    imagePreview.style.display = 'none';
                }

                loadProducts();
            } else {
                const errData = await response.json();
                alert(`Gagal: ${errData.message || errData.error}`);
            }
        } catch(error) {
            console.error('Error uploading product: ', error);
            alert('Terjadi kesalahan saat upload.');
        } finally {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText; 
            }
        }
    });
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
            loadProducts();
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
    loadProducts();
});

async function deleteProduct(id) {
    if(!confirm('Apakah kamu yakin ingin menghapus produk ini?')) return;

    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if(res.ok) {
            alert('Produk berhasil dihapus!');
            loadProducts();
        } else {
            const err = await res.json();
            alert(`Gagal menghapus: ${err.message}`);
        }
    } catch(error) {
        console.error('Error deleting product:', error);
        alert('Terjadi kesalahan saat menghapus produk.');
    }
}

async function editProduct(id, currentName, currentPrice, currentDescription) {
    const newName = prompt('Nama baru:', currentName) || currentName;
    const newPrice = prompt('Harga baru:', currentPrice) || currentPrice;
    const newDescription = prompt('Deskripsi baru:', currentDescription) || currentDescription;

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('price', newPrice);
    formData.append('description', newDescription);

    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if(res.ok) {
            alert('Produk berhasil diperbarui!');
            loadProducts();
        } else {
            const err = await res.json();
            alert(`Gagal memperbarui: ${err.message}`);
        }
    } catch(error) {
        console.error('Error updating product:', error);
    }
}

function openEditModal(id, name, price, description, imageUrl) {
    document.getElementById('editProductId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editPrice').value = price;
    document.getElementById('editDescription').value = description;

    const editImagePreview = document.getElementById('editImagePreview');
    if(editImagePreview && imageUrl) {
        editImagePreview.src = imageUrl;
        editImagePreview.style.display = 'block';
    }

    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editProductForm').reset();
}

document.getElementById('editProductForm').addEventListener('submit', async(e) => {
    e.preventDefault();

    const id = document.getElementById('editProductId').value;
    const name = document.getElementById('editName').value;
    const price = document.getElementById('editPrice').value;
    const description = document.getElementById('editDescription').value;
    const imageFile = document.getElementById('editImage').files[0];

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);

    if(imageFile) {
        formData.append('image', imageFile);
    }

    const token = localStorage.getItem('adminToken');

    try {
        const res = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if(res.ok) {
            alert('Produk berhasil diperbarui!');
            closeEditModal();

            const editImagePreview = document.getElementById('imagePreview');
            if(editImagePreview) {
                editImagePreview.src = '';
                editImagePreview.style.display = 'none';
            }

            loadProducts();
        } else {
            const err = await res.json();
            alert(`Gagal update: ${err.message || err.error}`);
        }
    } catch(error) {
        console.error('Error updating product:', error);
    }
});

const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');

if(imageInput && imagePreview) {
    imageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if(file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }

            reader.readAsDataURL(file);
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    });
}

const editImageInput = document.getElementById('editImage');
const editImagePreview = document.getElementById('editImagePreview');

if(editImageInput && editImagePreview) {
    editImageInput.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if(file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                editImagePreview.src = e.target.result;
                editImagePreview.style.display = 'block';
            }

            reader.readAsDataURL(file);
        } else {
            editImagePreview.src = '';
            editImagePreview.style.display = 'none';
        }
    });
}