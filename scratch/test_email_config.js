
const nodemailer = require('nodemailer');
const fs = require('fs');

async function testEmail() {
  // Simple .env parser
  const env = fs.readFileSync('.env', 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const [key, ...val] = line.split('=');
      if (key && val) acc[key.trim()] = val.join('=').trim().replace(/^"(.*)"$/, '$1');
      return acc;
    }, {});

  console.log('Testing email configuration...');
  console.log('EMAIL_USER:', env.EMAIL_USER);
  console.log('EMAIL_HOST:', env.EMAIL_HOST);

  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(env.EMAIL_PORT || "587"),
    secure: env.EMAIL_SECURE === "true",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
  } catch (error) {
    console.error('❌ SMTP connection failed:', error.message);
  }
}

testEmail();
