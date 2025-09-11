'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signin } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const result = await signin(formData.username, formData.password)
      if (result) {
        try {
          router.push('/bookings')
        } catch (routerError) {
          console.error('Router error:', routerError)
          if (typeof window !== 'undefined') {
            window.location.href = '/bookings'
          }
        }
      } else {
        alert('Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert(error.message || 'Login failed. Please try again.')
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
              <small>Welcome to,</small><br />
              Makerspace Delft
            </h1>
            <br />
            <h5 className="text-white mb-4">Sign in</h5>
            
            <form onSubmit={handleSubmit} name="login">
              <div className="login-input-content">
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="Username"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="Password"
                    disabled={isLoading}
                  />
                </div>
                <input
                  type="submit"
                  className="btn btn-block btn-success rounded border-0 z-3"
                  value={isLoading ? "Signing in..." : "Sign in"}
                  disabled={isLoading}
                />
              </div>
            </form>
            
            <br />
            <br />
            <div className="row no-gutters">
              <div className="col-6 text-left">
                <Link href="/forgot-password" className="text-white mt-3">
                  Forgot Password?
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
