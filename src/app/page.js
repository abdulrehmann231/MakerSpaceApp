'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  //const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show loading for a moment then redirect to bookings page (same as original App.js)
    const timer = setTimeout(() => {
      router.push('/bookings')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

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
            <h5 className="text-white mb-4">Loading...</h5>
            <div className="text-center">
              <div className="spinner-border text-light" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="text-white mt-3">Redirecting to bookings...</p>
            </div>
          </div>
        </div>
        <br />
      </div>
    </div>
  )

}
