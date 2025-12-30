// Requests Module
(function() {
  // Handle new request submission
  function handleNewRequest(event) {
    event.preventDefault();
    
    const user = window.auth.getCurrentUser();
    if (!user) return;
    
    // Get form data
    const title = document.getElementById('request-title').value.trim();
    const description = document.getElementById('request-description').value.trim();
    const location = document.getElementById('request-location').value.trim();
    
    // Get image (would be a file in real implementation)
    const imageInput = document.getElementById('request-image');
    let imageUrl = '';
    
    if (imageInput.files && imageInput.files[0]) {
      // In a real app, we would upload the file to a server
      // For this demo, we'll use a data URL
      const reader = new FileReader();
      
      reader.onload = function(e) {
        imageUrl = e.target.result;
        
        // Create new request object
        const newRequest = {
          id: Date.now().toString(), // Use timestamp as ID
          title,
          description,
          location,
          reportDate: new Date().toISOString(),
          beforeImage: imageUrl,
          afterImage: null,
          status: 'reported',
          citizenId: user.id,
          workerId: null,
          completedDate: null
        };
        
        // Add to requests and save
        const requests = JSON.parse(localStorage.getItem('cleanupRequests') || '[]');
        requests.push(newRequest);
        localStorage.setItem('cleanupRequests', JSON.stringify(requests));
        
        // Close modal and refresh list
        closeModal();
        window.app.loadCleanupRequests();
      };
      
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      // If no file selected, use a placeholder image for demo
      imageUrl = 'https://images.pexels.com/photos/4439901/pexels-photo-4439901.jpeg?auto=compress&cs=tinysrgb&w=600';
      
      // Create new request object
      const newRequest = {
        id: Date.now().toString(), // Use timestamp as ID
        title,
        description,
        location,
        reportDate: new Date().toISOString(),
        beforeImage: imageUrl,
        afterImage: null,
        status: 'reported',
        citizenId: user.id,
        workerId: null,
        completedDate: null
      };
      
      // Add to requests and save
      const requests = JSON.parse(localStorage.getItem('cleanupRequests') || '[]');
      requests.push(newRequest);
      localStorage.setItem('cleanupRequests', JSON.stringify(requests));
      
      // Close modal and refresh list
      closeModal();
      window.app.loadCleanupRequests();
    }
  }
  
  // Handle after image upload
  function handleAfterImageUpload(requestId, imageUrl) {
    const requests = JSON.parse(localStorage.getItem('cleanupRequests') || '[]');
    const requestIndex = requests.findIndex(req => req.id === requestId);
    
    if (requestIndex !== -1) {
      requests[requestIndex].afterImage = imageUrl;
      localStorage.setItem('cleanupRequests', JSON.stringify(requests));
      
      // Refresh details view
      window.app.viewRequestDetails(requestId);
    }
  }
  
  // Handle after image submission
  function submitAfterImage(requestId) {
    const afterImage = document.getElementById('after-image');
    
    if (afterImage.files && afterImage.files[0]) {
      // In a real app, we would upload the file to a server
      // For this demo, we'll use a data URL
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const imageUrl = e.target.result;
        handleAfterImageUpload(requestId, imageUrl);
      };
      
      reader.readAsDataURL(afterImage.files[0]);
    } else {
      // For demo, use a placeholder
      const imageUrl = 'https://images.pexels.com/photos/4439425/pexels-photo-4439425.jpeg?auto=compress&cs=tinysrgb&w=600';
      handleAfterImageUpload(requestId, imageUrl);
    }
  }
  
  // Close modal helper
  function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
      modal.classList.remove('active');
      
      // Remove modal from DOM after animation
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }
  
  // Export functions for global use
  window.requests = {
    handleNewRequest,
    submitAfterImage
  };
})();