'use client'

import { useState, useEffect } from 'react'
import { getAvailability, formatDate, dateString, registerBooking, sendBookingConfirmationEmail } from '@/lib/api'
import { useRouter } from 'next/navigation'
export default function BookingModal() {
  const [availableBookings, setAvailableBookings] = useState(null)
  const [selectedDayBookings, setSelectedDayBookings] = useState([])
  const [disabledStartTimes, setDisabledStartTimes] = useState([])
  const [disabledEndTimes, setDisabledEndTimes] = useState([])
  const [npeople, setNpeople] = useState(1)
  const [description, setDescription] = useState("")
  const [selectedDay, setSelectedDay] = useState(0)
  const [selectedStart, setSelectedStart] = useState(0)
  const [selectedEnd, setSelectedEnd] = useState(1)
  const [maxPeople, setMaxPeople] = useState(5)
  const router = useRouter()
  useEffect(() => {
    reload()
  }, [])

  const reload = async () => {
    try {
      const data = await getAvailability(dateString(0), dateString(14))
      
      if (data) {
        const bookingsData = data
        
        // Convert array format to object format (like original code expects)
        const convertedBookingsData = {}
        bookingsData.forEach((dayArray, dayIndex) => {
          convertedBookingsData[dayIndex] = {}
          dayArray.forEach((spots, hourIndex) => {
            convertedBookingsData[dayIndex][hourIndex] = spots
          })
        })
        
        setAvailableBookings(convertedBookingsData)
        
        // Safely get the first available day and times
        const firstDay = Object.keys(convertedBookingsData)[0] || 0
        const firstDayData = convertedBookingsData[firstDay] || {}
        const firstStart = Object.keys(firstDayData)[0] || 0
        const firstEnd = Object.keys(firstDayData)[1] || 1
        
        setSelectedStart(parseInt(firstStart))
        setSelectedEnd(parseInt(firstEnd))
        updateMenus(convertedBookingsData, parseInt(firstDay), parseInt(firstStart), parseInt(firstEnd), npeople)
      }
      else{
        router.push('/login')
      }
    } catch (error) {
      console.error('Error loading availability:', error)
    }
  }

  const updateMenus = (bookings = availableBookings, day = selectedDay, start = selectedStart, end = selectedEnd, people = npeople) => {
    if (!bookings) return

    const selectedStartTime = Math.max(start || 0, 0)
    const selectedEndTime = end || selectedEnd || 1
    const selectedPeople = people || npeople || 1
    const selectedDayValue = day || selectedDay || 0

    const dayBookings = bookings[selectedDayValue] || {}
    
    // Convert object to array for easier processing
    const dayBookingsArray = []
    for (let i = 0; i < 24; i++) {
      dayBookingsArray[i] = dayBookings[i] || 0
    }

    const date = new Date()
    const time = parseInt(date.toLocaleString('en-GB', { hour: '2-digit', timeZone: 'Europe/Athens' }))
    
    const newDisabledStartTimes = dayBookingsArray.map((e, i) => {
      return selectedPeople > parseInt(e) || (selectedDayValue == 0 && i < time + 2)
    })

    let newSelectedStart = selectedStartTime
    if (newDisabledStartTimes[selectedStartTime] === true) {
      newSelectedStart = newDisabledStartTimes.findIndex((a) => a === false)
    }

    const newDisabledEndTimes = dayBookingsArray.map((e, i) => {
      const j = i + 1
      let disabled = false
      if (newSelectedStart >= j) disabled = true
      for (let k = newSelectedStart; k < j; k++) {
        if (selectedPeople > parseInt(dayBookingsArray[k])) disabled = true
      }
      return disabled
    })

    let newSelectedEnd = selectedEndTime
    if (newDisabledEndTimes[newSelectedEnd - 1] === true) {
      newSelectedEnd = newDisabledEndTimes.findIndex((a) => a === false) + 1
    }

    // compute max people available for the selected range (min capacity across hours)
    const rangeMin = Math.max(0, newSelectedEnd - newSelectedStart) > 0
      ? Array.from({length: newSelectedEnd - newSelectedStart}).reduce((min, _, idx) => {
          const hour = newSelectedStart + idx
          const cap = parseInt(dayBookingsArray[hour]) || 0
          return idx === 0 ? cap : Math.min(min, cap)
        }, 0)
      : 0

    const adjustedPeople = Math.max(1, Math.min(selectedPeople, Math.max(rangeMin, 1)))

    setSelectedDayBookings(dayBookingsArray)
    setDisabledStartTimes(newDisabledStartTimes)
    setDisabledEndTimes(newDisabledEndTimes)
    setSelectedStart(newSelectedStart)
    setSelectedEnd(newSelectedEnd)
    setSelectedDay(selectedDayValue)
    setNpeople(adjustedPeople)
    setMaxPeople(Math.max(rangeMin, 1))
  }

  const updatePeople = (e) => {
    updateMenus(availableBookings, selectedDay, selectedStart, selectedEnd, parseInt(e.target.value))
  }

  const updateDay = (e) => {
    updateMenus(availableBookings, parseInt(e.target.value), selectedStart, selectedEnd, npeople)
  }

  const updateStartTime = (e) => {
    updateMenus(availableBookings, selectedDay, parseInt(e.target.value), selectedEnd, npeople)
  }

  const updateEndTime = (e) => {
    updateMenus(availableBookings, selectedDay, selectedStart, parseInt(e.target.value), npeople)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Validate
      const start = selectedStart || 0
      const end = selectedEnd || 1
      if (start >= end) {
        alert('Please ensure "Starting from" is before "Until".')
        return
      }
      const people = npeople || 1
      // ensure people do not exceed min capacity across selected range
      const minCapacity = Array.from({length: end - start}).reduce((min, _, idx) => {
        const cap = parseInt(selectedDayBookings[start + idx]) || 0
        return idx === 0 ? cap : Math.min(min, cap)
      }, 0)
      if (people > minCapacity) {
        alert(`Selected people exceed available capacity (${minCapacity}) for this time range.`)
        return
      }
      
      const success = await registerBooking(
        dateString(parseInt(selectedDay || 0)), 
        start, 
        end, 
        people,
        description || ""
      )
      
      if (success) {
        // Send booking confirmation email
        try {
          await sendBookingConfirmationEmail({
            date: dateString(parseInt(selectedDay || 0)),
            start: selectedStart || 0,
            end: selectedEnd || 1,
            npeople: npeople || 1
          })
        } catch (emailError) {
          console.error('Failed to send booking confirmation email:', emailError)
        }
        
        // Hide modal using Bootstrap
        if (typeof window !== 'undefined' && window.$) {
          try {
            window.$('#hireme').modal('hide')
          } catch (error) {
            console.error('Error hiding modal:', error)
          }
        }
        
        // Refresh the page to show new booking
        if (typeof window !== 'undefined') {
          window.location.href = window.location.pathname
        }
      } else {
        // Show error message to user
        console.log('Failed to create booking. Please try again.')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      
      // Show specific error message based on the error
      let errorMessage = 'Failed to create booking. Please try again.'
      
      if (error.message) {
        if (error.message.includes('Invalid booking details')) {
          errorMessage = 'Invalid booking details. Please check your date and time selection.'
        } else if (error.message.includes('Please log in')) {
          errorMessage = 'Please log in to create a booking.'
        } else if (error.message.includes('Service temporarily unavailable')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.'
        } else if (error.message.includes('Unable to create booking')) {
          errorMessage = 'Unable to create booking. Please check your internet connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(errorMessage)
    }
  }

  return (
    <div className="modal fade" id="hireme" tabIndex="-1" role="dialog" aria-hidden="true">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="background bg-45 rounded theme-header">
            <img src="/img/background.png" alt="" />
          </div>
          <div className="modal-header">
            <h5 className="text-white">New booking</h5>
            <button type="button" className="close text-white" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>

          <div className="modal-body">
            <div className="row">
              <div className="col mt-3">
                <form onSubmit={handleSubmit} name="login">
                  <div className="form-group">
                    <label>Number of people:</label>
                    <select 
                      className="form-control" 
                      id="people" 
                      name="people" 
                      value={npeople || 1} 
                      onChange={updatePeople}
                    >
                      {Array.from(Array(Math.min(10, maxPeople)), (e, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date:</label>
                    <select 
                      className="form-control" 
                      value={selectedDay || 0} 
                      onChange={updateDay}
                    >
                      { 
                      
                      (availableBookings? Object.keys(availableBookings) : []).map((e, i) => {
                        let dateName = ""
                        if (i === 0)
                            dateName = "Today"; 
                        else if (i === 1)
                            dateName = "Tomorrow";
                        else
                            dateName = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000 * parseInt(i)));
                        return <option key={i} value={i}>{dateName}</option>
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Starting from:</label>
                    <select 
                      className="form-control" 
                      value={selectedStart || 0} 
                      onChange={updateStartTime} 
                      disabled={!disabledStartTimes.includes(false)}
                    >
                      {selectedDayBookings.map((e, i) => (
                        <option 
                          key={i} 
                          value={i} 
                          disabled={disabledStartTimes[i]}
                        >
                          {i}:00 ({e})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Until:</label>
                    <select 
                      className="form-control" 
                      value={selectedEnd || 1} 
                      onChange={updateEndTime}
                    >
                      {selectedDayBookings.map((e, i) => (
                        <option 
                          key={i + 1} 
                          value={i + 1} 
                          disabled={disabledEndTimes[i]}
                        >
                          {i + 1}:00
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Give Description</label>
                    <textarea 
                      name="description" 
                      id="description" 
                      className="form-control" 
                      placeholder="Write Brief Description"
                      value={description}
                      onChange={(e)=>setDescription(e.target.value)}
                    />
                  </div>

                  <input 
                    className="btn btn-block btn-primary btn-lg rounded border-0 z-3" 
                    type="submit" 
                    value="Create booking" 
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
