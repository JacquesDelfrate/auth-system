'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })

      const data = await res.json()

      if (res.ok) {
        // Success case (200)
        setSuccess(data.message || 'Account created successfully! Please check your email for verification.')
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        // Handle different error cases
        switch (res.status) {
          case 400:
            if (data.message && data.message.includes('verification email sent')) {
              // User exists but unverified - verification email sent
              setSuccess(data.message)
              setTimeout(() => {
                router.push('/login')
              }, 3000)
            } else {
              setError(data.error || 'Invalid registration data. Please check your information.')
            }
            break
          case 429:
            setError(data.error || 'Too many registration attempts. Please try again later.')
            break
          case 500:
            setError(data.error || 'Server error. Please try again later.')
            break
          default:
            setError(data.error || 'An unexpected error occurred. Please try again.')
        }
      }
    
    } catch (error) {
      setError('Network error. Please check your connection and try again.')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={loading}
            >
              {showPassword ? "🙈" : "👁️‍🗨️"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-500 hover:text-blue-600 underline"
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}