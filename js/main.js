// Main JavaScript file for Dairy Director application

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
    setupDateDisplay();
    setupProgressBars();
    setupModals();
    setupForms();
    setupResponsiveMenu();
    setupAlerts();
}

// Navigation Functions
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = getCurrentPage();
    
    navLinks.forEach(link => {
        // Remove active class from all nav items
        link.parentElement.classList.remove('active');
        
        // Add active class to current page
        if (link.getAttribute('href') === currentPage || 
            (currentPage === 'index.html' && link.getAttribute('href') === 'index.html')) {
            link.parentElement.classList.add('active');
        }
        
        // Add click event for smooth navigation
        link.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                return;
            }
            
            // Add loading state
            showPageLoading();
        });
    });
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page || 'index.html';
}

// Date Display Functions
function setupDateDisplay() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        updateDateDisplay();
        // Update date every minute
        setInterval(updateDateDisplay, 60000);
    }
}

function updateDateDisplay() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const formattedDate = now.toLocaleDateString('en-US', options);
    
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
}

// Progress Bar Animations
function setupProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    // Animate progress bars on page load
    setTimeout(() => {
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 1s ease-out';
            
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }, 500);
}

// Modal Functions
function setupModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modalCloses = document.querySelectorAll('.modal-close, .modal-overlay');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    modalCloses.forEach(close => {
        close.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const activeModal = document.querySelector('.modal-overlay.active');
    if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Form Functions
function setupForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        
        // Setup form validation
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidation);
        });
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Show loading state
    showFormLoading(form);
    
    // Simulate form submission
    setTimeout(() => {
        hideFormLoading(form);
        showAlert('Form submitted successfully!', 'success');
        form.reset();
    }, 2000);
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');
    
    clearValidation(input);
    
    if (required && !value) {
        showInputError(input, 'This field is required');
        return false;
    }
    
    if (type === 'email' && value && !isValidEmail(value)) {
        showInputError(input, 'Please enter a valid email address');
        return false;
    }
    
    if (type === 'password' && value && value.length < 6) {
        showInputError(input, 'Password must be at least 6 characters');
        return false;
    }
    
    showInputSuccess(input);
    return true;
}

function clearValidation(input) {
    if (typeof input === 'object' && input.target) {
        input = input.target;
    }
    
    input.classList.remove('error', 'success');
    const errorElement = input.parentElement.querySelector('.form-error');
    const successElement = input.parentElement.querySelector('.form-success');
    
    if (errorElement) errorElement.remove();
    if (successElement) successElement.remove();
}

function showInputError(input, message) {
    input.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'form-error';
    errorElement.textContent = message;
    
    input.parentElement.appendChild(errorElement);
}

function showInputSuccess(input) {
    input.classList.add('success');
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Responsive Menu Functions
function setupResponsiveMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Close sidebar when clicking outside
        document.addEventListener('click', function(e) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// Alert Functions
function setupAlerts() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            hideAlert(alert);
        }, 5000);
    });
}

function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = getOrCreateAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    
    const icon = getAlertIcon(type);
    
    alert.innerHTML = `
        <span class="alert-icon">${icon}</span>
        <div class="alert-content">
            <div class="alert-message">${message}</div>
        </div>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-hide alert
    setTimeout(() => {
        hideAlert(alert);
    }, duration);
    
    return alert;
}

function hideAlert(alert) {
    if (alert && alert.parentElement) {
        alert.style.opacity = '0';
        alert.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            alert.remove();
        }, 300);
    }
}

function getOrCreateAlertContainer() {
    let container = document.getElementById('alert-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'alert-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 3000;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    return container;
}

function getAlertIcon(type) {
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };
    return icons[type] || icons.info;
}

// Loading Functions
function showPageLoading() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = '<div class="loading-spinner"></div>';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 4000;
    `;
    
    document.body.appendChild(loader);
}

function hidePageLoading() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.remove();
    }
}

function showFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading-dots"><div class="loading-dot"></div><div class="loading-dot"></div><div class="loading-dot"></div></div>';
    }
}

function hideFormLoading(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other files
window.DairyDirector = {
    showAlert,
    hideAlert,
    openModal,
    closeModal,
    showPageLoading,
    hidePageLoading,
    validateInput,
    formatNumber,
    formatDate,
    generateId
};

// Initialize tooltips and other interactive elements
function initializeInteractiveElements() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.12)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn, .record-delivery-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize interactive elements when DOM is ready
document.addEventListener('DOMContentLoaded', initializeInteractiveElements);
