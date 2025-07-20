import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { setPasswordResetToken } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"


export async function POST(request: Request) {
    
    try {
        const { email } = await request.json()

        const user = await prisma.user.findUnique({
            where: { email }
        })
        
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        const passwordResetToken = await setPasswordResetToken(user)

        if (passwordResetToken instanceof NextResponse) {
            return passwordResetToken
        }
        
        // Create password reset link
        const passwordResetLink = `${process.env.CLIENT_URL}/reset-password?token=${passwordResetToken}`
        console.log('Password reset link:', passwordResetLink)

        try {
            await sendPasswordResetEmail(user, passwordResetLink)
        } catch (error) {
            return NextResponse.json({ error: 'Error sending password reset email' }, { status: 500 })
        }
        
        return NextResponse.json({ message: 'Password reset email sent successfully' })
        
    } catch (error) {
        console.error('Forgot password error:', error)
        return NextResponse.json({ error: 'Error sending password reset email' }, { status: 500 })
    }
}