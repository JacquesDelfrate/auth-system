# Auth System

A modern, secure authentication system built with Next.js 15, featuring user registration, login, email verification, and password reset functionality.

## 🚀 Features

- **User Authentication**: Secure login and registration with bcrypt password hashing
- **Email Verification**: Email-based account verification with token expiration
- **Password Reset**: Secure password reset functionality with email tokens
- **JWT Tokens**: Stateless authentication using JSON Web Tokens
- **Rate Limiting**: API rate limiting to prevent abuse
- **Database**: SQLite database with Prisma ORM
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **TypeScript**: Full TypeScript support for better development experience

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Styling**: Tailwind CSS
- **Email**: Nodemailer for email notifications
- **Language**: TypeScript
- **Package Manager**: npm

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd auth_claude
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-here"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

**Note**: For Gmail, you'll need to use an App Password instead of your regular password.

### 4. Set up the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
auth_claude/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   │   ├── login/     # Login API
│   │   │   ├── register/  # Registration API
│   │   │   ├── verify-email/ # Email verification
│   │   │   └── send-verification/ # Send verification email
│   │   ├── logout/        # Logout endpoint
│   │   └── me/            # Current user info
│   ├── components/        # React components
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Login page
│   ├── signup/           # Registration page
│   └── verify-email/     # Email verification page
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── email.ts          # Email sending utilities
│   ├── logger.ts         # Logging utilities
│   ├── prisma.ts         # Database client
│   └── rateLimit.ts      # Rate limiting utilities
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Email Verification
- `POST /api/auth/send-verification` - Send verification email
- `GET /api/auth/verify-email` - Verify email token

### Rate Limiting
- `GET /api/auth/rate-limit-status` - Check rate limit status

## 🗄️ Database Schema

The application uses a SQLite database with the following main table:

### Users Table
- `id` - Unique user identifier
- `email` - User email (unique)
- `password` - Hashed password
- `name` - User's display name
- `emailVerified` - Email verification status
- `verificationToken` - Email verification token
- `verificationTokenExpiry` - Token expiration
- `resetPasswordToken` - Password reset token
- `resetPasswordTokenExpiry` - Reset token expiration
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

## 🔒 Security Features

- **Password Hashing**: Bcrypt for secure password storage
- **JWT Tokens**: Stateless authentication
- **Email Verification**: Required for account activation
- **Rate Limiting**: API protection against abuse
- **Token Expiration**: Automatic token cleanup
- **Secure Headers**: CSRF protection and secure cookies

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

Built with ❤️ using Next.js and modern web technologies.
