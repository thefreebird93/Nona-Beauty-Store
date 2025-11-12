// auth_v4.js - enhanced authentication with better UX
async function loadUsersOnce() {
  let users = JSON.parse(localStorage.getItem('nb_users') || 'null');
  if (!users) {
    try {
      users = await fetch('assets/data/users.json').then(r => r.json());
      localStorage.setItem('nb_users', JSON.stringify(users));
    } catch (error) {
      console.error('Error loading users:', error);
      users = [];
    }
  }
  return users;
}

function initAuth() {
  const loginForm = document.getElementById('loginForm');
  const forgotBtn = document.getElementById('forgotBtn');
  const registerBtn = document.getElementById('registerBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (forgotBtn) {
    forgotBtn.addEventListener('click', handleForgotPassword);
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', handleRegister);
  }

  // Check if user is already logged in
  checkExistingAuth();
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
  submitBtn.disabled = true;

  try {
    const users = await loadUsersOnce();
    const user = users.find(x => x.email === email && x.password === password);
    
    if (user) {
      localStorage.setItem('nb_user', JSON.stringify(user));
      
      // Show success message
      showAuthNotification('Login successful! Redirecting...', 'success');
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      showAuthNotification('Invalid email or password', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    showAuthNotification('Login failed. Please try again.', 'error');
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function handleForgotPassword() {
  const email = prompt('Enter your account email for password reset:');
  if (!email) return;

  try {
    const users = await loadUsersOnce();
    const user = users.find(x => x.email === email);
    
    if (!user) {
      alert('No account found with that email address.');
      return;
    }

    const newPassword = prompt('Enter new password (min. 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    // Update password
    user.password = newPassword;
    localStorage.setItem('nb_users', JSON.stringify(users));
    
    showAuthNotification('Password reset successfully!', 'success');
  } catch (error) {
    showAuthNotification('Password reset failed. Please try again.', 'error');
  }
}

async function handleRegister() {
  const name = prompt('Enter your full name:');
  if (!name) return;

  const email = prompt('Enter your email:');
  if (!email || !isValidEmail(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const password = prompt('Enter password (min. 6 characters):');
  if (!password || password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  try {
    const users = await loadUsersOnce();
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
      alert('An account with this email already exists.');
      return;
    }

    // Create new user
    const newUser = {
      id: Math.max(...users.map(u => u.id)) + 1,
      name: name,
      email: email,
      password: password,
      role: 'user',
      orders: [],
      joined: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('nb_users', JSON.stringify(users));
    
    showAuthNotification('Registration successful! You can now login.', 'success');
  } catch (error) {
    showAuthNotification('Registration failed. Please try again.', 'error');
  }
}

function checkExistingAuth() {
  const user = JSON.parse(localStorage.getItem('nb_user') || 'null');
  if (user && window.location.pathname.includes('login.html')) {
    // User is already logged in, redirect to home
    window.location.href = 'index.html';
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showAuthNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotification = document.querySelector('.auth-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `auth-notification auth-${type}`;
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
    z-index: 1000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  notification.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;">
      <i class="fas fa-${type === 'success' ? 'check' : 
                     type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Initialize auth when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}