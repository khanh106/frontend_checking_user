'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { AdminFooterWrapper } from './AdminFooterWrapper'

interface ClientAdminLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    role: string
  }
  onLogout?: () => void
}

export function ClientAdminLayout({ children, user, onLogout }: ClientAdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <div className="hidden md:flex md:w-64 md:flex-col">
          <Sidebar user={user} onLogout={onLogout} />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900">
              <Sidebar user={user} onLogout={onLogout} />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
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

          <AdminFooterWrapper />
        </div>
      </div>
    </div>
  )
}
