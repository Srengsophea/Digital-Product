import nodemailer from "nodemailer";

export async function sendVerificationEmail({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}) {
  const smtpEmail = process.env.SMTP_EMAIL?.trim();
  const smtpPass = process.env.SMTP_APP_PASSWORD?.trim().replace(/\s+/g, "");

  // If SMTP is not yet configured, log to server console for testing
  if (!smtpEmail || !smtpPass) {
    console.log(`\n========================================`);
    console.log(`[DIGI VIP Email Verification Code]`);
    console.log(`To: ${to} (${name})`);
    console.log(`Code: ${code}`);
    console.log(`Note: Configure SMTP_EMAIL and SMTP_APP_PASSWORD in .env.local to send live emails.`);
    console.log(`========================================\n`);
    return { ok: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 587 ? false : true,
    auth: {
      user: smtpEmail,
      pass: smtpPass,
    },
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your DIGI VIP Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0719; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f0ff;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0719; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="540" style="max-width: 540px; background-color: #130e29; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 24px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 12px 24px; border-radius: 16px; box-shadow: 0 8px 24px rgba(124, 58, 237, 0.35);">
                <span style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">DIGI <span style="color: #67e8f9;">VIP</span></span>
              </div>
            </td>
          </tr>

          <!-- Welcome Title -->
          <tr>
            <td align="center" style="padding-bottom: 12px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">Verify your email address</h1>
            </td>
          </tr>

          <!-- Greeting & Description -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <p style="margin: 0; font-size: 15px; color: #a99fc6; line-height: 1.6;">
                Hi <strong style="color: #ffffff;">${name}</strong>,<br>
                Thank you for joining DIGI VIP. Use the 6-digit verification code below to complete your registration.
              </p>
            </td>
          </tr>

          <!-- OTP Code Box -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <div style="background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(6, 182, 212, 0.15)); border: 2px dashed #7c3aed; border-radius: 16px; padding: 18px 32px; display: inline-block;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #a78bfa;">
                  ${code}
                </span>
              </div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <p style="margin: 0; font-size: 13px; color: #fbbf24;">
                ⏳ This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #6d6488;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 20px;" align="center">
              <p style="margin: 0; font-size: 11px; color: #6d6488;">
                © ${new Date().getFullYear()} DIGI VIP Marketplace. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const info = await transporter.sendMail({
    from: `"DIGI VIP" <${smtpEmail}>`,
    to,
    subject: `${code} is your DIGI VIP verification code`,
    html,
  });

  return { ok: true, messageId: info.messageId };
}
