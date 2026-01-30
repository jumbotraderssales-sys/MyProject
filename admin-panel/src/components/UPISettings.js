import React, { useState, useEffect } from 'react';
import './UPISettings.css';

const UPISettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    upiId: '',
    merchantName: '',
    qrCodeUrl: null,
    upiQrCode: null
  });
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageError, setImageError] = useState(false);

  // Fetch current UPI settings
  const fetchUPISettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/admin/upi-settings');
      const data = await response.json();
      
      if (data.success) {
        console.log('UPI Settings loaded:', data);
        setSettings({
          upiId: data.settings.upiId || '',
          merchantName: data.settings.merchantName || '',
          qrCodeUrl: data.settings.qrCodeUrl || null,
          upiQrCode: data.settings.upiQrCode || null
        });
        
        // Set preview URL if QR code exists
        if (data.settings.qrCodeUrl) {
          setPreviewUrl(`http://localhost:3001${data.settings.qrCodeUrl}`);
          setImageError(false);
        } else {
          setPreviewUrl(null);
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to load UPI settings' });
      }
    } catch (error) {
      console.error('Error fetching UPI settings:', error);
      setMessage({ type: 'error', text: 'Error connecting to server. Make sure backend is running on port 3001.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUPISettings();
  }, []);

  // Handle file selection for QR code
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Only JPG, PNG, and GIF images are allowed' });
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }

      setQrCodeFile(file);
      
      // Create preview URL
      const filePreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(filePreviewUrl);
      setImageError(false);
      setMessage({ type: '', text: '' });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!settings.upiId) {
      setMessage({ type: 'error', text: 'UPI ID is required' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('upiId', settings.upiId);
      formData.append('merchantName', settings.merchantName);
      
      if (qrCodeFile) {
        formData.append('qrImage', qrCodeFile);
      }

      const response = await fetch('http://localhost:3001/api/admin/upi-qr/upload', {
        method: 'POST',
        body: formData
        // Note: Don't set Content-Type header for FormData
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'UPI settings saved successfully!' 
        });
        
        // Update local settings
        setSettings({
          upiId: data.settings.upiId,
          merchantName: data.settings.merchantName,
          qrCodeUrl: data.settings.qrCodeUrl,
          upiQrCode: data.settings.upiQrCode
        });
        
        // Reset file input
        setQrCodeFile(null);
        
        // Update preview URL from server response
        if (data.settings.qrCodeUrl) {
          setPreviewUrl(`http://localhost:3001${data.settings.qrCodeUrl}`);
          setImageError(false);
        }
        
        // Clear file input
        document.getElementById('qrCodeFile').value = '';
        
        // Refresh settings after 2 seconds
        setTimeout(() => {
          fetchUPISettings();
        }, 2000);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to save UPI settings' 
        });
      }
    } catch (error) {
      console.error('Error saving UPI settings:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error connecting to server. Make sure backend is running on port 3001.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image load error
  const handleImageError = () => {
    console.log('QR code image failed to load');
    setImageError(true);
  };

  // Clear QR code
  const clearQrCode = async () => {
    if (!window.confirm('Are you sure you want to remove the QR code?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/upi-qr', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'QR code removed successfully' });
        setPreviewUrl(null);
        setImageError(false);
        setSettings(prev => ({
          ...prev,
          qrCodeUrl: null,
          upiQrCode: null
        }));
        setQrCodeFile(null);
        document.getElementById('qrCodeFile').value = '';
      }
    } catch (error) {
      console.error('Error removing QR code:', error);
      setMessage({ type: 'error', text: 'Failed to remove QR code' });
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading UPI settings...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="content-area">
        <div className="settings-header">
          <h1>UPI Payment Settings</h1>
          <p className="section-description">
            Configure UPI payment details for user payments
          </p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
            {message.text}
          </div>
        )}

        <div className="settings-grid">
          <div className="settings-section">
            <div className="section-header">
              <h2><i className="fas fa-qrcode"></i> UPI Configuration</h2>
            </div>
            
            <div className="section-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="upiId">
                    <i className="fas fa-id-card"></i> UPI ID *
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    name="upiId"
                    value={settings.upiId}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter UPI ID (e.g., 7799191208-2@ybl)"
                    required
                  />
                  <small className="form-hint">
                    This is the UPI ID users will use to make payments
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="merchantName">
                    <i className="fas fa-store"></i> Merchant Name
                  </label>
                  <input
                    type="text"
                    id="merchantName"
                    name="merchantName"
                    value={settings.merchantName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter merchant/business name"
                  />
                  <small className="form-hint">
                    This name will appear on user's payment screen
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="qrCodeFile">
                    <i className="fas fa-image"></i> UPI QR Code Image
                  </label>
                  
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="qrCodeFile"
                      name="qrCodeFile"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.gif"
                      className="file-input"
                    />
                    <div className="file-upload-box">
                      <i className="fas fa-cloud-upload-alt"></i>
                      <p>Click to upload QR code image</p>
                      <p className="file-types">JPG, PNG, GIF (Max 5MB)</p>
                    </div>
                  </div>
                  
                  <small className="form-hint">
                    Upload a clear image of your UPI QR code. If not uploaded, existing QR code will be kept.
                  </small>
                </div>

                {/* QR Code Preview */}
                <div className="qr-preview-section">
                  <h3>QR Code Preview</h3>
                  <div className="qr-preview-container">
                    {previewUrl && !imageError ? (
                      <div className="qr-image-container">
                        <img 
                          src={previewUrl} 
                          alt="UPI QR Code" 
                          className="qr-image"
                          onError={handleImageError}
                          onLoad={() => console.log('QR code image loaded successfully')}
                        />
                      </div>
                    ) : (
                      <div className="no-qr-placeholder">
                        <i className="fas fa-qrcode"></i>
                        <p>No QR code uploaded or failed to load</p>
                      </div>
                    )}
                    
                    <div className="qr-info">
                      <p><strong>UPI ID:</strong> {settings.upiId || 'Not set'}</p>
                      <p><strong>Merchant:</strong> {settings.merchantName || 'Not set'}</p>
                      {settings.qrCodeUrl && !imageError && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={clearQrCode}
                        >
                          <i className="fas fa-trash"></i> Remove QR Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving || !settings.upiId}
                  >
                    {saving ? (
                      <>
                        <span className="loading-spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save UPI Settings
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={fetchUPISettings}
                    disabled={saving}
                  >
                    <i className="fas fa-sync-alt"></i>
                    Refresh
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="settings-section">
            <div className="section-header">
              <h2><i className="fas fa-info-circle"></i> Information</h2>
            </div>
            
            <div className="section-content">
              <div className="info-box">
                <h3><i className="fas fa-lightbulb"></i> How to get UPI QR Code</h3>
                <ol className="info-list">
                  <li>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>Go to your profile or settings</li>
                  <li>Look for "Show QR Code" or "My QR Code"</li>
                  <li>Screenshot or save the QR code image</li>
                  <li>Upload it here</li>
                </ol>
              </div>

              <div className="info-box">
                <h3><i className="fas fa-shield-alt"></i> Security Note</h3>
                <ul className="info-list">
                  <li>Your UPI ID is safe and only used for receiving payments</li>
                  <li>QR code images are stored securely on the server</li>
                  <li>Users can only view the QR code, not modify it</li>
                  <li>Regularly update your UPI details for security</li>
                </ul>
              </div>

              <div className="info-box">
                <h3><i className="fas fa-link"></i> Testing</h3>
                <p>After saving, test the UPI payment by:</p>
                <ol className="info-list">
                  <li>Opening the Trading Panel (frontend)</li>
                  <li>Selecting a plan to purchase</li>
                  <li>Checking if the QR code appears correctly</li>
                  <li>Verifying the UPI ID matches what you set</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPISettings;