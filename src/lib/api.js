// Helper function to handle 401 errors (like original readResponse)
function handleResponse(response) {
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return false;
  }
  return response.json();
}

// Simple cookie utility functions
const getCookie = (name) => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

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
    const response = await fetch('/api/client', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    const data = await handleResponse(response);
    if (data === false) return { code: 'ERROR', msg: null }; // 401 error handled
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
