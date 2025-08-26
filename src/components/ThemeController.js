'use client'

import { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'

export default function ThemeController() {
  const {  isDarkMode, changeThemeColor, toggleDarkMode } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleThemeColorClick = (newThemeColor) => {
    changeThemeColor(newThemeColor)
  }

  const handleDarkModeToggle = (e) => {
    toggleDarkMode(e.target.checked)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <div>
      <button className="theme btn btn-info sq-btn rounded float-bottom-right" onClick={openModal}>
        <i className="material-icons">color_lens</i>
      </button>
      
      {isModalOpen && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-bottom theme-header">
                <p className="text-uppercase font-weight-bold text-white my-2">Choose your color</p>
                <button type="button" className="close text-white" onClick={closeModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <div className="text-center theme-color">
                  <p className="text-uppercase font-weight-bold text-dark text-center">Select Color</p>
                  <button 
                    className="m-2 btn btn-danger rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-red')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <button 
                    className="m-2 btn btn-primary rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-blue')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <button 
                    className="m-2 btn btn-warning rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-yellow')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <button 
                    className="m-2 btn btn-success rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-green')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <br />
                  <button 
                    className="m-2 btn btn-pink rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-pink')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <button 
                    className="m-2 btn btn-orange rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-orange')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <button 
                    className="m-2 btn btn-gray rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-gray')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                  <button 
                    className="m-2 btn btn-black rounded sq-btn text-white" 
                    onClick={() => handleThemeColorClick('color-theme-black')}
                  >
                    <i className="material-icons w-25px">color_lens_outline</i>
                  </button>
                </div>
                <hr className="mt-4" />
                <div className="row align-items-center mt-4">
                  <div className="col-12 w-100">
                    <p className="text-uppercase font-weight-bold text-dark text-center">Layout Mode</p>
                  </div>
                  <div className="col text-right">
                    <i className="material-icons text-warning icon-3x">wb_sunny</i>
                  </div>
                  <div className="col-auto text-center">
                    <input 
                      type="checkbox" 
                      id="theme-dark" 
                      className="switch" 
                      checked={isDarkMode}
                      onChange={handleDarkModeToggle}
                    />
                    <label htmlFor="theme-dark">Toggle</label>
                  </div>
                  <div className="col text-left">
                    <i className="material-icons text-dark icon-3x">brightness_2</i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
