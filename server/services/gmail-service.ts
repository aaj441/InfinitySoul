import { google } from 'googleapis';

async function getAccessToken() {
  // Always fetch fresh token to avoid expiration issues
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Send an email via Gmail API
 */
export async function sendGmailEmail(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}) {
  const gmail = await getUncachableGmailClient();

  // Build email message
  const messageParts = [
    `From: ${params.from || 'WCAG AI Platform <noreply@wcag.ai>'}`,
    `To: ${params.to}`,
    `Subject: ${params.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    params.html
  ];

  const message = messageParts.join('\n');
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const result = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });

  return {
    messageId: result.data.id,
    success: true,
  };
}

/**
 * Send test email (for debugging)
 */
export async function sendTestEmail(to: string, testNumber: number) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .footer { margin-top: 20px; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Test Email #${testNumber}</h1>
            <p>WCAG AI Platform - Gmail Integration Test</p>
          </div>
          <div class="content">
            <p><strong>Status:</strong> <span class="badge">Connected</span></p>
            <p>This is test email #${testNumber} of 10.</p>
            <p>Gmail integration is working perfectly!</p>
            <p><strong>Features tested:</strong></p>
            <ul>
              <li>OAuth authentication</li>
              <li>HTML email rendering</li>
              <li>Vibrant color palette</li>
              <li>Professional formatting</li>
            </ul>
          </div>
          <div class="footer">
            <p>Sent via WCAG AI Platform</p>
            <p>Test run: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendGmailEmail({
    to,
    subject: `WCAG Test Email #${testNumber} - Gmail Integration`,
    html,
    text: `Test email #${testNumber} - Gmail integration working!`,
  });
}
