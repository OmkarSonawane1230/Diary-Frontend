// Owner-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeOwnerDashboard();
});

function initializeOwnerDashboard() {
    setupOwnerModals();
    setupOwnerForms();
    setupChartFilters();
    setupBusinessMetrics();
    loadOwnerData();
    setupUserManagement();
}

// Owner Modal Setup
function setupOwnerModals() {
    // Add Farm Modal
    const addFarmForm = document.getElementById('addFarmForm');
    if (addFarmForm) {
        addFarmForm.addEventListener('submit', handleAddFarm);
    }

    // Generate Report Modal
    const generateReportForm = document.getElementById('generateReportForm');
    if (generateReportForm) {
        generateReportForm.addEventListener('submit', handleGenerateReport);
        
        // Setup period selection change handler
        const periodSelect = generateReportForm.querySelector('select[name="period"]');
        if (periodSelect) {
            periodSelect.addEventListener('change', handleReportPeriodSelection);
        }
    }
}

// Form Handlers
function handleAddFarm(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const farmData = {
        farmName: formData.get('farmName'),
        ownerName: formData.get('ownerName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        farmSize: parseInt(formData.get('farmSize')),
        cowCount: parseInt(formData.get('cowCount')),
        address: formData.get('address'),
        farmId: generateFarmId(),
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active'
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        addFarmToSystem(farmData);
        closeModal();
        showAlert(`Farm ${farmData.farmName} added successfully!`, 'success');
        e.target.reset();
        updateFarmPerformanceTable();
    }, 1500);
}

function handleGenerateReport(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reportData = {
        reportType: formData.get('reportType'),
        period: formData.get('period'),
        fromDate: formData.get('fromDate'),
        toDate: formData.get('toDate'),
        format: formData.get('format'),
        generatedDate: new Date().toISOString().split('T')[0]
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        generateBusinessReport(reportData);
        closeModal();
        showAlert(`Business report generated in ${reportData.format.toUpperCase()} format!`, 'success');
        e.target.reset();
    }, 2000);
}

// Report Period Selection Handler
function handleReportPeriodSelection(e) {
    const selectedPeriod = e.target.value;
    const customDateRange = document.getElementById('customDateRange');
    
    if (customDateRange) {
        if (selectedPeriod === 'custom') {
            customDateRange.style.display = 'block';
            customDateRange.querySelectorAll('input').forEach(input => {
                input.required = true;
            });
        } else {
            customDateRange.style.display = 'none';
            customDateRange.querySelectorAll('input').forEach(input => {
                input.required = false;
            });
        }
    }
}

// Chart Filter Functions
function setupChartFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart based on selected period
            const period = this.textContent.toLowerCase();
            updateChartData(period);
        });
    });
}

function updateChartData(period) {
    // In real app, this would fetch actual data based on period
    console.log(`Updating chart for ${period} period`);
}

// Business Metrics Functions
function setupBusinessMetrics() {
    // Update metrics periodically
    setInterval(() => {
        updateBusinessMetrics();
    }, 30000); // Update every 30 seconds
}

function updateBusinessMetrics() {
    // Simulate real-time updates
    const metrics = document.querySelectorAll('.metric-value');
    if (metrics.length >= 4) {
        // Add subtle animations for updates
        metrics.forEach(metric => {
            metric.style.transform = 'scale(1.05)';
            setTimeout(() => {
                metric.style.transform = 'scale(1)';
            }, 200);
        });
    }
}

// Data Management Functions
function addFarmToSystem(farmData) {
    // Store farm data (in real app, this would go to backend)
    const farms = JSON.parse(localStorage.getItem('ownerFarms') || '[]');
    farms.unshift(farmData);
    localStorage.setItem('ownerFarms', JSON.stringify(farms));
}

function generateBusinessReport(reportData) {
    // Generate and store report data
    const reports = JSON.parse(localStorage.getItem('ownerReports') || '[]');
    reports.unshift({
        ...reportData,
        reportId: generateReportId()
    });
    localStorage.setItem('ownerReports', JSON.stringify(reports));
}

// User Management Functions
function setupUserManagement() {
    // Setup user management interactions
    const userRows = document.querySelectorAll('.data-table tbody tr');
    userRows.forEach(row => {
        row.addEventListener('click', function() {
            const userName = this.cells[0].textContent;
            showUserDetails(userName);
        });
        
        // Add hover effect
        row.style.cursor = 'pointer';
    });
}

function showUserDetails(userName) {
    // Create and show user details modal
    const modal = createUserDetailsModal(userName);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function createUserDetailsModal(userName) {
    const userData = getUserData(userName);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">User Details - ${userName}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="user-details">
                    <div class="detail-section">
                        <h4>Basic Information</h4>
                        <p><strong>Name:</strong> ${userData.name}</p>
                        <p><strong>Email:</strong> ${userData.email}</p>
                        <p><strong>Phone:</strong> ${userData.phone}</p>
                        <p><strong>Role:</strong> ${userData.role}</p>
                        <p><strong>Status:</strong> ${userData.status}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Activity Summary</h4>
                        <p><strong>Last Login:</strong> ${userData.lastLogin}</p>
                        <p><strong>Total Logins:</strong> ${userData.totalLogins}</p>
                        <p><strong>Account Created:</strong> ${userData.createdDate}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Permissions</h4>
                        <p><strong>Dashboard Access:</strong> ${userData.permissions.dashboard ? 'Yes' : 'No'}</p>
                        <p><strong>Reports Access:</strong> ${userData.permissions.reports ? 'Yes' : 'No'}</p>
                        <p><strong>User Management:</strong> ${userData.permissions.users ? 'Yes' : 'No'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
                <button type="button" class="btn btn-primary" onclick="editUserDetails('${userName}')">Edit User</button>
            </div>
        </div>
    `;
    
    // Add close functionality
    modal.addEventListener('click', function(e) {
        if (e.target === this || e.target.classList.contains('modal-close')) {
            this.remove();
        }
    });
    
    return modal;
}

function getUserData(userName) {
    // Mock user data - in real app, this would come from backend
    return {
        name: userName,
        email: `${userName.toLowerCase().replace(/\s+/g, '.')}@dairy.com`,
        phone: '+1-555-0123',
        role: userName.includes('Farm') ? 'Farm Owner' : 'Retailer',
        status: 'Active',
        lastLogin: '2 hours ago',
        totalLogins: 156,
        createdDate: '2024-01-15',
        permissions: {
            dashboard: true,
            reports: true,
            users: userName.includes('Farm') ? false : true
        }
    };
}

function editUserDetails(userName) {
    showAlert(`Edit functionality for ${userName} would be implemented here`, 'info');
}

// Farm Performance Functions
function updateFarmPerformanceTable() {
    const farms = JSON.parse(localStorage.getItem('ownerFarms') || '[]');
    const tableBody = document.querySelector('.data-table tbody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        farms.slice(0, 5).forEach(farm => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${farm.farmName}</td>
                <td>${farm.cowCount}</td>
                <td>${Math.floor(farm.cowCount * 25)}L</td>
                <td>${(Math.random() * 2 + 8).toFixed(1)}/10</td>
                <td><span class="badge badge-success">Excellent</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Utility Functions
function generateFarmId() {
    const timestamp = Date.now().toString().slice(-6);
    return `FARM${timestamp}`;
}

function generateReportId() {
    const timestamp = Date.now().toString().slice(-8);
    return `RPT${timestamp}`;
}

function refreshBusinessData() {
    // Refresh all business data
    updateBusinessMetrics();
    updateFarmPerformanceTable();
    showAlert('Business data refreshed successfully!', 'success');
}

function loadOwnerData() {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('ownerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        updateDashboardWithSavedData(data);
    }
    
    // Initialize with default data
    initializeDefaultFarms();
    updateFarmPerformanceTable();
}

function initializeDefaultFarms() {
    const farms = JSON.parse(localStorage.getItem('ownerFarms') || '[]');
    
    if (farms.length === 0) {
        const defaultFarms = [
            {
                farmName: 'Sunny Valley Farm',
                ownerName: 'John Smith',
                email: 'john@sunnyvalley.com',
                phone: '+1-555-0101',
                farmSize: 150,
                cowCount: 24,
                address: '123 Sunny Road, Valley Town',
                farmId: 'FARM001',
                joinDate: '2024-01-01',
                status: 'Active'
            },
            {
                farmName: 'Green Pastures',
                ownerName: 'Sarah Johnson',
                email: 'sarah@greenpastures.com',
                phone: '+1-555-0102',
                farmSize: 120,
                cowCount: 18,
                address: '456 Green Lane, Pasture City',
                farmId: 'FARM002',
                joinDate: '2024-01-15',
                status: 'Active'
            }
        ];
        localStorage.setItem('ownerFarms', JSON.stringify(defaultFarms));
    }
}

function updateDashboardWithSavedData(data) {
    // Update dashboard with saved data
    updateBusinessMetrics();
    updateFarmPerformanceTable();
}

// Auto-save data periodically
setInterval(() => {
    const ownerData = {
        lastUpdated: new Date().toISOString(),
        totalRevenue: 24567,
        totalOrders: 1247,
        activeCustomers: 89,
        activeFarms: 24
    };
    localStorage.setItem('ownerData', JSON.stringify(ownerData));
}, 60000); // Save every minute

// Export owner-specific functions
window.OwnerDashboard = {
    refreshBusinessData,
    updateFarmPerformanceTable,
    generateBusinessReport,
    showUserDetails
};
