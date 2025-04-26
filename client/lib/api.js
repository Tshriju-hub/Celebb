import axios from 'axios';

export const getUserDetails = async (session) => {
  try {
    console.log('Making API call with session:', session);
    
    // For Google login, we need to exchange the OAuth token for a JWT
    if (session?.user?.provider === 'google') {
      try {
        // Get the Google ID token from the session
        const idToken = session?.user?.idToken;
        
        if (!idToken && !session?.user?.token) {
          throw new Error('Google authentication failed - missing token');
        }

        // Only exchange token if we don't already have one
        if (!session?.user?.token) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const res = await axios.post(`${backendUrl}/api/auth/google`, {
            idToken: idToken
          });
          
          // Update session with new JWT token
          session.user.token = res.data.token;
        }
      } catch (error) {
        console.error('Google token exchange error:', error);
        throw new Error('Google authentication failed');
      }
    }

    if (!session?.user?.token) {
      throw new Error('Authentication token missing');
    }

    // Ensure we're using the full backend URL for API calls
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await axios.get(`${backendUrl}/api/auth/user`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.token}`
      },
      validateStatus: function (status) {
        return status < 500; // Reject only if the status code is greater than or equal to 500
      }
    });

    if (response.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }

    if (response.status !== 200) {
      throw new Error(response.data?.message || 'Failed to fetch user details');
    }
    console.log('API response:', response.data);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};

// Other existing API functions would be maintained here
export const getVenues = async () => {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const response = await axios.get(`${backendUrl}/api/venues`);
    return response.data;
  } catch (error) {
    console.error('Error fetching venues:', error);
    throw error;
  }
};
