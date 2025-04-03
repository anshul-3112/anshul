document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadZone = document.getElementById('uploadZone');
    const processingOptions = document.getElementById('processingOptions');
    const processingStatus = document.getElementById('processingStatus');
    const resultsArea = document.getElementById('resultsArea');
    const settingsModal = document.getElementById('settingsModal');
    const progressBar = document.getElementById('progressBar');
    const textPreview = document.getElementById('textPreview');

    // Buttons
    const uploadBtn = document.getElementById('uploadBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const cancelSettings = document.getElementById('cancelSettings');
    const startProcess = document.getElementById('startProcess');
    const cancelProcess = document.getElementById('cancelProcess');
    const copyText = document.getElementById('copyText');
    const downloadText = document.getElementById('downloadText');
    const editText = document.getElementById('editText');
    const newDocument = document.getElementById('newDocument');
    const saveDocument = document.getElementById('saveDocument');

    // New DOM Elements
    const resetSettings = document.getElementById('resetSettings');
    const exportHistory = document.getElementById('exportHistory');
    const theme = document.getElementById('theme');
    const processingPriority = document.getElementById('processingPriority');
    const storageLocation = document.getElementById('storageLocation');
    const historyRetention = document.getElementById('historyRetention');
    const autoClearHistory = document.getElementById('autoClearHistory');
    const ocrEngine = document.getElementById('ocrEngine');
    const enableTableDetection = document.getElementById('enableTableDetection');
    const enableLayoutAnalysis = document.getElementById('enableLayoutAnalysis');
    const enableHandwritingRecognition = document.getElementById('enableHandwritingRecognition');
    const enableBatchProcessing = document.getElementById('enableBatchProcessing');

    // File handling
    let currentFile = null;

    // Event Listeners
    uploadZone.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.pdf';
        input.onchange = handleFileSelect;
        input.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        handleFileSelect({ target: { files: [file] } });
    });

    // Settings Modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    cancelSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Theme handling
    theme.addEventListener('change', () => {
        const selectedTheme = theme.value;
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('theme', selectedTheme);
    });

    // Reset settings
    resetSettings.addEventListener('click', () => {
        const defaultSettings = {
            defaultLanguage: 'eng',
            defaultFormat: 'txt',
            imageQuality: 'medium',
            autoEnhance: true,
            autoSave: true,
            theme: 'light',
            processingPriority: 'normal',
            storageLocation: 'cloud',
            historyRetention: '30',
            autoClearHistory: false,
            ocrEngine: 'tesseract',
            enableTableDetection: true,
            enableLayoutAnalysis: true,
            enableHandwritingRecognition: true,
            enableBatchProcessing: false
        };

        // Apply default settings to UI
        Object.entries(defaultSettings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });

        // Save default settings
        localStorage.setItem('ocrSettings', JSON.stringify(defaultSettings));
        showNotification('Settings reset to default');
    });

    // Export history
    exportHistory.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/history/export', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ocr-history-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            showNotification('History exported successfully');
        } catch (error) {
            console.error('Error exporting history:', error);
            showError('Failed to export history. Please try again.');
        }
    });

    // Processing
    startProcess.addEventListener('click', async () => {
        if (!currentFile) return;

        uploadZone.classList.add('hidden');
        processingOptions.classList.add('hidden');
        processingStatus.classList.remove('hidden');

        try {
            const formData = new FormData();
            formData.append('image', currentFile);
            formData.append('options', JSON.stringify(getProcessingOptions()));

            const response = await fetch('/api/ocr/process', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Processing failed');

            const result = await response.json();
            showResults(result.text);
        } catch (error) {
            console.error('Error processing document:', error);
            showError('Failed to process document. Please try again.');
        }
    });

    cancelProcess.addEventListener('click', () => {
        processingStatus.classList.add('hidden');
        uploadZone.classList.remove('hidden');
    });

    // Results Actions
    copyText.addEventListener('click', () => {
        navigator.clipboard.writeText(textPreview.textContent);
        showNotification('Text copied to clipboard');
    });

    downloadText.addEventListener('click', () => {
        const format = document.querySelector('input[name="format"]:checked').value;
        const text = textPreview.textContent;
        downloadFile(text, format);
    });

    editText.addEventListener('click', () => {
        textPreview.contentEditable = true;
        textPreview.focus();
    });

    newDocument.addEventListener('click', () => {
        resultsArea.classList.add('hidden');
        uploadZone.classList.remove('hidden');
        currentFile = null;
    });

    saveDocument.addEventListener('click', async () => {
        const text = textPreview.textContent;
        const format = document.querySelector('input[name="format"]:checked').value;

        try {
            const response = await fetch('/api/ocr/export', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ text, format })
            });

            if (!response.ok) throw new Error('Save failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `document.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            showNotification('Document saved successfully');
        } catch (error) {
            console.error('Error saving document:', error);
            showError('Failed to save document. Please try again.');
        }
    });

    // Helper Functions
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/tiff', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            showError('Invalid file type. Please upload an image or PDF.');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size too large. Maximum size is 5MB.');
            return;
        }

        currentFile = file;
        uploadZone.classList.add('hidden');
        processingOptions.classList.remove('hidden');
    }

    function getProcessingOptions() {
        return {
            docType: document.getElementById('docType').value,
            language: document.getElementById('language').value,
            enhanceContrast: document.getElementById('enhanceContrast').checked,
            removeNoise: document.getElementById('removeNoise').checked,
            deskew: document.getElementById('deskew').checked,
            format: document.querySelector('input[name="format"]:checked').value,
            ocrEngine: ocrEngine.value,
            enableTableDetection: enableTableDetection.checked,
            enableLayoutAnalysis: enableLayoutAnalysis.checked,
            enableHandwritingRecognition: enableHandwritingRecognition.checked,
            processingPriority: processingPriority.value
        };
    }

    function showResults(text) {
        processingStatus.classList.add('hidden');
        resultsArea.classList.remove('hidden');
        textPreview.textContent = text;
    }

    function showError(message) {
        const error = document.createElement('div');
        error.className = 'notification error';
        error.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.classList.add('show');
            setTimeout(() => {
                error.classList.remove('show');
                setTimeout(() => error.remove(), 300);
            }, 3000);
        }, 100);
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    function downloadFile(text, format) {
        const blob = new Blob([text], { type: `text/${format}` });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }

    // Load saved settings (enhanced)
    const savedSettings = localStorage.getItem('ocrSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        Object.entries(settings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });

        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.theme || 'light');
    }
}); 