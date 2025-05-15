import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './InquiryForm.css';
import { useAuth } from '../../../context/AuthContext';

const InquiryForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    contactNumber: '',
    message: ''
  });
  
  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (currentUser) {
      setFormData(prevState => ({
        ...prevState,
        name: currentUser.username || '',
        email: currentUser.email || ''
      }));
    }
  }, [currentUser]);

  const [errors, setErrors] = useState({
    contactNumber: ''
  });

  const validatePhoneNumber = (number) => {
    // Remove any non-digit characters
    const digits = number.replace(/\D/g, '');
    
    // Check if it starts with 0
    if (!digits.startsWith('0')) {
      return 'Phone number must start with 0';
    }
    
    // Check if it has exactly 10 digits
    if (digits.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    
    // Check if it contains only integers
    if (!/^\d+$/.test(digits)) {
      return 'Phone number must contain only numbers';
    }
    
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Validate phone number as user types
    if (name === 'contactNumber') {
      const error = validatePhoneNumber(value);
      setErrors(prev => ({
        ...prev,
        contactNumber: error
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submission
    const phoneError = validatePhoneNumber(formData.contactNumber);
    if (phoneError) {
      setErrors(prev => ({
        ...prev,
        contactNumber: phoneError
      }));
      return;
    }

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // Set authorization header if logged in
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`
        };
      }
      
      const response = await API.post('/inquiries', formData, config);
      
      toast.success('Inquiry submitted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // If logged in, redirect to my-inquiries after successful submission
      if (currentUser) {
        setTimeout(() => {
          navigate('/my-inquiries');
        }, 2000);
      } else {
        // Reset the form if not logged in
        setFormData({
          name: '',
          subject: '',
          email: '',
          contactNumber: '',
          message: ''
        });
      }
      
      setErrors({ contactNumber: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error(error.response?.data?.message || 'Failed to submit inquiry. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="inquiry-form-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h2>Online Help / Information Request</h2>
      <form onSubmit={handleSubmit} className="inquiry-form">
        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="form-select">
            <option value="">Select a subject</option>
            <option value="Product Inquiry">Product Inquiry</option>
            <option value="Order Status">Order Status</option>
            <option value="Shipping Information">Shipping Information</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Return/Refund">Return/Refund</option>
            <option value="Seller Account">Seller Account</option>
            <option value="General Question">General Question</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">E-Mail Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Contact Number</label>
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            placeholder="Enter 10-digit number (e.g., 0123456789)"
            className={errors.contactNumber ? 'error' : ''}
          />
          {errors.contactNumber && (
            <span className="error-message">{errors.contactNumber}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="message">Your Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Type your message here..."
            rows="6"
            spellCheck="true"
            aria-label="Message"
          />
        </div>

        <div className="form-group">
          <button 
            type="submit" 
            className="submit-button"
            disabled={!!errors.contactNumber}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default InquiryForm; 