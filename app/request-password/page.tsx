'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"


export default function RequestPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/auth/request-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (res.ok) {
                alert('Password reset email sent')
                router.push('/login')
            } else {
                alert('Failed to send reset password email')
            }
        } catch (error) {
            alert('Failed to send reset password email: ' + error)
        }

        // Reset form fields
        setEmail('')
        setLoading(false)
    
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold text-center mb-6">Forgot Password</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-full p-3 border rounded-lg" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required
                    />
                    <button 
                    type="submit" 
                    className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
                    disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}