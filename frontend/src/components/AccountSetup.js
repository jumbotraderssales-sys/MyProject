import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AccountSetup.css';

const AccountSetup = () => {
    const [userData, setUserData] = useState({
        account_holder_name: '',
        account_number: '',
        bank_name: '',
        ifsc_code: '',
        upi_id: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [withdrawalBalance, setWithdrawalBalance] = useState(0);

    // Fetch user data and balance
    useEffect(() => {
        fetchUserData();
        fetchBalance();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.account_details) {
                setUserData(prev => ({
                    ...prev,
                    ...response.data.account_details
                }));
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const fetchBalance = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/user/balance', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWithdrawalBalance(response.data.withdrawal_balance || 0);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/user/save-account', userData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Account details saved successfully!' });
                // Save in localStorage for quick access
                localStorage.setItem('bank_account', JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error saving account:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.error || 'Failed to save account details'
            });
        } finally {
            setLoading(false);
        }
    };

    const validateAccountNumber = (number) => {
        // Basic validation for account number (9-18 digits)
        return /^[0-9]{9,18}$/.test(number);
    };

    const validateIFSC = (ifsc) => {
        // IFSC code validation (11 characters, alphanumeric)
        return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
    };

    return (
        <div className="account-setup-container">
            <div className="setup-header">
                <h2><i className="fas fa-university"></i> Bank Account Setup</h2>
                <p>Add your bank account details to withdraw funds</p>
            </div>

            <div className="balance-card">
                <div className="balance-info">
                    <span className="balance-label">Available for Withdrawal:</span>
                    <span className="balance-amount">₹{withdrawalBalance.toFixed(2)}</span>
                </div>
                <div className="balance-note">
                    <i className="fas fa-info-circle"></i>
                    This is the amount you can withdraw immediately
                </div>
            </div>

            {message.text && (
                <div className={`alert-message ${message.type}`}>
                    {message.type === 'success' ? '✓' : '⚠'} {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="account-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="account_holder_name">
                            <i className="fas fa-user"></i> Account Holder Name
                        </label>
                        <input
                            type="text"
                            id="account_holder_name"
                            name="account_holder_name"
                            value={userData.account_holder_name}
                            onChange={handleChange}
                            placeholder="Enter name as per bank records"
                            required
                            pattern="[A-Za-z\s]{3,}"
                            title="Enter full name (letters and spaces only)"
                        />
                        <small>Must match your bank account name exactly</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="account_number">
                            <i className="fas fa-credit-card"></i> Account Number
                        </label>
                        <input
                            type="text"
                            id="account_number"
                            name="account_number"
                            value={userData.account_number}
                            onChange={handleChange}
                            placeholder="Enter your bank account number"
                            required
                            pattern="[0-9]{9,18}"
                            title="Account number must be 9-18 digits"
                        />
                        <small>9 to 18 digits (no spaces or special characters)</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bank_name">
                            <i className="fas fa-building"></i> Bank Name
                        </label>
                        <select
                            id="bank_name"
                            name="bank_name"
                            value={userData.bank_name}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Bank</option>
                            <option value="State Bank of India">State Bank of India</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="Canara Bank">Canara Bank</option>
                            <option value="Union Bank of India">Union Bank of India</option>
                            <option value="Bank of India">Bank of India</option>
                            <option value="Other">Other Bank</option>
                        </select>
                        {userData.bank_name === 'Other' && (
                            <input
                                type="text"
                                name="bank_name_other"
                                placeholder="Enter bank name"
                                onChange={(e) => setUserData(prev => ({
                                    ...prev,
                                    bank_name: e.target.value
                                }))}
                                required
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="ifsc_code">
                            <i className="fas fa-code"></i> IFSC Code
                        </label>
                        <input
                            type="text"
                            id="ifsc_code"
                            name="ifsc_code"
                            value={userData.ifsc_code}
                            onChange={handleChange}
                            placeholder="Example: SBIN0001234"
                            required
                            pattern="^[A-Z]{4}0[A-Z0-9]{6}$"
                            title="Enter valid IFSC code (11 characters)"
                            style={{ textTransform: 'uppercase' }}
                        />
                        <small>Find IFSC on cheque book or bank statement</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="upi_id">
                            <i className="fas fa-mobile-alt"></i> UPI ID (Optional)
                        </label>
                        <input
                            type="text"
                            id="upi_id"
                            name="upi_id"
                            value={userData.upi_id || ''}
                            onChange={handleChange}
                            placeholder="username@bankname"
                        />
                        <small>For faster withdrawals via UPI</small>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-save"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i> Saving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i> Save Account Details
                            </>
                        )}
                    </button>
                    
                    <button
                        type="button"
                        className="btn-reset"
                        onClick={() => setUserData({
                            account_holder_name: '',
                            account_number: '',
                            bank_name: '',
                            ifsc_code: '',
                            upi_id: ''
                        })}
                    >
                        <i className="fas fa-redo"></i> Clear Form
                    </button>
                </div>

                <div className="security-note">
                    <i className="fas fa-shield-alt"></i>
                    <span>Your bank details are encrypted and stored securely. We never share your information with third parties.</span>
                </div>
            </form>

            <div className="account-preview">
                <h3><i className="fas fa-eye"></i> Account Preview</h3>
                <div className="preview-card">
                    <div className="preview-item">
                        <span>Account Holder:</span>
                        <strong>{userData.account_holder_name || 'Not set'}</strong>
                    </div>
                    <div className="preview-item">
                        <span>Account Number:</span>
                        <strong>{userData.account_number ? `XXXXX${userData.account_number.slice(-4)}` : 'Not set'}</strong>
                    </div>
                    <div className="preview-item">
                        <span>Bank:</span>
                        <strong>{userData.bank_name || 'Not set'}</strong>
                    </div>
                    <div className="preview-item">
                        <span>IFSC Code:</span>
                        <strong>{userData.ifsc_code || 'Not set'}</strong>
                    </div>
                    {userData.upi_id && (
                        <div className="preview-item">
                            <span>UPI ID:</span>
                            <strong>{userData.upi_id}</strong>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountSetup;