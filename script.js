document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewImage = document.getElementById('previewImage');
    const processBtn = document.getElementById('processBtn');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    const exportOptions = document.getElementById('exportOptions');
    const processingOverlay = document.getElementById('processingOverlay');
    const progressBar = document.querySelector('.progress');
    const confidenceScore = document.querySelector('.score-value');
    const textContent = document.querySelector('.text-content');

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('highlight');
    }

    function unhighlight() {
        dropZone.classList.remove('highlight');
    }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                    document.querySelector('.placeholder').style.display = 'none';
                    processBtn.disabled = false;
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    // Process button click handler
    processBtn.addEventListener('click', async () => {
        if (!previewImage.src) return;

        processingOverlay.style.display = 'flex';
        progressBar.style.width = '0%';

        try {
            // Simulate processing (replace with actual OCR API call)
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                progressBar.style.width = `${i}%`;
            }

            // Simulate OCR result (replace with actual OCR result)
            const mockText = "This is a sample of extracted text from the image. The actual OCR implementation would go here.";
            textContent.textContent = mockText;
            confidenceScore.textContent = "95%";

            exportBtn.disabled = false;
            exportOptions.style.display = 'block';
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image. Please try again.');
        } finally {
            processingOverlay.style.display = 'none';
        }
    });

    // Clear button click handler
    clearBtn.addEventListener('click', () => {
        previewImage.src = '';
        previewImage.style.display = 'none';
        document.querySelector('.placeholder').style.display = 'flex';
        textContent.textContent = 'Extracted text will appear here...';
        confidenceScore.textContent = '--%';
        processBtn.disabled = true;
        exportBtn.disabled = true;
        exportOptions.style.display = 'none';
    });

    // Export button click handlers
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const format = btn.dataset.format;
            const text = textContent.textContent;

            switch (format) {
                case 'pdf':
                    // Implement PDF export
                    alert('PDF export would be implemented here');
                    break;
                case 'docx':
                    // Implement Word export
                    alert('Word export would be implemented here');
                    break;
                case 'txt':
                    // Implement text file export
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'extracted-text.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    break;
                case 'copy':
                    // Copy to clipboard
                    navigator.clipboard.writeText(text)
                        .then(() => alert('Text copied to clipboard!'))
                        .catch(err => console.error('Failed to copy text: ', err));
                    break;
            }
        });
    });

    // Password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('input[type="password"]');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your form submission logic here
            console.log('Form submitted');
        });
    }
}); 