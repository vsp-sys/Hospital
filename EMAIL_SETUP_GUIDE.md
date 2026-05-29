# Email Configuration Guide for 2FA OTP

## Issue: Gmail Authentication Error

You're getting this error because you're trying to use a college email (`@sjcem.edu.in`) with Gmail's SMTP server, which doesn't work. Here are your options:

## Option 1: Use Gmail with App Password (Recommended)

### Step 1: Create a Gmail App Password

1. **Enable 2-Factor Authentication on your Gmail account:**
   - Go to [Google Account](https://myaccount.google.com/)
   - Click "Security" in the left sidebar
   - Under "Signing in to Google", click "2-Step Verification"
   - Follow the steps to enable it

2. **Generate an App Password:**
   - After enabling 2FA, go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Hospital HMS" as the name
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 2: Update `.env` file

```env
# Use your personal Gmail account
EMAIL_USER=your-personal-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # The 16-character app password (with spaces)
```

### Step 3: Restart your backend server

```bash
cd backend
npm run dev
```

## Option 2: Use a Different Email Provider

If you don't want to use Gmail, you can use other providers:

### Outlook/Hotmail

```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-outlook-password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo Mail

```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-yahoo-app-password  # Generate app password in Yahoo account settings
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## Option 3: Use a Transactional Email Service (Best for Production)

### SendGrid (Free tier available)

1. **Sign up at [SendGrid](https://sendgrid.com/)**
2. **Create an API Key:**
   - Go to Settings → API Keys
   - Create Full Access API Key
   - Copy the key

3. **Install SendGrid:**
```bash
cd backend
npm install @sendgrid/mail
```

4. **Update `.env`:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=your-verified-sender@example.com
```

5. **Update `backend/routes/auth.js` to use SendGrid:**

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOTPEmail = async (email, otp) => {
  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'Hospital Management System - Login Verification Code',
    html: `...` // same HTML as before
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};
```

## Option 4: Development/Testing Mode (No Email)

For testing purposes, you can bypass email and log OTP to console:

### Update `backend/routes/auth.js`:

```javascript
const sendOTPEmail = async (email, otp) => {
  // In development, log OTP to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
    return true;
  }
  
  // Production email sending code here...
};
```

## Important Notes

### College Email Limitations

Most college/institutional emails (`@sjcem.edu.in`, `@college.edu`, etc.):
- ❌ Don't support SMTP authentication
- ❌ Have strict security policies
- ❌ Block external application access
- ❌ May not allow app passwords

**Solution:** Use a personal Gmail, Outlook, or a transactional email service.

### Security Best Practices

1. **Never commit `.env` file to Git**
   ```bash
   echo ".env" >> .gitignore
   ```

2. **Use strong, unique passwords** for email accounts

3. **Enable 2FA** on your email account

4. **Rotate API keys** regularly in production

5. **Monitor email sending limits** to avoid being flagged as spam

## Quick Fix for Your Current Setup

Based on your error, you're using:
- Email: `123prasad4009@sjcem.edu.in`
- Password: `seyq xfye lzkn ahgi` (appears to be an app password)

**The problem:** You can't use Gmail's SMTP with a non-Gmail address.

**Quick solution:**
1. Create a new Gmail account (or use an existing personal one)
2. Enable 2FA on that Gmail
3. Generate an App Password
4. Update your `.env`:

```env
EMAIL_USER=your-new-gmail@gmail.com
EMAIL_PASS=your-16-char-app-password
```

5. Restart the backend server

## Testing Your Configuration

After updating `.env`, test by:

1. **Start backend:**
```bash
cd backend
npm run dev
```

2. **Try logging in** with any valid credentials

3. **Check console** for OTP (if using development mode) or **check email inbox** (including spam folder)

4. **Enter OTP** in the 2FA screen

## Troubleshooting Checklist

- [ ] Using a personal Gmail account (not college email)
- [ ] 2FA enabled on Gmail account
- [ ] App password generated (not regular password)
- [ ] `.env` file updated with correct credentials
- [ ] Backend server restarted after `.env` changes
- [ ] Checked spam/junk folder for OTP email
- [ ] No typos in email address or password

## Need More Help?

If you're still having issues:

1. **Check backend console logs** for detailed error messages
2. **Verify email credentials** by logging into the email account directly
3. **Try a different email provider** (Outlook, Yahoo, etc.)
4. **Use a transactional email service** like SendGrid for production

---

**Remember:** The 2FA system is designed to work with any email, but the email provider must support SMTP authentication or you need to use an API-based service like SendGrid.