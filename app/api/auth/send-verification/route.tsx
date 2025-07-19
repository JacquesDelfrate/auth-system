import { User } from '@/types/User'
import { NextResponse } from 'next/server'
import { getCurrentUser, setVerificationToken } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

export async function POST() {
    try {
        const user = await getCurrentUser() as User | NextResponse

        if (user instanceof NextResponse) {
            return user
        }
        
        if (user.emailVerified === true) {
            return NextResponse.json({ error: 'Email already verified' }, { status: 400 })
        }
        
        const verificationToken = await setVerificationToken(user)

        if (verificationToken instanceof NextResponse) {
            return verificationToken
        }
        
        // Create verification link
        const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`
        console.log('Verification link:', verificationLink)

        try {
            await sendVerificationEmail(user, verificationLink)
        } catch (error) {
            return NextResponse.json({ error: 'Error sending verification email, please try again' }, { status: 500 })  
        }
        
        return NextResponse.json({ message: 'Verification email sent successfully' })
        
    } catch (error) {
        console.error('Send verification error:', error)
        return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 })
    }
}