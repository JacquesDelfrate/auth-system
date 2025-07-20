import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import type { User } from '@/types/User'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { logger } from '@/lib/logger'

export async function getCurrentUser(): Promise<User | NextResponse> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth-token')?.value

        if (!token) {
            logger.authInfo('Authentication token not found')
            return NextResponse.json({ error: 'Authentication token not found' }, { status: 401 })
        }

        if (!process.env.JWT_SECRET) {
            logger.authError('JWT_SECRET not found in environment variables')
            return NextResponse.json({ error: 'JWT_SECRET not found' }, { status: 500 })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string, email: string }
        logger.authInfo('JWT token verified successfully', decoded.userId, decoded.email)

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                name: true,
                email: true,
                id: true,
                createdAt: true,
                updatedAt: true,
                emailVerified: true
            }
        })
        
        if (!user) {
            logger.authError('User not found in database', undefined, decoded.userId, decoded.email)
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        logger.authInfo('User retrieved successfully', user.id, user.email)
        return user as User;

    } catch (error) {
        logger.authError('Error getting current user', error as Error)
        return NextResponse.json({ error: 'Error getting current user' }, { status: 500 })
    }
}

export async function setVerificationToken(user: User) {
    try {
        const verificationToken = crypto.randomBytes(32).toString('hex')
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        
        logger.authInfo('Setting verification token for user', user.id, user.email)
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verificationToken: verificationToken,
                verificationTokenExpiry: verificationTokenExpiry
            }
        })

        logger.authInfo('Verification token set successfully', user.id, user.email)
        return verificationToken
    } catch (error) {
        logger.authError('Error setting verification token', error as Error, user.id, user.email)
        return NextResponse.json({ error: 'Error setting verification token' }, { status: 500 })
    }
}

export async function setPasswordResetToken(user: User) {
    try {
        const passwordResetToken = crypto.randomBytes(32).toString('hex')
        const passwordResetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        
        logger.authInfo('Setting password reset token for user', user.id, user.email)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: passwordResetToken,
                resetPasswordTokenExpiry: passwordResetTokenExpiry
            }
        })
        
        logger.authInfo('Password reset token set successfully', user.id, user.email)
        return passwordResetToken
    } catch (error) {
        logger.authError('Error setting password reset token', error as Error, user.id, user.email)
        return NextResponse.json({ error: 'Error setting password reset token' }, { status: 500 })
    }
}