// =============================================
// Mail Service — Sends Password Reset Emails
// =============================================

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Set up Gmail connection using credentials from .env
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  // -----------------------------------------------
  // Send password reset link to user's email
  // -----------------------------------------------
  async sendPasswordResetEmail(
    toEmail: string,
    userName: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink   = `${frontendUrl}/reset-password?token=${resetToken}`;

    await this.transporter.sendMail({
      from:    this.configService.get<string>('MAIL_FROM'),
      to:      toEmail,
      subject: 'Finance Division — Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
            
            <!-- Header -->
            <div style="background-color: #1a6b3a; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px;">
                Government of Pakistan
              </h1>
              <p style="color: #a8d5b5; margin: 4px 0 0 0; font-size: 14px;">
                Finance Division — Complaint Portal
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <h2 style="color: #1a6b3a; margin-top: 0;">Reset Your Password</h2>
              <p style="color: #555; font-size: 15px;">Dear <strong>${userName}</strong>,</p>
              <p style="color: #555; font-size: 15px;">
                We received a request to reset your password for the Finance Division Complaint Portal.
                Click the button below to set a new password.
              </p>

              <!-- Reset Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetLink}"
                   style="background-color: #1a6b3a; color: #ffffff; padding: 14px 32px;
                          text-decoration: none; border-radius: 6px; font-size: 16px;
                          font-weight: bold; display: inline-block;">
                  Reset My Password
                </a>
              </div>

              <p style="color: #888; font-size: 13px;">
                ⚠️ This link will expire in <strong>15 minutes</strong>.
              </p>
              <p style="color: #888; font-size: 13px;">
                If you did not request a password reset, please ignore this email.
                Your account remains secure.
              </p>

              <!-- Fallback link -->
              <p style="color: #aaa; font-size: 12px; margin-top: 24px;">
                If the button does not work, copy and paste this link into your browser:<br/>
                <a href="${resetLink}" style="color: #1a6b3a;">${resetLink}</a>
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f5f5f5; padding: 16px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #aaa; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Finance Division, Government of Pakistan. All rights reserved.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });
  }
}
