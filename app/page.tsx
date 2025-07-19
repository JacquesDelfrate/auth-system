'use client'
import { useRouter } from 'next/navigation'
import './globals.css'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Auth System</h1>
        <div className="space-y-4">
          <button onClick={() => router.push('/login')} className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Log In
          </button>
          <button onClick={() => router.push('/signup')} className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}