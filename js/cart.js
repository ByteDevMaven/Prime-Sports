let cart = [];

function addToCart(productId, selectedSize) {
    const product = products.find(p => p.id === productId);
    product.selectedSize = selectedSize;
    cart.push(product);
    updateCartCount();
    renderCart();
    showNotification(`¡${product.name} se agrego al carrito!`);
}

function removeFromCart(index) {
    const removedProduct = cart[index];
    cart.splice(index, 1);
    updateCartCount();
    renderCart();
    showNotification(`¡${removedProduct.name} se quito del carrito!`);
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
            <span>${item.name} - $${item.price} - Talla: ${item.selectedSize}</span>
            <button onclick="removeFromCart(${index})" class="btn">Quitar</button>
        `;
        cartItems.appendChild(cartItem);
        total += item.price;
    });

    cartTotal.textContent = `Total: $${total}`;
    checkoutTotal.textContent = `Total: $${total}`;
}
