'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validators'
import { resetPassword } from '@/lib/auth-client'
import { Lock, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface ResetPasswordFormProps {
  token: string
  onSuccess?: () => void
}

export function ResetPasswordForm({ token, onSuccess }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token
    }
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await resetPassword(data)
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Đã có lỗi xảy ra. Vui lòng thử lại.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-green-600 mb-2">Đặt lại mật khẩu thành công</h1>
              <p className="text-sm text-gray-600">
                Mật khẩu đã được đặt lại. Bạn có thể đăng nhập với mật khẩu mới
              </p>
            </div>
            <div className="text-center">
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <Image
                src="/logo.svg"
                alt="TIRA Logo"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">TIRA</h1>
            <p className="text-sm text-gray-600">
              Nhập mật khẩu mới cho tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                Mật khẩu mới
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('password')}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
                Xác nhận mật khẩu mới
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('confirmPassword')}
                  disabled={isLoading}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Đặt lại mật khẩu'
              )}
            </Button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline font-medium"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
