'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Show loading for a moment then redirect to bookings page (same as original App.js)
    const timer = setTimeout(() => {
      router.push('/bookings')
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

  return <Loader />
}
