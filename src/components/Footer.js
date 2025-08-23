'use client'

export default function Footer() {
  return (
    <div className="footer-wrapper shadow-15">
      <div className="footer">
        <div className="row mx-0">
          <div className="col">
            Overux
          </div>
          <div className="col-7 text-right">
            <a href="/" className="social"><img src="/img/facebook.png" alt="" /></a>
            <a href="/" className="social"><img src="/img/googleplus.png" alt="" /></a>
            <a href="/" className="social"><img src="/img/linkedin.png" alt="" /></a>
            <a href="/" className="social"><img src="/img/twitter.png" alt="" /></a>
          </div>
        </div>
      </div>
      <div className="footer dark">
        <div className="row mx-0">
          <div className="col text-center">
            Makerspace Delft
          </div>
        </div>
      </div>
    </div>
  )
}
