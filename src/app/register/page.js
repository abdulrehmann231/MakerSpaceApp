'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register, sendWelcomeEmail } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    password2: '',
    firstname: '',
    lastname: '',
    code: ''
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
    
    // Validation
    if (formData.code !== "HE8SXL4") {
      alert("Incorrect code")
      setIsLoading(false)
      return
    }
    
    if (!formData.username.length) {
      alert("Username is required")
      setIsLoading(false)
      return
    }
    
    if (formData.password !== formData.password2) {
      alert("Passwords do not match.")
      setIsLoading(false)
      return
    }
    
    try {
      const result = await register(
        formData.username, 
        formData.password, 
        formData.firstname, 
        formData.lastname
      )
      if (result) {
        // Send welcome email
        try {
          await sendWelcomeEmail(formData.username, formData.firstname)
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't fail registration if email fails
        }
        
        router.push('/account')
      }
    } catch (error) {
      console.error('Registration failed:', error)
      alert(error.message || 'Registration failed. Please try again.')
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
            <br /><br />
            <h5 className="text-white mb-4">Register with us</h5>
            
            <form onSubmit={handleSubmit} name="register">
              <div className="login-input-content">
                <div className="form-group">
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="Registration code"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="First name"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="Last name"
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="Email"
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
                <div className="form-group">
                  <input
                    type="password"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    className="form-control rounded text-center"
                    placeholder="Confirm password"
                    disabled={isLoading}
                  />
                </div>
                <input
                  type="submit"
                  value={isLoading ? "Registering..." : "Register"}
                  className="btn btn-block btn-primary btn-lg rounded border-0"
                  disabled={isLoading}
                />
              </div>
            </form>
            
            <div className="mt-4">
              <Link href="/login" className="text-white">
                Already have an account? Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
