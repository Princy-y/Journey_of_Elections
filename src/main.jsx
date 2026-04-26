import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { analyticsService } from './services/analyticsService.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Web Vitals — route to Google Analytics 4 via analyticsService
if (typeof window !== 'undefined') {
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    const reportVital = metric => {
      analyticsService.logEvent('web_vitals', {
        metric_name: metric.name,
        metric_value: Math.round(metric.value),
        metric_id: metric.id,
        metric_rating: metric.rating,
      })
    }
    onCLS(reportVital)
    onFCP(reportVital)
    onLCP(reportVital)
    onTTFB(reportVital)
    if (onINP) onINP(reportVital)
  }).catch(() => {
    // web-vitals unavailable — silently skip
  })
}

// Service Worker (production only)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('SW registration failed:', err)
    })
  })
}
