// Authentication JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    setupAuthForms();
}

async function postData(url = "", data = {}, method_ = "") {
    const response = await fetch(url, {
        method: method_,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return response.text();
}

// Auth Form Setup
function setupAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    
    if (loginForm) {
        // loginForm.getElementsByTagName('button')[0].addEventListener('click', handleLogin)
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registrationForm) {
        // registrationForm.getElementsByTagName('button')[0].addEventListener('click', handleRegistration)
        registrationForm.addEventListener('submit', handleRegistration);
    }
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const loginData = {
        email: "--- email ----",
        password: "--- password ---"
    };

    // send data to server for validation

    // Basic validation (only required fields)
    if (!loginData.email) {
        showAlert('Please enter your email address', 'error');
        return;
    }
    if (!loginData.password) {
        showAlert('Please enter your password', 'error');
        return;
    }
console.log("hello")
    const path = window.location.pathname;
    const page = path.split('/').pop();
    window.location.href = "farmer.html";
}

function getUserType() {
  const radioButtons = document.getElementsByName("userType");
  for (let i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
      return radioButtons[i].value;
    }
  }
  return null; // No radio button selected
}

// Registration Handler
async function handleRegistration(e) {
    e.preventDefault();
    const formData = document.getElementById('registrationForm');
    const registrationData = {
        "username": `${formData.username.value}`,
        "userType": `${getUserType()}`,
        "password": `${formData.password.value}`
    };
    console.log(registrationData)
    result = await postData(`http://10.142.153.52:8080/api/user/create-user`, registrationData, "POST");
    console.log(result)
}

// Password Validation (disabled for simplicity)
function setupPasswordValidation() {}

// Forgot Password Setup
function setupForgotPassword() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
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

// Check if user is already logged in (disabled)
function checkAuthStatus() {
    // No-op
}

// Remove mock users and localStorage initialization
// Remove initializeMockUsers

// Logout function (just redirect)
function logout() {
    window.location.href = 'login.html';
}

// Role-based access control functions (no localStorage)
function getUserRole() {
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
        redirectToDashboard(userRole);
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

// Setup role-based navigation restrictions (no localStorage)
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
    checkPageAccess();
    setupRoleBasedNavigation();
}

// Export auth functions
window.Auth = {
    logout,
    checkAuthStatus,
    getUserRole,
    checkPageAccess,
    setupRoleBasedNavigation,
    initializeRoleBasedAccess
};
