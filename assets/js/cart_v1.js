// cart_v1.js - shopping cart functionality
class ShoppingCart {
  constructor() {
    this.cart = this.loadCart();
    this.init();
  }

  init() {
    this.renderCart();
    this.bindEvents();
  }

  loadCart() {
    return JSON.parse(localStorage.getItem('nb_cart') || '[]');
  }

  saveCart() {
    localStorage.setItem('nb_cart', JSON.stringify(this.cart));
    this.updateCartUI();
  }

  addItem(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.title_en,
        price: product.price,
        image: product.image,
        quantity: quantity
      });
    }
    
    this.saveCart();
    this.renderCart();
    this.showNotification(`${product.title_en} added to cart!`, 'success');
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.renderCart();
  }

  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
        this.renderCart();
      }
    }
  }

  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartItems) {
      if (this.cart.length === 0) {
        cartItems.innerHTML = `
          <div style="text-align:center;padding:40px;color:var(--muted);">
            <i class="fas fa-shopping-cart" style="font-size:3em;margin-bottom:20px;"></i>
            <p>Your cart is empty</p>
            <button class="btn primary" onclick="window.location.href='products.html'">
              Start Shopping
            </button>
          </div>
        `;
      } else {
        cartItems.innerHTML = this.cart.map(item => `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
              <strong>${item.name}</strong>
              <div class="cart-item-price">$${item.price.toFixed(2)}</div>
              <div class="cart-item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">
                  <i class="fas fa-minus"></i>
                </button>
                <span>${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">
                  <i class="fas fa-plus"></i>
                </button>
                <button class="quantity-btn remove" data-id="${item.id}" style="margin-left:auto;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    if (cartTotal) {
      cartTotal.textContent = this.getTotal().toFixed(2);
    }
  }

  bindEvents() {
    // Delegate events for cart items
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.quantity-btn');
      if (!target) return;

      const productId = parseInt(target.dataset.id);
      
      if (target.classList.contains('plus')) {
        const item = this.cart.find(item => item.id === productId);
        if (item) this.updateQuantity(productId, item.quantity + 1);
      } else if (target.classList.contains('minus')) {
        const item = this.cart.find(item => item.id === productId);
        if (item) this.updateQuantity(productId, item.quantity - 1);
      } else if (target.classList.contains('remove')) {
        this.removeItem(productId);
      }
    });

    // Checkout button
    document.querySelector('.cart-footer .btn')?.addEventListener('click', () => {
      this.handleCheckout();
    });
  }

  handleCheckout() {
    if (this.cart.length === 0) {
      this.showNotification('Your cart is empty!', 'error');
      return;
    }

    const user = JSON.parse(localStorage.getItem('nb_user') || 'null');
    if (!user) {
      this.showNotification('Please login to checkout', 'error');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
      return;
    }

    // In a real application, this would redirect to a checkout page
    this.showNotification('Proceeding to checkout...', 'success');
    
    // Simulate order creation
    setTimeout(() => {
      this.createOrder();
    }, 2000);
  }

  createOrder() {
    const order = {
      id: Date.now(),
      items: this.cart,
      total: this.getTotal(),
      date: new Date().toISOString(),
      status: 'pending'
    };

    // Save order to user's orders
    const user = JSON.parse(localStorage.getItem('nb_user'));
    if (!user.orders) user.orders = [];
    user.orders.push(order);
    localStorage.setItem('nb_user', JSON.stringify(user));

    // Clear cart
    this.cart = [];
    this.saveCart();
    
    this.showNotification('Order placed successfully!', 'success');
    
    // Close cart sidebar
    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
      cartSidebar.classList.remove('open');
    }
  }

  updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const totalItems = this.getTotalItems();
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : 
                   type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 3000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      max-width: 300px;
    `;
    
    notification.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <i class="fas fa-${type === 'success' ? 'check' : 
                       type === 'error' ? 'exclamation' : 'info'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize cart when DOM is loaded
let cart;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
  });
} else {
  cart = new ShoppingCart();
}

// Global function to add items to cart
window.addToCart = function(product, quantity = 1) {
  if (cart) {
    cart.addItem(product, quantity);
  }
};