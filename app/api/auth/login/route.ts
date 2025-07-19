import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type { User } from '@/types/User'
import { logger } from '@/lib/logger'
import { rateLimiter } from '@/lib/rateLimit'

export async function POST(request: Request) {
    
    try {
        // Check rate limit first
        const rateLimitResult = rateLimiter.checkRateLimit(request, {
            maxAttempts: 5,
            windowMs: 15 * 60 * 1000, // 15 minutes
            blockDurationMs: 30 * 60 * 1000 // 30 minutes
        })

        if (!rateLimitResult.allowed) {
            const remainingTime = rateLimitResult.blockedUntil 
                ? Math.ceil((rateLimitResult.blockedUntil - Date.now()) / 1000 / 60)
                : 0

            logger.authInfo('Login blocked due to rate limiting', undefined, undefined)
            
            return NextResponse.json({ 
                error: `Too many login attempts. Please try again in ${remainingTime} minutes.`,
                blockedUntil: rateLimitResult.blockedUntil
            }, { 
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
                    'Retry-After': Math.ceil((rateLimitResult.blockedUntil || rateLimitResult.resetTime - Date.now()) / 1000).toString()
                }
            })
        }

        const { email, password } = await request.json()
        
        // Basic validation
        if (!email || !password) {
            logger.authInfo('Login attempt with missing fields', undefined, email)
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }
        
        logger.authInfo('Login attempt', undefined, email)
        
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        }) as User | null

        if (!existingUser) {
            logger.authInfo('Login attempt for non-existent user', undefined, email)
            return NextResponse.json({ error: 'User not found - Please sign up first' }, { status: 404 })
        }

        // check if password is correct
        const passwordMatch = await bcrypt.compare(password, existingUser.password || '')

        if (!passwordMatch) {
            logger.authInfo('Login attempt with invalid password', existingUser.id, email)
            return NextResponse.json({ 
                error: 'Invalid password',
                remainingAttempts: rateLimitResult.remainingAttempts
            }, { status: 401 })
        }

        // Login successful - clear rate limit for this IP
        rateLimiter.recordSuccess(request)

        // Create JWT token
        if (!process.env.JWT_SECRET) {
            logger.authError('JWT_SECRET is not set in environment variables')
            return NextResponse.json({ error: 'JWT_SECRET is not set' }, { status: 500 })
        }

        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        )

        const userResponse: User = {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name || '',
            password: null,
            emailVerified: existingUser.emailVerified,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt
        }

        const response = NextResponse.json({ 
            message: 'Login successful',
            user: userResponse
        })

        // Set HTTP-only cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 // 24 hours
        })

        logger.authInfo('User logged in successfully', existingUser.id, email)
        return response
  
    } catch (error) {
        logger.authError('Unexpected error during login', error as Error, undefined, undefined)
        return NextResponse.json({ error: 'Error logging in' }, { status: 500 })
    }
}