'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Loader from '@/components/Loader'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState(null) // null = checking, true = valid, false = invalid

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      setMessage('Invalid or missing reset token.')
      return
    }

    // Verify token is valid
    const verifyToken = async () => {
      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        const data = await response.json()
        
        if (data.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setMessage('Reset token is invalid or has expired.')
        }
      } catch (error) {
        console.error('Token verification error:', error)
        setTokenValid(false)
        setMessage('Error verifying reset token.')
      }
    }

    verifyToken()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }
    
    if (formData.password.length < 4) {
      setMessage('Password must be at least 4 characters long.')
      return
    }
    
    setIsLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsSuccess(true)
        setMessage('Password has been reset successfully!')
      } else {
        setMessage(data.message || 'Failed to reset password. Please try again.')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  

  if (tokenValid === null) {
    return <Loader />
  }

  if (tokenValid === false) {
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
                <small>Invalid</small><br />
                Reset Link
              </h1>
              <br />
              <div className="alert alert-danger mb-3">
                {message}
              </div>
              <Link href="/forgot-password" className="btn btn-block btn-primary rounded border-0">
                Request New Reset Link
              </Link>
              <br />
              <br />
              <Link href="/login" className="text-white">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
              <small>Set new</small><br />
              Password
            </h1>
            <br />
            <h5 className="text-white mb-4">Enter your new password</h5>
            
            {message && (
              <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'} mb-3`}>
                {message}
              </div>
            )}
            
            {!isSuccess ? (
              <form onSubmit={handleSubmit} name="reset-password">
                <div className="login-input-content">
                  <div className="form-group">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control rounded text-center"
                      placeholder="New password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-control rounded text-center"
                      placeholder="Confirm new password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <input
                    type="submit"
                    className="btn btn-block btn-primary rounded border-0 z-3"
                    value={`${isLoading ? 'Resetting...' : 'Reset Password'}`}
                    disabled={isLoading}
                  />
                </div>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-white mb-4">
                  Your password has been successfully reset!
                </p>
                <Link href="/login" className="btn btn-block btn-primary rounded border-0">
                  Sign In
                </Link>
              </div>
            )}
            
            <br />
            <br />
            <div className="row no-gutters">
              <div className="col-12 text-center">
                <Link href="/login" className="text-white mt-3">
                  Back to Login
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader />}>
      <ResetPasswordForm />
    </Suspense>
  )
}
