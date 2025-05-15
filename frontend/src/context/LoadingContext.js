import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Create context
const LoadingContext = createContext();

// Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

// Provider component
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Show loading screen on location change
  useEffect(() => {
    // Start loading
    setIsLoading(true);
    
    // Hide loading after a minimum timeout (to prevent flashing)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200); // Minimum loading time to show the animation properly
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Context value
  const value = {
    isLoading,
    setIsLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingContext;
