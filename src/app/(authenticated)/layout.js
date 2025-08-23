'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import ThemeController from '@/components/ThemeController'
import { Page, BookingModal } from '@/components'
import { accountInfo } from '@/lib/api'

export default function AuthenticatedLayout({ children }) {
  const [firstname, setFirstname] = useState("User")

  useEffect(() => {
    accountInfo().then((data) => {
      if (data ) {
        setFirstname(data.msg.firstname)
      }
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
