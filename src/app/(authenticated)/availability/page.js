'use client'

import { useState, useEffect } from 'react'
import { getAvailability, accountInfo, getSetting as apiGetSetting, setSetting as apiSetSetting } from '@/lib/api'
import { useRouter } from 'next/navigation'

export default function AvailabilityPage() {
  const [availabilityData, setAvailabilityData] = useState([])
  const [firstname, setFirstname] = useState("")
  const [userRole, setUserRole] = useState("user")
  const [loading, setLoading] = useState(true)
  const [weekTemplate, setWeekTemplate] = useState(Array.from({ length: 7 }, () => Array(24).fill(0)))
  const [holidays, setHolidays] = useState([])
  const [recurHolidays, setRecurHolidays] = useState([])
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    const checkUserRole = async () => {
      try {
        const data = await accountInfo()
        console.log(data)
        if (data && data.code === 'FOUND' && data.msg) {
          setFirstname(data.msg.firstname || "")
          setUserRole(data.msg.user || "user")
          
          // If not admin, redirect to bookings
          if (data.msg.user !== 'admin') {
            router.push('/bookings')
            return
          }
          
          // Load availability data for admin
          await Promise.all([loadAvailability(), loadSettings()])
        } else if (data && data.code === "UNAUTHORIZED") {
          router.push('/login')
        } else {
          router.push('/bookings')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        router.push('/bookings')
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [router])

  const loadAvailability = async () => {
    try {
      const from = new Date().toISOString().split('T')[0]
      const to = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const data = await getAvailability(from, to)
      if (data && Array.isArray(data)) {
        setAvailabilityData(data)
      } else {
        setAvailabilityData([])
      }
    } catch (error) {
      console.error('Error loading availability:', error)
      setAvailabilityData([])
    }
  }

  const loadSettings = async () => {
    try {
      setSettingsLoading(true)
      const data = await apiGetSetting('availability')
      const cfg = (data && data.msg) || {}
      if (cfg.spotsAvailable && Array.isArray(cfg.spotsAvailable)) setWeekTemplate(cfg.spotsAvailable)
      if (Array.isArray(cfg.holidays)) setHolidays(cfg.holidays)
      if (Array.isArray(cfg.recurHolidays)) setRecurHolidays(cfg.recurHolidays)
    } catch (e) {
      console.error('Error loading settings', e)
    } finally {
      setSettingsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimeSlot = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (userRole !== 'admin') {
    return null // Will redirect in useEffect
  }

  const updateSlot = (dayIndex, hourIndex, delta) => {
    setWeekTemplate(prev => {
      const copy = prev.map(day => day.slice())
      const nextVal = Math.max(0, (copy[dayIndex][hourIndex] || 0) + delta)
      copy[dayIndex][hourIndex] = nextVal
      return copy
    })
    setDirty(true)
  }

  const saveChanges = async () => {
    try {
      setSaving(true)
      const data = await apiSetSetting('availability', { spotsAvailable: weekTemplate, holidays, recurHolidays })
      if (!data || data.code !== 'UPDATE') throw new Error('Save failed')
      setDirty(false)
    } catch (e) {
      console.error(e)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const addHoliday = (dateStr) => {
    if (!dateStr) return
    if (!holidays.includes(dateStr)) setHolidays(prev => { setDirty(true); return [...prev, dateStr] })
  }
  const removeHoliday = (dateStr) => {
    setHolidays(prev => { setDirty(true); return prev.filter(d => d !== dateStr) })
  }
  const addRecurHoliday = (mmdd) => {
    if (!mmdd) return
    if (!recurHolidays.includes(mmdd)) setRecurHolidays(prev => { setDirty(true); return [...prev, mmdd] })
  }
  const removeRecurHoliday = (mmdd) => {
    setRecurHolidays(prev => { setDirty(true); return prev.filter(d => d !== mmdd) })
  }

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  return (
    <div className="container">
      <div className="section">
        <div className="row">
          <div className="col">
            <h3 className="mb-2">Availability</h3>
            <p className="text-muted">Set default hourly capacity per weekday and manage holidays.</p>
          </div>
        </div>
        <div className="card mb-3 position-relative">
          {(settingsLoading || saving) && (
            <div className="d-flex align-items-center justify-content-center position-absolute w-100 h-100" style={{top:0,left:0,background:'rgba(255,255,255,0.6)', zIndex: 2}}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          <div className="card-body">
            <ul className="nav nav-pills mb-3" role="tablist">
              {dayNames.map((d, i) => (
                <li className="nav-item" key={i}>
                  <a className={`nav-link ${i===0?'active':''}`} data-toggle="tab" href={`#day-${i}`}>{d}</a>
                </li>
              ))}
            </ul>
            <div className="tab-content" style={{overflowX:'hidden'}}>
              {dayNames.map((d, i) => (
                <div className={`tab-pane fade ${i===0?'show active':''}`} id={`day-${i}`} key={i}>
                  <div className="slot-wrap">
                    {weekTemplate[i].map((val, h) => (
                      <div className="slot" key={h}>
                        <div className="border rounded shadow-sm p-2 d-flex flex-column align-items-stretch h-100 bg-light">
                          <small className="text-muted mb-2" aria-hidden>{getTimeSlot(h)}</small>
                          <div className="d-flex align-items-center flex-nowrap w-100">
                            <button aria-label={`Decrease capacity at ${getTimeSlot(h)}`} className="btn btn-outline-secondary btn-sm mr-1" style={{flex:'0 0 28px', lineHeight:1}} onClick={() => updateSlot(i, h, -1)}>-</button>
                            <div className="badge badge-secondary text-center" style={{flex:'1 1 auto', minWidth:36, padding:'6px 0'}}>{val}</div>
                            <button aria-label={`Increase capacity at ${getTimeSlot(h)}`} className="btn btn-outline-secondary btn-sm ml-1" style={{flex:'0 0 28px', lineHeight:1}} onClick={() => updateSlot(i, h, +1)}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card mb-3 position-relative">
          {settingsLoading && (
            <div className="d-flex align-items-center justify-content-center position-absolute w-100 h-100" style={{top:0,left:0,background:'rgba(255,255,255,0.6)', zIndex: 2}}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          )}
          <div className="card-body">
            <h5 className="mb-2">Holidays</h5>
            <div className="mb-2 d-flex">
              <input type="date" className="form-control mr-2" onChange={(e)=>addHoliday(e.target.value)} />
            </div>
            <div className="mb-3">
              {holidays.length===0 && (<p className="text-muted">No holidays added yet.</p>)}
              {holidays.map(d => (
                <span key={d} className="badge badge-secondary mr-2 mb-2">
                  {d}
                  <a className="ml-2 cursor-pointer" onClick={()=>removeHoliday(d)}>×</a>
                </span>
              ))}
            </div>
            <h6 className="mb-2">Recurring (MM-DD)</h6>
            <div className="mb-2 d-flex">
              <input type="text" placeholder="MM-DD" className="form-control mr-2" onBlur={(e)=>addRecurHoliday(e.target.value)} />
            </div>
            <div>
              {recurHolidays.length===0 && (<p className="text-muted">No recurring holidays.</p>)}
              {recurHolidays.map(d => (
                <span key={d} className="badge badge-secondary mr-2 mb-2">
                  {d}
                  <a className="ml-2 cursor-pointer" onClick={()=>removeRecurHoliday(d)}>×</a>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="fixed-footer p-2 bg-white border-top">
          <div className="d-flex align-items-center justify-content-between">
            <small className="text-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</small>
            <div>
              <button className="btn btn-link mr-2" disabled={!dirty || saving} onClick={()=>{loadSettings(); setDirty(false)}}>Discard</button>
              <button className="btn btn-primary" disabled={!dirty || saving} onClick={saveChanges}>{saving ? 'Saving...' : 'Save changes'}</button>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .slot-wrap{
          display:flex;
          flex-wrap:wrap;
          gap:12px;
        }
        .slot{
          flex: 1 1 150px; /* grow, shrink, base */
          min-width: 140px; /* keeps buttons readable */
          max-width: 220px; /* prevents over-expansion on wide screens */
        }
      `}</style>
    </div>
  )
}
