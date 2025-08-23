const apiURL = 'https://api.makerspacedelft.nl/prod'

// Authentication functions
export async function signin(email, password) {
  try {
    if (!email.length || !password.length) {
      throw new Error('Email and password are required')
    }
    
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      return true
    } else {
      throw new Error(data.error || 'Sign in failed')
    }
  } catch (error) {
    console.error('Signin error:', error)
    throw error
  }
}

export async function signout() {
  // TODO: Implement signout logic
  return true
}

export async function register(email, password, firstname, lastname) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, firstname, lastname })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      return true
    } else {
      throw new Error(data.error || 'Registration failed')
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Keep other functions for future use
export async function setUserData(email, userData) {
  try {
    const data = await postData(apiURL + '?action=client', { 
      email: email, 
      userdata: userData, 
      update: true 
    })
    
    if (data.code === "UPDATE") {
      return true
    } else {
      throw new Error(data.msg || 'Update failed')
    }
  } catch (error) {
    console.error('Update error:', error)
    throw error
  }
}

export async function accountInfo() {
  try {
    const data = await postData(apiURL + '?action=client', {})
    return data
  } catch (error) {
    console.error('Account info error:', error)
    throw error
  }
}

export async function registerBooking(date, start, end, people, description = "") {
  try {
    const data = await postData(apiURL + '?action=bookings', { 
      date: date, 
      start: start, 
      end: end, 
      npeople: people, 
      description: description 
    })
    
    if (data.code === "BOOKED") {
      return true
    } else {
      throw new Error(data.msg || 'Booking failed')
    }
  } catch (error) {
    console.error('Booking error:', error)
    throw error
  }
}

// Helper function for other API calls
async function postData(url = '', data = {}, method = 'POST') {
  try {
    const response = await fetch(url, {
      method: method,
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(data)
    })
    return response.json()
  } catch (error) {
    console.error('API call failed:', error)
    throw error
  }
}

