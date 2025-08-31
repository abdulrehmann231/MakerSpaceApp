'use client'

import { useState, useEffect } from 'react'
import { accountInfo, setUserData } from '@/lib/api'

export default function AccountPage() {
  const [firstname, setFirstname] = useState("...")
  const [lastname, setLastname] = useState("...")
  const [email, setEmail] = useState("")
  const [team, setTeam] = useState("")
  const [phone, setPhone] = useState("")
  const [allergies, setAllergies] = useState("")
  const [medications, setMedications] = useState("")
  const [bloodtype, setBloodtype] = useState("")
  const [bio, setBio] = useState("")
  const [insta, setInsta] = useState("")
  const [slack, setSlack] = useState("")
  const [showemail, setShowemail] = useState(false)
  const [showphone, setShowphone] = useState(false)

  useEffect(() => {
    // Load account info
    const loadAccountInfo = async () => {
      try {
        const data = await accountInfo()
        if (data && data.msg) {
          const info = data.msg
          setFirstname(info.firstname || "...")
          setLastname(info.lastname || "...")
          setEmail(info.key || "")
          
          // Set user data fields if they exist
          if (info.userData) {
            setTeam(info.userData.team || "")
            setPhone(info.userData.phone || "")
            setAllergies(info.userData.allergies || "")
            setMedications(info.userData.medications || "")
            setBloodtype(info.userData.bloodtype || "")
            setBio(info.userData.bio || "")
            setInsta(info.userData.insta || "")
            setSlack(info.userData.slack || "")
            setShowemail(info.userData.showemail || false)
            setShowphone(info.userData.showphone || false)
          }
        }
      } catch (error) {
        console.error('Error loading account info:', error)
      }
    }

    loadAccountInfo()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = {
        team,
        phone,
        allergies,
        medications,
        bloodtype,
        bio,
        insta,
        slack,
        showemail,
        showphone
      }
      await setUserData(email, userData)
      
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  return (
    <div className="no-top-gap">
          <div className="row mx-0 position-relative py-5 mb-4">
            <div className="background h-100 theme-header">
              <img src="/img/background.png" alt="" />
            </div>
            <div className="col">
              <a href="user-profile.html#" className="media">
                <div className="w-auto h-100">
                  <figure className="avatar avatar-120">
                    <img src="/img/user1.png" alt="" />
                  </figure>
                </div>
                <div className="media-body align-self-center">
                  <h5 className="text-white">
                    {firstname + " " + lastname} <span className="status-online bg-success"></span>
                  </h5>
                  <p className="text-white">
                    online <span className="status-online bg-color-success"></span>
                    <br /> <span id="key">{email}</span>
                  </p>
                </div>
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} name="login">
            <h2 className="block-title">Account Details:</h2>
            <div className="row mx-0">
              <div className="col">
                <div className="form-group">
                  <label>Team name:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={team} 
                    onChange={(e) => setTeam(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Phone number:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "none" }}>
              <h2 className="block-title">Emergency information:</h2>
              <div className="row mx-0">
                <div className="col">
                  <div className="form-group">
                    <label>Allergies:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={allergies} 
                      onChange={(e) => setAllergies(e.target.value)} 
                      placeholder="None" 
                    />
                  </div>

                  <div className="form-group">
                    <label>Medications:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={medications} 
                      onChange={(e) => setMedications(e.target.value)} 
                      placeholder="None" 
                    />
                  </div>

                  <div className="form-group">
                    <label>Blood type:</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={bloodtype} 
                      onChange={(e) => setBloodtype(e.target.value)} 
                      placeholder="Unknown" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="block-title">Makerspace Profile:</h2>
            <div className="row mx-0">
              <div className="col">
                <div className="form-group">
                  <label>About you: (interests, skills, hobbies) </label>
                  <textarea 
                    type="text" 
                    className="form-control" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                  />
                </div>

                <div className="form-group">
                  <label>Instagram:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={insta} 
                    onChange={(e) => setInsta(e.target.value)} 
                    placeholder="" 
                  />
                </div>

                <div className="form-group">
                  <label>Slack username:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={slack} 
                    onChange={(e) => setSlack(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <h2 className="block-title">Privacy:</h2>
            <div className="row mx-0">
              <div className="col">
                <div className="form-group">
                  <input 
                    id="showemail" 
                    type="checkbox" 
                    className="" 
                    checked={showemail} 
                    onChange={(e) => setShowemail(e.target.checked)} 
                  />
                  <label htmlFor="showemail">&nbsp;Allow other members to see my email address</label>
                  <br />
                  <input 
                    id="showphone" 
                    type="checkbox" 
                    className="" 
                    checked={showphone} 
                    onChange={(e) => setShowphone(e.target.checked)} 
                  />
                  <label htmlFor="showphone">&nbsp;Allow other members to see my phone number</label>
                </div>

                <input 
                  className="btn btn-block btn-primary btn-lg rounded border-0 z-3" 
                  type="submit" 
                  value="Save Profile" 
                />
              </div>
            </div>
          </form>

          <br />
        </div>
  )
}
