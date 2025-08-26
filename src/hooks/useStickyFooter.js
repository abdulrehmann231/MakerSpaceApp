'use client'

import { useEffect } from 'react'

export function useStickyFooter() {
  useEffect(() => {
    const updateFooterPosition = () => {
      const contentStickyFooter = document.querySelector('.content-sticky-footer')
      const footerWrapper = document.querySelector('.footer-wrapper')
      
      if (contentStickyFooter && footerWrapper) {
        const footerHeight = footerWrapper.offsetHeight
        contentStickyFooter.style.paddingBottom = `${footerHeight + 35}px`
        footerWrapper.style.marginTop = `-${footerHeight + 20}px`
      }
    }

    // Update on mount
    updateFooterPosition()
    
    // Update on window resize
    window.addEventListener('resize', updateFooterPosition)
    
    // Update after a short delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updateFooterPosition, 100)
    
    return () => {
      window.removeEventListener('resize', updateFooterPosition)
      clearTimeout(timeoutId)
    }
  }, [])
}
