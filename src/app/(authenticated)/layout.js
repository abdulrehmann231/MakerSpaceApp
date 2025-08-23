'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import ThemeController from '@/components/ThemeController'
import { Page, BookingModal } from '@/components'
import { accountInfo } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AuthenticatedLayout({ children }) {
  const [firstname, setFirstname] = useState("User")
  const router = useRouter()
  useEffect(() => {
    accountInfo().then((data) => {
      if (data && data.code === 'FOUND' && data.msg && data.msg.firstname) {
        setFirstname(data.msg.firstname)
      }
      else{
        router.push('/login')
      }
    }).catch((error) => {
      console.error('Error loading account info in layout:', error)
    })
  }, [])

  return (
    <>
      <Sidebar firstname={firstname} />
      <Page>
        {children}
      </Page>
      <BookingModal />
      <ThemeController />
    </>
  )
}
