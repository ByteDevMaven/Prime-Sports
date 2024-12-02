function updatePagination() {
    const totalItems = searchActive ? filteredProducts.length : products.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const paginationNumbers = document.getElementById('pagination-numbers');

    paginationNumbers.innerHTML = '';
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('button');
        pageLink.textContent = i;
        pageLink.classList.add('page-number');
        if (i === currentPage) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', () => {
            currentPage = i;
            renderProducts(currentPage);
            updatePagination();
        });
        paginationNumbers.appendChild(pageLink);
    }

    window.scrollTo({ top: 0 }); //, behavior: 'smooth' 

    pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
}

document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts(currentPage);
        updatePagination();
    }
});

document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts(currentPage);
        updatePagination();
    }
});
