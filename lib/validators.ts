import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống')
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Mật khẩu mới phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
  path: ['newPassword']
})

export const locationSchema = z.object({
  name: z.string()
    .min(2, 'Tên vị trí phải có ít nhất 2 ký tự')
    .max(100, 'Tên vị trí không được quá 100 ký tự'),
  address: z.string()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
    .max(200, 'Địa chỉ không được quá 200 ký tự'),
  latitude: z.number()
    .min(-90, 'Vĩ độ phải từ -90 đến 90')
    .max(90, 'Vĩ độ phải từ -90 đến 90'),
  longitude: z.number()
    .min(-180, 'Kinh độ phải từ -180 đến 180')
    .max(180, 'Kinh độ phải từ -180 đến 180'),
  radius: z.number()
    .min(10, 'Bán kính tối thiểu là 10 mét')
    .max(1000, 'Bán kính tối đa là 1000 mét')
})

export const coordinateSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
})

export const locationSearchSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  page: z.string().optional()
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type LocationFormData = z.infer<typeof locationSchema>
export type CoordinateFormData = z.infer<typeof coordinateSchema>
export type LocationSearchFormData = z.infer<typeof locationSearchSchema>