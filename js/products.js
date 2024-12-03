let products = [];
let filteredProducts = [];
let searchActive = false;
const itemsPerPage = 8;
let currentPage = 1;

async function fetchProducts() {
    const loader = document.getElementById('loader');
    const productList = document.getElementById('product-list');
    const errorContainer = document.getElementById('error-container');

    loader.classList.remove('hidden');
    productList.classList.add('hidden');
    errorContainer.classList.add('hidden');

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbx7JVcLRmEM91HAqdVXsIOeHlB_j48XpQtY1o3C43jPoF1pFTOz8HMgkVFKjl75WMG3/exec');
        if (!response.ok) {
            console.log(response);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        products = await response.json();

        loader.classList.add('hidden');
        productList.classList.remove('hidden');

        renderProducts(currentPage);
    } catch (error) {
        console.log(response);
        loader.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        displayErrorMessage(error);
    }
}

function displayErrorMessage(error) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryButton = document.getElementById('retry-button');

    errorMessage.textContent = `Error: ${error.message} | Name: ${error.name}`;
    errorContainer.classList.remove('hidden');

    retryButton.addEventListener('click', () => {
        errorContainer.classList.add('hidden');
        fetchProducts();
    });
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
        searchActive = true;
    } else {
        filteredProducts = [];
        searchActive = false;
    }

    renderProducts();
}

function getProductsForCurrentPage() {
    const items = searchActive ? filteredProducts : products;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
}

function renderProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    const productsForPage = getProductsForCurrentPage();
    if (productsForPage.length === 0) {
        productList.innerHTML = '<p>No se econtro ningun producto.</p>';
        return;
    }

    productsForPage.forEach(product => {
        const productElement = createProductElement(product);
        productList.appendChild(productElement);
    });

    updatePagination();
}

function renderFavorites() {
    const favList = document.getElementById('fav-list');
    favList.innerHTML = '';

    const favoriteIds = getFavorites();
    if (favoriteIds.length === 0) {
        favList.innerHTML = '<p>No hay productos en favoritos.</p>';
        return;
    }

    const favoriteProducts = products.filter(product => favoriteIds.includes(product.id));
    favoriteProducts.forEach(product => {
        const productElement = createProductElement(product);
        favList.appendChild(productElement);
    });
}


function createProductElement(product) {
    const productElement = document.createElement('div');
    const favoriteIds = getFavorites();

    productElement.className = 'product';

    // Add discount ribbon if discount is greater than 0
    if (product.discount > 0) {
        const discountRibbon = document.createElement('div');
        discountRibbon.className = 'discount-ribbon';
        discountRibbon.textContent = `${product.discount}% OFF`;
        productElement.appendChild(discountRibbon);
    }

    productElement.innerHTML += `
        <img src="${product.image}" alt="${product.name}" onclick="openImagePreview(${product.id})">
        <h3>${product.name}</h3>
        <p>$${product.price}</p>
    `;

    if (!favoriteIds.includes(product.id)) {
        const favoritesButton = document.createElement('button');
        favoritesButton.textContent = 'Favoritos';
        favoritesButton.className = 'btn btn-primary';
        favoritesButton.onclick = () => addToFavorites(product.id);
        productElement.appendChild(favoritesButton);
    }

    return productElement;
}
