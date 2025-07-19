import { NextResponse } from 'next/server'
import { rateLimiter, getClientIP } from '@/lib/rateLimit'

export async function GET(request: Request) {
    const clientIP = getClientIP(request)
    const remainingAttempts = rateLimiter.getRemainingAttempts(request)
    
    return NextResponse.json({
        remainingAttempts,
        clientIP: clientIP === 'unknown' ? undefined : clientIP
    })
} 