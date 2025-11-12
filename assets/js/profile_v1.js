// profile_v1.js - user profile functionality
class UserProfile {
  constructor() {
    this.user = null;
    this.init();
  }

  init() {
    this.checkAuthentication();
    this.loadUserData();
    this.setupNavigation();
    this.setupEventListeners();
  }

  checkAuthentication() {
    this.user = JSON.parse(localStorage.getItem('nb_user') || 'null');
    if (!this.user) {
      window.location.href = 'login.html';
      return;
    }
  }

  loadUserData() {
    // Update profile information
    document.getElementById('profileName').textContent = this.user.name;
    document.getElementById('profileEmail').textContent = this.user.email;

    // Load orders
    this.loadOrders();
    
    // Load settings
    this.loadSettings();
    
    // Load addresses
    this.loadAddresses();
    
    // Load wishlist
    this.loadWishlist();
  }

  loadOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    const orders = this.user.orders || [];

    if (orders.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-shopping-bag" style="font-size:3em;color:var(--muted);margin-bottom:20px;"></i>
          <h3>No orders yet</h3>
          <p>Your order history will appear here</p>
          <a href="products.html" class="btn primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <strong>Order #${order.id}</strong>
            <div class="order-date">${new Date(order.date || Date.now()).toLocaleDateString()}</div>
          </div>
          <div class="order-status ${order.status.toLowerCase()}">
            ${order.status}
          </div>
        </div>
        <div class="order-items">
          ${this.getOrderItemsHTML(order.items)}
        </div>
        <div class="order-footer">
          <div class="order-total">
            Total: $${order.total?.toFixed(2) || '0.00'}
          </div>
          <button class="btn outline" onclick="profile.viewOrderDetails(${order.id})">
            View Details
          </button>
        </div>
      </div>
    `).join('');
  }

  getOrderItemsHTML(items) {
    if (!items || !Array.isArray(items)) {
      return '<div class="order-item">No items found</div>';
    }

    // In a real app, you would fetch product details from your database
    return items.map(itemId => `
      <div class="order-item">
        <div class="order-item-info">
          <span>Product #${itemId}</span>
          <span>Qty: 1</span>
        </div>
      </div>
    `).join('');
  }

  loadSettings() {
    const settingsName = document.getElementById('settingsName');
    const settingsEmail = document.getElementById('settingsEmail');
    
    if (settingsName) settingsName.value = this.user.name;
    if (settingsEmail) settingsEmail.value = this.user.email;
    
    // Load additional user data if available
    if (this.user.phone) {
      const settingsPhone = document.getElementById('settingsPhone');
      if (settingsPhone) settingsPhone.value = this.user.phone;
    }
  }

  loadAddresses() {
    const addressesGrid = document.getElementById('addressesGrid');
    if (!addressesGrid) return;

    const addresses = this.user.addresses || [];

    if (addresses.length === 0) {
      addressesGrid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-map-marker-alt" style="font-size:3em;color:var(--muted);margin-bottom:20px;"></i>
          <h3>No addresses saved</h3>
          <p>Add your first address to make checkout easier</p>
        </div>
      `;
      return;
    }

    addressesGrid.innerHTML = addresses.map(address => `
      <div class="address-card">
        <div class="address-header">
          <h4>${address.label || 'Address'}</h4>
          ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="address-details">
          <p>${address.street}</p>
          <p>${address.city}, ${address.state} ${address.zipCode}</p>
          <p>${address.country}</p>
        </div>
        <div class="address-actions">
          <button class="btn link" onclick="profile.editAddress('${address.id}')">
            Edit
          </button>
          <button class="btn link" onclick="profile.deleteAddress('${address.id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  loadWishlist() {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;

    const wishlist = this.user.wishlist || [];

    if (wishlist.length === 0) {
      wishlistGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <i class="fas fa-heart" style="font-size:3em;color:var(--muted);margin-bottom:20px;"></i>
          <h3>Your wishlist is empty</h3>
          <p>Save your favorite items here for later</p>
          <a href="products.html" class="btn primary">Explore Products</a>
        </div>
      `;
      return;
    }

    // In a real app, you would fetch product details
    wishlistGrid.innerHTML = wishlist.map(productId => `
      <div class="product-card card">
        <img src="assets/images/product${productId}.jpg" alt="Product ${productId}" loading="lazy">
        <h4>Product ${productId}</h4>
        <div class="price">$0.00</div>
        <div class="product-actions">
          <button class="btn outline">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <button class="btn" onclick="profile.removeFromWishlist(${productId})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.profile-nav-link');
    const sections = document.querySelectorAll('.profile-section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active nav link
        navLinks.forEach(nl => nl.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === targetId) {
            section.classList.add('active');
          }
        });
      });
    });
  }

  setupEventListeners() {
    // Settings form
    const settingsForm = document.querySelector('.settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Add address button
    const addAddressBtn = document.getElementById('addAddressBtn');
    if (addAddressBtn) {
      addAddressBtn.addEventListener('click', () => {
        this.addNewAddress();
      });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  saveSettings() {
    const name = document.getElementById('settingsName')?.value;
    const email = document.getElementById('settingsEmail')?.value;
    const phone = document.getElementById('settingsPhone')?.value;

    if (name && email) {
      this.user.name = name;
      this.user.email = email;
      if (phone) this.user.phone = phone;

      localStorage.setItem('nb_user', JSON.stringify(this.user));
      
      this.showNotification('Settings saved successfully!', 'success');
      
      // Update profile display
      document.getElementById('profileName').textContent = name;
      document.getElementById('profileEmail').textContent = email;
    }
  }

  addNewAddress() {
    const street = prompt('Enter street address:');
    if (!street) return;

    const city = prompt('Enter city:');
    if (!city) return;

    const state = prompt('Enter state:');
    const zipCode = prompt('Enter ZIP code:');
    const country = prompt('Enter country:') || 'United States';

    const newAddress = {
      id: Date.now().toString(),
      street,
      city,
      state,
      zipCode,
      country,
      label: 'Home',
      isDefault: !this.user.addresses || this.user.addresses.length === 0
    };

    if (!this.user.addresses) {
      this.user.addresses = [];
    }

    this.user.addresses.push(newAddress);
    localStorage.setItem('nb_user', JSON.stringify(this.user));
    
    this.loadAddresses();
    this.showNotification('Address added successfully!', 'success');
  }

  editAddress(addressId) {
    // Implementation for editing address
    this.showNotification('Edit address functionality coming soon!', 'info');
  }

  deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.user.addresses = this.user.addresses.filter(addr => addr.id !== addressId);
      localStorage.setItem('nb_user', JSON.stringify(this.user));
      this.loadAddresses();
      this.showNotification('Address deleted successfully!', 'success');
    }
  }

  removeFromWishlist(productId) {
    if (this.user.wishlist) {
      this.user.wishlist = this.user.wishlist.filter(id => id !== productId);
      localStorage.setItem('nb_user', JSON.stringify(this.user));
      this.loadWishlist();
      this.showNotification('Item removed from wishlist!', 'success');
    }
  }

  viewOrderDetails(orderId) {
    // Implementation for viewing order details
    this.showNotification(`Viewing details for order #${orderId}`, 'info');
  }

  logout() {
    localStorage.removeItem('nb_user');
    window.location.href = 'index.html';
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

// Initialize profile
let profile;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    profile = new UserProfile();
  });
} else {
  profile = new UserProfile();
}