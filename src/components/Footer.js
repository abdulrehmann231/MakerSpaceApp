'use client'

import Link from "next/link"
import { useTheme } from "@/hooks/useTheme"

export default function Footer() {
  const { isDarkMode, isInitialized } = useTheme()

  // Helper function to get the appropriate icon based on theme
  const getIconSrc = (baseName) => {
    if (!isInitialized) return `/img/${baseName}-light.png` // Default during loading
    return `/img/${baseName}-${isDarkMode ? 'dark' : 'light'}.png`
  }

  return (
    <div className="footer-wrapper shadow-15">
      <div className="footer">
        <div className="row mx-0">
          <div className="col">
            Overux
          </div>
          <div className="col-7 text-right">
            <Link href="https://www.facebook.com/makerspacedelft/" className="social">
              <img src={getIconSrc('facebook')} alt="Facebook" />
            </Link>
            <Link href="https://www.instagram.com/makerspacedelft" className="social">
              <img src={getIconSrc('insta')} alt="Instagram" />
            </Link>
            <Link href="https://discord.com/invite/qHVbghbW" className="social">
              <img src={getIconSrc('discord')} alt="Discord" />
            </Link>
            <Link href="https://www.linkedin.com/company/makerspacedelft/posts/?feedView=all" className="social">
              <img src="/img/linkedin.png" alt="LinkedIn" />
            </Link>
            <Link href="https://www.makerspacedelft.nl/" className="social">
              <img src={getIconSrc('web')} alt="Website" />
            </Link>
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
