// products_v1.js - enhanced products page functionality
class ProductsPage {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.currentPage = 1;
    this.productsPerPage = 12;
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupFilters();
    this.setupSorting();
    this.setupLoadMore();
    this.applyFilters();
  }

  async loadProducts() {
    try {
      const response = await fetch('assets/data/products.json');
      this.products = await response.json();
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
      this.filteredProducts = [];
    }
  }

  setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const onlyDiscounts = document.getElementById('onlyDiscounts');
    const searchInput = document.getElementById('searchInput');

    // Populate categories
    const categories = [...new Set(this.products.map(p => p.category))].sort();
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });

    // Add event listeners
    categoryFilter.addEventListener('change', () => this.applyFilters());
    onlyDiscounts.addEventListener('change', () => this.applyFilters());
    
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applyFilters();
        }, 300);
      });
    }
  }

  setupSorting() {
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
      sortFilter.addEventListener('change', () => this.applyFilters());
    }
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => this.loadMore());
    }
  }

  applyFilters() {
    const category = document.getElementById('categoryFilter')?.value || '';
    const onlyDiscounts = document.getElementById('onlyDiscounts')?.checked || false;
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const sortBy = document.getElementById('sortFilter')?.value || 'name';

    // Apply filters
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory = !category || product.category === category;
      const matchesDiscount = !onlyDiscounts || (product.discount && product.discount > 0);
      const matchesSearch = !searchTerm || 
        product.title_en.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesDiscount && matchesSearch;
    });

    // Apply sorting
    this.sortProducts(sortBy);

    // Reset pagination
    this.currentPage = 1;

    // Render products
    this.renderProducts();
    this.updateResultsInfo();
  }

  sortProducts(sortBy) {
    switch (sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount':
        this.filteredProducts.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'name':
      default:
        this.filteredProducts.sort((a, b) => a.title_en.localeCompare(b.title_en));
    }
  }

  getProductsToShow() {
    const startIndex = 0;
    const endIndex = this.currentPage * this.productsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const productsToShow = this.getProductsToShow();

    if (productsToShow.length === 0) {
      grid.innerHTML = `
        <div class="no-products" style="grid-column:1/-1;text-align:center;padding:60px;">
          <i class="fas fa-search" style="font-size:4em;color:var(--muted);margin-bottom:20px;"></i>
          <h3>No products found</h3>
          <p>Try adjusting your search criteria or filters</p>
          <button class="btn primary" onclick="this.clearFilters()" style="margin-top:20px;">
            Clear All Filters
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = productsToShow.map(product => this.createProductHTML(product)).join('');
    }

    this.updateLoadMoreButton();
  }

  createProductHTML(product) {
    const discountBadge = product.discount && product.discount > 0 ? 
      `<div class="discount-badge">${product.discount}% OFF</div>` : '';

    const ratingStars = this.generateStarRating(product.rating);

    return `
      <div class="product-card card" data-id="${product.id}">
        ${discountBadge}
        <img src="${product.image}" alt="${product.title_en}" loading="lazy">
        <h4>${product.title_en}</h4>
        <div class="rating">
          ${ratingStars}
          <span>(${product.ratings_count})</span>
        </div>
        <div class="price">
          $${product.price.toFixed(2)}
          ${product.old_price && product.old_price > 0 ? 
            `<span class="old">$${product.old_price.toFixed(2)}</span>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn outline add-to-cart" data-product-id="${product.id}">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <button class="btn quick-view" data-product-id="${product.id}">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `;
  }

  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return '<i class="fas fa-star"></i>'.repeat(fullStars) +
           (halfStar ? '<i class="fas fa-star-half-alt"></i>' : '') +
           '<i class="far fa-star"></i>'.repeat(emptyStars);
  }

  loadMore() {
    this.currentPage++;
    this.renderProducts();
  }

  updateResultsInfo() {
    const resultsInfo = document.getElementById('resultsInfo');
    if (!resultsInfo) return;

    const totalProducts = this.filteredProducts.length;
    const showingProducts = Math.min(totalProducts, this.currentPage * this.productsPerPage);

    resultsInfo.innerHTML = `
      <div style="color:var(--muted);font-size:0.9em;">
        Showing ${showingProducts} of ${totalProducts} products
      </div>
    `;
  }

  updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    const totalProducts = this.filteredProducts.length;
    const showingProducts = Math.min(totalProducts, this.currentPage * this.productsPerPage);

    if (showingProducts >= totalProducts) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }

  clearFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('onlyDiscounts').checked = false;
    document.getElementById('searchInput').value = '';
    document.getElementById('sortFilter').value = 'name';
    this.applyFilters();
  }
}

// Initialize products page
let productsPage;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    productsPage = new ProductsPage();
  });
} else {
  productsPage = new ProductsPage();
}