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
  const adminEmail = process.env.ADMIN_EMAIL || "info@syedservices.com.pk";
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

export async function sendStatusUpdateNotification(lead: any, attachment?: { buffer: Buffer, filename: string }, attachmentUrl?: string) {
  if (!lead.email) return;

  const transporter = getTransporter();
  const mailOptions: any = {
    from: `"Syed Services Updates" <${process.env.EMAIL_USER}>`,
    to: lead.email,
    subject: `Update: Application Status for ${lead.trackingId}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
            <div style="display: inline-block; width: 50px; height: 50px; background-color: #facc15; border-radius: 12px; line-height: 50px; color: #000000; font-weight: bold; font-size: 24px; margin-bottom: 10px;">S</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">Syed Services</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px;">Premier Visa & Travel Solutions</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 22px; font-weight: bold;">Application Status Update</h2>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
              Dear <strong>${lead.name}</strong>,<br><br>
              We are writing to inform you that there has been an update to your application status for <strong>${lead.service}</strong>.
            </p>

            ${lead.status === 'Completed' ? `
            <!-- Premium Success Section -->
            <div style="background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); border: 1px solid #facc15; padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 30px;">
              <div style="width: 40px; height: 40px; background-color: #facc15; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; color: #000000; font-size: 20px; line-height: 40px; font-weight: bold;">✓</div>
              <h3 style="color: #713f12; margin: 0 0 10px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Success! Application Approved</h3>
              <p style="color: #854d0e; font-size: 14px; line-height: 1.6; margin: 0;">
                <strong>Thank you for choosing Syed Services.</strong> It has been a privilege to assist you. Your official documents have been processed and are attached to this email.
              </p>
              <div style="margin-top: 20px; padding: 10px; background: rgba(250, 204, 21, 0.2); border-radius: 8px; display: inline-block;">
                <p style="margin: 0; color: #713f12; font-size: 12px; font-weight: bold;">📎 Please download the attached PDF Exit Permit.</p>
              </div>
              
              ${attachmentUrl ? `
              <div style="margin-top: 25px;">
                <a href="${attachmentUrl}" style="display: inline-block; background-color: #facc15; color: #000000; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; border: 1px solid #eab308; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  ⬇️ Download Official Exit Permit
                </a>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div style="background-color: #fefce8; border-left: 4px solid #facc15; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <p style="margin: 0; color: #713f12; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Current Status</p>
              <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 24px; font-weight: 800;">${lead.status}</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 35px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #64748b; font-size: 13px;">Tracking ID:</td>
                  <td style="color: #1e293b; font-size: 13px; font-weight: bold; text-align: right; font-family: monospace;">${lead.trackingId}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; font-size: 13px; padding-top: 8px;">Date Updated:</td>
                  <td style="color: #1e293b; font-size: 13px; font-weight: bold; text-align: right; padding-top: 8px;">${new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center;">
              <a href="https://syedservices.com.pk/track?id=${lead.trackingId}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease;">
                Track Application Status
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 15px 0;">
              Need help? Contact our support team directly.
            </p>
            <div style="display: inline-block; margin: 0 10px;">
              <p style="margin: 0; color: #1e293b; font-size: 12px; font-weight: bold;">WhatsApp</p>
              <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">+92 309 9797771</p>
            </div>
            <div style="display: inline-block; margin: 0 10px; border-left: 1px solid #e2e8f0; padding-left: 20px;">
              <p style="margin: 0; color: #1e293b; font-size: 12px; font-weight: bold;">Email</p>
              <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">info@syedservices.com.pk</p>
            </div>
            <p style="color: #94a3b8; font-size: 11px; margin-top: 25px;">
              © 2026 Syed Services Pakistan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  if (attachment) {
    mailOptions.attachments = [
      {
        filename: attachment.filename,
        content: attachment.buffer,
      }
    ];
  }

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error("Status Update Notification Error:", error);
  }
}

export async function sendApplicationStatusUpdateEmail(
  application: any,
  newStatus: string,
  notes?: string
) {
  const clientEmail = application.client?.user?.email;
  if (!clientEmail) return;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const trackingId = application.trackingId;
  const applicantName = application.client?.user?.name || "Client";
  const agentName = application.agent?.user?.name || "";
  const agentEmail = application.agent?.user?.email || "";

  const statusFormatted = newStatus.replace(/_/g, " ");

  const notesHtml = notes
    ? `<div style="margin-bottom: 30px;">
         <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Details/Notes:</p>
         <div style="background-color: #f1f5f9; padding: 15px 20px; border-radius: 12px; color: #1e293b; font-size: 14px; line-height: 1.6;">
           ${notes}
         </div>
       </div>`
    : "";

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
          <div style="display: inline-block; width: 50px; height: 50px; background-color: #facc15; border-radius: 12px; line-height: 50px; color: #000000; font-weight: bold; font-size: 24px; margin-bottom: 10px;">S</div>
          <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 1px; text-transform: uppercase;">Syed Services</h1>
          <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 12px;">Visa File & Application Status Update</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 22px; font-weight: bold;">Visa File Status Changed</h2>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
            Dear <strong>${applicantName}</strong>,
          </p>
          <p style="color: #475569; line-height: 1.6; margin-bottom: 25px;">
            There has been a status change on your visa file for <strong>${application.country} - ${application.visaCategory}</strong>.
          </p>

          <div style="background-color: #fefce8; border-left: 4px solid #facc15; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #713f12; font-size: 14px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">New Status</p>
            <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 24px; font-weight: 800;">${statusFormatted}</p>
          </div>

          ${notesHtml}

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 35px; border: 1px solid #f1f5f9;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: #64748b; font-size: 13px;">Tracking ID:</td>
                <td style="color: #1e293b; font-size: 13px; font-weight: bold; text-align: right; font-family: monospace;">${trackingId}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 13px; padding-top: 8px;">Date Updated:</td>
                <td style="color: #1e293b; font-size: 13px; font-weight: bold; text-align: right; padding-top: 8px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center;">
            <a href="http://localhost:3000/portal/login" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Log In to Portal to View Details
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 13px; margin: 0 0 15px 0;">
            Need help? Contact our support team directly.
          </p>
          <div style="display: inline-block; margin: 0 10px;">
            <p style="margin: 0; color: #1e293b; font-size: 12px; font-weight: bold;">WhatsApp</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">+92 309 9797771</p>
          </div>
          <div style="display: inline-block; margin: 0 10px; border-left: 1px solid #e2e8f0; padding-left: 20px;">
            <p style="margin: 0; color: #1e293b; font-size: 12px; font-weight: bold;">Email</p>
            <p style="margin: 2px 0 0 0; color: #64748b; font-size: 11px;">info@syedservices.com.pk</p>
          </div>
          <p style="color: #94a3b8; font-size: 11px; margin-top: 25px;">
            © 2026 Syed Services Pakistan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"Syed Services Updates" <${process.env.EMAIL_USER}>`,
        to: clientEmail,
        subject: `Update: Visa File Status for ${trackingId} (${statusFormatted})`,
        html,
      });
    }
  } catch (error) {
    console.error("Client email notification error:", error);
  }

  if (agentEmail) {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"Syed Services Updates" <${process.env.EMAIL_USER}>`,
to: agentEmail,
          subject: `Agent Notice: Visa File Status for ${trackingId} (${statusFormatted})`,
          html: html.replace(`Dear <strong>${applicantName}</strong>`, `Dear Agent <strong>${agentName}</strong> (Client: ${applicantName})`),
        });
      }
    } catch (error) {
      console.error("Agent email notification error:", error);
    }
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Syed Services Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Portal Password",
    html: `
      <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; max-width: 500px; margin: auto;">
        <h2 style="color: #fbbf24; margin-bottom: 5px;">Syed Services</h2>
        <p style="color: #64748b; font-size: 14px; margin-top: 0;">Portal Support</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="font-size: 15px; color: #1e293b; line-height: 1.5;">You requested to reset your portal password. Please use the following 6-digit verification code to proceed:</p>
        <div style="background: #f8fafc; border: 1px dashed #cbd5e1; padding: 15px; border-radius: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #0f172a; margin: 25px 0;">
          ${code}
        </div>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">This verification code is valid for 15 minutes. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[EMAIL DEV MODE] Password reset code for ${email}: ${code}`);
    }
  } catch (error) {
    console.error("Password reset email send error:", error);
  }
}

export async function sendWelcomeEmail(email: string, name: string, role: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Syed Services Welcome" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Syed Services Portal!",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; padding: 35px; background: #0f172a; color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h2 style="color: #fbbf24; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Welcome to Syed Services</h2>
          <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Your Premium Visa & Ticket Portal</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 20px 0;" />
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Dear <strong>${name}</strong>,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Thank you for registering on our platform! We are thrilled to welcome you as a registered <strong>${role === "AGENT" ? "Travel Agent" : "Client"}</strong>.</p>
        <div style="background: #020617; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; margin: 25px 0;">
          <h4 style="color: #fbbf24; margin: 0 0 10px 0; font-size: 14px; font-weight: 800; text-transform: uppercase; tracking-wider;">Account Details</h4>
          <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Registered Email:</strong> ${email}</p>
          <p style="margin: 5px 0; font-size: 13px; color: #94a3b8;"><strong>Account Type:</strong> ${role === "AGENT" ? "Travel Agency Partner" : "Direct Client"}</p>
        </div>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">You can now log in to submit application files, track application status in real-time, upload documents, make payments, and chat directly with our support team.</p>
        <div style="text-align: center; margin: 30px 0 15px 0;">
          <a href="https://syedservices.com.pk/portal/login" style="background: #fbbf24; color: #020617; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; font-size: 14px; display: inline-block;">Log In to Portal</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 25px 0;" />
        <p style="font-size: 11px; text-align: center; color: #64748b; line-height: 1.5; margin: 0;">This email was sent automatically by Syed Services. If you did not create an account, please contact our support team at info@syedservices.com.pk.</p>
      </div>
    `,
  };

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.log(`[EMAIL DEV MODE] Welcome email sent to ${email}`);
    }
  } catch (error) {
    console.error("Welcome email send error:", error);
  }
}
