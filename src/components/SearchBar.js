'use client'

export default function SearchBar() {
  return (
    <form className="searchcontrol">
      <div className="input-group">
        <div className="input-group-prepend">
          <button type="button" className="input-group-text close-search">
            <i className="material-icons">keyboard_backspace</i>
          </button>
        </div>
        <input type="email" className="form-control border-0" placeholder="Search..." aria-label="Username" />
      </div>
    </form>
  )
}
