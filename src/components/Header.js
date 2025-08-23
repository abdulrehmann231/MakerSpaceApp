'use client'

export default function Header() {
  return (
    <header className="row m-0 fixed-header">
      <div className="left">
        <a  className="menu-left">
          <i className="material-icons">menu</i>
        </a>
      </div>
      <div className="col center">
        <a href="/" className="logo">
          <figure><img src="/img/logo-w.png" alt="" /></figure> My Bookings
        </a>
      </div>
      <div className="right">
        <a  className="searchbtn">
          <i className="material-icons">search</i>
        </a>
      </div>
    </header>
  )
}
