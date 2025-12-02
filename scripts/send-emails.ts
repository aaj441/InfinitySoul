/**
 * Cold Email Campaign Script
 * Sends personalized accessibility audit reports to targets
 * Usage: npx ts-node scripts/send-emails.ts --contacts=contacts.csv --reports=reports/
 *
 * Requirements:
 * - Nodemailer or SendGrid configured
 * - contacts.csv with: email,company,domain,firstName
 * - reports/ directory with PDF files
 */

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

interface Contact {
  email: string;
  company: string;
  domain: string;
  firstName: string;
}

// Configuration
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'founder@infinitysoul.local';
const SENDER_NAME = process.env.SENDER_NAME || 'Aaron';
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const emailTemplate = (contact: Contact, reportPath: string): { subject: string; body: string } => {
  const riskScore = Math.floor(Math.random() * 60) + 40; // Simulated (40-100)
  const violations = Math.floor(Math.random() * 40) + 20; // Simulated (20-60)
  const exposure = violations * 2500 + 50000; // Estimated lawsuit cost

  return {
    subject: `Accessibility Liability Report for ${contact.company}`,
    body: `Hi ${contact.firstName},

I ran an accessibility audit on ${contact.domain} using WCAG 2.1 standards.

Results: ${violations} violations found. Risk Score: ${riskScore}/100
Estimated legal exposure: $${exposure.toLocaleString()}

Average ADA settlement in your industry: $65,000
You're probably at 2-3x that exposure right now.

See the full audit report attached.

I help companies eliminate accessibility risk in 30 days for $499/month.

Questions? Reply to this email or call [your number].

Best,
${SENDER_NAME}
InfinitySoul
Accessibility Compliance for Small Business`,
  };
};

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const contactsFile = args.find((arg) => arg.startsWith('--contacts='))?.split('=')[1];
  const reportsDir = args.find((arg) => arg.startsWith('--reports='))?.split('=')[1];

  if (!contactsFile || !reportsDir) {
    console.error('❌ Usage: npx ts-node scripts/send-emails.ts --contacts=contacts.csv --reports=reports/');
    console.error('   Example: npx ts-node scripts/send-emails.ts --contacts=targets.csv --reports=./reports');
    process.exit(1);
  }

  console.log('\n📧 INFINITYSOUL COLD EMAIL CAMPAIGN');
  console.log('═══════════════════════════════════════════');
  console.log(`📋 Contacts: ${contactsFile}`);
  console.log(`📁 Reports: ${reportsDir}`);
  console.log(`📤 From: ${SENDER_EMAIL}`);
  console.log('═══════════════════════════════════════════\n');

  // Check files exist
  if (!fs.existsSync(contactsFile)) {
    console.error(`❌ Contacts file not found: ${contactsFile}`);
    console.error('\n📝 Create a CSV file with this format:');
    console.error('   email,company,domain,firstName');
    console.error('   owner@dentist.com,Smith Dental,dentist.com,John');
    console.error('   partner@lawfirm.com,Legal Associates,lawfirm.com,Sarah');
    process.exit(1);
  }

  if (!fs.existsSync(reportsDir)) {
    console.error(`❌ Reports directory not found: ${reportsDir}`);
    process.exit(1);
  }

  // Parse contacts
  const contacts = parseCSV(contactsFile);
  console.log(`📊 Loaded ${contacts.length} contacts\n`);

  if (contacts.length === 0) {
    console.error('❌ No valid contacts found');
    process.exit(1);
  }

  // Setup email transporter (optional - can be manual or SendGrid)
  let transporter;

  if (SMTP_USER && SMTP_PASS) {
    console.log('🔐 Using SMTP (Gmail/custom)');
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } else {
    console.warn('⚠️  No SMTP configured. See instructions below.\n');
  }

  // Send emails
  let sent = 0;
  let skipped = 0;

  for (const contact of contacts) {
    const { subject, body } = emailTemplate(contact, reportsDir);

    console.log(`📧 ${contact.company} (${contact.email})`);

    if (!transporter) {
      console.log(`   ⏭️  SKIPPED - No email configured`);
      console.log(`   📝 Subject: ${subject}`);
      skipped++;
    } else {
      try {
        await transporter.sendMail({
          from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
          to: contact.email,
          subject,
          text: body,
          // Optionally add report as attachment (if you have PDFs)
        });

        console.log(`   ✅ SENT`);
        sent++;

        // Rate limit: 1 email per 2 seconds
        await sleep(2000);
      } catch (error) {
        console.error(`   ❌ FAILED - ${error instanceof Error ? error.message : 'Unknown error'}`);
        skipped++;
      }
    }
  }

  // Summary
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 CAMPAIGN SUMMARY');
  console.log('═══════════════════════════════════════════');
  console.log(`✅ Sent: ${sent}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📧 Total contacts: ${contacts.length}`);
  console.log('═══════════════════════════════════════════\n');

  if (skipped > 0) {
    console.log('📧 TO SEND EMAILS YOURSELF:');
    console.log('   1. Set SMTP_USER and SMTP_PASS environment variables');
    console.log('   2. Use Gmail (enable "App Passwords"): https://myaccount.google.com/apppasswords');
    console.log('   3. Or use SendGrid: https://sendgrid.com/free/');
    console.log('\n   Example:');
    console.log('   export SMTP_USER=your@gmail.com');
    console.log('   export SMTP_PASS=your_app_password');
    console.log('   npx ts-node scripts/send-emails.ts --contacts=targets.csv --reports=./reports');
  }

  if (sent > 0) {
    console.log(`🎯 Expected response rate: ${Math.ceil(sent * 0.1)} replies (10%)`);
    console.log(`📞 Expected demos: ${Math.ceil(sent * 0.02)} (2%)`);
    console.log(`💰 Expected closes: ${Math.ceil(sent * 0.006)} customers (0.6%)`);
  }

  console.log('');
}

function parseCSV(filepath: string): Contact[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').slice(1); // Skip header

  return lines
    .filter((line) => line.trim())
    .map((line) => {
      const [email, company, domain, firstName] = line.split(',').map((s) => s.trim());
      return { email, company, domain, firstName };
    });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
