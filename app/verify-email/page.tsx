'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface User {
  name: string
  email: string
  id: string
  emailVerified: boolean
}

export default function WelcomeSendVerification() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyEmail(token)
    }
    else {
      checkUserStatus()
    }
  }, [searchParams])


  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      })
      console.log('Response:', response)
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        router.push('/dashboard')
      } else {
        const data = await response.json()
        alert(data.error)
        router.push('/login')
      }
    } catch (error) {
      alert('Error verifying email: ' + error)
      console.error('Error verifying email:', error)
    }
  }
        
  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const userData = await response.json() as User
        setUser(userData)
        
        // If already verified, redirect to dashboard
        if (userData.emailVerified) {
          router.push('/dashboard')
          return
        }
      } else {
        // User not logged in, redirect to signup
        router.push('/signup')
        return
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setError('Failed to load user information')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!user || sending) return

    setSending(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('✅ Verification email sent successfully! Please check your inbox.')
      } else {
        setError(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Welcome to Auth System!
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            You're almost ready to get started
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.95a3 3 0 003.22 0L21 8m-18 4v8a2 2 0 002 2h16a2 2 0 002-2v-8m-18-4a2 2 0 012-2h16a2 2 0 012 2v4" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Hi {user.name}! 👋
            </h2>
            <p className="text-gray-600 text-lg">
              We've sent a verification email to:
            </p>
            <p className="font-medium text-gray-900 mt-1 text-lg">
              {user.email}
            </p>
          </div>

          {/* Status Messages */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              What's next?
            </h3>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Check your email inbox</li>
              <li>2. Click the verification link</li>
              <li>3. Start using your account!</li>
            </ol>
          </div>

          {/* Resend Button */}
          <div className="space-y-4">
            <button
              onClick={handleResendVerification}
              disabled={sending}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                sending 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resend Verification Email
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-3">
                Didn't receive an email? Check your spam folder or click resend.
              </p>
              
              {/* Logout Option */}
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Sign out and use a different account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}