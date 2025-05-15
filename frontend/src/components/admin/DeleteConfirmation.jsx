import React from 'react';

const DeleteConfirmation = ({ onClose, onConfirm, loading }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} disabled={loading}>×</button>
        <div className="modal-header">
          <h3>Delete Account</h3>
        </div>
        
        <div className="confirmation-message">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
          <p>All your data will be permanently removed from our servers.</p>
        </div>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onClose} 
            disabled={loading}
          >
            No, Cancel
          </button>
          <button 
            type="button" 
            className="delete-button" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
