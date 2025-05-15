import React, { useEffect, useState } from 'react';
import './Loader.css';

const Loader = ({ message = 'Loading...', username = '' }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [opacity, setOpacity] = useState(0);
  
  useEffect(() => {
    // Initial fade in
    let fadeTimeout = setTimeout(() => {
      setOpacity(1);
    }, 100);
    
    // If username is provided, show welcome message after 3 seconds
    if (username) {
      let welcomeTimeout = setTimeout(() => {
        setShowWelcome(true);
      }, 3000);
      
      return () => {
        clearTimeout(fadeTimeout);
        clearTimeout(welcomeTimeout);
      };
    }
    
    return () => clearTimeout(fadeTimeout);
  }, [username]);

  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <img 
          src="/assets/Images/RazorKartLogo.png" 
          alt="RazorKart Logo" 
          className="loader-logo"
          style={{ opacity: opacity }}
        />
        {showWelcome ? (
          <div className="welcome-message">Welcome, {username}</div>
        ) : (
          <div className="loader-container">
            <div className="loader"></div>
            <div className="loader-text">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loader;
