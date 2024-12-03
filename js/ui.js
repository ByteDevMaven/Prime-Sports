document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".slide");
    let currentIndex = 0;

    // Show the first slide
    slides[currentIndex].classList.add("active");

    setInterval(() => {
        // Remove the active class from the current slide
        slides[currentIndex].classList.remove("active");
        // Move to the next slide
        currentIndex = (currentIndex + 1) % slides.length;
        // Add the active class to the new current slide
        slides[currentIndex].classList.add("active");
    }, 3000); // Change slide every 3 seconds

    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
    });
});

function openImagePreview(productId) {
    const product = products.find(p => p.id === productId);
    const favoriteIds = getFavorites();
    
    if (!product) {
        console.error('Product not found');
        return;
    }

    const modal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewPrice = document.getElementById('preview-price');
    const sizeSelector = document.getElementById('size-selector');
    const addToCartButton = document.getElementById('add-to-cart');
    const addToFavoritesButton = document.getElementById('add-to-favorites');

    if (favoriteIds.includes(product.id)) {
        addToFavoritesButton.classList.add('hidden');
    }

    previewImage.src = product.image;
    previewImage.alt = product.name;
    previewTitle.textContent = product.name;
    previewDescription.textContent = product.description;
    previewPrice.textContent = `$${parseFloat(product.price).toFixed(2)}`;

    // Clear previous size options
    sizeSelector.innerHTML = '';

    // Add size options
    let stockData;
    try {
        stockData = JSON.parse(product.stock);
    } catch (error) {
        console.error('Error parsing stock data:', error);
        stockData = [];
    }

    if (Array.isArray(stockData) && stockData.length > 0) {
        stockData.forEach(sizeOption => {
            const option = document.createElement('option');
            option.value = sizeOption.size;
            option.textContent = `Size ${sizeOption.size}`;
            option.disabled = sizeOption.stock === 0;
            if (sizeOption.stock === 0) {
                option.classList.add('out-of-stock');
            }
            sizeSelector.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.textContent = 'No size data available';
        option.disabled = true;
        sizeSelector.appendChild(option);
    }

    addToCartButton.onclick = () => {
        const selectedSize = sizeSelector.value; // Get the selected size
        if (!selectedSize) {
            alert('Por favor selecciona una talla antes de agregar al carrito.');
            return;
        }
        addToCart(product.id, selectedSize); // Pass both product ID and size
    };

    addToFavoritesButton.onclick = () => addToFavorites(product.id);

    modal.style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('image-preview-modal').style.display = 'none';
});

function addToFavorites(productId) {
    // Retrieve existing favorites from the cookie
    let favorites = getFavorites();

    // Add the product ID if it’s not already in the list
    if (!favorites.includes(productId)) {
        favorites.push(productId);
        saveFavorites(favorites); // Save updated favorites back to the cookie
        showNotification(`¡Producto con ID ${productId} se agregó a favoritos!`);
    } else {
        showNotification('El producto ya está en favoritos.');
    }
}

// Retrieve favorites from cookie
function getFavorites() {
    const favoritesCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('favorites='));
    return favoritesCookie ? JSON.parse(favoritesCookie.split('=')[1]) : [];
}

// Save favorites to cookie
function saveFavorites(favorites) {
    document.cookie = `favorites=${JSON.stringify(favorites)}; path=/; max-age=31536000`; // 1-year expiration
}

window.addEventListener('click', (event) => {
    const modal = document.getElementById('image-preview-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Show the cart modal when the cart button is clicked
document.getElementById("cart-button").addEventListener("click", function () {
    document.getElementById("cart-dialog").showModal(); // Open the dialog as a modal
});

// Close the cart modal when the close button is clicked
document.getElementById("close-cart").addEventListener("click", function () {
    document.getElementById("cart-dialog").close(); // Close the dialog
});

document.getElementById('checkout-button').addEventListener('click', () => {
    document.getElementById('product-list').classList.toggle('hidden');
    document.getElementById('pagination').classList.toggle('hidden');
    document.getElementById('checkout').classList.toggle('hidden');
    document.getElementById('promo').classList.toggle('hidden');
    document.getElementById("cart-dialog").close(); // Close the dialog
});

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('checkout').classList.add('hidden');
    document.getElementById('loader').classList.remove('hidden');
    // document.getElementById('submit').disabled = true;

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
            throw new Error(`Response status: ${response.status}`);
        }

        //alert(`Thank you for your order, ${orderData.name}! Your purchase is complete.`);
        showNotification(`¡Orden Confirmada! Correo enviado a: ${orderData.email}`, 'success', 9000);
        cart = [];
        updateCartCount();
        renderCart();
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('promo').classList.remove('hidden');
        document.getElementById('product-list').classList.remove('hidden');
        document.getElementById('pagination').classList.remove('hidden');
        document.getElementById('checkout-form').reset();
    } catch (error) {
        //alert('There was an error processing your order. Please try again.');
        document.getElementById('loader').classList.add('hidden');
        document.getElementById('checkout').classList.remove('hidden');
        showNotification('¡No se pudo procesar la orden!', 'error', 100000);
        console.error('Order submission error:', error.message);
    }
});

async function sendOrderData(orderData) {
    const url = 'https://script.google.com/macros/s/AKfycbx7JVcLRmEM91HAqdVXsIOeHlB_j48XpQtY1o3C43jPoF1pFTOz8HMgkVFKjl75WMG3/exec';
    const response = await fetch(url, {
        redirect: 'follow',
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
    });
    return response;
}
