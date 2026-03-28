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

export async function sendWelcomeEmail(to: string, name?: string) {
  const displayName = name || 'there';

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `AiBlog <${process.env.SMTP_USER}>`,
    to,
    subject: 'Welcome to AiBlog Newsletter!',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #e0e0e0; background: #121212;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0;">AiBlog</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #888; margin-top: 4px;">Editorial Intelligence</p>
        </div>
        <h2 style="font-size: 22px; color: #ffffff; margin-bottom: 16px;">Hey ${displayName} 👋</h2>
        <p style="font-size: 15px; line-height: 1.7; color: #b0b0b0;">
          Welcome to the AiBlog newsletter! You're now part of a community of creators, engineers, and thought leaders shaping the future of AI-powered content.
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #b0b0b0;">Here's what you'll get:</p>
        <ul style="font-size: 14px; line-height: 2; color: #b0b0b0; padding-left: 20px;">
          <li>Weekly curated AI & editorial insights</li>
          <li>Career growth tips for content creators</li>
          <li>Early access to new platform features</li>
        </ul>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}/community"
             style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px;">
            Explore the Community
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #333; margin: 32px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">
          You're receiving this because you subscribed at AiBlog. <br />
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3004'}" style="color: #6366f1;">Unsubscribe</a>
        </p>
      </div>
    `,
  });
}

export { transporter };
