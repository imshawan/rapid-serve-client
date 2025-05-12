export function getPasswordResetEmailTemplate(options: {
  resetLink: string;
  userName?: string;
}): { html: string; text: string } {
  const { resetLink, userName } = options;
  const greeting = userName ? `Hello ${userName},` : 'Hello,';

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.5;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            padding: 30px;
          }
          h1 {
            color: #111;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 16px;
          }
          .button {
            display: inline-block;
            background-color: #000;
            color: #fff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #666;
          }
          .expiry {
            font-size: 14px;
            color: #666;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Reset Your Password</h1>
          <p>${greeting}</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p>
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p class="expiry">This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <div class="footer">
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetLink}</p>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `
      Reset Your Password
      
      ${greeting}
      
      We received a request to reset your password. Please go to the following link to create a new password:
      
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
    `;

  return { html, text };
}