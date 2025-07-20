// Authentication JavaScript functionality

document.addEventListener('DOMContentLoaded', function () {
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
    const formData = document.getElementById('loginForm');
    const loginData = {
        "userid": `${formData.userId.value}`,
        "password": `${formData.password.value}`
    };

    console.log(loginData)

    // send data to server for validation

    // const path = window.location.pathname;
    // const page = path.split('/').pop();
    // window.location.href = "farmer.html";
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
    result = await postData(`http://10.129.20.53:8080/api/user/create-user`, registrationData, "POST");
    console.log(result)

    // redirect to respective dashboard;
}

// Password Validation (disabled for simplicity)
function setupPasswordValidation() { }

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
