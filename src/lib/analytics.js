let analyticsReady = false

export function initAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (!measurementId || typeof window === 'undefined' || analyticsReady) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  function gtag() {
    window.dataLayer.push(arguments)
  }

  window.gtag = gtag
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    page_path: window.location.pathname
  })

  analyticsReady = true
}

export function trackPageView(path) {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID
  if (!measurementId || typeof window === 'undefined' || !window.gtag) return

  window.gtag('config', measurementId, {
    page_path: path
  })
}