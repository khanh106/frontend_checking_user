import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'
import { Footer } from '@/components/layout/Footer'

interface ResetPasswordPageProps {
  params: Promise<{
    token: string
  }>
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <ResetPasswordForm token={token} />
        </div>
      </div>
      <Footer />
    </div>
  )
}
