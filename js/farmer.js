// Farmer-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeFarmerDashboard();
});

function initializeFarmerDashboard() {
    setupFarmerModals();
    setupFarmerForms();
    setupCowInventoryActions();
    setupStatisticsUpdates();
    loadFarmerData();
}

// Farmer Modal Setup
function setupFarmerModals() {
    // Add Cow Modal
    const addCowForm = document.getElementById('addCowForm');
    if (addCowForm) {
        addCowForm.addEventListener('submit', handleAddCow);
    }

    // Record Milk Modal
    const recordMilkForm = document.getElementById('recordMilkForm');
    if (recordMilkForm) {
        recordMilkForm.addEventListener('submit', handleRecordMilk);
    }

    // Schedule Vet Modal
    const scheduleVetForm = document.getElementById('scheduleVetForm');
    if (scheduleVetForm) {
        scheduleVetForm.addEventListener('submit', handleScheduleVet);
    }
}

// Form Handlers
function handleAddCow(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cowData = {
        name: formData.get('cowName'),
        breed: formData.get('breed'),
        age: formData.get('age'),
        healthStatus: formData.get('healthStatus'),
        id: generateCowId()
    };

    // Simulate API call
    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        addCowToInventory(cowData);
        closeModal();
        showAlert(`Cow ${cowData.name} has been added successfully!`, 'success');
        e.target.reset();
        updateFarmStatistics();
    }, 1500);
}

function handleRecordMilk(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const milkData = {
        cowId: formData.get('cowId'),
        quantity: parseFloat(formData.get('quantity')),
        collectionTime: formData.get('collectionTime'),
        notes: formData.get('notes'),
        date: new Date().toISOString().split('T')[0]
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        recordMilkProduction(milkData);
        closeModal();
        showAlert(`Milk production recorded: ${milkData.quantity}L`, 'success');
        e.target.reset();
        updateFarmStatistics();
        addRecentActivity('🥛', `Recorded ${milkData.quantity}L milk production`, 'just now');
    }, 1500);
}

function handleScheduleVet(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const vetData = {
        cowId: formData.get('cowId'),
        visitDate: formData.get('visitDate'),
        visitType: formData.get('visitType'),
        notes: formData.get('notes'),
        id: generateId()
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        scheduleVetVisit(vetData);
        closeModal();
        showAlert(`Vet visit scheduled for ${formatDate(new Date(vetData.visitDate))}`, 'success');
        e.target.reset();
        addRecentActivity('🏥', `Vet visit scheduled for cow #${vetData.cowId}`, 'just now');
    }, 1500);
}

// Data Management Functions
function addCowToInventory(cowData) {
    const tableBody = document.querySelector('.data-table tbody');
    if (tableBody) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${cowData.id}</td>
            <td>${cowData.name}</td>
            <td>${cowData.breed}</td>
            <td>${cowData.age} years</td>
            <td><span class="badge badge-${getBadgeClass(cowData.healthStatus)}">${cowData.healthStatus}</span></td>
            <td>0.0</td>
        `;
        tableBody.appendChild(row);
        
        // Add fade-in animation
        row.classList.add('fade-in');
    }
}

function recordMilkProduction(milkData) {
    // Update the cow's daily milk production in the table
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        const cowId = row.cells[0].textContent.replace('#', '');
        if (cowId === milkData.cowId) {
            const currentProduction = parseFloat(row.cells[5].textContent) || 0;
            const newProduction = currentProduction + milkData.quantity;
            row.cells[5].textContent = newProduction.toFixed(1);
            
            // Highlight the updated row
            row.style.backgroundColor = '#e8f5e8';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 2000);
        }
    });
}

function scheduleVetVisit(vetData) {
    // Store vet appointment data (in real app, this would go to backend)
    const vetAppointments = JSON.parse(localStorage.getItem('vetAppointments') || '[]');
    vetAppointments.push(vetData);
    localStorage.setItem('vetAppointments', JSON.stringify(vetAppointments));
}

// Utility Functions
function generateCowId() {
    const existingIds = Array.from(document.querySelectorAll('.data-table tbody tr'))
        .map(row => parseInt(row.cells[0].textContent.replace('#', '')))
        .filter(id => !isNaN(id));
    
    const maxId = Math.max(...existingIds, 0);
    return String(maxId + 1).padStart(3, '0');
}

function getBadgeClass(status) {
    const statusMap = {
        'Healthy': 'success',
        'Check-up Due': 'warning',
        'Needs Attention': 'danger'
    };
    return statusMap[status] || 'secondary';
}

function updateFarmStatistics() {
    const totalCows = document.querySelectorAll('.data-table tbody tr').length;
    const healthyCows = document.querySelectorAll('.badge-success').length;
    const needAttention = document.querySelectorAll('.badge-danger').length;
    
    // Calculate total daily production
    let totalProduction = 0;
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        const production = parseFloat(row.cells[5].textContent) || 0;
        totalProduction += production;
    });

    // Update statistics display
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 4) {
        statItems[0].querySelector('.stat-value').textContent = totalCows;
        statItems[1].querySelector('.stat-value').textContent = `${totalProduction.toFixed(0)}L`;
        statItems[2].querySelector('.stat-value').textContent = healthyCows;
        statItems[3].querySelector('.stat-value').textContent = needAttention;
    }

    // Update badge in cow inventory header
    const inventoryBadge = document.querySelector('.card-header .badge');
    if (inventoryBadge) {
        inventoryBadge.textContent = `${totalCows} Total`;
    }
}

function addRecentActivity(icon, title, time) {
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item fade-in';
        activityItem.innerHTML = `
            <div class="activity-icon">${icon}</div>
            <div class="activity-content">
                <p class="activity-title">${title}</p>
                <p class="activity-time">${time}</p>
            </div>
        `;
        
        // Insert at the beginning
        activityList.insertBefore(activityItem, activityList.firstChild);
        
        // Remove oldest activity if more than 5
        const activities = activityList.querySelectorAll('.activity-item');
        if (activities.length > 5) {
            activities[activities.length - 1].remove();
        }
    }
}

function loadFarmerData() {
    // Load saved data from localStorage (in real app, this would come from API)
    const savedData = localStorage.getItem('farmerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        // Apply saved data to the dashboard
        updateDashboardWithSavedData(data);
    }
    
    // Update statistics on page load
    setTimeout(updateFarmStatistics, 500);
}

function updateDashboardWithSavedData(data) {
    // This function would populate the dashboard with saved data
    // For now, we'll just update the statistics
    updateFarmStatistics();
}

// Cow Inventory Actions
function setupCowInventoryActions() {
    // Add click handlers for cow rows
    const tableRows = document.querySelectorAll('.data-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const cowId = this.cells[0].textContent;
            const cowName = this.cells[1].textContent;
            showCowDetails(cowId, cowName);
        });
        
        // Add hover effect
        row.style.cursor = 'pointer';
    });
}

function showCowDetails(cowId, cowName) {
    // Create and show cow details modal
    const modal = createCowDetailsModal(cowId, cowName);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function createCowDetailsModal(cowId, cowName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Cow Details - ${cowName} (${cowId})</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="cow-details">
                    <div class="detail-section">
                        <h4>Basic Information</h4>
                        <p><strong>ID:</strong> ${cowId}</p>
                        <p><strong>Name:</strong> ${cowName}</p>
                        <p><strong>Status:</strong> <span class="badge badge-success">Healthy</span></p>
                    </div>
                    <div class="detail-section">
                        <h4>Production History</h4>
                        <p>Average daily production: 25.2L</p>
                        <p>This week: 176.4L</p>
                        <p>This month: 756.0L</p>
                    </div>
                    <div class="detail-section">
                        <h4>Health Records</h4>
                        <p>Last checkup: 2 weeks ago</p>
                        <p>Next vaccination: In 3 months</p>
                        <p>Vet notes: All normal</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
                <button type="button" class="btn btn-primary" onclick="editCowDetails('${cowId}')">Edit Details</button>
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

function editCowDetails(cowId) {
    showAlert('Edit functionality would be implemented here', 'info');
}

// Statistics Updates
function setupStatisticsUpdates() {
    // Update statistics every 30 seconds (in real app, this might be real-time data)
    setInterval(() => {
        updateFarmStatistics();
    }, 30000);
}

// Export farmer-specific functions
window.FarmerDashboard = {
    addCowToInventory,
    recordMilkProduction,
    scheduleVetVisit,
    updateFarmStatistics,
    addRecentActivity,
    showCowDetails
};

// Auto-save data periodically
setInterval(() => {
    const farmerData = {
        lastUpdated: new Date().toISOString(),
        totalCows: document.querySelectorAll('.data-table tbody tr').length,
        // Add more data to save as needed
    };
    localStorage.setItem('farmerData', JSON.stringify(farmerData));
}, 60000); // Save every minute
