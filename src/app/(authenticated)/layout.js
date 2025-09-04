'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { Page, BookingModal } from '@/components'
import { accountInfo } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AuthenticatedLayout({ children }) {
  const [firstname, setFirstname] = useState("User")
  const [userRole, setUserRole] = useState("user")
  const router = useRouter()
  
  useEffect(() => {
    accountInfo().then((data) => {
      
      if (data && data.code === 'FOUND' && data.msg && data.msg.firstname) {
        setFirstname(data.msg.firstname)
        // Set user role from the user document
        const role = data.msg.user || "user"
        console.log('User role detected:', role)
        setUserRole(role)
      }
      else if (data && data.code === 'UNAUTHORIZED') {
        // Token expired or invalid, redirect to login
        router.push('/login')
      }
      else{
        router.push('/login')
      }
    }).catch((error) => {
      
      router.push('/login')
    })
  }, [])

  return (
    <>
      <Sidebar firstname={firstname} userRole={userRole} />
      <Page>
        {children}
      </Page>
      <BookingModal />
    </>
  )
}
