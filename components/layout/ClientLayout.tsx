'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { Footer } from './Footer'

interface ClientLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    role: string
  }
  onLogout?: () => void
}

export function ClientLayout({ children, user, onLogout }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed] = useState(false)


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden md:flex md:flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <Sidebar
            user={user}
            onLogout={onLogout}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900 transform transition-transform duration-300">
              <Sidebar user={user} onLogout={onLogout} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out">
          <Topbar
            user={user}
            onLogout={onLogout}
            onMenuToggle={() => setSidebarOpen(true)}
            showMenuButton={true}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}
