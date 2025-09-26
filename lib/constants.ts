export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  LOCATIONS: '/locations',
  HISTORY: '/history',
  SETTINGS: '/settings',
  CHANGE_PASSWORD: '/settings/change-password',
  HELP: '/help',
} as const

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  EMPLOYEE: 'employee',
} as const

export const ATTENDANCE_STATUS = {
  ON_TIME: 'on_time',
  LATE: 'late',
  EARLY: 'early',
  OVERTIME: 'overtime',
} as const

export const DATE_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  THIS_QUARTER: 'this_quarter',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
} as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const
