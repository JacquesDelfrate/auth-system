import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function POST(request: Request) {
    console.log('Reset password request received')
    try {
        const { password, token } = await request.json()

        const user = await prisma.user.findUnique({
            where: { resetPasswordToken: token }
        })
        
        if (!user) {
            return NextResponse.json(
                { error: 'Token not found' }, 
                { status: 404 }
            )
        }

        if (user.resetPasswordTokenExpiry && user.resetPasswordTokenExpiry < new Date()) {
            return NextResponse.json(
                { error: 'Token expired' }, 
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, resetPasswordToken: null, resetPasswordTokenExpiry: null }
        })

        return NextResponse.json({ message: 'Password reset successfully' })
        
    } catch (error) {
        console.error('Reset password error:', error)
        return NextResponse.json({ error: 'Error resetting password' }, { status: 500 })
    }
}