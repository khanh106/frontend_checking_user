'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  className?: string
  disabled?: boolean
}

export function PasswordInput({
  label,
  placeholder = "Nhập mật khẩu",
  value = "",
  onChange,
  error,
  className,
  disabled = false
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-semibold text-gray-900">
          {label}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            "pl-10 pr-10",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          disabled={disabled}
        >
          {showPassword ? (
            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          )}
        </button>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
