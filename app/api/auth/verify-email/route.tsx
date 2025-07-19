import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {

    try {
    const { token } = await request.json()

    if (!token) {
        return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Find user with this verification token
    const user = await prisma.user.findUnique({
        where: { verificationToken: token }
    })

    if (!user) {
        return NextResponse.json({ error: 'Unvalid email verification token' }, { status: 404 })
    }
    
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
        return NextResponse.json({ error: 'Token expired - Ask for a new one' }, { status: 400 })
    }

    await prisma.user.update({
        where: {id: user.id},
        data: {
            emailVerified: true,
            verificationToken: null,
            verificationTokenExpiry: null
        }
    })

        return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error verifying email:', error)
        return NextResponse.json({ error: 'Error verifying email' }, { status: 500 })
    }
}