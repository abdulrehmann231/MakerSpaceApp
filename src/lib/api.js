// Helper function to handle 401 errors and refresh tokens
async function handleResponse(response) {
  if (response.status === 401) {
    // Try to refresh the access token
    const refreshResult = await refreshAccessToken();
    if (refreshResult) {
      // Refresh successful, but we can't retry the original request here
      // The calling function should handle this case
      return false; // Signal that refresh happened but request needs to be retried
    } else {
      // Refresh failed, clear cookies
      if (typeof window !== 'undefined') {
        document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      return false;
    }
  }
  return response.json();
}

// Function to refresh access token
async function refreshAccessToken() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      return true; // Refresh successful
    }
    return false; // Refresh failed
  } catch (error) {
    console.error('Refresh token error:', error);
    return false;
  }
}



// JWT token utility functions
const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    // Decode JWT token (without verification since we don't have the secret on frontend)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

const checkAuthStatus = () => {
  const authToken = getCookie('auth');
  const refreshToken = getCookie('refresh');
  
  // If no tokens at all, user is not authenticated
  if (!authToken && !refreshToken) {
    return false;
  }
  
  // If we have a valid access token, user is authenticated
  if (authToken && !isTokenExpired(authToken)) {
    return true;
  }
  
  // If access token is expired but we have refresh token, let API handle refresh
  if (refreshToken) {
    return true; // API will handle token refresh automatically
  }
  
  // No valid tokens, clear cookies and return false
  if (typeof document !== 'undefined') {
    document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refresh=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
  return false;
};

// Email utility functions using Nodemailer
export async function sendBookingConfirmationEmail(userEmail, bookingDetails) {
  try {
    // Get current theme from cookies
    const themeColor = getCookie('theme-color') || 'color-theme-blue'
    const themeLayout = getCookie('theme-color-layout') || 'theme-light'
    const isDarkMode = themeLayout === 'theme-dark'

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking-confirmation',
        userEmail,
        bookingDetails,
        themeColor,
        isDarkMode
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
    return result;
  } catch (error) {
    console.error('Send booking confirmation email error:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(userEmail, firstName) {
  try {
    // Get current theme from cookies
    const themeColor = getCookie('theme-color') || 'color-theme-blue'
    const themeLayout = getCookie('theme-color-layout') || 'theme-light'
    const isDarkMode = themeLayout === 'theme-dark'

    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        userEmail,
        firstName,
        themeColor,
        isDarkMode
      })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to send email');
    }
    return result;
  } catch (error) {
    console.error('Send welcome email error:', error);
    throw error;
  }
}

// API functions for Next.js backend
export async function signin(email, password) {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await handleResponse(response);
    if (data === false) return false; // 401 error handled
    return data.code === 'LOGIN' || data.code === 'PWCHANGE';
  } catch (error) {
    console.error('Signin error:', error);
    return false;
  }
}

export async function signout() {
  try {
    // Call the signout API to clear HttpOnly cookies server-side
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      credentials: 'include'
    });
    

    return true;
  } catch (error) {
    console.error('Signout error:', error);
    return false;
  }
}

export async function register(email, password, firstname, lastname) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, firstname, lastname })
    });

    const data = await handleResponse(response);
    if (data === false) return false; // 401 error handled
    return data.code === 'REG';
  } catch (error) {
    console.error('Register error:', error);
    return false;
  }
}

export async function getAvailability(from, to) {
  try {
    const response = await fetch(`/api/bookings?from=${from}&to=${to}&see=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (data === false) return []; // 401 error handled
    return data.code === 'FOUND' ? data.msg : [];
  } catch (error) {
    console.error('Get availability error:', error);
    return [];
  }
}

export async function bookings() {
  try {
    const from = new Date().toISOString().split('T')[0];
    const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(`/api/bookings?from=${from}&to=${to}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (data === false) return { code: 'ERROR', msg: [] }; // 401 error handled
    return data; // Return the full response object
  } catch (error) {
    console.error('Bookings error:', error);
    return { code: 'ERROR', msg: [] };
  }
}

export async function cancelBooking(id) {
  try {
    const response = await fetch('/api/bookings', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id })
    });

    const data = await handleResponse(response);
    if (data === false) return false; // 401 error handled
    return data.code === 'DELETE';
  } catch (error) {
    console.error('Cancel booking error:', error);
    return false;
  }
}

export async function registerBooking(date, start, end, people, description = "") {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ date, start, end, npeople: people, description })
    });

    const data = await handleResponse(response);
    if (data === false) return false; // 401 error handled
    
    // Check if the response indicates success
    if (data.code === 'BOOKED') {
      return true;
    } else {
      // Throw error with the message from the server
      throw new Error(data.msg || 'Booking creation failed');
    }
  } catch (error) {
    console.error('Register booking error:', error);
    throw error;
  }
}

export async function accountInfo() {
  try {
    // Check if we have any authentication tokens
    // if (typeof window !== 'undefined' && !checkAuthStatus()) {
    //   return { code: 'UNAUTHORIZED', msg: null };
    // }

    const response = await fetch('/api/client', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (data === false) return { code: 'UNAUTHORIZED', msg: null }; // 401 error handled
    return data; // Return the full response object
  } catch (error) {
    console.error('Account info error:', error);
    return { code: 'ERROR', msg: null };
  }
}

export async function setUserData(email, userData) {
  try {
    const response = await fetch('/api/client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, userdata: userData, update: true })
    });

    const data = await handleResponse(response);
    if (data === false) return false; // 401 error handled
    return data.code === 'UPDATE';
  } catch (error) {
    console.error('Set user data error:', error);
    return false;
  }
}

// Utility functions
export function dateString(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().replace(/T.*/, '');
}

export function dateId(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.valueOf() - (new Date(2020, 1, 1)).valueOf();
}

export function formatDate(d) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate();
}

export function formatDateId(dateId) {
  const d = new Date(parseInt(dateId)+(new Date(2020, 1, 1)).valueOf());
  return formatDate(d);
}
