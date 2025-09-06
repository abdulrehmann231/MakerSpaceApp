'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {getCookie} from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    const themeColor = getCookie('theme-color') || 'color-theme-blue'
    const themeLayout = getCookie('theme-color-layout') || 'theme-light'
    const isDarkMode = themeLayout === 'theme-dark'
    console.log("themecolor", themeColor)
    console.log("themeLayout", themeLayout)
    console.log("isDarkMode", isDarkMode)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, themeColor, isDarkMode }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSuccess(true)
        setMessage('Password reset link has been sent to your email address.')
      } else {
        setMessage(data.message || 'Failed to send reset email. Please try again.')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  

  return (
    <div className="page">
      <div className="page-content h-100">
        <div className="background theme-header">
          <img src="/img/city2.jpg" alt="" />
        </div>
        <div className="row mx-0 h-100 justify-content-center">
          <div className="col-10 col-md-6 col-lg-4 my-3 mx-auto text-center align-self-center">
            <img src="/img/logo-w.png" alt="" className="login-logo" />
            <h1 className="login-title">
              <small>Reset your</small><br />
              Password
            </h1>
            <br />
            <h5 className="text-white mb-4">Enter your email address</h5>
            
            {message && (
              <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mb-3`}>
                {message}
              </div>
            )}
            
            {!isSuccess ? (
              <form onSubmit={handleSubmit} name="forgot-password">
                <div className="login-input-content">
                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-control rounded text-center"
                      placeholder="Email address"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    type="submit"
                    className="btn btn-block btn-primary rounded border-0 z-3"
                    value={`${isLoading ? 'Sending...' : 'Send Reset Link'}`}
                    disabled={isLoading}
                  />
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-white mb-4">
                  Check your email for the password reset link. The link will expire in 5 minutes.
                </p>
                <Link href="/login" className="btn btn-block btn-outline-light rounded border-0">
                  Back to Login
                </Link>
              </div>
            )}
            
            <br />
            <br />
            <div className="row no-gutters">
              <div className="col-12 text-center">
                <Link href="/login" className="text-white mt-3">
                  Remember your password? Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
        <br />
      </div>
    </div>
  )
}
