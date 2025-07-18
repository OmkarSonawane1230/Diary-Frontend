// Retailer-specific JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeRetailerDashboard();
});

function initializeRetailerDashboard() {
    setupRetailerModals();
    setupRetailerForms();
    setupInventoryActions();
    setupStockAlerts();
    loadRetailerData();
    setupProductCardInteractions();
}

// Retailer Modal Setup
function setupRetailerModals() {
    // New Order Modal
    const newOrderForm = document.getElementById('newOrderForm');
    if (newOrderForm) {
        newOrderForm.addEventListener('submit', handleNewOrder);
    }

    // Update Stock Modal
    const updateStockForm = document.getElementById('updateStockForm');
    if (updateStockForm) {
        updateStockForm.addEventListener('submit', handleUpdateStock);
        
        // Setup product selection change handler
        const productSelect = updateStockForm.querySelector('select[name="product"]');
        if (productSelect) {
            productSelect.addEventListener('change', handleProductSelection);
        }
    }

    // Sales Report Modal
    const salesReportForm = document.getElementById('salesReportForm');
    if (salesReportForm) {
        salesReportForm.addEventListener('submit', handleSalesReport);
        
        // Setup period selection change handler
        const periodSelect = salesReportForm.querySelector('select[name="period"]');
        if (periodSelect) {
            periodSelect.addEventListener('change', handlePeriodSelection);
        }
    }
}

// Form Handlers
function handleNewOrder(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const orderData = {
        product: formData.get('product'),
        quantity: parseInt(formData.get('quantity')),
        supplier: formData.get('supplier'),
        deliveryDate: formData.get('deliveryDate'),
        instructions: formData.get('instructions'),
        orderId: generateOrderId(),
        status: 'Pending',
        orderDate: new Date().toISOString().split('T')[0]
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        addOrderToSystem(orderData);
        closeModal();
        showAlert(`Order ${orderData.orderId} placed successfully!`, 'success');
        e.target.reset();
        updateOrdersTable();
    }, 1500);
}

function handleUpdateStock(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const stockData = {
        product: formData.get('product'),
        currentStock: parseInt(formData.get('currentStock')),
        newStock: parseInt(formData.get('newStock')),
        reason: formData.get('reason'),
        updateDate: new Date().toISOString().split('T')[0]
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        updateProductStock(stockData);
        closeModal();
        showAlert(`Stock updated for ${getProductName(stockData.product)}`, 'success');
        e.target.reset();
        refreshInventoryDisplay();
    }, 1500);
}

function handleSalesReport(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reportData = {
        period: formData.get('period'),
        fromDate: formData.get('fromDate'),
        toDate: formData.get('toDate'),
        reportType: formData.get('reportType'),
        generatedDate: new Date().toISOString().split('T')[0]
    };

    showFormLoading(e.target);
    
    setTimeout(() => {
        hideFormLoading(e.target);
        generateSalesReport(reportData);
        closeModal();
        showAlert('Sales report generated successfully!', 'success');
        e.target.reset();
    }, 2000);
}

// Product Selection Handler
function handleProductSelection(e) {
    const selectedProduct = e.target.value;
    const currentStockInput = e.target.form.querySelector('input[name="currentStock"]');
    
    if (selectedProduct && currentStockInput) {
        const currentStock = getCurrentStock(selectedProduct);
        currentStockInput.value = currentStock;
    }
}

// Period Selection Handler
function handlePeriodSelection(e) {
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

// Data Management Functions
function addOrderToSystem(orderData) {
    // Store order data (in real app, this would go to backend)
    const orders = JSON.parse(localStorage.getItem('retailerOrders') || '[]');
    orders.unshift(orderData);
    localStorage.setItem('retailerOrders', JSON.stringify(orders));
}

function updateProductStock(stockData) {
    // Update product stock in local storage
    const inventory = JSON.parse(localStorage.getItem('retailerInventory') || '{}');
    inventory[stockData.product] = stockData.newStock;
    localStorage.setItem('retailerInventory', JSON.stringify(inventory));
}

function generateSalesReport(reportData) {
    // Generate and display sales report
    console.log('Generating sales report:', reportData);
    // In real app, this would generate actual report
}

// Utility Functions
function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    return `ORD${timestamp}`;
}

function getCurrentStock(product) {
    const inventory = JSON.parse(localStorage.getItem('retailerInventory') || '{}');
    return inventory[product] || 0;
}

function getProductName(productKey) {
    const productNames = {
        'whole-milk': 'Whole Milk',
        '2-milk': '2% Milk',
        'skim-milk': 'Skim Milk',
        'heavy-cream': 'Heavy Cream',
        'cheese': 'Cheese',
        'butter': 'Butter'
    };
    return productNames[productKey] || productKey;
}

function updateOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('retailerOrders') || '[]');
    const tableBody = document.querySelector('.data-table tbody');
    
    if (tableBody) {
        tableBody.innerHTML = '';
        
        orders.slice(0, 5).forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${getProductName(order.product)}</td>
                <td>${order.quantity} units</td>
                <td><span class="badge badge-${getStatusBadgeClass(order.status)}">${order.status}</span></td>
            `;
            tableBody.appendChild(row);
        });
    }
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'Pending': 'warning',
        'In Transit': 'primary',
        'Delivered': 'success',
        'Cancelled': 'danger'
    };
    return statusMap[status] || 'secondary';
}

function refreshInventoryDisplay() {
    // Refresh inventory display with updated data
    const inventory = JSON.parse(localStorage.getItem('retailerInventory') || '{}');
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name').textContent.toLowerCase().replace(/\s+/g, '-');
        const stockValue = card.querySelector('.product-value');
        
        if (inventory[productName]) {
            stockValue.textContent = `${inventory[productName]} units`;
            updateStockStatus(stockValue, inventory[productName]);
        }
    });
}

function updateStockStatus(element, stock) {
    element.classList.remove('stock-low', 'stock-medium', 'stock-high');
    
    if (stock < 25) {
        element.classList.add('stock-low');
    } else if (stock < 100) {
        element.classList.add('stock-medium');
    } else {
        element.classList.add('stock-high');
    }
}

function setupStockAlerts() {
    // Check for low stock items
    const inventory = JSON.parse(localStorage.getItem('retailerInventory') || '{}');
    const lowStockItems = [];
    
    Object.entries(inventory).forEach(([product, stock]) => {
        if (stock < 25) {
            lowStockItems.push({ product: getProductName(product), stock });
        }
    });
    
    if (lowStockItems.length > 0) {
        updateStockAlert(lowStockItems);
    }
}

function updateStockAlert(items) {
    const alertContent = document.querySelector('.alert-message');
    if (alertContent) {
        let alertText = '<p><strong>Low Stock Warning:</strong></p>';
        items.forEach(item => {
            alertText += `<p>• ${item.product}: ${item.stock} units remaining</p>`;
        });
        alertText += '<p>Consider placing new orders soon!</p>';
        
        alertContent.innerHTML = alertText;
    }
}

function loadRetailerData() {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('retailerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        // Apply saved data to the dashboard
        updateDashboardWithSavedData(data);
    }
    
    // Initialize with default data if no saved data
    initializeDefaultInventory();
    updateOrdersTable();
    setupStockAlerts();
}

function initializeDefaultInventory() {
    const inventory = JSON.parse(localStorage.getItem('retailerInventory') || '{}');
    
    if (Object.keys(inventory).length === 0) {
        const defaultInventory = {
            'whole-milk': 245,
            '2-milk': 89,
            'skim-milk': 23,
            'heavy-cream': 156,
            'cheese': 67,
            'butter': 12
        };
        localStorage.setItem('retailerInventory', JSON.stringify(defaultInventory));
    }
}

function updateDashboardWithSavedData(data) {
    // Update dashboard with saved data
    refreshInventoryDisplay();
}

// Product Card Interactions
function setupProductCardInteractions() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productName = this.querySelector('.product-name').textContent;
            showProductDetails(productName);
        });
        
        // Add hover effect
        card.style.cursor = 'pointer';
    });
}

function showProductDetails(productName) {
    // Create and show product details modal
    const modal = createProductDetailsModal(productName);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function createProductDetailsModal(productName) {
    const productData = getProductData(productName);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">${productName} Details</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="product-details">
                    <div class="detail-section">
                        <h4>Current Stock</h4>
                        <p><strong>Available:</strong> ${productData.stock} units</p>
                        <p><strong>Status:</strong> ${getStockStatus(productData.stock)}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Pricing</h4>
                        <p><strong>Current Price:</strong> ${productData.price}</p>
                        <p><strong>Last Updated:</strong> ${productData.lastUpdated}</p>
                    </div>
                    <div class="detail-section">
                        <h4>Recent Sales</h4>
                        <p><strong>Today:</strong> ${productData.todaySales} units</p>
                        <p><strong>This Week:</strong> ${productData.weekSales} units</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
                <button type="button" class="btn btn-primary" onclick="editProductDetails('${productName}')">Edit Details</button>
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

function getProductData(productName) {
    const inventory = JSON.parse(localStorage.getItem('retailerInventory') || '{}');
    const productKey = productName.toLowerCase().replace(/\s+/g, '-');
    
    return {
        stock: inventory[productKey] || 0,
        price: getProductPrice(productName),
        lastUpdated: 'Today',
        todaySales: Math.floor(Math.random() * 20),
        weekSales: Math.floor(Math.random() * 100)
    };
}

function getProductPrice(productName) {
    const prices = {
        'Whole Milk': '$3.99/L',
        '2% Milk': '$3.79/L',
        'Skim Milk': '$3.59/L',
        'Heavy Cream': '$5.99/L',
        'Cheese': '$8.99/kg',
        'Butter': '$4.49/pack'
    };
    return prices[productName] || '$0.00';
}

function getStockStatus(stock) {
    if (stock < 25) return 'Low Stock';
    if (stock < 100) return 'Medium Stock';
    return 'Good Stock';
}

function editProductDetails(productName) {
    showAlert(`Edit functionality for ${productName} would be implemented here`, 'info');
}

// Auto-save data periodically
setInterval(() => {
    const retailerData = {
        lastUpdated: new Date().toISOString(),
        totalRevenue: 1247,
        itemsSold: 89,
        transactions: 34,
        averageSale: 36.68
    };
    localStorage.setItem('retailerData', JSON.stringify(retailerData));
}, 60000); // Save every minute

// Export retailer-specific functions
window.RetailerDashboard = {
    refreshInventoryDisplay,
    updateStockStatus,
    setupStockAlerts,
    showProductDetails
};
