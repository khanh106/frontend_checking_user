import { ChartData } from '@/lib/api/attendance'

export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period: string
  }
  loading?: boolean
}

export interface AttendanceChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'area'
  period: string
  loading?: boolean
}

export interface PeriodSelectorProps {
  value: PeriodOption
  onChange: (period: PeriodOption) => void
  customRange?: DateRange
  onCustomRangeChange?: (range: DateRange) => void
}

export type PeriodOption = 'this_week' | 'this_month' | 'this_quarter' | 'custom'

export interface DateRange {
  from: Date
  to: Date
}

export interface DashboardPageProps {
  searchParams: {
    period?: string
    from?: string
    to?: string
  }
}
