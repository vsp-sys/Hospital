# Two-Factor Authentication (2FA) Implementation Guide

## Overview

This document describes the Two-Factor Authentication (2FA) system implemented for the Hospital Management System. The 2FA adds an extra layer of security by requiring users to verify their identity with a one-time password (OTP) sent via email after entering their credentials.

## Features

- ✅ **6-digit OTP** sent via email
- ✅ **5-minute expiration** for OTP codes
- ✅ **Resend OTP** functionality with 30-second cooldown
- ✅ **Works for all user roles** (Super Admin, Branch Admin, Doctor, Staff, Staff Admin, Patient)
- ✅ **Automatic cleanup** of expired OTPs from database
- ✅ **Fallback mechanism** for backward compatibility with existing local authentication

## Architecture

### Backend Components

1. **OTP Model** (`backend/models/OTP.js`)
   - Stores temporary OTP records
   - Auto-expires after 5 minutes
   - Links OTP to user and purpose

2. **Auth Routes** (`backend/routes/auth.js`)
   - `POST /api/auth/login` - Validates credentials and sends OTP
   - `POST /api/auth/verify-otp` - Verifies OTP and completes login
   - `POST /api/auth/resend-otp` - Resends OTP to user's email

3. **Email Service**
   - Uses Nodemailer with Gmail SMTP
   - Professional HTML email template
   - Configurable via environment variables

### Frontend Components

1. **TwoFactorAuth Component** (`frontend/src/components/TwoFactorAuth.jsx`)
   - 6-digit OTP input with auto-focus
   - Paste support for OTP codes
   - Countdown timer for resend
   - Role-specific styling
   - Error and success messaging

2. **Login Page Integration** (`frontend/src/components/LoginPage.jsx`)
   - Seamless transition to 2FA after credential validation
   - Maintains user context during 2FA flow
   - Back navigation support

## Setup Instructions

### 1. Backend Configuration

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Email Settings

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and configure your email:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
JWT_SECRET=your-secret-key
MONGO_URI=mongodb://localhost:27017/hospital
```

#### Gmail App Password Setup

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Step Verification (if not already enabled)
3. Visit [App Passwords](https://myaccount.google.com/apppasswords)
4. Create a new app password for "Mail"
5. Use this 16-character password in your `.env` file

### 2. Start the Backend Server

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:5000`

### 3. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or your configured port)

## How It Works

### Login Flow

1. **User enters credentials** (email + password)
2. **Backend validates credentials**
   - If valid: generates 6-digit OTP
   - Stores OTP in database with 5-minute expiry
   - Sends OTP via email
   - Returns `tempToken` (JWT with 5-minute expiry)
3. **Frontend shows 2FA screen**
   - Displays email where OTP was sent
   - Shows 6 input fields for OTP
4. **User enters OTP**
   - Frontend sends OTP + `tempToken` to backend
5. **Backend verifies OTP**
   - Checks if OTP matches and hasn't expired
   - Deletes used OTP from database
   - Generates final authentication token
   - Returns user data and token
6. **User logged in successfully**

### Resend OTP Flow

1. User clicks "Resend Code" (available after 30 seconds)
2. Backend generates new OTP
3. Deletes old OTP
4. Sends new OTP via email
5. Resets 30-second countdown

## API Endpoints

### 1. Login (Step 1)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Response:**
```json
{
  "message": "Credentials verified. OTP sent to your email.",
  "requires2FA": true,
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Verify OTP (Step 2)
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "otp": "123456",
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "doctor"
  },
  "message": "Login successful"
}
```

### 3. Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "tempToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "message": "New OTP sent to your email"
}
```

## Testing

### Test Credentials (with fallback)

The system maintains backward compatibility with existing test credentials:

- **Super Admin**: `supmin20@gmail.com` / `supmin@hms20`
- **Doctor**: `doctor@gmail.com` / `doctor123`
- **Nurse/Staff**: `nurse@gmail.com` / `nurse123`
- **Staff Admin**: `staffadmin@gmail.com` / `staff123`
- **Branch Admin**: `branchops@gmail.com` / `branch123`

**Note**: When using the API login endpoint, these credentials will trigger 2FA. The hardcoded fallback only applies when the API call fails.

### Manual Testing Steps

1. Start backend and frontend servers
2. Navigate to login page
3. Select a role (e.g., Doctor)
4. Enter valid credentials
5. Check email for OTP (check spam folder if using Gmail)
6. Enter 6-digit OTP in the verification screen
7. Should be redirected to the appropriate dashboard

### Testing Resend

1. After requesting OTP, wait 30 seconds
2. Click "Resend Code"
3. Should receive new OTP via email
4. Old OTP will no longer work

## Security Considerations

1. **OTP Expiration**: OTPs expire after 5 minutes
2. **Single Use**: OTPs are deleted after successful verification
3. **Rate Limiting**: Consider adding rate limiting to prevent brute force attacks
4. **HTTPS**: Always use HTTPS in production
5. **Email Security**: Use app-specific passwords, not main account passwords
6. **Token Security**: `tempToken` expires in 5 minutes

## Troubleshooting

### OTP Email Not Received

1. Check spam/junk folder
2. Verify email configuration in `.env`
3. Ensure Gmail App Password is correct
4. Check if 2-Step Verification is enabled on Gmail account
5. Verify MongoDB connection is working

### "Invalid or expired OTP" Error

1. OTP expires after 5 minutes - request a new one
2. Ensure you're using the most recent OTP (old ones are invalidated)
3. Check if OTP was already used

### Backend Connection Errors

1. Verify MongoDB is running
2. Check if backend server is running on port 5000
3. Ensure all dependencies are installed

## Database Schema

### OTP Collection

```javascript
{
  _id: ObjectId,
  email: String,           // User's email
  otp: String,            // 6-digit OTP
  userId: ObjectId,       // Reference to User
  purpose: String,        // "login"
  createdAt: Date,        // Auto-expires after 5 minutes
  __v: Number
}
```

## Future Enhancements

- [ ] Add SMS-based OTP (Twilio integration)
- [ ] Implement rate limiting per IP/email
- [ ] Add OTP attempt tracking and lockout after failed attempts
- [ ] Support for authenticator apps (TOTP)
- [ ] Remember device functionality
- [ ] Email template customization
- [ ] Multi-language email support

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs for error messages
3. Verify environment configuration
4. Test with different email providers if Gmail issues persist

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-29