'use client'

import { useState, useEffect, useRef } from 'react'
import { PeriodSelectorProps, PeriodOption } from '@/types/dashboard'
import { Calendar, ChevronDown } from 'lucide-react'

const periodOptions = [
  { value: 'this_week', label: 'Tuần này' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'this_quarter', label: 'Quý này' },
  { value: 'custom', label: 'Tùy chỉnh' }
] as const

export function PeriodSelector({ 
  value, 
  onChange, 
  customRange, 
  onCustomRangeChange 
}: PeriodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const currentOption = periodOptions.find(option => option.value === value)

  const handlePeriodChange = (period: PeriodOption) => {
    onChange(period)
    setIsOpen(false)
    
    if (period === 'custom') {
      setShowCustomPicker(true)
    } else {
      setShowCustomPicker(false)
    }
  }

  const handleCustomRangeSubmit = (from: string, to: string) => {
    if (onCustomRangeChange) {
      onCustomRangeChange({
        from: new Date(from),
        to: new Date(to)
      })
    }
    setShowCustomPicker(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCustomPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">{currentOption?.label}</span>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePeriodChange(option.value)}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors
                ${value === option.value ? 'bg-gray-100 font-medium' : ''}
                ${option.value === 'custom' ? 'border-t' : ''}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {showCustomPicker && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white border rounded-lg shadow-lg z-50 p-4">
          <h3 className="text-sm font-medium mb-3">Chọn khoảng thời gian</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md text-sm"
                defaultValue={customRange?.from.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const from = e.target.value
                  const to = customRange?.to.toISOString().split('T')[0] || ''
                  if (from && to) {
                    handleCustomRangeSubmit(from, to)
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
              <input
                type="date"
                className="w-full px-3 py-2 border rounded-md text-sm"
                defaultValue={customRange?.to.toISOString().split('T')[0] || ''}
                onChange={(e) => {
                  const to = e.target.value
                  const from = customRange?.from.toISOString().split('T')[0] || ''
                  if (from && to) {
                    handleCustomRangeSubmit(from, to)
                  }
                }}
              />
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowCustomPicker(false)}
                className="flex-1 px-3 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const from = customRange?.from.toISOString().split('T')[0] || ''
                  const to = customRange?.to.toISOString().split('T')[0] || ''
                  if (from && to) {
                    handleCustomRangeSubmit(from, to)
                  }
                }}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}