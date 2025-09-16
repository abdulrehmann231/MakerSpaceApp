

// Simple cookie utility functions
export const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Helper function to handle 401 errors and refresh tokens
async function handleResponse(response, retryFunction = null) {
  if (response.status === 401 || response.code === 'UNAUTHORIZED') {
    // Try to refresh the access token
    const refreshResult = await refreshAccessToken();
    if (refreshResult) {
      // Refresh successful, retry the original request if retry function provided
      if (retryFunction) {
        console.log('retry function')
        const retryResponse = await retryFunction();
        // If retry response is successful, parse and return the JSON
        if (retryResponse.ok) {
          return await retryResponse.json();
        } else {
          return false;
        }
      }
      return false; 
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





// Email utility functions using Nodemailer
export async function sendBookingConfirmationEmail( bookingDetails) {
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
      credentials: 'include',
      body: JSON.stringify({
        type: 'booking-confirmation',
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
    const makeRequest = async () => {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      return response;
    };

    const response = await makeRequest();

    const data = await handleResponse(response, makeRequest);
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
    const makeRequest = async () => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, firstname, lastname })
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return false; // 401 error handled
    return data.code === 'REG';
  } catch (error) {
    console.error('Register error:', error);
    return false;
  }
}

// Admin: create user and send reset link
export async function adminCreateUser(email, firstname = '', lastname = '') {
  try {
    const themeColor = getCookie('theme-color') || 'color-theme-blue'
    const themeLayout = getCookie('theme-color-layout') || 'theme-light'
    const isDarkMode = themeLayout === 'theme-dark'

    const makeRequest = async () => {
      const response = await fetch('/api/auth/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, firstname, lastname, themeColor, isDarkMode })
      })
      return response
    }

    const response = await makeRequest()
    const data = await handleResponse(response, makeRequest)
    if (data === false) return { code: 'UNAUTHORIZED', msg: false }
    return data // { code: 'INVITED', msg: true }
  } catch (error) {
    console.error('Admin create user error:', error)
    return { code: 'ERROR', msg: false }
  }
}

export async function getAvailability(from, to) {
  try {
    const makeRequest = async () => {
      const response = await fetch(`/api/bookings?from=${from}&to=${to}&see=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return false; // 401 error handled
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

    const makeRequest = async () => {
      const response = await fetch(`/api/bookings?from=${from}&to=${to}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return { code: 'ERROR', msg: [] }; // 401 error handled
    return data; // Return the full response object
  } catch (error) {
    console.error('Bookings error:', error);
    return { code: 'ERROR', msg: [] };
  }
}

export async function cancelBooking(id) {
  try {
    const makeRequest = async () => {
      const response = await fetch('/api/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return false; // 401 error handled
    return data.code === 'DELETE';
  } catch (error) {
    console.error('Cancel booking error:', error);
    return false;
  }
}

export async function registerBooking(date, start, end, people, description = "") {
  try {
    const makeRequest = async () => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ date, start, end, npeople: people, description })
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
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
    const makeRequest = async () => {
      const response = await fetch('/api/client', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      return response;
    };

    const response = await makeRequest();

    const data = await handleResponse(response, makeRequest);
    console.log('Account info data received:', data);

    if (data === false) return { code: 'UNAUTHORIZED', msg: null }; // 401 error handled
    return data; // Return the full response object
  } catch (error) {
    console.error('Account info error:', error);
    return { code: 'ERROR', msg: null };
  }
}

export async function setUserData(email, userData) {
  try {
    const makeRequest = async () => {
      const response = await fetch('/api/client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, userdata: userData, update: true })
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return false; // 401 error handled
    return data.code === 'UPDATE';
  } catch (error) {
    console.error('Set user data error:', error);
    return false;
  }
}

// Settings API (admin)
export async function getSetting(key = 'availability') {
  try {
    const makeRequest = async () => {
      const response = await fetch(`/api/settings?key=${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return { code: 'UNAUTHORIZED', msg: null };
    return data; // { code, msg }
  } catch (error) {
    console.error('Get setting error:', error);
    return { code: 'ERROR', msg: null };
  }
}

export async function setSetting(key, value) {
  try {
    const makeRequest = async () => {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ key, value })
      });
      return response;
    };

    const response = await makeRequest();
    const data = await handleResponse(response, makeRequest);
    if (data === false) return { code: 'UNAUTHORIZED', msg: null };
    return data; // { code: 'UPDATE' }
  } catch (error) {
    console.error('Set setting error:', error);
    return { code: 'ERROR', msg: null };
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

