// Fetch products when the page loads
window.onload = fetchProducts;

let cart = [];
let products = [];
let currentPage = 1;
const itemsPerPage = 8;

// Get the cart dialog and cart button elements
const cartDialog = document.getElementById("cart-dialog");
const cartButton = document.getElementById("cart-button");
const closeCartButton = document.getElementById("close-cart");

let filteredProducts = [];  // Store filtered products separately
let searchActive = false;   // Track if search is active

// Show the cart modal when the cart button is clicked
cartButton.addEventListener("click", function () {
    cartDialog.showModal(); // Open the dialog as a modal
});

// Close the cart modal when the close button is clicked
closeCartButton.addEventListener("click", function () {
    cartDialog.close(); // Close the dialog
});


// Function to fetch products from Google Script
async function fetchProducts() {
    try {
        // Replace with your actual Google Script web app URL
        const response = await fetch('https://script.google.com/macros/s/AKfycbx7JVcLRmEM91HAqdVXsIOeHlB_j48XpQtY1o3C43jPoF1pFTOz8HMgkVFKjl75WMG3/exec');
        products = await response.json();
        renderProducts(currentPage);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

document.getElementById("search-input").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        searchProducts();
    }
});

function searchProducts() {
    const searchInput = document.getElementById('search-input').value.toLowerCase();
    if (searchInput) {
        filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchInput)
        );
        searchActive = true;  // Indicate search mode
    } else {
        filteredProducts = [];
        searchActive = false; // Exit search mode
    }

    currentPage = 1;  // Reset to the first page of results
    renderProducts(currentPage);  // Call the unified render function
}

function renderProducts(page) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const items = searchActive ? filteredProducts : products;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = items.slice(startIndex, endIndex);

    if (pageProducts.length === 0) {
        productList.innerHTML = '<p>No products found.</p>';
        return;
    }

    pageProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onclick="openImagePreview(${product.id})">
            <h3>${product.name}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})" class="btn btn-primary">Add to Cart</button>
        `;
        productList.appendChild(productElement);
    });

    updatePagination();
}

function updatePagination() {
    const totalItems = searchActive ? filteredProducts.length : products.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pageInfo.textContent = `Pagina ${currentPage} de ${totalPages}`;
}


function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCartCount();
    renderCart();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(index) {
    const removedProduct = cart[index];
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
    showNotification(`${removedProduct.name} removed from cart!`);
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutTotal = document.getElementById('checkout-total');

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <span>${item.name} - $${item.price}</span>
            <button onclick="removeFromCart(${index})" class="btn">Quitar</button>
        `;
        cartItems.appendChild(cartItem);
        total += item.price;
    });

    cartTotal.textContent = `Total: $${total}`;
    checkoutTotal.textContent = `Total: $${total}`;
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '15px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function openImagePreview(productId) {
    const product = products.find(p => p.id === productId);
    const modal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewPrice = document.getElementById('preview-price');

    previewImage.src = product.image;
    previewImage.alt = product.name;
    previewTitle.textContent = product.name;
    previewDescription.textContent = product.description;
    previewPrice.textContent = `$${product.price}`;

    modal.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('image-preview-modal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('image-preview-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

document.getElementById('checkout-button').addEventListener('click', () => {
    document.getElementById('product-list').classList.toggle('hidden');
    document.getElementById('pagination').classList.toggle('hidden');
    document.getElementById('checkout').classList.toggle('hidden');
    document.getElementById('promo').classList.toggle('hidden');
    cartDialog.close(); // Close the dialog
});

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const orderData = {
        name: formData.get('name'),
        email: formData.get('email'),
        address: formData.get('address'),
        dni: formData.get('dni'),
        items: cart.map(item => ({ name: item.name, price: item.price })),
        total: cart.reduce((sum, item) => sum + item.price, 0)
    };

    try {
        const response = await sendOrderData(orderData);
        if (!response.ok) {
            console.log(response);
            throw new Error(`Response status: ${response.status}`);
        }

        alert(`Thank you for your order, ${orderData.name}! Your purchase is complete.`);
        cart = [];
        updateCartCount();
        renderCart();
        document.getElementById('checkout').classList.add('hidden');
        document.getElementById('promo').classList.toggle('hidden');
        document.getElementById('product-list').classList.remove('hidden');
        document.getElementById('checkout-form').reset();
    } catch (error) {
        alert('There was an error processing your order. Please try again.');
        console.error('Order submission error:', error.message);
    }
});

async function sendOrderData(orderData) {
    const url = 'https://script.google.com/macros/s/AKfycbx7JVcLRmEM91HAqdVXsIOeHlB_j48XpQtY1o3C43jPoF1pFTOz8HMgkVFKjl75WMG3/exec'; // Replace with your actual API endpoint 
    const response = await fetch(url, {
        redirect: 'follow',
        method: 'POST',
        body: JSON.stringify(orderData),
        //mode: "no-cors",
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
    });
    return response;
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts(currentPage);
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts(currentPage);
    }
});