'use client'

import Loader from './Loader'

export default function AppWrapper({ children }) {
  return (
    <div className="App">
      <Loader />
      <div className="wrapper">
        {children}
      </div>
    </div>
  )
}
