import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import type { User } from '@/types/User'

export async function GET() {
    try {
        const user = await getCurrentUser() as User | NextResponse

        if (user instanceof NextResponse) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name || '',
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        })

    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}