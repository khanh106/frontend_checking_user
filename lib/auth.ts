import { cookies } from 'next/headers'
import { User } from '@/types'
import { NextAuthOptions } from 'next-auth'

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    
    if (!sessionCookie) {
      return null
    }

    // Parse session cookie trực tiếp thay vì gọi API /me
    try {
      const sessionData = JSON.parse(sessionCookie.value)
      if (sessionData && sessionData.user) {
        return sessionData.user
      }
    } catch (error) {
      console.error('Error parsing session cookie:', error)
    }
    
    return null
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export async function logout(): Promise<void> {
  try {
    // Gọi logout API nếu có
    // await apiClient.post('/auth/logout')
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    const cookieStore = await cookies()
    cookieStore.delete('session')
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null
}

export function requireAuth(): User {
  throw new Error('requireAuth must be called server-side')
}

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/login'
  }
}
