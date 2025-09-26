'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validators'
import { forgotPassword } from '@/lib/auth-client'
import { Mail, Loader2 } from 'lucide-react'

interface ForgotPasswordFormProps {
  onSuccess?: () => void
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await forgotPassword(data)
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
              <h1 className="text-2xl font-bold text-green-600 mb-2">Email đã được gửi</h1>
              <p className="text-sm text-gray-600">
                Vui lòng kiểm tra hộp thư email để đặt lại mật khẩu
              </p>
            </div>
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Nếu không thấy email, hãy kiểm tra thư mục spam
              </p>
              <Link href="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                  Quay lại đăng nhập
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
            <p className="text-sm text-gray-600">
              Nhập địa chỉ email của bạn để nhận hướng dẫn đặt lại mật khẩu.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                Địa chỉ email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập địa chỉ email của bạn"
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  {...register('email')}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
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
                'Gửi hướng dẫn đặt lại'
              )}
            </Button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-500 hover:underline font-medium"
              >
                Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
