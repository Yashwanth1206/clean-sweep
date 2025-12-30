// Dashboard Module
(function() {
  // Dashboard state
  const dashboardState = {
    activeFilter: 'all'
  };
  
  // Update dashboard UI based on user role
  function updateDashboardUI() {
    const user = window.auth.getCurrentUser();
    if (!user) return;
    
    // Set user name and avatar
    document.querySelectorAll('.user-name').forEach(el => {
      el.textContent = user.name;
    });
    
    document.querySelectorAll('.user-avatar').forEach(el => {
      el.src = user.avatar;
      el.alt = user.name;
    });
  }
  
  // Handle filter clicks
  function handleFilterClick(event) {
    const filterBtn = event.target;
    const filter = filterBtn.dataset.filter;
    
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    filterBtn.classList.add('active');
    
    // Store active filter
    dashboardState.activeFilter = filter;
    
    // Apply filter
    applyFilter(filter);
  }
  
  // Apply filter to requests/tasks
  function applyFilter(filter) {
    const user = window.auth.getCurrentUser();
    if (!user) return;
    
    if (user.role === 'worker') {
      filterTasks(filter);
    } else {
      filterRequests(filter);
    }
  }
  
  // Filter citizen requests
  function filterRequests(filter) {
    const requestCards = document.querySelectorAll('.request-card');
    
    requestCards.forEach(card => {
      if (filter === 'all' || card.dataset.status === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Filter worker tasks
  function filterTasks(filter) {
    const user = window.auth.getCurrentUser();
    const taskCards = document.querySelectorAll('.request-card');
    
    taskCards.forEach(card => {
      if (filter === 'all') {
        card.style.display = 'block';
      } else if (filter === 'reported' && card.dataset.status === 'reported') {
        card.style.display = 'block';
      } else if (filter === 'assigned' && card.dataset.status === 'assigned' && card.dataset.workerId === user.id) {
        card.style.display = 'block';
      } else if (card.dataset.status === filter && card.dataset.workerId === user.id) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Add event delegation for dashboard
  document.addEventListener('click', function(event) {
    // Filter buttons
    if (event.target.matches('.filter-btn')) {
      handleFilterClick(event);
    }
  });
  
  // Initialize dashboard when auth state changes
  window.addEventListener('authStateChanged', function(event) {
    const { isAuthenticated } = event.detail;
    
    if (isAuthenticated) {
      updateDashboardUI();
    }
  });
  
  // Export functions
  window.dashboard = {
    updateDashboardUI,
    applyFilter
  };
})();