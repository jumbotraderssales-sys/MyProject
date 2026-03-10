import React from 'react';

const DeleteConfirmationModal = ({ user, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h2>⚠️ Confirm Permanent Deletion</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="delete-warning-icon">❗</div>
          <h3>Are you absolutely sure?</h3>
          
          <div className="delete-warning-text">
            <p>You are about to permanently delete:</p>
            <div className="user-to-delete">
              <strong>{user.name || user.userName || 'Unknown User'}</strong>
              <span>{user.email}</span>
              <span>User ID: {user.id || user._id}</span>
            </div>
            
            <div className="warning-box">
              <p><strong>This action CANNOT be undone!</strong></p>
              <ul>
                <li>All user data will be permanently removed</li>
                <li>Trading history will be deleted</li>
                <li>Any remaining balance will be lost</li>
                <li>User will lose access immediately</li>
              </ul>
            </div>
            
            <p className="delete-confirm-text">
              Type <strong>DELETE</strong> to confirm:
            </p>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
          >
            Yes, Permanently Delete User
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
