const nodemailer = require('nodemailer');

exports.sendEmail = async ({ to, subject, text, html, attachments }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    const mailOptions = {
      from: `"Multi-Vendor Marketplace" <no-reply@marketplace.com>`,
      to,
      subject,
      text,
      html,
    };

    if (attachments) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`📧 Email sent: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('❌ Email sending error:', err);
    return false;
  }
};
