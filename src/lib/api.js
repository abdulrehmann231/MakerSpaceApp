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

    const data = await response.json();
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

    const data = await response.json();
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

    const data = await response.json();
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

    const data = await response.json();
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

    const data = await response.json();
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

    const data = await response.json();
    return data.code === 'BOOKED';
  } catch (error) {
    console.error('Register booking error:', error);
    return false;
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

    const data = await response.json();
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

    const data = await response.json();
    return data.code === 'UPDATE';
  } catch (error) {
    console.error('Set user data error:', error);
    return false;
  }
}

// Utility functions
export function dateString(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().replace(/T.*/, '')
}

export function dateId(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.valueOf() - (new Date(2020, 1, 1)).valueOf()
}

export function formatDate(d) {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate()
}

export function formatDateId(dateId) {
  const d = new Date(parseInt(dateId) + (new Date(2020, 1, 1)).valueOf())
  return formatDate(d)
}
