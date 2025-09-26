import { LoginForm } from '@/components/forms/LoginForm'
import { Footer } from '@/components/layout/Footer'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <LoginForm />
        </div>
      </div>
      <Footer />
    </div>
  )
}
