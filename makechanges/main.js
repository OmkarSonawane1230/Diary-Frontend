// Main JavaScript file for Dairy Director application

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupResponsiveMenu();
});

// Initialize Application
function initializeApp() {
    setupNavigation();
}

function toggleNavigationElement(elementList, elementIndex) {
    elementList.forEach(navItem => {
        navItem.classList.remove('active');
    })
    elementList[elementIndex].classList.add('active');
}

// Navigation Functions
function setupNavigation() {
    const navItems = Array.from(document.getElementsByClassName('nav-item'));
    const navBodys = Array.from(document.getElementsByClassName('nav-body'));

    // set default page for user
    navItems[0].classList.add('active');
    navBodys[0].classList.add('active');
    console.log(navItems, navBodys);
    navItems.forEach(navItem => {

        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            const clickedIndex = navItems.indexOf(navItem);
            toggleNavigationElement(navItems, clickedIndex);
            toggleNavigationElement(navBodys, clickedIndex);
        })
    });
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
