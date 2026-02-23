import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD,
            },
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try {
            const info = await this.transporter.sendMail({
                from: `"${process.env.MAIL_FROM_NAME || 'Cinema App'}" <${process.env.MAIL_USER}>`,
                to,
                subject,
                html,
            });
            console.log("Message sent: %s", info.messageId);
            return info;
        } catch (error) {
            console.error("Error sending email: ", error);
            throw error;
        }
    }

    async sendOTP(to: string, otp: string) {
        const subject = "Your OTP Verification Code";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e50914;">Cinema Verification</h2>
                <p>Hello,</p>
                <p>Your One-Time Password (OTP) for verification is:</p>
                <h1 style="background: #f4f4f4; padding: 10px; text-align: center; border-radius: 5px; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in ${process.env.OTP_EXPIRE_MINUTES || 5} minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,<br>Cinema Management Team</p>
            </div>
        `;
        return this.sendMail(to, subject, html);
    }

    async sendResetLink(to: string, link: string) {
        const subject = "Password Reset Request";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e50914;">Password Reset</h2>
                <p>Hello,</p>
                <p>You requested to reset your password. Please click the link below to reset it:</p>
                <a href="${link}" style="background: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p>This link is valid for 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <br>
                <p>Best Regards,<br>Cinema Management Team</p>
            </div>
        `;
        return this.sendMail(to, subject, html);
    }

    async sendWelcomeEmail(to: string, name: string) {
        const subject = "Welcome to Our Cinema!";
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #e50914;">Welcome to Cinema World! 🎉</h2>
                <p>Hello <strong>${name}</strong>,</p>
                <p>Thank you for registering with us! We are thrilled to have you as a member of our community.</p>
                <p>You can now book tickets for your favorite movies, order snacks, and enjoy a premium cinema experience.</p>
                <div style="margin: 20px 0;">
                    <a href="${process.env.CLIENT_URL || "http://localhost:3000"}" style="background: #e50914; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Movies</a>
                </div>
                <p>If you have any questions, feel free to reply to this email.</p>
                <br>
                <p>Enjoy the show! 🍿<br>The Cinema Management Team</p>
            </div>
        `;
        return this.sendMail(to, subject, html);
    }
}
