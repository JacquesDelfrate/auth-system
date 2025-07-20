export interface User {
    id: string
    email: string
    name: string | null
    password: string | null
    emailVerified: boolean
    verificationToken?: string | null
    verificationTokenExpiry?: Date | null
    resetPasswordToken?: string | null
    resetPasswordTokenExpiry?: Date | null
    createdAt: Date
    updatedAt: Date
  }