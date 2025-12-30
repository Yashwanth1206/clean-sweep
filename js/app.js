// Main App Module
(function() {
  // App state
  const appState = {
    currentSection: 'auth',
    currentRequest: null,
    cleanupRequests: [],
    modalActive: false
  };
  
  // Mock cleanup requests
  const MOCK_CLEANUP_REQUESTS = [
    {
      id: '1',
      title: 'Trash pile at Central Park',
      description: 'Large accumulation of trash near the south entrance of Central Park. Includes plastic bottles, food wrappers, and paper waste.',
      location: 'Central Park, South Entrance',
      reportDate: '2025-04-10T14:30:00',
      beforeImage: 'https://images.pexels.com/photos/2768961/pexels-photo-2768961.jpeg?auto=compress&cs=tinysrgb&w=600',
      afterImage: null,
      status: 'reported',
      citizenId: '1',
      workerId: null,
      completedDate: null
    },
    {
      id: '2',
      title: 'Street litter on Oak Avenue',
      description: 'Scattered litter along Oak Avenue sidewalk for approximately 200 meters. Mostly consists of takeaway containers and beverage cups.',
      location: 'Oak Avenue, between 5th and 7th Street',
      reportDate: '2025-04-05T09:15:00',
      beforeImage: 'https://images.pexels.com/photos/2873286/pexels-photo-2873286.jpeg?auto=compress&cs=tinysrgb&w=600',
      afterImage: null,
      status: 'assigned',
      citizenId: '1',
      workerId: '2',
      completedDate: null
    },
    {
      id: '3',
      title: 'Illegal dumping behind mall',
      description: 'Someone has illegally dumped construction waste behind the Westfield Mall. Includes broken concrete, wood scraps, and paint cans.',
      location: 'Westfield Mall, rear service area',
      reportDate: '2025-03-28T16:45:00',
      beforeImage: 'https://images.pexels.com/photos/2547565/pexels-photo-2547565.jpeg?auto=compress&cs=tinysrgb&w=600',
      afterImage: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=600',
      status: 'completed',
      citizenId: '1',
      workerId: '2',
      completedDate: '2025-04-02T11:20:00'
    },
    {
      id: '4',
      title: 'Overflowing trash bins at Beach Park',
      description: 'Three trash bins at Beach Park are overflowing with waste, causing litter to spread around the area.',
      location: 'Beach Park, near the main pavilion',
      reportDate: '2025-04-08T10:30:00',
      beforeImage: 'https://images.pexels.com/photos/5497740/pexels-photo-5497740.jpeg?auto=compress&cs=tinysrgb&w=600',
      afterImage: 'https://images.pexels.com/photos/3951435/pexels-photo-3951435.jpeg?auto=compress&cs=tinysrgb&w=600',
      status: 'verified',
      citizenId: '1',
      workerId: '2',
      completedDate: '2025-04-09T13:40:00'
    }
  ];
  
  // Initialize or get from storage
  function initializeCleanupRequests() {
    const storedRequests = localStorage.getItem('cleanupRequests');
    if (storedRequests) {
      appState.cleanupRequests = JSON.parse(storedRequests);
    } else {
      appState.cleanupRequests = MOCK_CLEANUP_REQUESTS;
      saveCleanupRequests();
    }
    return appState.cleanupRequests;
  }
  
  // Save cleanup requests to storage
  function saveCleanupRequests() {
    localStorage.setItem('cleanupRequests', JSON.stringify(appState.cleanupRequests));
  }
  
  // Load cleanup requests
  function loadCleanupRequests() {
    const requests = initializeCleanupRequests();
    const user = window.auth.getCurrentUser();
    
    if (!user) return;
    
    const userRequests = user.role === 'citizen' 
      ? requests.filter(req => req.citizenId === user.id)
      : requests;
    
    // Update stats
    updateStats(userRequests);
    
    // Render requests
    const requestsList = document.getElementById('requests-list');
    if (!requestsList) return;
    
    requestsList.innerHTML = '';
    
    if (userRequests.length === 0) {
      requestsList.innerHTML = '<div class="empty-state">No cleanup requests found. Click "New Request" to create one.</div>';
      return;
    }
    
    userRequests.forEach(request => {
      const requestCard = createRequestCard(request);
      requestsList.appendChild(requestCard);
    });
  }
  
  // Load cleanup tasks for workers
  function loadCleanupTasks() {
    const requests = initializeCleanupRequests();
    const user = window.auth.getCurrentUser();
    
    if (!user || user.role !== 'worker') return;
    
    // Update stats
    const availableTasks = requests.filter(req => req.status === 'reported');
    const myTasks = requests.filter(req => req.workerId === user.id && ['assigned', 'in-progress'].includes(req.status));
    const completedTasks = requests.filter(req => req.workerId === user.id && ['completed', 'verified'].includes(req.status));
    
    document.getElementById('available-tasks').textContent = availableTasks.length;
    document.getElementById('my-tasks').textContent = myTasks.length;
    document.getElementById('completed-tasks').textContent = completedTasks.length;
    
    // Render tasks
    const tasksList = document.getElementById('tasks-list');
    if (!tasksList) return;
    
    tasksList.innerHTML = '';
    
    if (requests.length === 0) {
      tasksList.innerHTML = '<div class="empty-state">No cleanup tasks available at this time.</div>';
      return;
    }
    
    requests.forEach(request => {
      const taskCard = createRequestCard(request);
      tasksList.appendChild(taskCard);
    });
  }
  
  // Create request card element
  function createRequestCard(request) {
    const template = document.getElementById('request-card-template');
    const clone = template.content.cloneNode(true);
    
    // Set card data
    const card = clone.querySelector('.request-card');
    card.dataset.id = request.id;
    card.dataset.status = request.status;
    
    // Set title
    const title = clone.querySelector('.request-title');
    title.textContent = request.title;
    
    // Set status
    const status = clone.querySelector('.request-status');
    status.textContent = formatStatus(request.status);
    status.classList.add(`status-${request.status}`);
    
    // Set location
    const location = clone.querySelector('.location-text');
    location.textContent = request.location;
    
    // Set before image
    const beforeImg = clone.querySelector('.before-image img');
    beforeImg.src = request.beforeImage;
    
    // Set after image if available
    const afterImageContainer = clone.querySelector('.after-image');
    const afterImg = clone.querySelector('.after-image img');
    
    if (request.afterImage) {
      afterImg.src = request.afterImage;
      afterImageContainer.classList.remove('hidden');
    } else {
      afterImageContainer.classList.add('hidden');
    }
    
    // Set date
    const date = clone.querySelector('.request-date');
    date.textContent = formatDate(request.reportDate);
    
    // Add click handler to view details button
    const viewDetailsBtn = clone.querySelector('.view-details');
    viewDetailsBtn.addEventListener('click', () => {
      viewRequestDetails(request.id);
    });
    
    return clone;
  }
  
  // Format status for display
  function formatStatus(status) {
    const statusMap = {
      'reported': 'Reported',
      'assigned': 'Assigned',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'verified': 'Verified'
    };
    
    return statusMap[status] || status;
  }
  
  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Filter requests based on status
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
  
  // Filter tasks based on status
  function filterTasks(filter) {
    const user = window.auth.getCurrentUser();
    const taskCards = document.querySelectorAll('.request-card');
    
    taskCards.forEach(card => {
      const request = appState.cleanupRequests.find(req => req.id === card.dataset.id);
      
      if (filter === 'all') {
        card.style.display = 'block';
      } else if (filter === 'reported' && request.status === 'reported') {
        card.style.display = 'block';
      } else if (filter === 'assigned' && request.status !== 'reported' && request.workerId === user.id) {
        card.style.display = 'block';
      } else if (card.dataset.status === filter && request.workerId === user.id) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Update stats based on user requests
  function updateStats(requests) {
    const totalRequests = document.getElementById('total-requests');
    const inProgressRequests = document.getElementById('in-progress-requests');
    const completedRequests = document.getElementById('completed-requests');
    
    if (totalRequests && inProgressRequests && completedRequests) {
      totalRequests.textContent = requests.length;
      
      const inProgress = requests.filter(req => 
        ['reported', 'assigned', 'in-progress'].includes(req.status)
      ).length;
      
      const completed = requests.filter(req => 
        ['completed', 'verified'].includes(req.status)
      ).length;
      
      inProgressRequests.textContent = inProgress;
      completedRequests.textContent = completed;
    }
  }
  
  // View request details
  function viewRequestDetails(requestId) {
    const request = appState.cleanupRequests.find(req => req.id === requestId);
    if (!request) return;
    
    appState.currentRequest = request;
    
    // Hide dashboard section
    document.getElementById('dashboard-section').classList.add('hidden');
    
    // Show detail section
    const detailSection = document.getElementById('request-detail-section');
    detailSection.classList.remove('hidden');
    
    // Clone the template
    const template = document.getElementById('request-detail-template');
    const clone = template.content.cloneNode(true);
    
    // Clear previous content and append
    detailSection.innerHTML = '';
    detailSection.appendChild(clone);
    
    // Populate detail view
    populateRequestDetails(request);
    
    // Setup back button
    const backButton = document.getElementById('back-to-dashboard');
    backButton.addEventListener('click', () => {
      detailSection.classList.add('hidden');
      document.getElementById('dashboard-section').classList.remove('hidden');
    });
  }
  
  // Populate request details
  function populateRequestDetails(request) {
    // Set title
    document.getElementById('detail-title').textContent = request.title;
    
    // Set status
    const statusEl = document.getElementById('detail-status');
    statusEl.textContent = formatStatus(request.status);
    statusEl.classList.add(`status-${request.status}`);
    
    // Set location
    document.getElementById('detail-location').textContent = request.location;
    
    // Set date
    document.getElementById('detail-date').textContent = formatDate(request.reportDate);
    
    // Set description
    document.getElementById('detail-description').textContent = request.description;
    
    // Set before image
    document.getElementById('detail-before-image').src = request.beforeImage;
    
    // Set completion date if available
    if (request.completedDate) {
      document.getElementById('detail-completion-date').classList.remove('hidden');
      document.getElementById('completion-date').textContent = formatDate(request.completedDate);
    }
    
    // Set after image if available
    const afterImageSection = document.getElementById('after-image-section');
    const afterContainer = document.getElementById('detail-after-container');
    
    if (request.afterImage) {
      // Show image
      afterContainer.innerHTML = `<img src="${request.afterImage}" alt="After Cleanup">`;
      document.getElementById('after-image-caption').textContent = 'Cleaned condition';
    } else {
      const userRole = window.auth.getCurrentUserRole();
      
      if (userRole === 'worker' && request.status === 'in-progress') {
        // Show upload option for worker
        afterContainer.innerHTML = `
          <div class="file-upload after-upload">
            <input type="file" id="after-image" accept="image/*">
            <label for="after-image" class="file-upload-label">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Upload After Photo
            </label>
          </div>
          <div id="after-preview-container" class="image-preview-container hidden">
            <img id="after-preview" src="" alt="After Image Preview">
            <button type="button" id="remove-after-image" class="btn btn-danger btn-sm">Remove</button>
          </div>
        `;
        
        // Add event listeners
        const afterImage = document.getElementById('after-image');
        afterImage.addEventListener('change', handleAfterImagePreview);
        
        const removeAfterImageBtn = document.getElementById('remove-after-image');
        if (removeAfterImageBtn) {
          removeAfterImageBtn.addEventListener('click', removeAfterImagePreview);
        }
      } else {
        // Show placeholder
        afterContainer.innerHTML = `
          <div class="placeholder-image">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p>Waiting for cleanup verification</p>
          </div>
        `;
        document.getElementById('after-image-caption').textContent = 'Awaiting cleanup';
      }
    }
    
    // Setup action panel based on role and status
    setupActionPanel(request);
  }
  
  // Setup action panel based on role and status
  function setupActionPanel(request) {
    const user = window.auth.getCurrentUser();
    const actionPanel = document.getElementById('action-panel');
    
    if (!user || !actionPanel) return;
    
    actionPanel.innerHTML = '';
    
    if (user.role === 'citizen') {
      // Citizen actions
      if (request.status === 'completed') {
        // Show verify button
        const verifyBtn = document.createElement('button');
        verifyBtn.className = 'btn btn-primary';
        verifyBtn.textContent = 'Verify Cleanup';
        verifyBtn.addEventListener('click', () => verifyCleanup(request.id));
        actionPanel.appendChild(verifyBtn);
      }
    } else if (user.role === 'worker') {
      // Worker actions
      if (request.status === 'reported') {
        // Accept task button
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn btn-primary';
        acceptBtn.textContent = 'Accept Task';
        acceptBtn.addEventListener('click', () => acceptTask(request.id));
        actionPanel.appendChild(acceptBtn);
      } else if (request.status === 'assigned' && request.workerId === user.id) {
        // Start task button
        const startBtn = document.createElement('button');
        startBtn.className = 'btn btn-primary';
        startBtn.textContent = 'Start Cleanup';
        startBtn.addEventListener('click', () => startTask(request.id));
        actionPanel.appendChild(startBtn);
      } else if (request.status === 'in-progress' && request.workerId === user.id) {
        // Complete task button
        const completeBtn = document.createElement('button');
        completeBtn.className = 'btn btn-primary';
        completeBtn.textContent = 'Mark as Completed';
        completeBtn.addEventListener('click', () => completeTask(request.id));
        completeBtn.disabled = !request.afterImage;
        actionPanel.appendChild(completeBtn);
      }
    }
  }
  
  // Accept task (worker)
  function acceptTask(requestId) {
    const user = window.auth.getCurrentUser();
    if (!user || user.role !== 'worker') return;
    
    const requestIndex = appState.cleanupRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;
    
    // Update request
    appState.cleanupRequests[requestIndex].status = 'assigned';
    appState.cleanupRequests[requestIndex].workerId = user.id;
    
    // Save and refresh
    saveCleanupRequests();
    viewRequestDetails(requestId);
  }
  
  // Start task (worker)
  function startTask(requestId) {
    const user = window.auth.getCurrentUser();
    if (!user || user.role !== 'worker') return;
    
    const requestIndex = appState.cleanupRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;
    
    // Update request
    appState.cleanupRequests[requestIndex].status = 'in-progress';
    
    // Save and refresh
    saveCleanupRequests();
    viewRequestDetails(requestId);
  }
  
  // Complete task (worker)
  function completeTask(requestId) {
    const user = window.auth.getCurrentUser();
    if (!user || user.role !== 'worker') return;
    
    const requestIndex = appState.cleanupRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1 || !appState.cleanupRequests[requestIndex].afterImage) return;
    
    // Update request
    appState.cleanupRequests[requestIndex].status = 'completed';
    appState.cleanupRequests[requestIndex].completedDate = new Date().toISOString();
    
    // Save and refresh
    saveCleanupRequests();
    viewRequestDetails(requestId);
  }
  
  // Verify cleanup (citizen)
  function verifyCleanup(requestId) {
    const user = window.auth.getCurrentUser();
    if (!user || user.role !== 'citizen') return;
    
    const requestIndex = appState.cleanupRequests.findIndex(req => req.id === requestId);
    if (requestIndex === -1) return;
    
    // Update request
    appState.cleanupRequests[requestIndex].status = 'verified';
    
    // Save and refresh
    saveCleanupRequests();
    viewRequestDetails(requestId);
  }
  
  // Handle auth state changes
  window.addEventListener('authStateChanged', function(event) {
    const { user, isAuthenticated } = event.detail;
    
    if (isAuthenticated) {
      // Load appropriate dashboard
      if (user.role === 'worker') {
        loadCleanupTasks();
      } else {
        loadCleanupRequests();
      }
    }
  });
  
  // Event delegation for dynamic elements
  document.addEventListener('click', function(event) {
    // Handle any global click events here if needed
  });
  
  // Initialize
  function init() {
    // Initialize cleanup requests
    initializeCleanupRequests();
  }
  
  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', init);
  
  // Make functions available to other modules
  window.app = {
    loadCleanupRequests,
    loadCleanupTasks,
    saveCleanupRequests,
    viewRequestDetails
  };
})();