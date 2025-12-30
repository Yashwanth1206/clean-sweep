// Image Upload Module
(function() {
  // Handle image preview
  function handleImagePreview(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const previewContainer = document.getElementById('image-preview-container');
    const preview = document.getElementById('image-preview');
    
    // Show the preview container
    previewContainer.classList.remove('hidden');
    
    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
    };
    
    reader.readAsDataURL(file);
  }
  
  // Remove image preview
  function removeImagePreview() {
    const fileInput = document.getElementById('request-image');
    const previewContainer = document.getElementById('image-preview-container');
    const preview = document.getElementById('image-preview');
    
    // Clear the file input
    fileInput.value = '';
    
    // Clear and hide the preview
    preview.src = '';
    previewContainer.classList.add('hidden');
  }
  
  // Handle after image preview
  function handleAfterImagePreview(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const previewContainer = document.getElementById('after-preview-container');
    const preview = document.getElementById('after-preview');
    
    // Show the preview container
    previewContainer.classList.remove('hidden');
    
    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      
      // Auto submit the image
      const currentRequest = JSON.parse(localStorage.getItem('cleanCityCurrentRequest'));
      if (currentRequest) {
        window.requests.submitAfterImage(currentRequest.id);
      }
    };
    
    reader.readAsDataURL(file);
  }
  
  // Remove after image preview
  function removeAfterImagePreview() {
    const fileInput = document.getElementById('after-image');
    const previewContainer = document.getElementById('after-preview-container');
    const preview = document.getElementById('after-preview');
    
    // Clear the file input
    fileInput.value = '';
    
    // Clear and hide the preview
    preview.src = '';
    previewContainer.classList.add('hidden');
  }
  
  // Make functions available to global scope
  window.handleImagePreview = handleImagePreview;
  window.removeImagePreview = removeImagePreview;
  window.handleAfterImagePreview = handleAfterImagePreview;
  window.removeAfterImagePreview = removeAfterImagePreview;
})();