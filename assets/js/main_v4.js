// Nona Beauty - Main JavaScript File (Unified)
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
        this.setupAccessibility();
    }

    // Setup event listeners
    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Language toggle
        document.getElementById('langToggle')?.addEventListener('click', () => this.toggleLanguage());
        
        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Cart functionality
        document.getElementById('cartBtn')?.addEventListener('click', () => this.openCart());
        document.getElementById('closeCart')?.addEventListener('click', () => this.closeCart());
        
        // Search functionality
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e));
        
        // Login button
        document.getElementById('loginBtn')?.addEventListener('click', () => this.handleLogin());
    }

    // Setup accessibility features
    setupAccessibility() {
        // Add skip link
        this.addSkipLink();
        
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
        
        // Add ARIA labels where needed
        this.enhanceAccessibility();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'انتقل إلى المحتوى الرئيسي';
        document.body.prepend(skipLink);
    }

    handleKeyboardNavigation(e) {
        // Close cart on Escape key
        if (e.key === 'Escape') {
            this.closeCart();
            this.closeMobileMenu();
        }
        
        // Trap focus in cart when open
        if (e.key === 'Tab' && document.getElementById('cartSidebar')?.classList.contains('open')) {
            this.trapFocusInCart(e);
        }
    }

    trapFocusInCart(e) {
        const cart = document.getElementById('cartSidebar');
        const focusableElements = cart.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    enhanceAccessibility() {
        // Add ARIA labels to icons
        document.querySelectorAll('.fas, .fab').forEach(icon => {
            if (!icon.getAttribute('aria-label')) {
                const parent = icon.closest('button, a');
                if (parent && parent.textContent.trim()) {
                    icon.setAttribute('aria-hidden', 'true');
                }
            }
        });
    }

    // Theme management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', this.currentTheme);
        document.getElementById('themeToggle').querySelector('i').className = 
            this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Save preference
        localStorage.setItem('nona-theme', this.currentTheme);
    }

    // Language management
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
        document.getElementById('langToggle').textContent = 
            this.currentLanguage === 'ar' ? 'EN' : 'AR';
        
        // Update page direction
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Save preference
        localStorage.setItem('nona-language', this.currentLanguage);
        
        // Reload content
        this.updateContentLanguage();
    }

    updateContentLanguage() {
        // This would typically make API calls to get translated content
        console.log('Updating content for language:', this.currentLanguage);
    }

    // Mobile menu
    toggleMobileMenu() {
        const nav = document.getElementById('mainNav');
        const menuBtn = document.getElementById('mobileMenuBtn');
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        
        nav.classList.toggle('mobile-open');
        menuBtn.setAttribute('aria-expanded', !isExpanded);
        menuBtn.querySelector('i').className = isExpanded ? 'fas fa-bars' : 'fas fa-times';
    }

    closeMobileMenu() {
        const nav = document.getElementById('mainNav');
        const menuBtn = document.getElementById('mobileMenuBtn');
        
        nav.classList.remove('mobile-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.querySelector('i').className = 'fas fa-bars';
    }

    // Cart functionality
    openCart() {
        document.getElementById('cartSidebar').classList.add('open');
        document.getElementById('cartSidebar').setAttribute('aria-hidden', 'false');
        
        // Trap focus in cart
        const firstFocusable = document.getElementById('cartSidebar').querySelector('button, [href], input');
        firstFocusable?.focus();
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('open');
        document.getElementById('cartSidebar').setAttribute('aria-hidden', 'true');
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
            countElement.setAttribute('aria-label', `${count} عناصر في عربة التسوق`);
        }
    }

    renderCartItems() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">عربة التسوق فارغة</p>';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" role="listitem">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <div class="cart-item-price">$${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" aria-label="تقليل الكمية" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase" aria-label="زيادة الكمية" data-id="${item.id}">+</button>
                        <button class="btn remove-btn" aria-label="إزالة المنتج" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for quantity buttons
        cartItems.querySelectorAll('.decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.updateQuantity(id, -1);
            });
        });

        cartItems.querySelectorAll('.increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.updateQuantity(id, 1);
            });
        });

        cartItems.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                this.removeFromCart(id);
            });
        });

        this.updateCartTotal();
    }

    updateQuantity(productId, change) {
        const item = this.cart.find(item => item.id === productId);
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

    // Product management
    async loadProducts() {
        try {
            this.showLoading();
            const response = await fetch('data/products.json');
            this.products = await response.json();
            this.renderFeaturedProducts();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading products:', error);
            this.hideLoading();
            this.showNotification('حدث خطأ في تحميل المنتجات', 'error');
        }
    }

    renderFeaturedProducts() {
        const grid = document.getElementById('featuredProductsGrid');
        if (!grid) return;

        const featuredProducts = this.products.slice(0, 6); // Show first 6 products
        grid.innerHTML = featuredProducts.map(product => this.createProductCard(product)).join('');

        // Add event listeners to product cards
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
            <div class="product-card" data-id="${product.id}" role="listitem">
                ${discount > 0 ? `<div class="discount-badge">${discount}%</div>` : ''}
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <h3>${product.title}</h3>
                <div class="product-price">
                    <span class="current-price">$${product.price}</span>
                    ${product.old_price ? `<span class="old-price">$${product.old_price}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn primary add-to-cart-btn" aria-label="إضافة إلى عربة التسوق">
                        <i class="fas fa-shopping-cart"></i> إضافة إلى العربة
                    </button>
                    <button class="btn secondary wishlist-btn" aria-label="إضافة إلى المفضلة">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Search functionality
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Implement search logic here
        console.log('Searching for:', searchTerm);
    }

    // Login functionality
    handleLogin() {
        window.location.href = 'login.html';
    }

    // Utility functions
    showLoading() {
        document.getElementById('loadingSpinner')?.classList.add('show');
    }

    hideLoading() {
        document.getElementById('loadingSpinner')?.classList.remove('show');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification" aria-label="إغلاق الإشعار">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? 'var(--error-color)' : 
                        type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            padding: var(--space-md) var(--space-lg);
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            display: flex;
            align-items: center;
            gap: var(--space-md);
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Initialize from localStorage
    loadPreferences() {
        const savedTheme = localStorage.getItem('nona-theme');
        const savedLanguage = localStorage.getItem('nona-language');
        
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.body.setAttribute('data-theme', savedTheme);
        }
        
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = savedLanguage;
            document.getElementById('langToggle').textContent = 
                savedLanguage === 'ar' ? 'EN' : 'AR';
        }
        
        this.loadCart();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nonaApp = new NonaBeautyApp();
    window.nonaApp.loadPreferences();
});

// Service Worker for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
