import React from 'react'
import { Outlet } from 'react-router-dom'
import SalesmanSidebar from './SalesmanSidebar'

interface ErrorBoundaryState { error: Error | null }

class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8">
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="font-semibold text-red-800 mb-1">Page Error</p>
            <p className="text-sm text-red-700 font-mono">{this.state.error.message}</p>
            <button
              className="mt-3 text-sm text-red-600 underline"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function SalesmanLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SalesmanSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-8">
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </div>
      </main>
    </div>
  )
}
