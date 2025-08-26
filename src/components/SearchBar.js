'use client'

import { useSearch } from '@/hooks/useSearch'

export default function SearchBar() {
  const { closeSearch } = useSearch()

  return (
    <form className="searchcontrol">
      <div className="input-group">
        <div className="input-group-prepend">
          <button type="button" className="input-group-text close-search cursor-pointer" onClick={closeSearch}>
            <i className="material-icons">keyboard_backspace</i>
          </button>
        </div>
        <input type="email" className="form-control border-0" placeholder="Search..." aria-label="Username" />
      </div>
    </form>
  )
}
