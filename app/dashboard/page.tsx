import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import React from 'react'
import { User } from '@/types/User'
import { NextResponse } from 'next/server'

export default async function Dashboard() {
    const user = await getCurrentUser() as User | NextResponse

    if (user instanceof NextResponse) {
        redirect('/login')
    } else if (user.emailVerified === false) {
        redirect('/verify-email')
    }

    return (
      <div className="min-h-screen bg-gray-100 ">
        <div className="flex items-center justify-center pt-20">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-center mb-6">Dashboard</h1>
              <p className="text-center text-gray-600">Welcome, {user.name}! You're successfully logged in.</p>
              <p className="text-center text-gray-600">Your email is {user.email}.</p>
            </div>
        </div>
      </div>
    )
  }