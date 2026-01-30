// admin-panel/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Create axios instance with defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add token interceptor to all requests
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('📤 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  error => {
    console.error('📥 API Response Error:', error.response?.status, error.config?.url);
    console.error('📥 Error details:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

const adminApi = {
  // ========== WITHDRAWAL MANAGEMENT ==========
  getAllWithdrawals: async (status = '') => {
  try {
    console.log('📤 Fetching withdrawals with status:', status || 'all');
    const response = await apiClient.get('/admin/withdrawals', {
      params: { status: status || '' }
    });
    console.log('📥 Withdrawals response:', response.data);
    
    // Check if response.data is an array
    if (Array.isArray(response.data)) {
      console.log(`✅ Found ${response.data.length} withdrawals`);
      return response.data;
    } else {
      console.warn('⚠️ Response data is not an array:', response.data);
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('❌ API Error fetching withdrawals:', error.message);
    console.error('❌ Full error:', error);
    
    // Only return mock data if it's a network error or 404
    if (error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      console.log('🔄 Returning mock data as fallback');
      return [
        {
          id: 'WD001',
          userId: 'USER001',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          amount: 5000,
          status: 'pending',
          accountNumber: 'XXXXXX1234',
          bankName: 'HDFC Bank',
          accountHolderName: 'John Doe',
          ifscCode: 'HDFC0000123',
          requestedAt: '2024-01-20T09:15:00'
        },
        {
          id: 'WD002',
          userId: 'USER002',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          amount: 3000,
          status: 'pending',
          accountNumber: 'XXXXXX5678',
          bankName: 'SBI',
          accountHolderName: 'Jane Smith',
          ifscCode: 'SBIN0001234',
          requestedAt: '2024-01-19T14:30:00'
        }
      ];
    }
    
    // For other errors, re-throw
    throw error;
  }
},
  approveWithdrawal: async (withdrawalId, transactionId) => {
    try {
      const response = await apiClient.post(`/admin/withdrawal/${withdrawalId}/approve`, {
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error('API Error approving withdrawal:', error);
      throw error;
    }
  },

  rejectWithdrawal: async (withdrawalId, reason) => {
    try {
      const response = await apiClient.post(`/admin/withdrawal/${withdrawalId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('API Error rejecting withdrawal:', error);
      throw error;
    }
  },

  // ========== USER MANAGEMENT ==========
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('API Error fetching users:', error);
      return [];
    }
  },

  // ========== TRADE MANAGEMENT ==========
  getAllTrades: async () => {
    try {
      const response = await apiClient.get('/admin/trades');
      return response.data;
    } catch (error) {
      console.error('API Error fetching trades:', error);
      return [];
    }
  },

  getAllOrders: async () => {
    try {
      const response = await apiClient.get('/admin/orders');
      return response.data;
    } catch (error) {
      console.error('API Error fetching orders:', error);
      return [];
    }
  },

  // ========== PAYMENT MANAGEMENT ==========
  getAllPayments: async () => {
    try {
      const response = await apiClient.get('/admin/payments');
      return response.data;
    } catch (error) {
      console.error('API Error fetching payments:', error);
      return [];
    }
  },

  updatePaymentStatus: async (paymentId, status, notes = '', processedBy = 'admin') => {
    try {
      const response = await apiClient.put(`/payments/${paymentId}/status`, {
        status,
        notes,
        processedBy
      });
      return response.data;
    } catch (error) {
      console.error('API Error updating payment status:', error);
      throw error;
    }
  },

  // ========== PAYMENT STATISTICS ==========
  // This gets payment-specific stats (pending payments, revenue, etc.)
  getPaymentStats: async () => {
    try {
      // Try the dedicated payment stats endpoint first
      const response = await apiClient.get('/payments/stats');
      return response.data;
    } catch (error) {
      console.warn('Payment stats endpoint not available, trying admin stats:', error.message);
      
      // Fallback: Get all payments and calculate stats manually
      try {
        const payments = await adminApi.getAllPayments();
        
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        const approvedPayments = payments.filter(p => p.status === 'approved').length;
        const rejectedPayments = payments.filter(p => p.status === 'rejected').length;
        
        const totalRevenue = payments
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        return {
          pendingPayments,
          totalRevenue,
          approvedPayments,
          rejectedPayments,
          totalPayments: payments.length
        };
      } catch (fallbackError) {
        console.error('Error calculating payment stats from payments data:', fallbackError);
        return { 
          pendingPayments: 0, 
          totalRevenue: 0,
          approvedPayments: 0,
          rejectedPayments: 0,
          totalPayments: 0
        };
      }
    }
  },

  // ========== PLATFORM STATISTICS ==========
  // This gets overall platform stats (users, trades, balance, etc.)
  getPlatformStats: async () => {
    try {
      const response = await apiClient.get('/admin/stats');
      
      // Ensure the response has all expected fields
      const stats = response.data || {};
      
      return {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        totalBalance: stats.totalBalance || 0,
        activeTrades: stats.activeTrades || 0,
        openPositions: stats.openPositions || 0,
        dailyVolume: stats.dailyVolume || 0,
        totalPnl: stats.totalPnl || 0,
        totalTrades: stats.totalTrades || 0,
        winningTrades: stats.winningTrades || 0,
        // Include payment stats if they exist in platform stats
        pendingPayments: stats.pendingPayments || 0,
        totalRevenue: stats.totalRevenue || 0,
        // Other platform metrics
        totalDeposits: stats.totalDeposits || 0,
        totalWithdrawals: stats.totalWithdrawals || 0
      };
    } catch (error) {
      console.error('API Error fetching platform stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalBalance: 0,
        activeTrades: 0,
        openPositions: 0,
        dailyVolume: 0,
        totalPnl: 0,
        totalTrades: 0,
        winningTrades: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
    }
  },

  // ========== WALLET MANAGEMENT ==========
  addFundsToWallet: async (userId, amount, type, notes = '') => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/wallet/add`, {
        amount: parseFloat(amount),
        type,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('API Error adding funds to wallet:', error);
      throw error;
    }
  },

  deductFundsFromWallet: async (userId, amount, type, notes = '') => {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/wallet/deduct`, {
        amount: parseFloat(amount),
        type,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('API Error deducting funds from wallet:', error);
      throw error;
    }
  },

  getUserWallet: async (userId) => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/wallet`);
      return response.data;
    } catch (error) {
      console.error('API Error getting wallet:', error);
      throw error;
    }
  },

  // ========== DEPOSITS & WITHDRAWALS ==========
  getAllDeposits: async () => {
    try {
      const response = await apiClient.get('/admin/deposits');
      return response.data;
    } catch (error) {
      console.error('API Error fetching deposits:', error);
      return [];
    }
  },

  // ========== TRANSACTIONS ==========
  getAllTransactions: async () => {
    try {
      const response = await apiClient.get('/admin/transactions');
      return response.data;
    } catch (error) {
      console.error('API Error fetching transactions:', error);
      return [];
    }
  },

  // ========== UPI SETTINGS ==========
  getUPISettings: async () => {
    try {
      const response = await apiClient.get('/admin/upi-settings');
      return response.data;
    } catch (error) {
      console.error('API Error fetching UPI settings:', error);
      return {
        success: false,
        settings: {
          upiQrCode: null,
          upiId: '7799191208@ybl',
          merchantName: 'Paper2Real Trading',
          updatedAt: new Date().toISOString()
        }
      };
    }
  },

  uploadUPIQrCode: async (formData) => {
    try {
      const response = await apiClient.post('/admin/upi-qr/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('API Error uploading UPI QR code:', error);
      throw error;
    }
  },

  updateUPISettings: async (upiId, merchantName) => {
    try {
      const response = await apiClient.put('/admin/upi-settings', {
        upiId,
        merchantName
      });
      return response.data;
    } catch (error) {
      console.error('API Error updating UPI settings:', error);
      throw error;
    }
  },

  // ========== TESTING & HEALTH ==========
  testConnection: async () => {
    try {
      const response = await apiClient.get('/test');
      return response.data;
    } catch (error) {
      console.error('API Error testing connection:', error);
      throw error;
    }
  },

  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('API Error health check:', error);
      throw error;
    }
  },

  // ========== HELPER METHODS ==========
  // Get detailed payment information for admin panel
  getPaymentDetails: async (paymentId) => {
    try {
      // If there's a specific endpoint for payment details
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.warn('Payment details endpoint not available:', error.message);
      
      // Fallback: Get all payments and find the specific one
      try {
        const allPayments = await adminApi.getAllPayments();
        const payment = allPayments.find(p => p.id === paymentId || p._id === paymentId);
        
        if (payment) {
          return {
            success: true,
            payment: payment
          };
        } else {
          return {
            success: false,
            error: 'Payment not found'
          };
        }
      } catch (fallbackError) {
        console.error('Error finding payment:', fallbackError);
        return {
          success: false,
          error: 'Could not retrieve payment details'
        };
      }
    }
  },

  // Search payments by criteria
  searchPayments: async (criteria) => {
    try {
      // Try dedicated search endpoint
      const response = await apiClient.post('/payments/search', criteria);
      return response.data;
    } catch (error) {
      console.warn('Payment search endpoint not available, filtering locally:', error.message);
      
      // Fallback: Get all payments and filter locally
      try {
        const allPayments = await adminApi.getAllPayments();
        
        const filteredPayments = allPayments.filter(payment => {
          let matches = true;
          
          if (criteria.status && payment.status !== criteria.status) matches = false;
          if (criteria.userId && payment.userId !== criteria.userId) matches = false;
          if (criteria.planName && payment.planName !== criteria.planName) matches = false;
          
          // Date filtering
          if (criteria.startDate) {
            const paymentDate = new Date(payment.submittedAt || payment.createdAt);
            const startDate = new Date(criteria.startDate);
            if (paymentDate < startDate) matches = false;
          }
          
          if (criteria.endDate) {
            const paymentDate = new Date(payment.submittedAt || payment.createdAt);
            const endDate = new Date(criteria.endDate);
            if (paymentDate > endDate) matches = false;
          }
          
          return matches;
        });
        
        return filteredPayments;
      } catch (fallbackError) {
        console.error('Error filtering payments:', fallbackError);
        return [];
      }
    }
  }
};

export default adminApi;