// --- GLOBAL STATE ---

// Simple utility to generate a unique ID
const generateUUID = () => {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return r.toString(16);
    });
};

// Application State
const state = {
    isAppReady: false,
    cart: [],
    wishlist: [],
    orders: [],
    // Product data (Static API response simulation)
    products: [
        { id: '1', name: 'Quantum Core Laptop', category: 'Laptops', price: 1999.99, rating: 4.8, description: 'The ultimate performance machine, built for speed and durability.', specs: 'CPU: Core I9, RAM: 32GB, Storage: 1TB NVMe, Display: 16" 4K OLED.', imageUrl: 'https://placehold.co/600x400/1e293b/a5f3fc?text=Laptop+Pro' },
        { id: '2', name: 'Sonic Wireless Headset', category: 'Accessories', price: 149.99, rating: 4.5, description: 'Immersive sound quality with industry-leading noise cancellation.', specs: 'Battery: 30 hours, Connectivity: Bluetooth 5.2, Weight: 250g.', imageUrl: 'https://placehold.co/600x400/1e293b/a5f3fc?text=Headset' },
        { id: '3', name: 'Ergonomic Mechanical Keyboard', category: 'Accessories', price: 99.99, rating: 4.7, description: 'Tactile typing experience designed for all-day comfort.', specs: 'Switches: Brown, Backlight: RGB, Connection: USB-C.', imageUrl: 'https://placehold.co/600x400/1e293b/a5f3fc?text=Keyboard' },
        { id: '4', name: 'Ultra-Slim Monitor (27")', category: 'Monitors', price: 399.99, rating: 4.6, description: 'Stunning visuals in a sleek, minimalist design.', specs: 'Resolution: 4K, Refresh Rate: 144Hz, Panel: IPS.', imageUrl: 'https://placehold.co/600x400/1e293b/a5f3fc?text=Monitor+4K' },
        { id: '5', name: 'High-Capacity Power Bank', category: 'Accessories', price: 49.99, rating: 4.4, description: 'Keep all your devices charged on the go with massive capacity.', specs: 'Capacity: 20000mAh, Ports: USB-C PD, USB-A QC.', imageUrl: 'https://placehold.co/600x400/1e293b/a5f3fc?text=Power+Bank' },
        { id: '6', name: 'Zenbook Pro', category: 'Laptops', price: 1299.00, rating: 4.1, description: 'Lightweight and powerful for creative professionals.', specs: 'CPU: Ryzen 7, RAM: 16GB, Storage: 512GB SSD, Display: 14" FHD.', imageUrl: 'https://placehold.co/600x400/1e293b/a5f3fc?text=Laptop+Light' }
    ],
    userProfile: {
        uid: localStorage.getItem('df_user_id') || generateUUID(),
        name: 'Guest User',
        email: 'guest@example.com',
    }
};

// --- LOCAL STORAGE HELPERS ---

function loadData() {
    // Ensure we have a persistent user ID
    if (!localStorage.getItem('df_user_id')) {
        localStorage.setItem('df_user_id', state.userProfile.uid);
    }

    try {
        const storedCart = localStorage.getItem('df_cart');
        const storedWishlist = localStorage.getItem('df_wishlist');
        const storedOrders = localStorage.getItem('df_orders');

        if (storedCart) state.cart = JSON.parse(storedCart);
        if (storedWishlist) state.wishlist = JSON.parse(storedWishlist);
        if (storedOrders) state.orders = JSON.parse(storedOrders);
    } catch (e) {
        console.error("Data load error", e);
        localStorage.clear(); // Reset if corrupted
    }
    state.isAppReady = true;
    updateCartCountUI();
}

function saveData(key) {
    if (key === 'cart') localStorage.setItem('df_cart', JSON.stringify(state.cart));
    if (key === 'wishlist') localStorage.setItem('df_wishlist', JSON.stringify(state.wishlist));
    if (key === 'orders') localStorage.setItem('df_orders', JSON.stringify(state.orders));
    updateCartCountUI();
}

// --- UI UTILITIES ---

function showMessage(message, type = 'info') {
    const box = document.getElementById('message-box');
    let colorClass = 'bg-blue-600';
    if (type === 'success') colorClass = 'bg-green-600';
    if (type === 'error') colorClass = 'bg-red-600';

    box.className = `fixed top-20 right-4 p-4 rounded-lg shadow-2xl z-[100] transition-transform duration-500 transform translate-x-full opacity-0 max-w-sm text-white ${colorClass}`;
    box.innerHTML = `<p class="font-bold">${type.toUpperCase()}</p><p class="mt-1">${message}</p>`;

    // Show
    setTimeout(() => {
        box.classList.remove('translate-x-full', 'opacity-0');
        box.classList.add('translate-x-0', 'opacity-100');
    }, 50);

    // Hide
    setTimeout(() => {
        box.classList.add('translate-x-full', 'opacity-0');
        box.classList.remove('translate-x-0', 'opacity-100');
    }, 4000);
}

function updateCartCountUI() {
    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = count;
    cartCountElement.classList.toggle('opacity-0', count === 0);
}

function getProductById(id) {
    return state.products.find(p => p.id === id);
}

// --- CORE ACTIONS ---

function addToCart(productId, quantity = 1) {
    const product = getProductById(productId);
    if (!product) return showMessage('Product not found.', 'error');

    const existingItem = state.cart.find(item => item.productId === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
        showMessage(`${product.name} quantity updated!`, 'success');
    } else {
        state.cart.push({
            cartId: generateUUID(),
            productId: productId,
            name: product.name,
            price: product.price,
            quantity: quantity,
            imageUrl: product.imageUrl
        });
        showMessage(`${product.name} added to cart!`, 'success');
    }
    saveData('cart');
}

function removeFromCart(cartId) {
    state.cart = state.cart.filter(item => item.cartId !== cartId);
    saveData('cart');
    renderCart(); // Re-render logic handled here for simplicity
    showMessage('Item removed.', 'info');
}

function addToWishlist(productId) {
    const product = getProductById(productId);
    if (state.wishlist.some(item => item.productId === productId)) {
        return showMessage('Already in Wishlist.', 'info');
    }
    state.wishlist.push({
        wishlistId: generateUUID(),
        productId: productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl
    });
    saveData('wishlist');
    showMessage('Added to Wishlist!', 'success');
}

function removeFromWishlist(wishlistId) {
    state.wishlist = state.wishlist.filter(item => item.wishlistId !== wishlistId);
    saveData('wishlist');
    renderWishlist();
    showMessage('Removed from Wishlist.', 'info');
}

function placeOrder() {
    if (state.cart.length === 0) return showMessage('Cart is empty!', 'error');

    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + 15.00; // Flat shipping
    const orderId = 'ORD-' + Math.floor(Math.random() * 1000000);

    const newOrder = {
        orderId: orderId,
        date: new Date().toISOString(),
        total: total,
        status: 'Processing',
        items: [...state.cart] // Copy cart items
    };

    state.orders.unshift(newOrder); // Add to beginning
    state.cart = []; // Clear cart
    
    saveData('orders');
    saveData('cart');

    showMessage('Order placed successfully!', 'success');
    navigate(`/confirmation/${orderId}`);
}

// --- ROUTING & PAGE RENDERING ---

const appContainer = document.getElementById('app-container');

function navigate(path) {
    window.location.hash = path;
    const cleanPath = path.replace('#', '');
    const parts = cleanPath.split('/').filter(p => p);
    const route = parts[0] || '';
    const param = parts[1] || '';

    appContainer.innerHTML = ''; // Clear current content
    window.scrollTo(0, 0);

    switch (route) {
        case '': renderHomepage(); break;
        case 'category': renderCategoryPage(decodeURIComponent(param)); break;
        case 'product': renderProductPage(param); break;
        case 'cart': renderCart(); break;
        case 'checkout': renderCheckoutPage(); break;
        case 'confirmation': renderConfirmationPage(param); break;
        case 'account': renderAccountDashboard(); break;
        case 'orders': renderOrderHistory(); break;
        case 'wishlist': renderWishlist(); break;
        case 'search': renderSearchPage(decodeURIComponent(param)); break;
        case 'login': renderLogin(); break;
        case 'register': renderRegister(); break;
        // Static Pages
        case 'about': renderAbout(); break;
        case 'contact': renderContact(); break;
        case 'faq': renderFAQ(); break;
        case 'terms': renderTerms(); break;
        case 'privacy': renderPrivacy(); break;
        case 'shipping-policy': renderShipping(); break;
        case 'return-policy': renderReturns(); break;
        default: render404();
    }
}

window.addEventListener('hashchange', () => navigate(window.location.hash.substring(1)));

// --- PAGE COMPONENTS ---

function renderHomepage() {
    const featured = state.products.slice(0, 4);
    appContainer.innerHTML = `
        <!-- Hero -->
        <section class="mb-12 rounded-xl overflow-hidden shadow-2xl relative h-96 w-full bg-cover bg-center" style="background-image: url('https://placehold.co/1200x500/101010/e0e0e0?text=Digital+Foundry+Experience');">
            <div class="bg-black bg-opacity-60 h-full flex items-center justify-center text-center p-8">
                <div>
                    <h1 class="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight mb-4">
                        <span class="text-accent-color">Innovate.</span> Elevate. Deliver.
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">High-performance tech for the modern professional.</p>
                    <button onclick="navigate('/category/Laptops')" class="btn-accent px-8 py-3 rounded-full text-lg shadow-lg">Shop Now</button>
                </div>
            </div>
        </section>

        <!-- Featured -->
        <section class="mb-12">
            <h2 class="text-3xl font-bold mb-8 text-center border-b border-zinc-700 pb-4">Featured Products</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                ${featured.map(p => createProductCard(p)).join('')}
            </div>
        </section>
    `;
}

function createProductCard(product) {
    return `
        <div class="card p-4 flex flex-col h-full">
            <div class="cursor-pointer" onclick="navigate('/product/${product.id}')">
                <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-48 object-cover rounded-md mb-4 border border-zinc-700 hover:opacity-90 transition">
                <h3 class="text-lg font-bold text-white mb-1 hover:text-accent-color transition">${product.name}</h3>
            </div>
            <p class="text-sm text-gray-400 mb-4 flex-grow">${product.description.substring(0, 60)}...</p>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xl font-bold text-accent-color">$${product.price}</span>
                <button class="btn-accent px-4 py-2 text-sm rounded-full" onclick="addToCart('${product.id}')">Add</button>
            </div>
        </div>
    `;
}

function renderCategoryPage(cat) {
    const items = state.products.filter(p => p.category === cat);
    appContainer.innerHTML = `
        <h1 class="text-4xl font-bold mb-8 border-b border-zinc-700 pb-4">${cat}</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${items.length ? items.map(p => createProductCard(p)).join('') : '<p class="text-gray-400">No products found.</p>'}
        </div>
    `;
}

function renderProductPage(id) {
    const product = getProductById(id);
    if (!product) return render404();
    
    appContainer.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fade-in">
            <div class="card p-2 rounded-xl">
                <img src="${product.imageUrl.replace('600x400', '800x600')}" class="w-full rounded-lg" alt="${product.name}">
            </div>
            <div>
                <span class="text-accent-color text-sm uppercase tracking-wider font-semibold">${product.category}</span>
                <h1 class="text-4xl font-extrabold mt-2 mb-4">${product.name}</h1>
                <p class="text-3xl font-bold text-white mb-6">$${product.price}</p>
                <p class="text-gray-300 mb-8 leading-relaxed">${product.description}</p>
                
                <div class="flex space-x-4 mb-8">
                    <button class="btn-accent flex-1 py-4 rounded-lg font-bold text-lg" onclick="addToCart('${product.id}')">Add to Cart</button>
                    <button class="bg-zinc-800 text-white px-6 rounded-lg border border-zinc-700 hover:bg-zinc-700" onclick="addToWishlist('${product.id}')">♥</button>
                </div>

                <div class="card p-6">
                    <h3 class="font-bold mb-2 text-lg">Tech Specs</h3>
                    <p class="text-sm text-gray-400 font-mono">${product.specs}</p>
                </div>
            </div>
        </div>
    `;
}

function renderCart() {
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsHtml = state.cart.map(item => `
        <div class="flex items-center justify-between p-4 bg-zinc-800 rounded-lg mb-4 border border-zinc-700">
            <div class="flex items-center">
                <img src="${item.imageUrl.replace('600x400', '100x100')}" class="w-16 h-16 rounded object-cover mr-4">
                <div>
                    <h4 class="font-bold cursor-pointer hover:text-accent-color" onclick="navigate('/product/${item.productId}')">${item.name}</h4>
                    <p class="text-sm text-gray-400">$${item.price} x ${item.quantity}</p>
                </div>
            </div>
            <div class="flex items-center">
                <span class="font-bold mr-4">$${(item.price * item.quantity).toFixed(2)}</span>
                <button class="text-red-400 hover:text-red-300" onclick="removeFromCart('${item.cartId}')">Remove</button>
            </div>
        </div>
    `).join('');

    appContainer.innerHTML = `
        <h1 class="text-4xl font-bold mb-8">Shopping Cart</h1>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                ${state.cart.length ? itemsHtml : '<p class="text-gray-400">Your cart is empty.</p>'}
            </div>
            <div class="card p-6 h-fit">
                <h3 class="text-xl font-bold mb-4 border-b border-zinc-700 pb-2">Summary</h3>
                <div class="flex justify-between mb-2 text-gray-300"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
                <div class="flex justify-between mb-4 text-gray-300"><span>Shipping</span><span>$15.00</span></div>
                <div class="flex justify-between font-bold text-xl text-white pt-2 border-t border-zinc-700"><span>Total</span><span>$${(subtotal + 15).toFixed(2)}</span></div>
                <button onclick="navigate('/checkout')" class="w-full btn-accent mt-6 py-3 rounded-lg font-bold" ${state.cart.length === 0 ? 'disabled style="opacity:0.5"' : ''}>Checkout</button>
            </div>
        </div>
    `;
}

function renderCheckoutPage() {
    if(state.cart.length === 0) { navigate('/cart'); return; }
    appContainer.innerHTML = `
        <h1 class="text-4xl font-bold mb-8">Checkout</h1>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="card p-8">
                <h2 class="text-xl font-bold mb-6 text-accent-color">Shipping Details</h2>
                <form onsubmit="event.preventDefault(); placeOrder();">
                    <input type="text" placeholder="Full Name" required class="w-full mb-4 p-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-accent-color outline-none">
                    <input type="email" placeholder="Email" required class="w-full mb-4 p-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-accent-color outline-none">
                    <input type="text" placeholder="Address" required class="w-full mb-4 p-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-accent-color outline-none">
                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <input type="text" placeholder="City" required class="p-3 bg-zinc-900 border border-zinc-700 rounded text-white">
                        <input type="text" placeholder="Zip" required class="p-3 bg-zinc-900 border border-zinc-700 rounded text-white">
                    </div>
                    
                    <h2 class="text-xl font-bold mb-6 text-accent-color mt-8">Payment (Simulated)</h2>
                    <div class="p-4 bg-zinc-900 rounded mb-6 text-sm text-gray-400">
                        This is a secure payment placeholder. No actual charge will be made.
                    </div>
                    <input type="text" placeholder="Card Number" class="w-full mb-4 p-3 bg-zinc-900 border border-zinc-700 rounded text-white">
                    
                    <button type="submit" class="w-full btn-accent py-4 rounded-lg font-bold text-lg mt-4">Place Order</button>
                </form>
            </div>
            <div class="card p-6 h-fit">
                <h3 class="font-bold mb-4">In Your Bag</h3>
                <ul class="text-sm text-gray-400 space-y-2">
                    ${state.cart.map(i => `<li class="flex justify-between"><span>${i.name} (x${i.quantity})</span><span>$${(i.price * i.quantity).toFixed(2)}</span></li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function renderConfirmationPage(orderId) {
    appContainer.innerHTML = `
        <div class="max-w-2xl mx-auto card p-12 text-center mt-10">
            <div class="text-green-500 text-6xl mb-4">✓</div>
            <h1 class="text-4xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p class="text-gray-400 mb-8">Thank you for your purchase. Your order ID is <span class="text-accent-color font-mono">${orderId}</span>.</p>
            <button onclick="navigate('/orders')" class="btn-accent px-8 py-3 rounded-lg">View Order History</button>
        </div>
    `;
}

function renderAccountDashboard() {
    appContainer.innerHTML = `
        <div class="max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold mb-8">My Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="card p-6 cursor-pointer hover:border-accent-color border border-transparent transition" onclick="navigate('/orders')">
                    <h3 class="text-xl font-bold mb-2">📦 Orders</h3>
                    <p class="text-gray-400 text-sm">View and track your order history.</p>
                </div>
                <div class="card p-6 cursor-pointer hover:border-accent-color border border-transparent transition" onclick="navigate('/wishlist')">
                    <h3 class="text-xl font-bold mb-2">♥ Wishlist</h3>
                    <p class="text-gray-400 text-sm">Manage your saved items.</p>
                </div>
                <div class="card p-6 cursor-pointer hover:border-accent-color border border-transparent transition" onclick="navigate('/addresses')">
                    <h3 class="text-xl font-bold mb-2">📍 Addresses</h3>
                    <p class="text-gray-400 text-sm">Update shipping locations.</p>
                </div>
            </div>
        </div>
    `;
}

function renderOrderHistory() {
    if(state.orders.length === 0) {
        appContainer.innerHTML = `<h1 class="text-3xl font-bold mb-8">Order History</h1><p class="text-gray-400">No orders found.</p>`;
        return;
    }
    appContainer.innerHTML = `
        <h1 class="text-3xl font-bold mb-8">Order History</h1>
        <div class="space-y-4">
            ${state.orders.map(o => `
                <div class="card p-6 flex justify-between items-center">
                    <div>
                        <p class="font-bold text-white">Order #${o.orderId}</p>
                        <p class="text-sm text-gray-400">${new Date(o.date).toLocaleDateString()} • ${o.items.length} Items</p>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-accent-color">$${o.total.toFixed(2)}</p>
                        <span class="text-xs bg-zinc-700 px-2 py-1 rounded text-gray-300">${o.status}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderWishlist() {
    if(state.wishlist.length === 0) {
        appContainer.innerHTML = `<h1 class="text-3xl font-bold mb-8">My Wishlist</h1><p class="text-gray-400">No saved items.</p>`;
        return;
    }
    appContainer.innerHTML = `
        <h1 class="text-3xl font-bold mb-8">My Wishlist</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${state.wishlist.map(item => `
                <div class="card p-4 relative">
                    <button class="absolute top-2 right-2 bg-red-900 text-white w-8 h-8 rounded-full z-10 hover:bg-red-700" onclick="removeFromWishlist('${item.wishlistId}')">×</button>
                    <img src="${item.imageUrl}" class="w-full h-40 object-cover rounded mb-4">
                    <h3 class="font-bold text-white mb-1">${item.name}</h3>
                    <p class="text-accent-color font-bold mb-4">$${item.price}</p>
                    <button class="w-full btn-accent py-2 rounded text-sm" onclick="addToCart('${item.productId}')">Move to Cart</button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderSearchPage(query) {
    const results = state.products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    appContainer.innerHTML = `
        <h1 class="text-3xl font-bold mb-8">Search Results: "${query}"</h1>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${results.length ? results.map(p => createProductCard(p)).join('') : '<p class="text-gray-400">No matches found.</p>'}
        </div>
    `;
}

// --- STATIC PAGES ---
function renderAbout() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">About Us</h1><p class="text-gray-300 leading-relaxed">Digital Foundry is a premier demo application showcasing modern e-commerce architecture.</p></div>`; }
function renderContact() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">Contact</h1><p class="text-gray-300">Email: support@digitalfoundry.com</p></div>`; }
function renderFAQ() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">FAQ</h1><p class="text-gray-300">Q: Is this real? <br>A: No, this is a portfolio showcase.</p></div>`; }
function renderTerms() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">Terms</h1><p class="text-gray-300">Placeholder terms of service.</p></div>`; }
function renderPrivacy() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">Privacy</h1><p class="text-gray-300">Placeholder privacy policy.</p></div>`; }
function renderShipping() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">Shipping</h1><p class="text-gray-300">Standard shipping: 5-7 business days.</p></div>`; }
function renderReturns() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-3xl font-bold mb-4">Returns</h1><p class="text-gray-300">30-day return policy.</p></div>`; }
function renderLogin() { appContainer.innerHTML = `<div class="max-w-md mx-auto card p-8 text-center"><h1 class="text-2xl font-bold mb-4">Login</h1><p class="text-gray-400">Simulation: You are auto-logged in as Guest.</p></div>`; }
function renderRegister() { appContainer.innerHTML = `<div class="max-w-md mx-auto card p-8 text-center"><h1 class="text-2xl font-bold mb-4">Register</h1><p class="text-gray-400">Registration is simulated.</p></div>`; }
function renderAddresses() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-2xl font-bold mb-4">Addresses</h1><p class="text-gray-400">123 Tech Lane, Innovation City (Default)</p></div>`; }
function renderPaymentMethods() { appContainer.innerHTML = `<div class="max-w-3xl mx-auto card p-8"><h1 class="text-2xl font-bold mb-4">Payment Methods</h1><p class="text-gray-400">Visa ending in 4242</p></div>`; }
function render404() { appContainer.innerHTML = `<div class="text-center p-20"><h1 class="text-6xl font-bold text-accent-color">404</h1><p class="text-xl mt-4">Page Not Found</p><button onclick="navigate('/')" class="btn-accent mt-8 px-6 py-2 rounded">Home</button></div>`; }

// --- INIT ---
window.onload = function() {
    loadData();
    navigate(window.location.hash.substring(1) || '/');
};