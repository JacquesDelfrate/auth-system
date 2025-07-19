import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logged out successfully' })

        response.cookies.delete('auth-token')

        return response
    } catch (error) {
        return NextResponse.json({ error: 'Error logging out' }, { status: 500 })
    }
}