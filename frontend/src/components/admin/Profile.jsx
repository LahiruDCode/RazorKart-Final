import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Menu from '../common/Menu';
import EditProfileForm from './EditProfileForm';
import DeleteConfirmation from './DeleteConfirmation';
import ChangePasswordForm from './ChangePasswordForm';
import './ModernProfile.css';

const ModernProfile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch latest user data
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local user data
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        // If unauthorized, redirect to login
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditProfile = () => {
    setShowEditForm(true);
  };

  const handleDeleteProfile = () => {
    setShowDeleteConfirmation(true);
  };
  
  const handleChangePassword = () => {
    setShowChangePasswordForm(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowEditForm(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // For debugging
      console.log('Attempting to delete account for user ID:', user._id);
      
      // Make sure we're using a fully qualified URL to the server
      const response = await axios.delete(`http://localhost:5001/api/users/${user._id}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response:', response.data);
      
      // Clear all local storage items
      localStorage.clear();
      
      // Show a temporary success message
      alert('Your account has been successfully deleted');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error deleting profile:', error.response || error);
      // More detailed error message
      const errorMsg = error.response?.data?.message || 
                      (error.response ? `Server error: ${error.response.status}` : 
                      'Failed to connect to server. Please try again.');
      alert(errorMsg);
      setLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Menu />
        <div className="admin-content loader-container">
          <div className="loader"></div>
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="admin-layout">
        <Menu />
        <div className="admin-content error-container">
          <p>Could not load profile. Please try logging in again.</p>
          <button 
            className="submit-button" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Menu />
      <div className="admin-content">
        <div className="admin-header">
          <h1>My Profile</h1>
        </div>
        
        <div className="modern-profile-container">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="profile-title">
              <h2>{user.username}</h2>
              <span className="profile-role">{user.role}</span>
              <span className="profile-status">{user.status === 'active' ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          <div className="profile-content">
            <div className="profile-card">
              <h3>Personal Information</h3>
              <div className="profile-info-row">
                <div className="info-label">Username</div>
                <div className="info-value">{user.username || 'Not set'}</div>
              </div>
              <div className="profile-info-row">
                <div className="info-label">Email</div>
                <div className="info-value">{user.email || 'Not set'}</div>
              </div>
              <div className="profile-info-row">
                <div className="info-label">Contact Number</div>
                <div className="info-value">{user.contactNumber || 'Not set'}</div>
              </div>
              <div className="profile-info-row">
                <div className="info-label">Role</div>
                <div className="info-value">{user.role || 'Not set'}</div>
              </div>
              <div className="profile-info-row">
                <div className="info-label">Last Login</div>
                <div className="info-value">{formatDate(user.lastLogin)}</div>
              </div>
              <div className="profile-info-row">
                <div className="info-label">Account Created</div>
                <div className="info-value">{formatDate(user.createdAt)}</div>
              </div>
            </div>

            <div className="profile-card">
              <h3>Account Management</h3>
              <div className="profile-actions">
                <button className="edit-profile-btn" onClick={handleEditProfile}>
                  Edit Profile
                </button>
                <button className="change-password-btn" onClick={handleChangePassword}>
                  Change Password
                </button>
                <button className="delete-profile-btn" onClick={handleDeleteProfile}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditForm && (
        <EditProfileForm 
          user={user} 
          onClose={() => setShowEditForm(false)} 
          onUpdate={handleProfileUpdate}
        />
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmation 
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDeleteConfirm}
          loading={loading}
        />
      )}
      
      {showChangePasswordForm && (
        <ChangePasswordForm
          user={user}
          onClose={() => setShowChangePasswordForm(false)}
        />
      )}
    </div>
  );
};

export default ModernProfile;
