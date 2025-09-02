# Excel Analytics Platform 🚀

A unified full-stack web application for Excel data analytics with user authentication and password recovery.

## ✨ Features

- 🔐 **User Authentication**: Login/Signup with JWT tokens
- 📧 **Password Recovery**: OTP-based password reset via email  
- 🎨 **Modern UI**: Responsive design with consistent theming
- 🗄️ **MongoDB Integration**: Secure user data persistence
- 📨 **Email Service**: Automated OTP delivery
- 🛡️ **Security**: Password hashing, token expiration, input validation
- 🌐 **Unified Server**: Single port for both frontend and backend

## 🚀 Quick Start

### Prerequisites
- Node.js (>=16.0.0)
- MongoDB Atlas account
- Gmail account (for OTP emails)

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Configure environment variables:**
   Update the `.env` file in the root directory:
   ```env
   # Unified port configuration
   PORT=5000
   REACT_APP_API_URL=/api

   # Database
   MONGO_URI=your_mongodb_connection_string

   # Authentication  
   JWT_SECRET=your_jwt_secret_key

   # Email Service
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   PASSWORD=Ajha@2468
   ```

3. **Build and start the application:**
   ```bash
   npm run dev
   ```
   
   Or just start (if already built):
   ```bash
   npm start
   ```

4. **Access the application:**
   - **Everything on**: http://localhost:5000
   - **API endpoints**: http://localhost:5000/api/*

## 🎯 How It Works

The application runs on a **single unified server** that:
- Serves the React frontend as static files
- Handles API requests on `/api/*` routes  
- Eliminates CORS issues and port conflicts
- Simplifies deployment and development

## 📁 Project Structure

```
Excel-Analytics-Platform/
├── .env                          # Unified environment config
├── package.json                  # Root scripts
├── backend/
│   ├── index.js                 # Unified Express server
│   ├── models/User.js           # User schema
│   ├── routes/auth.js           # Authentication routes
│   └── utils/emailService.js    # Email utilities
└── frontend/
    ├── build/                   # Production React build
    ├── src/
    │   ├── components/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   ├── AuthPage.jsx
    │   │   └── SuccessDialog.jsx
    │   ├── api.js              # API utility functions
    │   └── App.jsx
    └── .env                    # Frontend environment
```

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/verify-otp` | Verify OTP code |
| POST | `/api/auth/reset-password` | Reset password with OTP |
| GET | `/api/test` | Health check |

## 🛠 Tech Stack

**Frontend:**
- React.js with modern hooks
- Custom CSS with CSS Variables
- Responsive design patterns

**Backend:**
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT authentication
- Nodemailer for emails
- bcryptjs for password security

**Unified Architecture:**
- Single server serves both frontend and API
- Production-ready React build
- Optimized static file serving

## 🔒 Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT token authentication with expiration
- ✅ OTP expiration (10 minutes)
- ✅ Input validation and sanitization
- ✅ Secure email templates
- ✅ Environment variable protection

## 📧 Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password":
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASS` (not your regular password)

## 🚀 Deployment

The unified architecture makes deployment simple:

1. **Build the frontend**: `npm run build`
2. **Set production environment variables**
3. **Deploy the backend folder** to your hosting service
4. **Single port deployment** - no need for separate frontend hosting

## 📝 Development Commands

```bash
# Install all dependencies
npm run install-all

# Build frontend for production  
npm run build

# Build and start unified server
npm run dev

# Start server (if already built)
npm start
```

## 🎨 UI Components

- **LoginPage**: User authentication with error handling
- **SignupPage**: User registration with validation
- **ForgotPasswordPage**: 3-step password recovery process
- **SuccessDialog**: Consistent success messaging
- **AuthPage**: Route management between auth states

## 📞 Support

- Check console logs for debugging
- Ensure all environment variables are configured
- Verify MongoDB connection string
- Test email configuration with valid Gmail app password

---

**Built with ❤️ using the MERN stack**
