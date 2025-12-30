// Auth Module
(function() {
  // DOM Elements
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutButtons = document.querySelectorAll('#logout-btn');
  
  // Mock users for demo
  const MOCK_USERS = [
    {
      id: '1',
      name: 'John Citizen',
      email: 'citizen@example.com',
      role: 'citizen',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '2',
      name: 'Sarah Worker',
      email: 'worker@example.com',
      role: 'worker',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      id: '3',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];
  
  // Check if user is logged in
  function checkAuth() {
    const user = JSON.parse(localStorage.getItem('cleanCityUser'));
    
    if (user) {
      // Update user info in UI
      document.querySelectorAll('.user-name').forEach(el => {
        el.textContent = user.name;
      });
      
      document.querySelectorAll('.user-avatar').forEach(el => {
        el.src = user.avatar;
        el.alt = user.name;
      });
      
      // Show appropriate dashboard
      document.getElementById('auth-section').classList.remove('active-section');
      document.getElementById('auth-section').classList.add('hidden');
      
      if (user.role === 'worker') {
        loadWorkerDashboard();
      } else {
        loadCitizenDashboard();
      }
      
      // Dispatch auth event
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { user, isAuthenticated: true } 
      }));
      
      return true;
    }
    
    return false;
  }
  
  // Login handler
  function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
      showLoginError('Please enter both email and password');
      return;
    }
    
    // Find user by email (simplified auth for demo)
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user && password === 'password') { // Demo password is always "password"
      // Save user to localStorage
      localStorage.setItem('cleanCityUser', JSON.stringify(user));
      
      // Clear form and errors
      loginForm.reset();
      hideLoginError();
      
      // Check auth to load appropriate dashboard
      checkAuth();
    } else {
      showLoginError('Invalid credentials. Try citizen@example.com, worker@example.com, or admin@example.com with password "password"');
    }
  }
  
  // Logout handler
  function handleLogout() {
    // Clear user data
    localStorage.removeItem('cleanCityUser');
    
    // Show auth section
    document.getElementById('dashboard-section').classList.add('hidden');
    document.getElementById('request-detail-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('auth-section').classList.add('active-section');
    
    // Dispatch auth event
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { user: null, isAuthenticated: false } 
    }));
  }
  
  // Helper to show login error
  function showLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
  }
  
  // Helper to hide login error
  function hideLoginError() {
    loginError.textContent = '';
    loginError.classList.add('hidden');
  }
  
  // Load Citizen Dashboard
  function loadCitizenDashboard() {
    const dashboardSection = document.getElementById('dashboard-section');
    dashboardSection.classList.remove('hidden');
    
    // Clone the template
    const template = document.getElementById('citizen-dashboard-template');
    const clone = template.content.cloneNode(true);
    
    // Clear previous content and append
    dashboardSection.innerHTML = '';
    dashboardSection.appendChild(clone);
    
    // Add event listeners to the new elements
    setupDashboardEventListeners('citizen');
    
    // Load user's cleanup requests
    window.app.loadCleanupRequests();
  }
  
  // Load Worker Dashboard
  function loadWorkerDashboard() {
    const dashboardSection = document.getElementById('dashboard-section');
    dashboardSection.classList.remove('hidden');
    
    // Clone the template
    const template = document.getElementById('worker-dashboard-template');
    const clone = template.content.cloneNode(true);
    
    // Clear previous content and append
    dashboardSection.innerHTML = '';
    dashboardSection.appendChild(clone);
    
    // Add event listeners to the new elements
    setupDashboardEventListeners('worker');
    
    // Load cleanup tasks
    loadCleanupTasks();
  }
  
  // Setup dashboard event listeners
  function setupDashboardEventListeners(role) {
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Only add new request button for citizens
    if (role === 'citizen') {
      const newRequestBtn = document.getElementById('new-request-btn');
      if (newRequestBtn) {
        newRequestBtn.addEventListener('click', showNewRequestModal);
      }
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', handleFilterChange);
    });
  }
  
  // Handle filter change
  function handleFilterChange(event) {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    const filter = event.currentTarget.dataset.filter;
    
    // Apply filter
    if (getCurrentUserRole() === 'worker') {
      filterTasks(filter);
    } else {
      filterRequests(filter);
    }
  }
  
  // Show new request modal
  function showNewRequestModal() {
    const modalTemplate = document.getElementById('new-request-template');
    const modalClone = modalTemplate.content.cloneNode(true);
    
    document.body.appendChild(modalClone);
    
    const modal = document.querySelector('.modal');
    setTimeout(() => {
      modal.classList.add('active');
      // Initialize the Leaflet map after the modal becomes visible
      setTimeout(initNewRequestMap, 50);
    }, 10);
    
    // Setup modal event listeners
    const closeButton = document.querySelector('.close-modal');
    closeButton.addEventListener('click', closeModal);
    
    const cancelButton = document.querySelector('.cancel-request');
    cancelButton.addEventListener('click', closeModal);
    
    const newRequestForm = document.getElementById('new-request-form');
    newRequestForm.addEventListener('submit', window.requests.handleNewRequest);
    
    const requestImage = document.getElementById('request-image');
    requestImage.addEventListener('change', handleImagePreview);
    
    const removeImageBtn = document.getElementById('remove-image');
    if (removeImageBtn) {
      removeImageBtn.addEventListener('click', removeImagePreview);
    }
  }

  // Initialize Leaflet map for New Request modal
  function initNewRequestMap() {
    const mapEl = document.getElementById('new-request-map');
    if (!mapEl || typeof L === 'undefined') return;

    // Create the map instance
    const map = L.map(mapEl).setView([20.5937, 78.9629], 5); // Center on India by default

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Ensure proper sizing after render
    setTimeout(() => map.invalidateSize(), 100);

    // Try geolocating the user for a better default view
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 13);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 3000 }
      );
    }

    // Marker handling and hidden inputs
    let marker = null;
    const latInput = document.getElementById('request-lat');
    const lngInput = document.getElementById('request-lng');

    function updateMarker(latlng) {
      if (marker) {
        marker.setLatLng(latlng);
      } else {
        marker = L.marker(latlng).addTo(map);
      }
      if (latInput) latInput.value = latlng.lat.toFixed(6);
      if (lngInput) lngInput.value = latlng.lng.toFixed(6);
    }

    map.on('click', (e) => {
      updateMarker(e.latlng);
    });
  }
  
  // Close modal
  function closeModal() {
    const modal = document.querySelector('.modal');
    modal.classList.remove('active');
    
    // Remove modal from DOM after animation
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
  
  // Get current user
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('cleanCityUser'));
  }
  
  // Get current user role
  function getCurrentUserRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
  }
  
  // Initialize auth
  function init() {
    // Add login form handler
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add logout handlers
    logoutButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', handleLogout);
      }
    });
    
    // Check if user is already logged in
    checkAuth();
  }
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', init);
  
  // Export functions to global scope for use in other modules
  window.auth = {
    getCurrentUser,
    getCurrentUserRole,
    checkAuth
  };
})();