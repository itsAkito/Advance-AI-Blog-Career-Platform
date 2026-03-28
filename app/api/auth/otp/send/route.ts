import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
  },
});

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    const supabase = await createClient();

    // Store OTP in database (upsert so resending replaces old OTP)
    const { error: dbError } = await supabase
      .from('otp_codes')
      .upsert(
        [{ email, code: otp, expires_at: expiresAt, verified: false }],
        { onConflict: 'email' }
      );

    if (dbError) {
      console.error('OTP store error:', dbError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Your AiBlog Login Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px; background: #121212; color: #e0e0e0;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 800; color: #fff; margin: 0;">AiBlog</h1>
          </div>
          <p style="font-size: 15px; color: #b0b0b0; margin-bottom: 24px;">Your one-time login code is:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fff; background: #1e1e1e; padding: 16px 32px; border-radius: 12px; border: 1px solid #333;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 13px; color: #888; text-align: center;">This code expires in 10 minutes. Do not share it.</p>
          <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
          <p style="font-size: 11px; color: #666; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
