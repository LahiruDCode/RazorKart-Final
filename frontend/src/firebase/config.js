// Firebase configuration for RazorKart
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// NOTE: You need to replace these values with your own Firebase project configuration
// Follow these steps:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select an existing one
// 3. Add a web app to your project
// 4. Copy the config values from the Firebase console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",  // Replace with your Firebase API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider (optional additional settings)
googleProvider.setCustomParameters({
  prompt: 'select_account' // Forces account selection even when one account is available
});

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign-in process...');
    
    // Add debugging for popup opening
    console.log('Opening Google sign-in popup...');
    const result = await signInWithPopup(auth, googleProvider);
    
    console.log('Received Google sign-in result:', result);
    
    // Check if we have the necessary data
    if (!result.user) {
      console.error('No user data returned from Google');
      return {
        success: false,
        error: 'No user data returned from Google'
      };
    }
    
    // Create response data
    const responseData = {
      success: true,
      user: result.user,
      // Additional info we might need from the result
      userData: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'User',
        photoURL: result.user.photoURL || '',
      },
      token: result._tokenResponse?.idToken || ''
    };
    
    console.log('Returning Google sign-in data:', responseData);
    return responseData;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Common Firebase auth errors
    let errorMessage = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in canceled. You closed the Google sign-in popup.';
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Pop-up blocked by browser. Please allow pop-ups for this site.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Sign-in operation canceled due to a new popup being opened.';
    }
    
    return {
      success: false,
      error: errorMessage,
      code: error.code
    };
  }
};

export { auth, googleProvider };
