import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Keep this even in production — makes real bugs diagnosable instead of a silent blank/broken screen.
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center app-shell px-6">
          <div className="card max-w-sm w-full text-center">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 grid place-items-center mx-auto mb-3">
              <AlertTriangle size={24} className="text-rose-500" />
            </div>
            <h2 className="font-display font-bold text-lg text-ink-900 dark:text-white">Something went wrong</h2>
            <p className="text-sm text-ink-400 mt-1.5">
              This screen ran into a problem. Your data is safe on this device — reloading usually fixes it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
