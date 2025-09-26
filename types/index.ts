export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  createdAt?: Date
  updatedAt?: Date
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export interface RegisterApiData {
  email: string
  name: string
  password: string
  confirmPassword: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface AuthResponse {
  user?: User
  token?: string
  refreshToken?: string
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface AttendanceRecord {
  id: number
  lat: string
  lng: string
  address: string
  createdAt: string
  type: 'CHECK_IN' | 'CHECK_OUT'
  imageUri: string | null
  userId: number
  locationId: number | null
  deletedAt: string | null
  Location: {
    name: string
  }
}

export interface Location {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface CreateLocationData {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  isActive?: boolean
}

export interface LocationFormData {
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface AddressParts {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
}

export interface AttendanceSummary {
  totalDays: number
  totalHours: number
  onTimeDays: number
  lateDays: number
  overtimeHours: number
  period: {
    from: Date
    to: Date
  }
}

export type PeriodOption = 'this_week' | 'this_month' | 'this_quarter' | 'custom'

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

export interface PeriodSelectorProps {
  value: PeriodOption
  onChange: (period: PeriodOption) => void
  customRange?: DateRange
  onCustomRangeChange?: (range: DateRange) => void
}

export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType
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

export interface ChartData {
  date: string
  hours: number
  status: 'on_time' | 'late' | 'early'
  overtime?: number
}

export interface RecentActivity {
  id: string
  type: 'check_in' | 'check_out'
  timestamp: string
  location: string
  status: 'on_time' | 'late' | 'early'
  device?: string
}

export interface TrendData {
  value: number
  type: 'increase' | 'decrease' | 'neutral'
  period: string
}

export interface AttendanceStats {
  totalDays: number
  workingDays: number
  totalHours: number
  regularHours: number
  overtimeHours: number
  onTimeDays: number
  lateDays: number
  earlyDays: number
  attendanceRate: number
  punctualityRate: number
}

export interface AttendanceSummaryParams {
  from: Date
  to: Date
  period: 'this_week' | 'this_month' | 'this_quarter' | 'custom'
}

export type AttendanceStatus = 'on_time' | 'late' | 'early' | 'overtime' | 'absent'

export interface HistoryFilters {
  dateFrom?: Date
  dateTo?: Date
  status?: AttendanceStatus[]
  locationId?: string
  search?: string
}

export interface HistoryParams extends HistoryFilters {
  page: number
  limit: number
  sortBy: 'date' | 'checkIn' | 'status' | 'hours'
  sortOrder: 'asc' | 'desc'
}

export interface HistoryResponse {
  data: AttendanceRecord[]
  totalItems: number
  page: number
  limit: number
  totalPages: number
}

export interface HistoryStats {
  totalRecords: number
  totalWorkingHours: number
  totalOvertimeHours: number
  averageHoursPerDay: number
  onTimeRate: number
  lateRate: number
  absentRate: number
}