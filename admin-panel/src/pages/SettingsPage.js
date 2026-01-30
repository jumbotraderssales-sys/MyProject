import React, { useState } from 'react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Paper2Real Trading Platform',
    siteUrl: 'https://paper2real.com',
    adminEmail: 'paper2real.info@gmail.com',
    supportEmail: 'paper2real.info@gmail.com',
    maintenanceMode: false,
    allowRegistrations: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    tradingHoursStart: '09:00',
    tradingHoursEnd: '18:00',
    maxLeverage: 10,
    minDeposit: 100,
    maxDeposit: 100000,
    withdrawalFee: 1.5,
    referralBonus: 5,
    riskWarning: 'Trading involves substantial risk of loss.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: key === 'maintenanceMode' || key === 'allowRegistrations' || 
              key === 'enableEmailNotifications' || key === 'enableSMSNotifications' 
              ? !prev[key] 
              : value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would call: adminApi.updateSettings(settings)
      console.log('Settings saved:', settings);
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        siteName: 'Paper2Real Trading Platform',
        siteUrl: 'https://paper2real.com',
        adminEmail: 'paper2real.info@gmail.com',
        supportEmail: 'paper2real.info@gmail.com',
        maintenanceMode: false,
        allowRegistrations: true,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        tradingHoursStart: '09:00',
        tradingHoursEnd: '18:00',
        maxLeverage: 10,
        minDeposit: 100,
        maxDeposit: 100000,
        withdrawalFee: 1.5,
        referralBonus: 5,
        riskWarning: 'Trading involves substantial risk of loss.'
      });
      setSaveMessage('Settings reset to default!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>System Settings</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleResetSettings}
            disabled={isSaving}
          >
            <i className="fas fa-undo"></i> Reset Defaults
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className={`alert ${saveMessage.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
          <i className={`fas ${saveMessage.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {saveMessage}
        </div>
      )}

      <div className="settings-grid">
        {/* General Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2><i className="fas fa-cog"></i> General Settings</h2>
          </div>
          <div className="section-content">
            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Site URL</label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Admin Email</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2><i className="fas fa-server"></i> System Settings</h2>
          </div>
          <div className="section-content">
            <div className="toggle-group">
              <div className="toggle-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={() => handleSettingChange('maintenanceMode')}
                  />
                  <span className="toggle-label">Maintenance Mode</span>
                </label>
                <span className="toggle-description">
                  When enabled, the site will be inaccessible to users
                </span>
              </div>
              
              <div className="toggle-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.allowRegistrations}
                    onChange={() => handleSettingChange('allowRegistrations')}
                  />
                  <span className="toggle-label">Allow New Registrations</span>
                </label>
                <span className="toggle-description">
                  Allow new users to register accounts
                </span>
              </div>
              
              <div className="toggle-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableEmailNotifications}
                    onChange={() => handleSettingChange('enableEmailNotifications')}
                  />
                  <span className="toggle-label">Email Notifications</span>
                </label>
                <span className="toggle-description">
                  Send email notifications to users
                </span>
              </div>
              
              <div className="toggle-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.enableSMSNotifications}
                    onChange={() => handleSettingChange('enableSMSNotifications')}
                  />
                  <span className="toggle-label">SMS Notifications</span>
                </label>
                <span className="toggle-description">
                  Send SMS notifications to users
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2><i className="fas fa-chart-line"></i> Trading Settings</h2>
          </div>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Trading Hours Start</label>
                <input
                  type="time"
                  value={settings.tradingHoursStart}
                  onChange={(e) => handleSettingChange('tradingHoursStart', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Trading Hours End</label>
                <input
                  type="time"
                  value={settings.tradingHoursEnd}
                  onChange={(e) => handleSettingChange('tradingHoursEnd', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Maximum Leverage</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maxLeverage}
                onChange={(e) => handleSettingChange('maxLeverage', parseInt(e.target.value))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="settings-section">
          <div className="section-header">
            <h2><i className="fas fa-money-bill-wave"></i> Financial Settings</h2>
          </div>
          <div className="section-content">
            <div className="form-row">
              <div className="form-group">
                <label>Minimum Deposit (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.minDeposit}
                  onChange={(e) => handleSettingChange('minDeposit', parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Maximum Deposit (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.maxDeposit}
                  onChange={(e) => handleSettingChange('maxDeposit', parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Withdrawal Fee (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.withdrawalFee}
                onChange={(e) => handleSettingChange('withdrawalFee', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Referral Bonus (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={settings.referralBonus}
                onChange={(e) => handleSettingChange('referralBonus', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="settings-section">
          <div className="section-header">
            <h2><i className="fas fa-exclamation-triangle"></i> Risk Warning</h2>
          </div>
          <div className="section-content">
            <div className="form-group">
              <label>Risk Warning Message</label>
              <textarea
                value={settings.riskWarning}
                onChange={(e) => handleSettingChange('riskWarning', e.target.value)}
                className="form-textarea"
                rows="4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;