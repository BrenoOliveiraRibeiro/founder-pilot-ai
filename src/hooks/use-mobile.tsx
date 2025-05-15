
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isSafariIOS, setIsSafariIOS] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check for mobile screen size
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Check for iOS Safari
    const checkIOSSafari = () => {
      const ua = window.navigator.userAgent
      const iOS = /iPad|iPhone|iPod/.test(ua) || 
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua)
      setIsSafariIOS(iOS && isSafari)
    }
    
    // Add event listeners
    mql.addEventListener("change", onChange)
    
    // Initial checks
    onChange()
    checkIOSSafari()
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return {
    isMobile,
    isSafariIOS
  }
}
