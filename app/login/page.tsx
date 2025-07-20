'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
    const [rateLimitError, setRateLimitError] = useState('')

    const router = useRouter()

    useEffect(() => {
        // Check rate limit status on page load
        checkRateLimitStatus()
    }, [])

    const checkRateLimitStatus = async () => {
        try {
            const response = await fetch('/api/auth/rate-limit-status')
            if (response.ok) {
                const data = await response.json()
                setRemainingAttempts(data.remainingAttempts)
            }
        } catch (error) {
            console.error('Failed to check rate limit status:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setRateLimitError('')

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password })
            })
            
            const data = await res.json()

            if (res.ok) {
                if (data.user.emailVerified === false) {
                    router.push('/verify-email')
                } else {
                    router.push('/dashboard')
                }
            } else if (res.status === 429) {
                // Rate limit exceeded
                setRateLimitError(data.error)
                setRemainingAttempts(0)
            } else if (data.error === 'User not found - Please sign up first') {
                alert(data.error)
                router.push('/signup')
            } else {
                // Update remaining attempts if provided
                if (data.remainingAttempts !== undefined) {
                    setRemainingAttempts(data.remainingAttempts)
                }
                alert(data.error)
            }
        } catch (error) {
            alert('Error logging in with error: ' + error)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Login</h1>

                {/* Rate Limit Warning */}
                {remainingAttempts !== null && remainingAttempts <= 2 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-700">
                            ⚠️ {remainingAttempts} login attempts remaining
                        </p>
                    </div>
                )}

                {/* Rate Limit Error */}
                {rateLimitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-700">{rateLimitError}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                        required
                        disabled={loading || (remainingAttempts === 0)}
                    />

                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            required
                            disabled={loading || (remainingAttempts === 0)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            disabled={loading || (remainingAttempts === 0)}
                        >
                            {"👁️‍🗨️"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || (remainingAttempts === 0)}
                        className={`w-full py-2 px-4 rounded transition-colors ${
                            loading || remainingAttempts === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>

                    <div className="text-center space-y-2">
                        <p className="text-gray-500">
                            Don't have an account? <Link href="/signup" className="text-blue-500 hover:text-blue-600">Sign up</Link>
                        </p>
                        <p className="text-gray-500">
                            <Link href="/request-password" className="text-blue-500 hover:text-blue-600">Forgot Password?</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}