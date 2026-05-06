const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App Password for Gmail
      }
    });
  }

  async sendOTP(email, otp) {
    const mailOptions = {
      from: `"HeroAi Content Factory" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'HeroAi - Secure Access Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 20px; background: #050509; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00D4FF; margin: 0; font-size: 32px;">HeroAi</h1>
            <p style="color: #A0A0C4; font-size: 14px;">Your AI Content Command Center</p>
          </div>
          <div style="background: #0C0C18; padding: 30px; border-radius: 16px; text-align: center; border: 1px solid #141428;">
            <p style="font-size: 14px; color: #A0A0C4; margin-bottom: 10px;">Enter this code to verify your access:</p>
            <h2 style="font-size: 48px; font-weight: 800; color: #00D4FF; letter-spacing: 10px; margin: 0;">${otp}</h2>
          </div>
          <p style="font-size: 12px; color: #5A5A80; text-align: center; margin-top: 30px;">
            This code expires in 10 minutes. If you did not request this, please ignore this email.
          </p>
          <hr style="border: 0; border-top: 1px solid #141428; margin: 30px 0;">
          <p style="font-size: 10px; color: #5A5A80; text-align: center;">
            &copy; 2026 HeroAi Growth Studio. All rights reserved.
          </p>
        </div>
      `
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Mail Error:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email, name) {
    const mailOptions = {
      from: `"HeroAi Content Factory" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to the Future of Content!',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: auto; padding: 30px; background: #050509; color: #ffffff; border-radius: 20px; border: 1px solid #141428;">
          <h1 style="color: #00D4FF;">Welcome, ${name}!</h1>
          <p style="color: #A0A0C4; font-size: 16px;">Your account has been successfully created. You are now part of the most advanced AI content factory in the world.</p>
          <div style="margin-top: 20px; padding: 20px; background: #0C0C18; border-radius: 12px;">
            <p style="margin: 0; color: #7000FF; font-weight: 700;">What's next?</p>
            <ul style="color: #A0A0C4; font-size: 14px; margin-top: 10px;">
              <li>Complete your profile setup</li>
              <li>Link your social channels</li>
              <li>Launch your first autonomous AI campaign</li>
            </ul>
          </div>
          <p style="font-size: 12px; color: #5A5A80; margin-top: 30px;">Let's architect your empire together.</p>
        </div>
      `
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Welcome Mail Error:', error);
      return false;
    }
  }
}

module.exports = new MailService();
