'use client'

import { useState, useEffect } from 'react'
import { getAvailability, accountInfo, getSetting as apiGetSetting, setSetting as apiSetSetting } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'

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
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [newRecurHoliday, setNewRecurHoliday] = useState("")
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
    const nextHour = hour + 1
    return `${hour.toString().padStart(2, '0')}:00 - ${nextHour.toString().padStart(2, '0')}:00`
  }

  if (loading) {
    return <Loader />
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
    setNewHolidayDate("")
  }
  const removeHoliday = (dateStr) => {
    setHolidays(prev => { setDirty(true); return prev.filter(d => d !== dateStr) })
  }
  const addRecurHoliday = (mmdd) => {
    if (!mmdd) return
    if (!/^\d{2}-\d{2}$/.test(mmdd)) return
    if (!recurHolidays.includes(mmdd)) setRecurHolidays(prev => { setDirty(true); return [...prev, mmdd] })
    setNewRecurHoliday("")
  }
  const removeRecurHoliday = (mmdd) => {
    setRecurHolidays(prev => { setDirty(true); return prev.filter(d => d !== mmdd) })
  }

  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const hourIndices = Array.from({ length: 24 }, (_, i) => i)

  const setSlotValue = (dayIndex, hourIndex, value) => {
    const clamped = Math.max(0, Math.min(5, Number.isFinite(value) ? value : 0))
    setWeekTemplate(prev => {
      const copy = prev.map(day => day.slice())
      copy[dayIndex][hourIndex] = clamped
      return copy
    })
    setDirty(true)
  }

  const formatHourLabel = (hour) => `${hour.toString().padStart(2,'0')}:00`

  const getCellClassName = (value) => {
    return value === 0 ? 'cell cell-zero' : 'cell cell-positive'
  }

  return (
    <div className="no-top-gap" style={{padding: '15px'}}>
      <div className="section">
        <div className="row">
          <div className="col">
            <h3 className="mb-2">Availability</h3>
            <p className="text-muted">Set default hourly capacity per weekday and manage holidays.</p>
          </div>
        </div>
        <div className="card mb-3 position-relative">
          {(settingsLoading || saving) && (
            <div className="d-flex align-items-center justify-content-center position-absolute w-100 h-100" style={{top:0,left:0,background:'rgba(255,255,255,0.8)', zIndex: 2}}>
              <div className="maxui-roller">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="text-muted">Edit hourly capacity per weekday</small>
              <div className="d-flex align-items-center">
                <span className="legend-swatch swatch-zero mr-1"></span>
                <small className="mr-3">0</small>
                <span className="legend-swatch swatch-positive mr-1"></span>
                <small>1–5</small>
              </div>
            </div>
            <div className="table-responsive week-table-wrapper">
              <table className="table table-sm table-bordered align-middle mb-0 week-table" role="grid" aria-label="Weekly availability grid">
                <thead className="thead-sticky">
                  <tr>
                    <th scope="col" className="text-nowrap sticky-col !bg-white" style={{width: '96px', backgroundColor: 'white !important'}}>Time</th>
                    {dayNames.map((d) => (
                      <th scope="col" key={`head-${d}`} className="text-center !bg-white" style={{backgroundColor: 'white !important'}}>{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hourIndices.map((h) => (
                    <tr key={`row-${h}`}>
                      <th scope="row" className="text-muted font-monospace small text-nowrap sticky-col " >{formatHourLabel(h)}</th>
                      {dayNames.map((_, di) => {
                        const value = (weekTemplate[di] && weekTemplate[di][h]) || 0
                        return (
                          <td key={`cell-${di}-${h}`} className={getCellClassName(value)}>
                            <input
                              type="number"
                              min={0}
                              max={5}
                              className="form-control form-control-sm text-center bg-transparent border-0 shadow-none cell-input"
                              value={value}
                              onChange={(e)=> setSlotValue(di, h, parseInt(e.target.value, 10))}
                              onFocus={(e)=> e.target.select()}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card mb-3 position-relative">
          {settingsLoading && (
            <div className="d-flex align-items-center justify-content-center position-absolute w-100 h-100" style={{top:0,left:0,background:'rgba(255,255,255,0.8)', zIndex: 2}}>
              <div className="maxui-roller">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          )}
          <div className="card-body">
            <h5 className="mb-2">Holidays</h5>
            <div className="mb-2 d-flex">
              <input type="date" className="form-control mr-2" value={newHolidayDate} onChange={(e)=>setNewHolidayDate(e.target.value)} />
              <button className="btn btn-primary" type="button" disabled={!newHolidayDate || holidays.includes(newHolidayDate)} onClick={()=>addHoliday(newHolidayDate)}>Add</button>
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
              <input type="text" placeholder="MM-DD" className="form-control mr-2" value={newRecurHoliday} onChange={(e)=>setNewRecurHoliday(e.target.value)} />
              <button className="btn btn-primary" type="button" disabled={!/^\d{2}-\d{2}$/.test(newRecurHoliday) || recurHolidays.includes(newRecurHoliday)} onClick={()=>addRecurHoliday(newRecurHoliday)}>Add</button>
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

        <div className="row mx-0 mt-3">
          <div className="col">
            <div className="savebar d-flex align-items-center justify-content-between p-3 bg-light rounded">
              <small className="text-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</small>
              <div>
                <button className="btn btn-outline-secondary mr-2" disabled={!dirty || saving} onClick={()=>{loadSettings(); setDirty(false)}}>Discard</button>
                <button className="btn btn-primary" disabled={!dirty || saving} onClick={saveChanges}>{saving ? 'Saving...' : 'Save changes'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .week-table-wrapper{
          max-height: 384px;
          overflow: auto;
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 6px;
          /* Firefox */
          scrollbar-width: auto;
          scrollbar-color: var(--bs-border-color, #cbd5e1) transparent;
        }
        /* WebKit scrollbars */
        :global(.week-table-wrapper::-webkit-scrollbar){
          width: 12px;
          height: 12px;
        }
        :global(.week-table-wrapper::-webkit-scrollbar-thumb){
          background-color: var(--bs-border-color, #cbd5e1);
          border-radius: 10px;
          border: 3px solid var(--bs-body-bg);
        }
        :global(.week-table-wrapper::-webkit-scrollbar-track){
          background: transparent;
        }
        .week-table{
          min-width: 720px;
          position: relative;
          table-layout: fixed;
          font-family: var(--bs-font-sans-serif);
          color: var(--bs-body-color);
          border-collapse: separate;
          border-spacing: 0;
        }
        .thead-sticky th{
          position: sticky;
          top: 0;
          z-index: 10;
          background: #ffffff;
          box-shadow: inset 0 -1px 0 var(--bs-border-color, #dee2e6), 0 2px 4px rgba(0,0,0,.02);
          font-weight: 600;
          background-clip: padding-box;
          /* Ensure fully opaque header to cover cells underneath */
          background-color: #ffffff !important;
        }
        /* Sticky first column (time) */
        .sticky-col{
          position: sticky;
          left: 0;
          z-index: 9;
          background: #ffffff;
          box-shadow: 1px 0 0 var(--bs-border-color, #e9ecef);
        }
        /* Stronger z-index for top-left header corner */
        thead .sticky-col{ z-index: 11; }
        /* Compact row height */
        .week-table tbody td, .week-table tbody th{
          padding-top: .2rem;
          padding-bottom: .2rem;
          line-height: 1.1;
          background-clip: padding-box;
        }
        /* Subtle hover highlight */
        .week-table tbody tr:hover td{
          filter: brightness(0.985);
        }
        .cell-zero{
          background-color: var(--bs-danger-bg-subtle, #f8d7da);
        }
        .cell-positive{
          background-color: var(--bs-success-bg-subtle, #d1e7dd);
        }
        .cell-input:focus{
          border-color: var(--bs-primary, #0d6efd) !important;
          background-color: var(--bs-body-bg);
        }
        .cell-input{
          min-height: 22px;
          height: 22px;
          padding: 0 .25rem;
          font-size: 0.875rem;
          line-height: 1.1;
          color: var(--bs-body-color);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        /* Remove number input spinners for cleaner look */
        .cell-input::-webkit-outer-spin-button,
        .cell-input::-webkit-inner-spin-button{
          -webkit-appearance: none;
          margin: 0;
        }
        .cell-input[type=number]{
          -moz-appearance: textfield;
        }
        .legend-swatch{
          display:inline-block;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          border: 1px solid var(--bs-border-color, #dee2e6);
        }
        .swatch-zero{ background-color: var(--bs-danger-bg-subtle, #f8d7da); }
        .swatch-positive{ background-color: var(--bs-success-bg-subtle, #d1e7dd); }
        /* Responsive save bar */
        @media (max-width: 480px){
          .savebar{
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .savebar small{ margin-bottom: 4px; }
          .savebar > div{
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .savebar .btn{
            width: 100%;
            margin-right: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
