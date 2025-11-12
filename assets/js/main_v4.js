// main_v4.js - enhanced version with animations, search, and improved UX
const DATA_PATH = 'assets/data/';
let currentProducts = [];
let currentTips = [];

async function fetchJSON(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching JSON:', error);
    return [];
  }
}

async function initSite() {
  await loadInitialData();
  renderSlider();
  renderProducts(currentProducts.slice(0, 8)); // Show only 8 featured products
  renderOffersPreview(currentProducts);
  renderTipsPreview(currentTips);
  populateFilters(currentProducts);
  bindTopControls();
  bindSearch();
  bindMobileMenu();
  addScrollAnimations();
  initScrollIndicator();
  checkAuthUI();
  
  // Preload images for better performance
  preloadImages();
}

async function loadInitialData() {
  try {
    const [products, tips] = await Promise.all([
      fetchJSON(DATA_PATH + 'products.json'),
      fetchJSON(DATA_PATH + 'tips.json')
    ]);
    
    currentProducts = products;
    currentTips = tips;
    
    // Cache data in localStorage for offline use
    localStorage.setItem('nb_products_cache', JSON.stringify(products));
    localStorage.setItem('nb_tips_cache', JSON.stringify(tips));
  } catch (error) {
    // Fallback to cached data
    console.log('Using cached data');
    currentProducts = JSON.parse(localStorage.getItem('nb_products_cache') || '[]');
    currentTips = JSON.parse(localStorage.getItem('nb_tips_cache') || '[]');
  }
}

function renderSlider() {
  const container = document.getElementById('slider');
  if (!container) return;

  const slides = [
    {
      image: 'assets/images/slider1.jpg',
      title: 'Premium Beauty Products',
      description: 'Discover our exclusive collection of luxury cosmetics',
      buttonText: 'Shop Now',
      buttonLink: 'products.html'
    },
    {
      image: 'assets/images/slider2.jpg',
      title: 'Special Offers',
      description: 'Up to 50% off on selected items - Limited time!',
      buttonText: 'View Offers',
      buttonLink: 'offers.html'
    },
    {
      image: 'assets/images/slider3.jpg',
      title: 'New Arrivals',
      description: 'Check out our latest products and innovations',
      buttonText: 'Explore',
      buttonLink: 'products.html?new=true'
    }
  ];

  container.innerHTML = '';
  let currentSlide = 0;

  slides.forEach((slide, index) => {
    const slideEl = document.createElement('div');
    slideEl.className = `slide ${index === 0 ? 'active' : ''}`;
    slideEl.innerHTML = `
      <img src="${slide.image}" alt="${slide.title}" loading="lazy">
      <div class="slide-content">
        <h2>${slide.title}</h2>
        <p>${slide.description}</p>
        <button class="slider-btn" onclick="window.location.href='${slide.buttonLink}'">
          ${slide.buttonText} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
    container.appendChild(slideEl);
  });

  // Add indicators
  const indicators = document.createElement('div');
  indicators.className = 'slider-indicators';
  slides.forEach((_, index) => {
    const indicator = document.createElement('button');
    indicator.className = `slider-indicator ${index === 0 ? 'active' : ''}`;
    indicator.addEventListener('click', () => showSlide(index));
    indicators.appendChild(indicator);
  });
  container.appendChild(indicators);

  // Auto slide
  let slideInterval = setInterval(nextSlide, 5000);

  // Pause on hover
  container.addEventListener('mouseenter', () => clearInterval(slideInterval));
  container.addEventListener('mouseleave', () => {
    slideInterval = setInterval(nextSlide, 5000);
  });

  // Navigation arrows
  document.getElementById('prevSlide')?.addEventListener('click', prevSlide);
  document.getElementById('nextSlide')?.addEventListener('click', nextSlide);

  function showSlide(index) {
    const slides = container.querySelectorAll('.slide');
    const indicators = container.querySelectorAll('.slider-indicator');
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[index].classList.add('active');
    indicators[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;
  window.showSlide = showSlide;
}

function createProductEl(product) {
  const productEl = document.createElement('div');
  productEl.className = 'product-card card';
  productEl.setAttribute('data-category', product.category);
  productEl.setAttribute('data-id', product.id);

  let discountBadge = '';
  if (product.discount && product.discount > 0) {
    discountBadge = `<div class="discount-badge">${product.discount}% OFF</div>`;
  }

  const ratingStars = generateStarRating(product.rating);

  productEl.innerHTML = `
    ${discountBadge}
    <img src="${product.image}" alt="${product.title_en}" loading="lazy" 
         onload="this.classList.add('loaded')">
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
  `;

  // Add event listeners
  const addToCartBtn = productEl.querySelector('.add-to-cart');
  const quickViewBtn = productEl.querySelector('.quick-view');

  addToCartBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    addToCart(product);
  });

  quickViewBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showQuickView(product);
  });

  productEl.addEventListener('click', () => {
    showProductDetails(product);
  });

  return productEl;
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let stars = '';
  
  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  // Half star
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  
  if (products.length === 0) {
    grid.innerHTML = `
      <div class="no-products" style="grid-column:1/-1;text-align:center;padding:40px;">
        <i class="fas fa-search" style="font-size:3em;color:var(--muted);margin-bottom:20px;"></i>
        <h3>No products found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const productEl = createProductEl(product);
    grid.appendChild(productEl);
  });
}

function renderOffersPreview(products) {
  const offers = products.filter(p => p.discount && p.discount > 0).slice(0, 3);
  const list = document.getElementById('offersPreviewList');
  if (!list) return;

  list.innerHTML = '';

  if (offers.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);text-align:center;">No current offers</p>';
    return;
  }

  offers.forEach(offer => {
    const offerEl = document.createElement('div');
    offerEl.className = 'offer-item';
    offerEl.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg);
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
    `;
    
    offerEl.innerHTML = `
      <img src="${offer.image}" alt="${offer.title_en}" 
           style="width:50px;height:50px;object-fit:cover;border-radius:6px;">
      <div style="flex:1;">
        <strong style="display:block;font-size:0.9em;">${offer.title_en}</strong>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <span style="color:var(--accent);font-weight:600;">$${offer.price}</span>
          <span style="color:var(--muted);text-decoration:line-through;font-size:0.8em;">
            $${offer.old_price}
          </span>
          <span style="background:#ff6b6b;color:white;padding:2px 6px;border-radius:4px;font-size:0.7em;font-weight:600;">
            -${offer.discount}%
          </span>
        </div>
      </div>
    `;

    offerEl.addEventListener('click', () => {
      showProductDetails(offer);
    });

    offerEl.addEventListener('mouseenter', () => {
      offerEl.style.transform = 'translateX(5px)';
      offerEl.style.background = 'var(--accent-2)';
    });

    offerEl.addEventListener('mouseleave', () => {
      offerEl.style.transform = 'translateX(0)';
      offerEl.style.background = 'var(--bg)';
    });

    list.appendChild(offerEl);
  });
}

function renderTipsPreview(tips) {
  const list = document.getElementById('tipsPreviewList');
  if (!list) return;

  list.innerHTML = '';

  tips.slice(0, 3).forEach(tip => {
    const tipEl = document.createElement('div');
    tipEl.className = 'tip-item';
    tipEl.style.cssText = `
      padding: 15px;
      background: var(--bg);
      border-radius: 8px;
      margin-bottom: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
      border-left: 3px solid var(--accent);
    `;
    
    tipEl.innerHTML = `
      <strong style="display:block;margin-bottom:8px;">${tip.title_en}</strong>
      <p style="margin:0;color:var(--muted);font-size:0.9em;line-height:1.4;">
        ${tip.content_en.substring(0, 80)}...
      </p>
    `;

    tipEl.addEventListener('click', () => {
      showTipDetails(tip);
    });

    tipEl.addEventListener('mouseenter', () => {
      tipEl.style.transform = 'translateX(5px)';
      tipEl.style.background = 'var(--accent-2)';
    });

    tipEl.addEventListener('mouseleave', () => {
      tipEl.style.transform = 'translateX(0)';
      tipEl.style.background = 'var(--bg)';
    });

    list.appendChild(tipEl);
  });
}

function populateFilters(products) {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  const categories = Array.from(new Set(products.map(p => p.category))).sort();
  
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.addEventListener('change', applyFilters);
  
  const onlyDiscounts = document.getElementById('onlyDiscounts');
  if (onlyDiscounts) {
    onlyDiscounts.addEventListener('change', applyFilters);
  }
}

function applyFilters() {
  const category = document.getElementById('categoryFilter')?.value || '';
  const onlyDiscounts = document.getElementById('onlyDiscounts')?.checked || false;
  const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

  let filteredProducts = currentProducts;

  // Apply category filter
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  // Apply discount filter
  if (onlyDiscounts) {
    filteredProducts = filteredProducts.filter(p => p.discount && p.discount > 0);
  }

  // Apply search filter
  if (searchTerm) {
    filteredProducts = filteredProducts.filter(p => 
      p.title_en.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
  }

  renderProducts(filteredProducts);
}

function bindSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
  });

  // Add search button functionality
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      applyFilters();
    });
  }

  // Allow Enter key to search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  });
}

function bindMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const nav = document.getElementById('mainNav');

  if (mobileMenuBtn && nav) {
    mobileMenuBtn.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
      mobileMenuBtn.innerHTML = nav.classList.contains('mobile-open') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
    });

    // Close mobile menu when clicking on a link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
      });
    });
  }
}

function addScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe product cards and other elements
  document.querySelectorAll('.product-card, .featured-card, .highlight-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    observer.observe(el);
  });
}

function initScrollIndicator() {
  const indicator = document.getElementById('scrollIndicator');
  if (!indicator) return;

  const sections = ['hero', 'products', 'offers'];
  
  // Create dots for each section
  indicator.innerHTML = '';
  sections.forEach(section => {
    const dot = document.createElement('div');
    dot.className = 'scroll-dot';
    dot.setAttribute('data-section', section);
    dot.addEventListener('click', () => {
      scrollToSection(section);
    });
    indicator.appendChild(dot);
  });

  // Update active dot on scroll
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 100;
    
    sections.forEach((section, index) => {
      const sectionEl = document.getElementById(section + 'Section');
      const dot = indicator.children[index];
      
      if (sectionEl) {
        const sectionTop = sectionEl.offsetTop;
        const sectionBottom = sectionTop + sectionEl.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      }
    });
  });
}

function scrollToSection(section) {
  const sectionEl = document.getElementById(section + 'Section');
  if (sectionEl) {
    sectionEl.scrollIntoView({ behavior: 'smooth' });
  }
}

function preloadImages() {
  const images = [
    'assets/images/slider1.jpg',
    'assets/images/slider2.jpg',
    'assets/images/slider3.jpg'
  ];

  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// Product interaction functions
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('nb_cart') || '[]');
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.title_en,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }
  
  localStorage.setItem('nb_cart', JSON.stringify(cart));
  updateCartUI();
  
  // Show success message
  showNotification(`${product.title_en} added to cart!`, 'success');
}

function showQuickView(product) {
  // This would typically open a modal with product details
  // For now, we'll show an alert
  showNotification(`Quick view: ${product.title_en} - $${product.price}`, 'info');
}

function showProductDetails(product) {
  // This would typically navigate to a product detail page
  // For now, we'll show an alert
  showNotification(`Viewing details for: ${product.title_en}`, 'info');
}

function showTipDetails(tip) {
  // This would typically show a modal or navigate to tip details
  showNotification(`Beauty Tip: ${tip.title_en}`, 'info');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--success)' : 
                 type === 'error' ? 'var(--error)' : 'var(--accent)'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: var(--shadow);
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

function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem('nb_cart') || '[]');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Controls (theme, lang, login)
function bindTopControls() {
  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const el = document.documentElement;
    const isDark = el.getAttribute('data-theme') === 'dark';
    el.setAttribute('data-theme', isDark ? 'light' : 'dark');
    
    // Update icon
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
      icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    }
    
    // Save preference
    localStorage.setItem('nb_theme', isDark ? 'light' : 'dark');
  });

  // Language toggle
  document.getElementById('langToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('lang') || 'en';
    if (cur === 'en') {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
      document.getElementById('langToggle').textContent = 'EN';
    } else {
      document.documentElement.setAttribute('lang', 'en');
      document.documentElement.setAttribute('dir', 'ltr');
      document.getElementById('langToggle').textContent = 'AR';
    }
  });

  // Cart toggle
  document.getElementById('cartBtn')?.addEventListener('click', toggleCart);
  document.getElementById('closeCart')?.addEventListener('click', toggleCart);

  // Load saved theme
  const savedTheme = localStorage.getItem('nb_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update theme icon
  const themeIcon = document.querySelector('#themeToggle i');
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

function toggleCart() {
  const cartSidebar = document.getElementById('cartSidebar');
  if (cartSidebar) {
    cartSidebar.classList.toggle('open');
  }
}

function checkAuthUI() {
  const user = JSON.parse(localStorage.getItem('nb_user') || 'null');
  const loginBtn = document.getElementById('loginBtn');
  const topControls = document.getElementById('topControls');

  if (!loginBtn) return;

  if (user) {
    loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
    loginBtn.onclick = () => window.location.href = 'profile.html';
    
    if (user.role === 'admin') {
      const nav = document.querySelector('.nav');
      const adminBtn = document.createElement('button');
      adminBtn.className = 'btn outline';
      adminBtn.innerHTML = '<i class="fas fa-cog"></i> Admin';
      adminBtn.onclick = () => window.location.href = 'admin.html';
      nav.insertBefore(adminBtn, topControls);
    }
  } else {
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    loginBtn.onclick = () => window.location.href = 'login.html';
  }

  // Update cart UI
  updateCartUI();
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSite);
} else {
  initSite();
}