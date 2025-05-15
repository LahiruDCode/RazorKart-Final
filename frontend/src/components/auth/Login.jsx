 import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import Loader from '../common/Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { signInWithGoogle } from '../../firebase/config';
import googleLogo from '../../assets/Images/google.svg';
import API from '../../api';

const Login = () => {
  const navigate = useNavigate();
  const { login, getHomeRoute } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState('');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      
      if (provider === 'Google') {
        const result = await signInWithGoogle();
        
        if (result.success) {
          console.log('Google sign-in successful:', result);
          
          // Check if user exists in our system or create new account
          try {
            // We need to register or login this Google user with our backend
            const response = await API.post('/auth/google-signin', {
              email: result.userData.email,
              username: result.userData.displayName || result.userData.email.split('@')[0],
              googleId: result.userData.uid,
              photoURL: result.userData.photoURL
            });
            
            // Update auth context with the user data from our backend
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', response.data.token);
            
            // Set authenticated user for welcome animation
            setAuthenticatedUser(user);
            
            // Redirect after animation
            setTimeout(() => {
              navigate(getHomeRoute());
            }, 3000);
            
          } catch (backendError) {
            console.error('Backend error during Google auth:', backendError);
            setLoading(false);
            
            // Check if we have a response with error message
            let errorMessage = 'Error connecting Google account with RazorKart';
            if (backendError.response && backendError.response.data && backendError.response.data.message) {
              errorMessage = backendError.response.data.message;
            }
            
            setShowMessage(errorMessage);
            setTimeout(() => setShowMessage(''), 5000);
          }
        } else {
          console.error('Google sign-in failed:', result.error, result.code);
          setLoading(false);
          
          // Use the more specific error message if available
          const errorMessage = result.error || 'Google sign-in failed. Please try again.';
          setShowMessage(errorMessage);
          setTimeout(() => setShowMessage(''), 5000);
        }
      } else {
        // Facebook or other providers - not implemented yet
        setShowMessage(`${provider} login will be implemented soon!`);
        setLoading(false);
        setTimeout(() => setShowMessage(''), 3000);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      setLoading(false);
      setShowMessage(`${provider} login failed. Please try again.`);
      setTimeout(() => setShowMessage(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);

      // Set authenticated user for welcome animation
      setAuthenticatedUser(user);
      
      // Delay redirect to show welcome animation
      setTimeout(() => {
        // Redirect to appropriate home route based on role
        navigate(getHomeRoute());
      }, 4000); // Wait for logo animation + welcome message
    } catch (error) {
      console.error('Login error:', error);
      setShowMessage(error.response?.data?.message || 'Invalid email or password');
      setTimeout(() => setShowMessage(''), 3000);
      // Only set loading to false if there's an error
      setLoading(false);
    }
    // Remove setLoading(false) from finally block to keep loader visible until redirect
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      {loading && <Loader 
        message={authenticatedUser ? "Preparing dashboard..." : "Authenticating..."} 
        username={authenticatedUser?.username}
      />}
      
      <video autoPlay loop muted className="background-video">
        <source src="/assets/videos/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="login-content">
        <div className="login-welcome">
          <h2>Welcome Back</h2>
          <p>Sign in to continue to RazorKart</p>
        </div>
        
        <div className="social-buttons">
          <button 
            className="social-button google"
            onClick={() => handleSocialLogin('Google')}
          >
            <img src={googleLogo} alt="Google" className="google-icon" />
            Continue with Google
          </button>

          <button 
            className="social-button facebook"
            onClick={() => handleSocialLogin('Facebook')}
          >
            <i className="icon">f</i>
            Continue with Facebook
          </button>
        </div>

        <div className="divider">
          <span>OR</span>
        </div>
        
        <div className="form-container">
          {showMessage && (
            <div className="message-box">
              {showMessage}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Hidden honeypot fields to trick browser autofill */}
            <div style={{ display: 'none' }}>
              <input type="text" name="fakeusernameremembered" />
              <input type="password" name="fakepasswordremembered" />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="user_email_address" /* Changed from 'email' to prevent autofill */
                placeholder="Email"
                value={formData.email}
                onChange={(e) => {
                  const updatedFormData = {
                    ...formData,
                    email: e.target.value
                  };
                  setFormData(updatedFormData);
                }}
                required
                autoComplete="chrome-off" /* More aggressive approach */
                data-lpignore="true"
              />
            </div>
            <div className="form-group password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                data-lpignore="true"
              />
              <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </span>
            </div>
            <div className="remember-forgot">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember me</label>
              </div>
              <a href="/forgot-password" className="forgot-password">Forgot password?</a>
            </div>
            
            <button type="submit" className="login-button large-button">
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
          <p className="signup-link">
            Don't have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
