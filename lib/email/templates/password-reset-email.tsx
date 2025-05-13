import React from 'react';

export interface PasswordResetEmailProps {
  resetLink: string;
  userName?: string;
}

export function PasswordResetEmail({ resetLink, userName }: PasswordResetEmailProps) {
  const greeting = userName ? `Hello ${userName},` : 'Hello,';

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    lineHeight: 1.5,
    color: '#333',
    maxWidth: '600px',
    margin: '0 auto',
  };

  const headingStyle: React.CSSProperties = {
    color: '#111',
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '20px',
  };

  const paragraphStyle: React.CSSProperties = {
    marginBottom: '16px',
  };

  const buttonStyle: React.CSSProperties = {
    display: 'inline-block',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontWeight: 500,
    margin: '20px 0',
  };

  const expiryStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic',
  };

  const footerStyle: React.CSSProperties = {
    marginTop: '30px',
    fontSize: '14px',
    color: '#666',
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Reset Your Password</title>
      </head>
      <body>
        <div style={containerStyle}>
          <h1 style={headingStyle}>Reset Your Password</h1>
          <p style={paragraphStyle}>{greeting}</p>
          <p style={paragraphStyle}>
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <p>
            <a href={resetLink} style={buttonStyle}>Reset Password</a>
          </p>
          <p style={expiryStyle}>This link will expire in 1 hour.</p>
          <p style={paragraphStyle}>If you didn't request a password reset, you can safely ignore this email.</p>
          <div style={footerStyle}>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{resetLink}</p>
          </div>
        </div>
      </body>
    </html>
  );
}