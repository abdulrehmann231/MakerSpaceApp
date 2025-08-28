'use client'

import Link from "next/link"

export default function Footer() {
  return (
    <div className="footer-wrapper shadow-15">
      <div className="footer">
        <div className="row mx-0">
          <div className="col">
            Overux
          </div>
          <div className="col-7 text-right">
            <Link href="https://www.facebook.com/makerspacedelft/" className="social"><img src="/img/facebook.png" alt="" /></Link>
            <Link href="https://www.instagram.com/makerspacedelft" className="social"><img src="/img/instagram.png" alt="" /></Link>
            <Link href="https://discord.com/invite/qHVbghbW" className="social"><img src="/img/discord.png" alt="" /></Link>
            <Link href="https://www.linkedin.com/company/makerspacedelft/posts/?feedView=all" className="social"><img src="/img/linkedin.png" alt="" /></Link>
            <Link href="https://www.makerspacedelft.nl/" className="social"><img src="/img/website.png" alt="" /></Link>
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
