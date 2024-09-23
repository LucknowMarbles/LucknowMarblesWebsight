document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const contactForm = document.getElementById('contact-form');

    if (!contactForm) {
        console.error('Contact form not found');
        return;
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const message = formData.get('message');

        console.log('Form submitted:', { name, email, message });

        // Clear the form
        contactForm.reset();

        // Show a success message
        alert('Message sent successfully!');
    });
});

// Add this at the end of the file
console.log('JavaScript file loaded');

// Sample product data (in a real application, this would come from a server)
const products = [
    { id: 1, name: 'Marble Tile A', price: 100, image: 'tile-a.jpg', quantity: 500 },
    { id: 2, name: 'Granite Slab B', price: 200, image: 'slab-b.jpg', quantity: 300 },
    // Add more products...
];

// Function to load products
function loadProducts() {
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product-item');
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <p>Available: ${product.quantity}</p>
            <button onclick="addProductToQuote(${product.id})">Get Quote</button>
        `;
        productList.appendChild(productElement);
    });
}

// Function to add a product to the quote form
function addProductToQuote(productId) {
    const product = products.find(p => p.id === productId);
    const quoteProducts = document.getElementById('quote-products');
    
    const productField = document.createElement('div');
    productField.classList.add('quote-product');
    productField.innerHTML = `
        <p>${product.name}</p>
        <input type="hidden" name="product_id[]" value="${product.id}">
        <label for="quantity-${product.id}">Quantity:</label>
        <input type="number" id="quantity-${product.id}" name="quantity[]" min="1" max="${product.quantity}" required>
    `;
    quoteProducts.appendChild(productField);
}

// Function to add an empty product field
function addProductField() {
    const quoteProducts = document.getElementById('quote-products');
    
    const productField = document.createElement('div');
    productField.classList.add('quote-product');
    productField.innerHTML = `
        <label for="product-name">Product Name:</label>
        <input type="text" name="product_name[]" required>
        <label for="quantity">Quantity:</label>
        <input type="number" name="quantity[]" min="1" required>
    `;
    quoteProducts.appendChild(productField);
}

// Handle quote form submission
document.getElementById('quote-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        if (!data[key]) {
            data[key] = [];
        }
        data[key].push(value);
    });
    
    console.log('Quote request submitted:', data);

    try {
        const response = await fetch('http://localhost:3000/api/quotes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Quote request submitted successfully!');
            this.reset();
        } else {
            const errorData = await response.json();
            console.error('Failed to submit quote request:', errorData);
            alert('Failed to submit quote request.');
        }
    } catch (error) {
        console.error('Error submitting quote request:', error);
        alert('An error occurred while submitting the quote request.');
    }
});

// Load products when the page loads
window.addEventListener('load', loadProducts);

// Handle contact form submission
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Implement form submission logic here
    console.log('Form submitted');
});

// Initialize Google Maps
function initMap() {
    // Implement Google Maps initialization here
}

// Fetch products from the server
async function fetchProducts() {
    const response = await fetch('http://localhost:3000/api/products');
    const products = await response.json();
    return products;
}

// Load products when the page loads
window.addEventListener('load', async () => {
    const products = await fetchProducts();
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product-item');
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <p>Available: ${product.quantity}</p>
            <button onclick="addProductToQuote(${product._id})">Get Quote</button>
        `;
        productList.appendChild(productElement);
    });
});

// Fetch quotes from the server
async function fetchQuotes() {
    const response = await fetch('http://localhost:3000/api/quotes');
    const quotes = await response.json();
    return quotes;
}

// Example usage: Log quotes to the console
window.addEventListener('load', async () => {
    const quotes = await fetchQuotes();
    console.log('Quotes:', quotes);
});