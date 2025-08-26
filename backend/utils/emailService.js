const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // You can change this to your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });
};

// Generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured in environment variables');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Excel Analytics Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #14213D; padding: 20px; text-align: center;">
            <h1 style="color: #FCA311; margin: 0;">Excel Analytics Platform</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #14213D;">Password Reset Request</h2>
            <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
            <div style="background: #FCA311; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; border-radius: 8px;">
              ${otp}
            </div>
            <p><strong>This OTP will expire in 10 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">
              This email was sent by Excel Analytics Platform. Do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email to new users
const sendWelcomeEmail = async (email, username) => {
  try {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured in environment variables');
      return { success: false, error: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Welcome to Excel Analytics Platform - Your Journey Begins!',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Excel Analytics Platform</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5;">
            <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header Section -->
                <div style="background: linear-gradient(135deg, #14213D 0%, #1a2951 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
                    <!-- Background Graphics -->
                    <div style="position: absolute; top: -50px; left: -50px; width: 100px; height: 100px; background: rgba(252, 163, 17, 0.1); border-radius: 50%; transform: rotate(45deg);"></div>
                    <div style="position: absolute; bottom: -30px; right: -30px; width: 80px; height: 80px; background: rgba(252, 163, 17, 0.15); border-radius: 50%;"></div>
                    
                    <!-- Logo Section -->
                    <div style="background: rgba(252, 163, 17, 0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 3px solid #FCA311;">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect x="6" y="8" width="28" height="24" rx="3" fill="#FCA311" opacity="0.3"/>
                            <rect x="8" y="12" width="10" height="8" rx="2" fill="#FCA311"/>
                            <rect x="20" y="12" width="12" height="3" rx="1.5" fill="#FCA311"/>
                            <rect x="20" y="17" width="12" height="3" rx="1.5" fill="#FCA311"/>
                            <rect x="8" y="22" width="24" height="2" rx="1" fill="#FCA311" opacity="0.6"/>
                            <rect x="8" y="26" width="18" height="2" rx="1" fill="#FCA311" opacity="0.4"/>
                        </svg>
                    </div>
                    
                    <h1 style="color: #FCA311; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Excel Analytics Platform</h1>
                    <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">Transform your data into insights</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 50px 40px;">
                    <!-- Welcome Message -->
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h2 style="color: #14213D; font-size: 28px; margin: 0 0 15px 0; font-weight: 600;">Welcome aboard, ${username}! 🚀</h2>
                        <p style="color: #666; font-size: 18px; line-height: 1.6; margin: 0;">We're thrilled to have you join our community of data enthusiasts and analysts.</p>
                    </div>

                    <!-- Features Section -->
                    <div style="background: linear-gradient(45deg, #f8f9fa, #e9ecef); padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #FCA311;">
                        <h3 style="color: #14213D; font-size: 20px; margin: 0 0 20px 0; display: flex; align-items: center;">
                            <span style="background: #FCA311; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px;">✨</span>
                            What you can do now:
                        </h3>
                        <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li><strong>Upload Excel files</strong> and get instant insights</li>
                            <li><strong>Create interactive dashboards</strong> with beautiful visualizations</li>
                            <li><strong>Analyze trends</strong> and patterns in your data</li>
                            <li><strong>Export reports</strong> and share with your team</li>
                            <li><strong>Real-time collaboration</strong> with colleagues</li>
                        </ul>
                    </div>

                    <!-- Call to Action -->
                    <div style="text-align: center; margin: 40px 0;">
                        <div style="background: linear-gradient(135deg, #FCA311, #e8920f); padding: 20px; border-radius: 12px; color: white;">
                            <h3 style="margin: 0 0 15px 0; font-size: 20px;">Ready to start analyzing?</h3>
                            <p style="margin: 0 0 20px 0; opacity: 0.9;">Log in to your account and upload your first Excel file to begin your data journey!</p>
                            <a href="${process.env.CLIENT_URL || 'http://localhost:5000'}" style="display: inline-block; background: white; color: #FCA311; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px; transition: all 0.3s ease;">
                                Get Started Now →
                            </a>
                        </div>
                    </div>

                    <!-- Tips Section -->
                    <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; border: 1px solid #e9ecef;">
                        <h4 style="color: #14213D; margin: 0 0 15px 0; display: flex; align-items: center;">
                            <span style="color: #FCA311; margin-right: 10px; font-size: 18px;">💡</span>
                            Pro Tips for Getting Started:
                        </h4>
                        <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                            <li>Start with clean, well-organized Excel files for best results</li>
                            <li>Use the dashboard templates to quickly create stunning visualizations</li>
                            <li>Explore our tutorial section for advanced analytics features</li>
                        </ul>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #14213D; padding: 30px; text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #FCA311; margin: 0 0 10px 0;">Need Help?</h4>
                        <p style="color: #ffffff; margin: 0; opacity: 0.8;">Our support team is here to help you succeed.</p>
                    </div>
                    
                    <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 20px;">
                        <p style="color: #ffffff; margin: 0; font-size: 14px; opacity: 0.7;">
                            This email was sent to <strong>${email}</strong><br>
                            © 2025 Excel Analytics Platform. All rights reserved.
                        </p>
                        <p style="color: #FCA311; margin: 10px 0 0 0; font-size: 12px;">
                            🔒 Your data security and privacy are our top priorities
                        </p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Welcome email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
};
