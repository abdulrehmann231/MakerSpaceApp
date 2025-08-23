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
    return data.code === 'LOGIN';
  } catch (error) {
    console.error('Signin error:', error);
    return false;
  }
}

export async function signout() {
  console.log('Signout called')
  // TODO: Implement signout
  return true
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
  console.log('Get availability called with:', from, to)
  // TODO: Implement availability
  return []
}

export async function bookings() {
  console.log('Bookings called')
  // TODO: Implement bookings
  return []
}

export async function cancelBooking(id) {
  console.log('Cancel booking called with id:', id)
  // TODO: Implement cancel booking
  return false
}

export async function registerBooking(date, start, end, people, description = "") {
  console.log('Register booking called with:', date, start, end, people, description)
  // TODO: Implement booking registration
  return false
}

export async function accountInfo() {
  console.log('Account info called')
  // TODO: Implement account info
  return null
}

export async function setUserData(email, userData) {
  console.log('Set user data called with:', email, userData)
  // TODO: Implement set user data
  return false
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
