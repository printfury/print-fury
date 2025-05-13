const WHATSAPP_NUMBER = '+916296890366'; // Replace with your WhatsApp number for product inquiries
const GOOGLE_FORM_URL = 'https://forms.gle/gRCk8u6wT9ZddMdH6'; // Replace with your Google Form URL for customization

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('trending-products-grid')) {
        loadProducts('trending');
    }
    if (document.getElementById('category-circles')) {
        displayCategories();
    }
    if (document.getElementById('all-products-grid')) {
        loadProductsAndSetupFilter();
    }

    document.body.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('buy-now-button') && target.closest('.product-grid')) {
            const productName = target.dataset.productName;
            const productPrice = target.dataset.productPrice;
            const message = `Hello, I'm interested in purchasing the "${productName}" priced at ₹${productPrice}. Please provide more details or guide me on how to proceed.`;
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } else if (target.classList.contains('customize-form-button')) {
            window.open(GOOGLE_FORM_URL, '_blank');
        }
    });

    // Header scroll behavior
    let lastScrollTop = 0;
    const header = document.querySelector('header');

    if (header) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > header.offsetHeight) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }

            lastScrollTop = scrollTop;
        });
    }
});

async function loadProductsAndSetupFilter() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const products = await response.json();
        setupProductFilter(products);
    } catch (error) {
        console.error('Error loading products for filter setup:', error);
        const gridElement = document.getElementById('all-products-grid');
        if (gridElement) {
            gridElement.innerHTML = '<p style="text-align:center; color: red;">Error loading products for filtering.</p>';
        }
    }
}

async function loadProducts(type) {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const products = await response.json();
        let productsToDisplay = [];

        if (type === 'trending') {
            productsToDisplay = products.slice(0, 8);
            displayProducts(productsToDisplay, 'trending-products-grid');
        }
    } catch (error) {
        console.error(`Error loading ${type} products:`, error);
        const gridElement = document.getElementById('trending-products-grid');
        if (gridElement) {
            gridElement.innerHTML = '<p style="text-align:center; color: red;">Error loading products. Please try again later.</p>';
        }
    }
}

function displayProducts(products, elementId) {
    const gridElement = document.getElementById(elementId);
    if (!gridElement) return;

    gridElement.innerHTML = '';
    if (products.length === 0) {
        gridElement.innerHTML = '<p style="text-align:center;">No products found in this category.</p>';
        return;
    }

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        productDiv.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">₹${product.price}</p>
            <button class="buy-now-button" data-product-name="${product.name}" data-product-price="${product.price}">Buy Now</button>
        `;
        gridElement.appendChild(productDiv);
    });
}

function displayCategories() {
    const categories = [
        { name: "Cup", image: "images/cup.jpg" },
        { name: "Bottle", image: "images/bottle.jpg" },
        { name: "Tshirt", image: "images/tshirt.jpg" },
        { name: "Mousepad", image: "images/mousepad.jpg" },
        { name: "Cap", image: "images/cap.jpg" },
        { name: "Custom", image: "images/custom.png" }
    ];

    const container = document.getElementById('category-circles');
    if (!container) return;

    categories.forEach(category => {
        const categoryLink = document.createElement('a');
        categoryLink.href = category.name === 'Custom' ? GOOGLE_FORM_URL : `products.html?category=${category.name.toLowerCase()}`;
        if (category.name === 'Custom') {
            categoryLink.target = '_blank';
            categoryLink.classList.add('custom-category-circle');
        }
        categoryLink.classList.add('category-circle');

        const img = document.createElement('img');
        img.src = category.image;
        img.alt = `${category.name} Category`;

        const p = document.createElement('p');
        p.textContent = category.name;

        categoryLink.appendChild(img);
        categoryLink.appendChild(p);
        container.appendChild(categoryLink);
    });
}

function setupProductFilter(products) {
    const categoryFilter = document.getElementById('category-filter');
    const allProductsGrid = document.getElementById('all-products-grid');

    if (!categoryFilter || !allProductsGrid || !products) {
        console.error('Filter setup failed: Missing elements or products data.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('category');
    let categoryToFilter = 'all';

    if (initialCategory) {
        const lowerCaseInitialCategory = initialCategory.toLowerCase();
        const isValidCategory = Array.from(categoryFilter.options).some(option => option.value === lowerCaseInitialCategory);
        if (isValidCategory) {
            categoryToFilter = lowerCaseInitialCategory;
            categoryFilter.value = categoryToFilter;
        } else {
            console.warn(`Invalid category "${initialCategory}" in URL. Defaulting to "all".`);
        }
    } else {
        categoryFilter.value = 'all';
    }

    filterProducts(categoryToFilter, products);

    categoryFilter.addEventListener('change', (event) => {
        const selectedCategory = event.target.value;
        filterProducts(selectedCategory, products);
    });
}

function filterProducts(category, products) {
    const allProductsGrid = document.getElementById('all-products-grid');
    if (!allProductsGrid || !products) {
        console.error('Filtering failed: Missing grid element or products data.');
        return;
    }

    if (category === 'own customization') {
        allProductsGrid.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 40px 20px;">
                <p style="font-size: 1.2em; margin-bottom: 20px;">Interested in a custom product? Fill out our form to tell us about your idea!</p>
                <a href="${GOOGLE_FORM_URL}" target="_blank" class="customize-form-button" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Fill Customization Form</a>
            </div>
        `;
        return;
    }

    const filteredProducts = category === 'all'
        ? products
        : products.filter(product => product.category && product.category.toLowerCase() === category.toLowerCase());

    displayProducts(filteredProducts, 'all-products-grid');
}
