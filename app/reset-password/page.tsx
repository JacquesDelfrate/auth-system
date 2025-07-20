'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"



export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password, token })
            })

            if (res.ok) {
                alert('Password reset successfully')
                router.push('/login')
            } else {
                const errorData = await res.json()
                alert('Failed to reset password: ' + errorData.error)
            }
        } catch (error) {
            alert('Failed to reset password: ' + error)
        }

        // Reset form fields
        setPassword('')
        setConfirmPassword('')
        setLoading(false)
    
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="password" 
                        placeholder="New Password" 
                        className="w-full p-3 border rounded-lg" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm Password" 
                        className="w-full p-3 border rounded-lg" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required
                    />
                    <button 
                    type="submit" 
                    className={`w-full p-3 rounded-lg ${
                        loading || password !== confirmPassword
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                    disabled={loading || password !== confirmPassword}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}