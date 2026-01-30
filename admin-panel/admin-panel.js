// admin-panel.js - Updated for Fresh System
const API_BASE = 'http://localhost:3001/api';
let currentUser = null;
let currentSection = 'dashboard';

// Check if user is admin
function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    return user.role === 'admin';
}

// Login to admin panel
async function adminLogin() {
    const email = prompt('Enter admin email:');
    const password = prompt('Enter admin password:');
    
    if (!email || !password) return;
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success && data.user.role === 'admin') {
            currentUser = data.user;
            localStorage.setItem('adminUser', JSON.stringify(data.user));
            localStorage.setItem('adminToken', data.token);
            
            showSection('dashboard');
            showNotification('Admin login successful!', 'success');
            document.getElementById('admin-login').style.display = 'none';
            document.getElementById('admin-content').style.display = 'block';
            document.getElementById('admin-name').textContent = data.user.name;
        } else {
            showNotification('Admin access only. First registered user becomes admin.', 'error');
        }
    } catch (error) {
        showNotification('Login failed. Check backend connection.', 'error');
    }
}

// Logout from admin panel
function adminLogout() {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    currentUser = null;
    
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-content').style.display = 'none';
    showNotification('Logged out successfully', 'info');
}

// Dashboard Functions
async function loadDashboard() {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        showSection('login');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
            adminLogout();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            
            // Update stats
            document.getElementById('total-users').textContent = stats.totalUsers;
            document.getElementById('active-users').textContent = stats.activeUsers;
            document.getElementById('total-balance').textContent = `$${stats.totalRealBalance.toLocaleString()}`;
            document.getElementById('paper-balance').textContent = `$${stats.totalPaperBalance.toLocaleString()}`;
            document.getElementById('total-orders').textContent = stats.totalOrders;
            document.getElementById('pending-orders').textContent = stats.pendingOrders;
            document.getElementById('total-deposits').textContent = `$${stats.totalDeposits.toLocaleString()}`;
            document.getElementById('pending-deposits').textContent = stats.pendingDeposits;
            document.getElementById('pending-withdrawals').textContent = stats.pendingWithdrawals;
            document.getElementById('last-updated').textContent = new Date(stats.lastUpdated).toLocaleString();
            
            // Show content
            document.getElementById('dashboard-loading').style.display = 'none';
            document.getElementById('dashboard-content').style.display = 'block';
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        document.getElementById('dashboard-loading').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc3545;">
                <h3>Connection Error</h3>
                <p>Cannot connect to backend.</p>
                <button onclick="loadDashboard()" class="btn-primary">Retry</button>
            </div>
        `;
    }
}

// Load Users
async function loadUsers() {
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
            adminLogout();
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.querySelector('#usersTable tbody');
            tbody.innerHTML = data.users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="status-badge status-${user.accountStatus}">${user.accountStatus}</span></td>
                    <td>$${user.realBalance.toFixed(2)}</td>
                    <td>$${user.paperBalance.toFixed(2)}</td>
                    <td>${user.role}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editUser('${user.id}')">Edit</button>
                        <button class="btn-action btn-delete" onclick="deleteUser('${user.id}')">Delete</button>
                        <select onchange="updateUserStatus('${user.id}', this.value)" class="status-select">
                            <option value="active" ${user.accountStatus === 'active' ? 'selected' : ''}>Active</option>
                            <option value="suspended" ${user.accountStatus === 'suspended' ? 'selected' : ''}>Suspended</option>
                            <option value="banned" ${user.accountStatus === 'banned' ? 'selected' : ''}>Banned</option>
                        </select>
                    </td>
                </tr>
            `).join('');
            
            document.getElementById('users-count').textContent = `(${data.count} users)`;
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('users-section', 'Failed to load users');
    }
}

// Load Orders
async function loadOrders() {
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`${API_BASE}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const tbody = document.querySelector('#ordersTable tbody');
            tbody.innerHTML = data.orders.map(order => `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.userName}</td>
                    <td><span class="badge ${order.type === 'buy' ? 'badge-buy' : 'badge-sell'}">${order.type.toUpperCase()}</span></td>
                    <td>${order.asset}</td>
                    <td>${order.amount}</td>
                    <td>$${order.price.toFixed(2)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.date).toLocaleString()}</td>
                    <td>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-select">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showError('orders-section', 'Failed to load orders');
    }
}

// Load Transactions
async function loadTransactions() {
    const token = localStorage.getItem('adminToken');
    
    try {
        const response = await fetch(`${API_BASE}/admin/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Load deposits
            const depositsBody = document.querySelector('#depositsTable tbody');
            depositsBody.innerHTML = data.deposits.map(deposit => `
                <tr>
                    <td>${deposit.id}</td>
                    <td>${deposit.userName}</td>
                    <td>$${deposit.amount.toFixed(2)}</td>
                    <td>${deposit.method}</td>
                    <td>${new Date(deposit.date).toLocaleString()}</td>
                    <td><span class="status-badge status-${deposit.status}">${deposit.status}</span></td>
                </tr>
            `).join('');
            
            // Load withdrawals
            const withdrawalsBody = document.querySelector('#withdrawalsTable tbody');
            withdrawalsBody.innerHTML = data.withdrawals.map(withdrawal => `
                <tr>
                    <td>${withdrawal.id}</td>
                    <td>${withdrawal.userName}</td>
                    <td>$${withdrawal.amount.toFixed(2)}</td>
                    <td>${withdrawal.method}</td>
                    <td>${new Date(withdrawal.date).toLocaleString()}</td>
                    <td><span class="status-badge status-${withdrawal.status}">${withdrawal.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showError('transactions-section', 'Failed to load transactions');
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    const token = localStorage.getItem('adminToken');
    
    if (!confirm(`Change order status to ${status}?`)) return;
    
    try {
        const response = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification(`Order status updated to ${status}`, 'success');
            loadOrders();
        }
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Failed to update order', 'error');
    }
}

// Update user status
async function updateUserStatus(userId, status) {
    // This would need a new endpoint in server.js
    showNotification('Update user status feature coming soon', 'info');
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Delete this user? This action cannot be undone.')) return;
    showNotification('Delete user feature coming soon', 'info');
}

// Navigation
function showSection(sectionId) {
    currentSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Load data if user is logged in
        const token = localStorage.getItem('adminToken');
        if (token) {
            switch(sectionId) {
                case 'dashboard':
                    loadDashboard();
                    break;
                case 'users':
                    loadUsers();
                    break;
                case 'orders':
                    loadOrders();
                    break;
                case 'transactions':
                    loadTransactions();
                    break;
            }
        }
    }
}

// Check admin access on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Panel Loaded');
    
    // Check if admin is logged in
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    const token = localStorage.getItem('adminToken');
    
    if (adminUser.role === 'admin' && token) {
        currentUser = adminUser;
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        document.getElementById('admin-name').textContent = adminUser.name;
        showSection('dashboard');
    } else {
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-content').style.display = 'none';
    }
    
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
    
    // Setup logout button
    document.getElementById('logout-btn').addEventListener('click', adminLogout);
    
    // Setup login button
    document.getElementById('login-btn').addEventListener('click', adminLogin);
});

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#cce5ff'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#004085'};
        border-radius: 5px; z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(sectionId, message) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3 style="color: #dc3545;">Error</h3>
                <p>${message}</p>
                <button onclick="showSection('${sectionId.replace('-section', '')}')" class="btn-primary">
                    Try Again
                </button>
            </div>
        `;
    }
}