import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import type { User } from '@/types/User'
import { NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/email'
import { setVerificationToken } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { rateLimiter, getClientIP } from '@/lib/rateLimit'


export async function POST(request: Request) {
    const clientIP = getClientIP(request)
    
    try {
        // Check rate limit for registration
        const rateLimitResult = rateLimiter.checkRateLimit(request, {
            maxAttempts: 3, // Fewer attempts for registration
            windowMs: 60 * 60 * 1000, // 1 hour
            blockDurationMs: 60 * 60 * 1000 // 1 hour
        })

        if (!rateLimitResult.allowed) {
            const remainingTime = rateLimitResult.blockedUntil 
                ? Math.ceil((rateLimitResult.blockedUntil - Date.now()) / 1000 / 60)
                : 0

            logger.authInfo(
                'Registration blocked due to rate limiting', 
                undefined, undefined
            )
            
            return NextResponse.json({ 
                error: `Too many registration attempts. Please try again in ${remainingTime} minutes.`
            }, { status: 429 })
        }

        const { email, password, name } = await request.json() as { 
            email: string, 
            password: string, 
            name: string 
        }

        // Basic validation
        if (!email || !password || !name) {
            logger.authInfo('Registration attempt with missing fields', undefined, email)
            return NextResponse.json(
                { error: 'Missing required fields' }, 
                { status: 400 }
            )
        }
        
        logger.authInfo('Registration attempt', undefined, email)
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        }) as User | null

        if (existingUser) {
            if (!existingUser.emailVerified) {
                logger.authInfo(
                    'Registration attempt for existing unverified user', 
                    existingUser.id, 
                    email   
                )
                try {
                    const verificationToken = await setVerificationToken(existingUser)

                    if (verificationToken instanceof NextResponse) {
                        return verificationToken
                    }

                    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
                    await sendVerificationEmail(existingUser, verificationLink)

                    return NextResponse.json(
                        { message: 'User already exists but is not verified, verification email sent' }, 
                        { status: 400 }
                    )
                } catch (error) {
                    logger.authError(
                        'Failed to send verification email for existing user', 
                        error as Error, 
                        existingUser.id, email
                    )
                    return NextResponse.json(
                        { error: 'User already exists but is not verified, error sending verification email' }, 
                        { status: 500 }
                    )
                }
            } else {
                logger.authInfo(
                    'Registration attempt for existing verified user', 
                    existingUser.id, email
                )
                return NextResponse.json(
                    { error: 'User already exists and is verified, please login' }, 
                    { status: 400 }
                )
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        }) as User | null   
        
        if (!user) {
            logger.authError('Failed to create user in database', undefined, undefined, email)
            return NextResponse.json(
                { error: 'Error creating user in database' }, 
                { status: 500 }
            )
        }

        logger.authInfo('User created successfully', user.id, email)

        // Create JWT token
        if (!process.env.JWT_SECRET) {
            logger.authError('JWT_SECRET is not set in environment variables')
            return NextResponse.json(
                { error: 'JWT_SECRET is not set' }, 
                { status: 500 }
            )
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        )

        const userResponse = {
            id: user.id,
            email: user.email,
            name: user.name || '',
            emailVerified: false, 
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } as User

        try {
            const verificationToken = await setVerificationToken(user)
            if (verificationToken instanceof NextResponse) {
                return verificationToken
            }

            const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
            await sendVerificationEmail(user, verificationLink)
            
            logger.authInfo('Verification email sent for new user', user.id, email)
        } catch (error) {
            logger.authError('Failed to send verification email for new user', error as Error, user.id, email)
            return NextResponse.json(
                { error: 'Error sending verification email, please try again' }, 
                { status: 500 }
            )
        }

        const response = NextResponse.json({ 
            message: 'User created successfully, please check your email for verification before logging in',
            user: userResponse, 
            status: 200
        })

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        })

        logger.authInfo('User registration completed successfully', user.id, email)
        return response

    } catch (error) {
        logger.authError('Unexpected error during registration', error as Error, undefined, undefined)
        return NextResponse.json(
            { error: 'Error creating user' }, 
            { status: 500 }
        )
    }
}