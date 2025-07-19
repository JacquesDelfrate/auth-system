'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import type { User } from '@/types/User'

interface ApiError {
    error: string
    code?: string
}


export default function NavBar() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [logoutLoading, setLogoutLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Only check auth on pages where it's needed
        if (shouldCheckAuth(pathname)) {
            checkAuth()
        } else {
            setLoading(false)
        }
    }, [pathname])

    const shouldCheckAuth = (path: string): boolean => {
        // Pages where we don't need to check auth
        const publicPages = ['/', '/login', '/signup']
        return !publicPages.includes(path)
    }

    const checkAuth = async () => {
        console.log('Checking authentication...')
        try {
            setError(null)
            const res = await fetch('/api/me', {
                cache: 'no-cache',
                credentials: 'include'
            })

            console.log('Response:', res)
            
            if (res.ok) {
                const userData = await res.json() as User
                setUser(userData)
                console.log('User authenticated:', userData)
            } else if (res.status === 401) {
                setUser(null)
            } else {
                const errorData = await res.json() as ApiError
                console.log('Unexpected response:', res.status)
                setUser(null)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                setError('Network error - please check your connection')
            }
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        if (logoutLoading) return // Prevent multiple clicks
        
        try {
            setLogoutLoading(true)
            setError(null)

            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            if (response.ok) {
                setUser(null)
                setError(null)
                if ('caches' in window) {
                    caches.delete('auth-cache')
                }
                router.push('/')
            } else {
                const errorData = await response.json() as ApiError
                setError(errorData.error || 'Failed to logout')
            }
        } catch (error) {
            console.error('Logout failed:', error)
            setError('Failed to logout')
        } finally {
            setLogoutLoading(false)
        }
    }

    const handleNavClick = (path: string) => {
        setError(null)
        router.push(path)
    }

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    if (loading) {
        return <div className="h-16 bg-white shadow-md"></div>
    }

    return (
        <>
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-400 hover:text-red-600"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <nav className="bg-white shadow-md border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <button 
                                onClick={() => handleNavClick(user ? '/dashboard' : '/')}
                                className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
                                aria-label="Go to home page"
                            >
                                Auth System
                            </button>
                        </div>
            
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <span className="text-gray-700">Welcome, {user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        disabled={logoutLoading}
                                        className={`bg-red-500 text-white px-4 py-2 rounded-lg transition-colors ${
                                            logoutLoading 
                                                ? 'opacity-50 cursor-not-allowed' 
                                                : 'hover:bg-red-600'
                                        }`}
                                    >
                                        {logoutLoading ? 'Logging out...' : 'Logout'}
                                    </button>
                                </>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={() => handleNavClick('/login')}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => handleNavClick('/signup')}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}