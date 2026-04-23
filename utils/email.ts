import nodemailer from "nodemailer";
import path from "path";

const getTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export async function sendAdminNotification(lead: any, files: any[]) {
  const adminEmail = process.env.ADMIN_EMAIL || "abidtanha1@gmail.com";
  const transporter = getTransporter();

  const attachments = files.map(file => ({
    filename: file.fileName,
    path: path.join(process.cwd(), "public", file.fileUrl),
  }));

  const mailOptions = {
    from: `"Syed Services Notification" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `New Lead: ${lead.service} from ${lead.name}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #fbbf24;">New Lead Submission</h2>
        <p><strong>Tracking ID:</strong> ${lead.trackingId}</p>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${lead.phone}</p>
        <p><strong>Service:</strong> ${lead.service}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f9f9f9; padding: 10px; border-radius: 5px;">${lead.message || 'No message provided'}</p>
        <hr />
        <p><strong>Files Attached:</strong> ${files.length}</p>
      </div>
    `,
    attachments,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function sendCustomerNotification(lead: any) {
  if (!lead.email) return;

  const transporter = getTransporter();
  const mailOptions = {
    from: `"Syed Services" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: `Application Received - Tracking ID: ${lead.trackingId}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
        <h2 style="color: #fbbf24;">Application Received!</h2>
        <p>Dear ${lead.name},</p>
        <p>Thank you for choosing Syed Services. We have received your application for <strong>${lead.service}</strong>.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid #fcd34d;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">Your Tracking ID: ${lead.trackingId}</p>
        </div>
        <p>You can track your application status anytime using the link below:</p>
        <a href="https://syedservices.com.pk/track?id=${lead.trackingId}" style="display: inline-block; background: #fbbf24; color: black; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">Track Application</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">If you have any questions, reply to this email or contact us on WhatsApp at +92 309 9797771.</p>
      </div>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error("Customer Notification Error:", error);
  }
}

export async function sendStatusUpdateNotification(lead: any) {
  if (!lead.email) return;

  const transporter = getTransporter();
  const mailOptions = {
    from: `"Syed Services Updates" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: `Update: Application Status for ${lead.trackingId}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
        <h2 style="color: #fbbf24;">Application Status Update</h2>
        <p>Dear ${lead.name},</p>
        <p>There has been an update to your application status for <strong>${lead.service}</strong>.</p>
        <div style="background: #f0fdf4; padding: 15px; border-radius: 10px; margin: 20px 0; border: 1px solid #bbf7d0;">
          <p style="margin: 0; font-weight: bold; color: #166534;">New Status: ${lead.status}</p>
        </div>
        <p>Tracking ID: <strong>${lead.trackingId}</strong></p>
        <a href="https://syedservices.com.pk/track?id=${lead.trackingId}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 25px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">View Details</a>
        <p style="margin-top: 20px; color: #666; font-size: 12px;">Best regards,<br/>Syed Services Team</p>
      </div>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error("Status Update Notification Error:", error);
  }
}
