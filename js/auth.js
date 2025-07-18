// Authentication JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    setupAuthForms();
    setupForgotPassword();
    setupTermsModal();
    setupPasswordValidation();
}

// Auth Form Setup
function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember') === 'on'
    };

    // Basic validation
    if (!validateEmail(loginData.email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    if (loginData.password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }

    showFormLoading(e.target);
    
    // Simulate login process
    setTimeout(() => {
        hideFormLoading(e.target);
        
        // Mock authentication - in real app, this would be API call
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const user = mockUsers.find(u => u.email === loginData.email && u.password === loginData.password);
        
        if (user) {
            // Store user session
            const sessionData = {
                userId: user.id,
                email: user.email,
                fullName: user.fullName,
                accountType: user.accountType,
                loginTime: new Date().toISOString(),
                remember: loginData.remember
            };
            
            localStorage.setItem('currentUser', JSON.stringify(sessionData));
            
            // Redirect based on account type
            redirectToDashboard(user.accountType);
        } else {
            showAlert('Invalid email or password', 'error');
        }
    }, 1500);
}

// Registration Handler
function handleRegistration(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const registrationData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        accountType: formData.get('accountType'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };

    // Validation
    if (!validateRegistration(registrationData)) {
        return;
    }

    showFormLoading(e.target);
    
    // Simulate registration process
    setTimeout(() => {
        hideFormLoading(e.target);
        
        // Check if email already exists
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const existingUser = mockUsers.find(u => u.email === registrationData.email);
        
        if (existingUser) {
            showAlert('Email address already registered', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: generateUserId(),
            ...registrationData,
            createdDate: new Date().toISOString(),
            status: 'Active'
        };
        
        // Store user (in real app, this would be API call)
        mockUsers.push(newUser);
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        
        // Auto-login after registration
        const sessionData = {
            userId: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            accountType: newUser.accountType,
            loginTime: new Date().toISOString(),
            remember: false
        };
        
        localStorage.setItem('currentUser', JSON.stringify(sessionData));
        
        showAlert('Account created successfully!', 'success');
        
        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(newUser.accountType);
        }, 1000);
    }, 1500);
}

// Validation Functions
function validateRegistration(data) {
    if (!data.fullName || data.fullName.trim().length < 2) {
        showAlert('Please enter your full name', 'error');
        return false;
    }
    
    if (!validateEmail(data.email)) {
        showAlert('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
        showAlert('Please enter a valid phone number', 'error');
        return false;
    }
    
    if (!data.accountType) {
        showAlert('Please select an account type', 'error');
        return false;
    }
    
    if (data.password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return false;
    }
    
    if (data.password !== data.confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password Validation
function setupPasswordValidation() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', validatePasswordStrength);
    });
}

function validatePasswordStrength(e) {
    const password = e.target.value;
    const strengthIndicator = document.getElementById('password-strength');
    
    if (!strengthIndicator) return;
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#e74c3c', '#f57c00', '#f57c00', '#27ae60', '#27ae60'];
    
    strengthIndicator.textContent = strengthText[strength] || 'Very Weak';
    strengthIndicator.style.color = strengthColors[strength] || '#e74c3c';
}

// Forgot Password Setup
function setupForgotPassword() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
}

function handleForgotPassword(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');

    if (!validateEmail(email)) {
        showAlert('Please enter a valid email address', 'error');
        return;
    }

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        closeModal();
        showAlert('Password reset link sent to your email', 'success');
        e.target.reset();
    }, 1500);
}

// Terms Modal Setup
function setupTermsModal() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        // Terms modal is already handled by main.js modal system
    }
}

// Utility Functions
function redirectToDashboard(accountType) {
    const dashboardMap = {
        'farmer': 'farmer.html',
        'retailer': 'retailer.html',
        'owner': 'owner.html'
    };
    
    const targetPage = dashboardMap[accountType] || 'index.html';
    window.location.href = targetPage;
}

function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

function showForgotPassword() {
    openModal('forgotPasswordModal');
}

function showTerms() {
    openModal('termsModal');
}

function showPrivacy() {
    openModal('termsModal');
}

// Check if user is already logged in
function checkAuthStatus() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        redirectToDashboard(userData.accountType);
    }
}

// Initialize mock users for demo
function initializeMockUsers() {
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    
    if (mockUsers.length === 0) {
        const defaultUsers = [
            {
                id: 'user_001',
                fullName: 'Demo Farmer',
                email: 'farmer@demo.com',
                phone: '+1-555-0101',
                accountType: 'farmer',
                password: 'demo123',
                createdDate: '2024-01-01'
            },
            {
                id: 'user_002',
                fullName: 'Demo Retailer',
                email: 'retailer@demo.com',
                phone: '+1-555-0102',
                accountType: 'retailer',
                password: 'demo123',
                createdDate: '2024-01-01'
            },
            {
                id: 'user_003',
                fullName: 'Demo Owner',
                email: 'owner@demo.com',
                phone: '+1-555-0103',
                accountType: 'owner',
                password: 'demo123',
                createdDate: '2024-01-01'
            }
        ];
        
        localStorage.setItem('mockUsers', JSON.stringify(defaultUsers));
    }
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeMockUsers();
    
    // Check auth status on auth pages
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('registration.html')) {
        checkAuthStatus();
    }
});

// Role-based access control functions
function getUserRole() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        return userData.accountType || 'generic';
    }
    return 'generic';
}

function checkPageAccess() {
    const currentPage = getCurrentPage();
    const userRole = getUserRole();
    
    const pageRoleMap = {
        'farmer.html': 'farmer',
        'retailer.html': 'retailer',
        'owner.html': 'owner'
    };
    
    const requiredRole = pageRoleMap[currentPage];
    
    // If page requires specific role and user doesn't have it
    if (requiredRole && userRole !== requiredRole && userRole !== 'generic') {
        showAccessDeniedAlert();
        // Redirect to appropriate dashboard
        setTimeout(() => {
            redirectToDashboard(userRole);
        }, 2000);
        return false;
    }
    
    return true;
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page || 'index.html';
}

function showAccessDeniedAlert() {
    if (window.DairyDirector && window.DairyDirector.showAlert) {
        window.DairyDirector.showAlert('Access Denied: You do not have permission to view this page.', 'error');
    } else {
        alert('Access Denied: You do not have permission to view this page.');
    }
}

// Setup role-based navigation restrictions
function setupRoleBasedNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const userRole = getUserRole();
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const requiredRole = getRequiredRoleForPage(href);
        
        // If link requires specific role and user doesn't have it
        if (requiredRole && userRole !== requiredRole && userRole !== 'generic') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showAccessDeniedAlert();
            });
            
            // Add visual indication that link is restricted
            link.style.opacity = '0.5';
            link.style.cursor = 'not-allowed';
        }
    });
}

function getRequiredRoleForPage(href) {
    if (!href || href.startsWith('#')) return null;
    
    const pageRoleMap = {
        'farmer.html': 'farmer',
        'retailer.html': 'retailer',
        'owner.html': 'owner'
    };
    
    return pageRoleMap[href];
}

// Initialize role-based access control
function initializeRoleBasedAccess() {
    // Check page access permissions
    checkPageAccess();
    
    // Setup role-based navigation
    setupRoleBasedNavigation();
}

// Export auth functions
window.Auth = {
    logout,
    checkAuthStatus,
    validateEmail,
    validateRegistration,
    getUserRole,
    checkPageAccess,
    setupRoleBasedNavigation,
    initializeRoleBasedAccess
};
