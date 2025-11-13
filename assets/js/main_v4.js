// Nona Beauty - Main JavaScript
class NonaBeautyApp {
    constructor() {
        this.currentLanguage = 'ar';
        this.currentTheme = 'light';
        this.cart = [];
        this.products = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProducts();
        this.updateCartCount();
        this.loadPreferences();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Language toggle
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => this.toggleLanguage());
        }

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Cart functionality
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) {
            cartBtn.addEventListener('click', () => this.openCart());
        }

        const closeCart = document.getElementById('closeCart');
        if (closeCart) {
            closeCart.addEventListener('click', () => this.closeCart());
        }

        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSidebar = document.getElementById('cartSidebar');
            const cartBtn = document.getElementById('cartBtn');
            if (cartSidebar && cartSidebar.classList.contains('open') && 
                !cartSidebar.contains(e.target) && 
                !cartBtn.contains(e.target)) {
                this.closeCart();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        localStorage.setItem('nona-theme', this.currentTheme);
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.textContent = this.currentLanguage === 'ar' ? 'EN' : 'AR';
        }
        
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        localStorage.setItem('nona-language', this.currentLanguage);
        
        this.updateContentLanguage();
    }

    updateContentLanguage() {
        console.log('Updating content for language:', this.currentLanguage);
        // Here you would typically update all text content based on language
    }

    toggleMobileMenu() {
        const nav = document.getElementById('mainNav');
        const menuBtn = document.getElementById('mobileMenuBtn');
        
        nav.classList.toggle('mobile-open');
        const isOpen = nav.classList.contains('mobile-open');
        
        if (menuBtn) {
            menuBtn.setAttribute('aria-expanded', isOpen);
            const icon = menuBtn.querySelector('i');
            if (icon) {
                icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
            }
        }
    }

    openCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.add('open');
            this.renderCartItems();
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        if (cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    }

    addToCart(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        this.updateCartCount();
        this.saveCart();
        this.showNotification('تم إضافة المنتج إلى عربة التسوق', 'success');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.updateCartCount();
        this.saveCart();
        this.renderCartItems();
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const countElement = document.querySelector('.cart-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light);">عربة التسوق فارغة</p>';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="placeholder-image" style="width: 80px; height: 80px;">
                    <i class="fas fa-image"></i>
                </div>
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        <button class="btn remove-btn" data-id="${item.id}" style="margin-right: auto;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        cartItems.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.updateQuantity(id, -1);
            });
        });

        cartItems.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.updateQuantity(id, 1);
            });
        });

        cartItems.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.removeFromCart(id);
            });
        });

        this.updateCartTotal();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id == productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.updateCartCount();
                this.saveCart();
                this.renderCartItems();
            }
        }
    }

    updateCartTotal() {
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    }

    saveCart() {
        localStorage.setItem('nona-cart', JSON.stringify(this.cart));
    }

    loadCart() {
        const savedCart = localStorage.getItem('nona-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartCount();
        }
    }

    async loadProducts() {
        try {
            // Sample products data
            this.products = [
                {
                    id: 1,
                    title: "عطر إيليكسير",
                    price: 150,
                    old_price: 200,
                    category: "Fragrance",
                    image: "assets/images/products/perfume1.jpg",
                    rating: 4.5
                },
                {
                    id: 2,
                    title: "كريم نورش",
                    price: 80,
                    old_price: 100,
                    category: "Skincare",
                    image: "assets/images/products/cream1.jpg",
                    rating: 4.0
                },
                {
                    id: 3,
                    title: "سيروم جلو",
                    price: 95,
                    old_price: 0,
                    category: "Skincare",
                    image: "assets/images/products/serum1.jpg",
                    rating: 4.8
                },
                {
                    id: 4,
                    title: "أحمر شفاه فيلفيت",
                    price: 45,
                    old_price: 60,
                    category: "Makeup",
                    image: "assets/images/products/lipstick1.jpg",
                    rating: 4.2
                }
            ];

            this.renderFeaturedProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            // Fallback to sample data
            this.renderFeaturedProducts();
        }
    }

    renderFeaturedProducts() {
        const grid = document.getElementById('featuredProductsGrid');
        if (!grid) return;

        const featuredProducts = this.products.slice(0, 4);
        grid.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');

        // Add event listeners
        grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.closest('.product-card').dataset.id;
                const product = this.products.find(p => p.id == productId);
                if (product) {
                    this.addToCart(product);
                }
            });
        });
    }

    createProductCard(product) {
        const discount = product.old_price ? 
            Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

        return `
            <div class="product-card" data-id="${product.id}">
                ${discount > 0 ? `<div class="discount-badge">${discount}%</div>` : ''}
                <div class="placeholder-image" style="height: 200px; margin-bottom: 1rem;">
                    <i class="fas fa-image" style="font-size: 3rem;"></i>
                </div>
                <h3>${product.title}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price}</span>
                    ${product.old_price ? `<span class="old-price">$${product.old_price}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn primary add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i> إضافة إلى العربة
                    </button>
                    <button class="btn secondary wishlist-btn">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }

    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // Implement search functionality here
    }

    showNotification(message, type = 'info') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#4CAF50' : '#eab3c6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    loadPreferences() {
        const savedTheme = localStorage.getItem('nona-theme');
        const savedLanguage = localStorage.getItem('nona-language');
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.body.setAttribute('data-theme', savedTheme);
            const themeIcon = document.querySelector('#themeToggle i');
            if (themeIcon) {
                themeIcon.className = savedTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
        
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = savedLanguage;
            const langToggle = document.getElementById('langToggle');
            if (langToggle) {
                langToggle.textContent = savedLanguage === 'ar' ? 'EN' : 'AR';
            }
        }
        
        this.loadCart();
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.nonaApp = new NonaBeautyApp();
});
