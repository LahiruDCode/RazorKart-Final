import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Menu.css';

const Menu = () => {
  const navigate = useNavigate();
  return (
    <div className="menu">
      <div className="menu-header">
        <img src="/assets/Images/RazorKartLogo.png" alt="RazorKart Logo" className="menu-logo" />
      </div>
      
      <nav className="menu-nav">
        <Link to="/admin" className="menu-item">
          <i className="fas fa-chart-line"></i>
          Dashboard
        </Link>
        
        <Link to="/admin/users" className="menu-item">
          <i className="fas fa-users"></i>
          Manage Users
        </Link>
        
        <Link to="/admin/role-requests" className="menu-item">
          <i className="fas fa-user-tag"></i>
          Role Requests
        </Link>
        
        <Link to="/admin/profile" className="menu-item">
          <i className="fas fa-user-circle"></i>
          Profile
        </Link>
      </nav>
      
      <div className="menu-footer">
        <button 
          className="logout-button"
          style={{ backgroundColor: '#FF8800', color: 'black' }}
          onClick={() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Menu;
