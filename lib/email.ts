import { User } from '@/types/User'
import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'


// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

export async function sendVerificationEmail(user: User, verificationLink: string) {
    try {
        console.log('Sending verification email to ' + user.email)

        // Test the connection
        try {
            await transporter.verify()
        } catch (error) {
            console.error('SMTP connection error:', error)
            throw new Error('Failed to connect to SMTP server')
        }

        // Send verification email
        await transporter.sendMail({
            from: `"Auth System" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #3B82F6; margin: 0;">Auth System</h1>
                    </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
                    <p style="color: #6b7280; line-height: 1.6;">
                        Hi <strong>${user.name}</strong>!
                    </p>
                    <p style="color: #6b7280; line-height: 1.6;">
                        Please click the button below to verify your email address and complete your account setup.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" 
                        style="background-color: #3B82F6; color: white; padding: 14px 28px; 
                                text-decoration: none; border-radius: 6px; display: inline-block;
                                font-weight: 600;">
                        Verify Email Address
                    </a>
                    </div>
                    
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="word-break: break-all; color: #6b7280; font-size: 14px; background: #fff; padding: 10px; border-radius: 4px;">
                        ${verificationLink}
                    </p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
                        </p>
                    </div>
                </div>
            `
            })        
    } catch (error) {
        console.error('Email error details:', error)
        throw new Error(`Error sending verification email: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}
