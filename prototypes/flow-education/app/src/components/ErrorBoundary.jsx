import React from 'react'

/**
 * ErrorBoundary - Catches React crashes and shows fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#09090b',
          color: '#e4e4e7',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😵</div>
          <h1 style={{ color: '#F04D26', marginBottom: '10px' }}>Oops! Something broke</h1>
          <p style={{ color: '#71717a', marginBottom: '30px' }}>
            Try refreshing the page or going back home.
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#F04D26',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🔄 Refresh Page
          </button>
          <button 
            onClick={() => {
              localStorage.clear()
              window.location.reload()
            }}
            style={{
              background: 'transparent',
              color: '#71717a',
              border: '1px solid #27272a',
              padding: '10px 20px',
              borderRadius: '8px',
              marginTop: '15px',
              cursor: 'pointer'
            }}
          >
            🧹 Clear & Restart
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
