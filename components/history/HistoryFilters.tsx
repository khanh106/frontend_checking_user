'use client'

import { useState } from 'react'
import { HistoryFilters, Location } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'

interface HistoryFiltersProps {
  filters: HistoryFilters
  onFiltersChange: (filters: HistoryFilters) => void
  locations: Location[]
  isLoading?: boolean
}

const quickRanges = [
  { label: 'Hôm nay', getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    }
  },
  { label: 'Tuần này', getValue: () => {
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      return { from: startOfWeek, to: endOfWeek };
    }
  },
  { label: 'Tháng này', getValue: () => {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return { from: startOfMonth, to: endOfMonth };
    }
  },
  { label: 'Tháng trước', getValue: () => {
      const today = new Date();
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: startOfLastMonth, to: endOfLastMonth };
    }
  }
];

export function HistoryFiltersComponent({ 
  filters, 
  onFiltersChange, 
  locations, 
  isLoading 
}: HistoryFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || '')
  
  const handleFilterChange = (key: keyof HistoryFilters, value: string | string[] | Date | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }
  
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateFrom: range?.from,
      dateTo: range?.to
    })
  }

  const handleQuickRange = (range: typeof quickRanges[0]) => {
    const { from, to } = range.getValue()
    onFiltersChange({
      ...filters,
      dateFrom: from,
      dateTo: to
    })
  }

  const clearAllFilters = () => {
    setSearchValue('')
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Bộ lọc lịch sử</CardTitle>
            <CardDescription>Tinh chỉnh kết quả hiển thị bên dưới.</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Tìm theo địa chỉ, tên địa điểm..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={() => handleFilterChange('search', searchValue || undefined)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('search', searchValue || undefined)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Khoảng thời gian</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom && filters.dateTo ? (
                    <>
                      {format(filters.dateFrom, "LLL dd, y", { locale: vi })} -{" "}
                      {format(filters.dateTo, "LLL dd, y", { locale: vi })}
                    </>
                  ) : (
                    <span>Chọn khoảng thời gian</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateFrom}
                  selected={{ from: filters.dateFrom, to: filters.dateTo }}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Địa điểm</Label>
            <Select
              value={filters.locationId || 'all'}
              onValueChange={(value) => handleFilterChange('locationId', value === 'all' ? undefined : value)}
              disabled={isLoading || locations.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn một địa điểm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chọn nhanh</Label>
            <div className="flex flex-wrap gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRange(range)}
                  disabled={isLoading}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
