// Mock data for trading platform
export const mockUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        balance: 1000,
        trades: 15
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        balance: 2500,
        trades: 32
    }
];

export const mockTransactions = [
    {
        id: 1,
        userId: 1,
        type: 'deposit',
        amount: 500,
        status: 'completed',
        timestamp: '2023-10-01T10:30:00Z'
    },
    {
        id: 2,
        userId: 1,
        type: 'trade',
        amount: -100,
        status: 'completed',
        timestamp: '2023-10-02T14:20:00Z'
    },
    {
        id: 3,
        userId: 1,
        type: 'withdrawal',
        amount: -200,
        status: 'pending',
        timestamp: '2023-10-03T09:15:00Z'
    }
];

export const mockPlans = [
    {
        id: 1,
        name: 'Basic',
        price: 100,
        features: [
            'Basic Trading Tools',
            'Email Support',
            'Standard Security'
        ]
    },
    {
        id: 2,
        name: 'Pro',
        price: 300,
        features: [
            'Advanced Trading Tools',
            'Priority Support',
            'Enhanced Security',
            'Market Analytics'
        ]
    },
    {
        id: 3,
        name: 'Enterprise',
        price: 1000,
        features: [
            'All Pro Features',
            'Dedicated Account Manager',
            'API Access',
            'Custom Solutions'
        ]
    }
];