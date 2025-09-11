'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import { accountInfo, adminCreateUser } from '@/lib/api'

export default function UsersAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('')
  const [firstname, setFirstname] = useState('User')

  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserFirst, setNewUserFirst] = useState('')
  const [newUserLast, setNewUserLast] = useState('')
  const [inviteStatus, setInviteStatus] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const data = await accountInfo()
      if (!data || data.code !== 'FOUND') {
        router.push('/login')
        return
      }
      const info = data.msg || {}
      setRole(info.user || '')
      setFirstname(info.firstname || 'User')
      if ((info.user || '') !== 'admin') {
        router.push('/account')
        return
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviteStatus('')
    if (!newUserEmail) {
      setInviteStatus('Please enter an email.')
      return
    }
    try {
      setInviting(true)
      const res = await adminCreateUser(newUserEmail, newUserFirst, newUserLast)
      if (res && res.code === 'INVITED') {
        setInviteStatus('Invitation sent.')
        setNewUserEmail('')
        setNewUserFirst('')
        setNewUserLast('')
      } else if (res && res.code === 'UNAUTHORIZED') {
        setInviteStatus('Unauthorized: admin required.')
        router.push('/login')
      } else {
        setInviteStatus('Failed to send invitation.')
      }
    } catch (err) {
      console.error(err)
      setInviteStatus('Failed to send invitation.')
    } finally {
      setInviting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className="no-top-gap">
      <div className="row mx-0 position-relative py-5 mb-4">
        <div className="background h-100 theme-header">
          <img src="/img/background.png" alt="" />
        </div>
        <div className="col">
          <a href="#" className="media">
            <div className="w-auto h-100">
              <figure className="avatar avatar-120">
                <img src="/img/user1.png" alt="" />
              </figure>
            </div>
            <div className="media-body align-self-center">
              <h5 className="text-white">
                {firstname} <span className="status-online bg-success"></span>
              </h5>
              <p className="text-white">Admin Panel</p>
            </div>
          </a>
        </div>
      </div>

      <div className="mt-2">
        <h2 className="block-title">Admin: Invite User</h2>
        <form onSubmit={handleInvite}>
          <div className="row mx-0">
            <div className="col">
              <div className="form-group">
                <label>User email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>
          </div>
          <div className="row mx-0">
            <div className="col">
              <div className="form-group">
                <label>First name (optional):</label>
                <input
                  type="text"
                  className="form-control"
                  value={newUserFirst}
                  onChange={(e) => setNewUserFirst(e.target.value)}
                />
              </div>
            </div>
            <div className="col">
              <div className="form-group">
                <label>Last name (optional):</label>
                <input
                  type="text"
                  className="form-control"
                  value={newUserLast}
                  onChange={(e) => setNewUserLast(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="row mx-0">
            <div className="col">
              <input
                className="btn btn-block btn-primary btn-lg rounded border-0 z-3"
                type="submit"
                value={inviting ? 'Inviting…' : 'Create User & Send Invite'}
                disabled={inviting}
              />
              {inviteStatus && (
                <p className="mt-2" style={{ color: inviteStatus.includes('Failed') || inviteStatus.includes('Unauthorized') ? '#E53E3E' : '#3CB371' }}>
                  {inviteStatus}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}


