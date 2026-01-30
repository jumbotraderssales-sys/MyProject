// 📁 crypto-admin-system/database.js
// This simulates a database using localStorage

class Database {
    constructor() {
        // Initialize if empty
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('transactions')) {
            localStorage.setItem('transactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('plans')) {
            localStorage.setItem('plans', JSON.stringify([
                { id: 1, name: 'Basic', price: 100, features: ['Basic Trading', '24/7 Support'] },
                { id: 2, name: 'Pro', price: 300, features: ['Advanced Trading', 'Priority Support', 'Analytics'] },
                { id: 3, name: 'Enterprise', price: 1000, features: ['All Features', 'Dedicated Manager', 'API Access'] }
            ]));
        }
    }

    // User methods
    addUser(user) {
        const users = this.getUsers();
        user.id = Date.now(); // Simple ID generation
        user.createdAt = new Date().toISOString();
        user.balance = 0;
        user.isActive = true;
        user.verification = {
            email: false,
            mobile: false,
            kyc: false,
            twoFA: false
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Add welcome transaction
        this.addTransaction({
            userId: user.id,
            type: 'registration',
            amount: 0,
            description: 'New user registration',
            status: 'completed'
        });
        
        return user;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users'));
    }

    getUser(id) {
        const users = this.getUsers();
        return users.find(user => user.id == id);
    }

    updateUser(id, updates) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id == id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('users', JSON.stringify(users));
            return users[index];
        }
        return null;
    }

    // Wallet methods
    updateBalance(userId, amount, type = 'deposit') {
        const user = this.getUser(userId);
        if (!user) return false;

        const oldBalance = user.balance;
        const newBalance = type === 'deposit' ? user.balance + amount : user.balance - amount;
        
        this.updateUser(userId, { balance: newBalance });
        
        // Record transaction
        this.addTransaction({
            userId: userId,
            type: type,
            amount: amount,
            oldBalance: oldBalance,
            newBalance: newBalance,
            description: `${type} by admin`,
            status: 'completed',
            adminAction: true
        });
        
        return true;
    }

    // Transaction methods
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now();
        transaction.timestamp = new Date().toISOString();
        transactions.push(transaction);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        return transaction;
    }

    getTransactions() {
        return JSON.parse(localStorage.getItem('transactions'));
    }

    getUserTransactions(userId) {
        const transactions = this.getTransactions();
        return transactions.filter(t => t.userId == userId);
    }

    // Plan methods
    getPlans() {
        return JSON.parse(localStorage.getItem('plans'));
    }

    purchasePlan(userId, planId) {
        const plans = this.getPlans();
        const plan = plans.find(p => p.id == planId);
        const user = this.getUser(userId);
        
        if (!plan || !user) return false;

        // Add transaction for plan purchase
        this.addTransaction({
            userId: userId,
            type: 'plan_purchase',
            amount: plan.price,
            description: `Purchased ${plan.name} plan`,
            planId: planId,
            status: 'completed'
        });

        // Update user with plan info
        this.updateUser(userId, { 
            plan: plan.name,
            planId: planId,
            planPurchasedAt: new Date().toISOString()
        });

        return true;
    }

    // Get new registrations (last 24 hours)
    getNewRegistrations() {
        const users = this.getUsers();
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return users.filter(user => new Date(user.createdAt) > oneDayAgo);
    }

    // Get users by verification status
    getUsersByVerification(type) {
        const users = this.getUsers();
        return users.filter(user => {
            if (type === 'email-unverified') return !user.verification.email;
            if (type === 'mobile-unverified') return !user.verification.mobile;
            if (type === 'kyc-pending') return !user.verification.kyc;
            return true;
        });
    }
}

// Create global instance
window.database = new Database();