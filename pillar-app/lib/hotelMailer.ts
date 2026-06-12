import nodemailer from "nodemailer";
import { sendSms } from "@/lib/twilio";

function createTransporter() {
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;
  if (!user || !pass) throw new Error("Email service not configured");
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.zoho.com", port: 465, secure: true,
      auth: { user, pass },
      connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000,
    }),
    user,
  };
}

export async function sendHotelWorkOrderEmail(
  to: string,
  hotelName: string,
  roomNumber: string,
  categoryName: string,
  description: string | null,
): Promise<void> {
  const { transporter, user } = createTransporter();
  await transporter.sendMail({
    from: `"Pillar Work Orders" <${user}>`,
    to,
    subject: `New Work Order: Room ${roomNumber} — ${hotelName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <p style="margin:0 0 4px;font-size:12px;color:#888">Pillar Work Order</p>
        <h2 style="margin:0 0 20px;font-size:20px;font-weight:400;color:#1e293b">Room ${roomNumber} — ${hotelName}</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:120px">Hotel</td><td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${hotelName}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Room</td><td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:600">${roomNumber}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Category</td><td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${categoryName}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Submitted</td><td style="padding:6px 0;font-size:13px;color:#1e293b">${new Date().toLocaleString()}</td></tr>
        </table>
        ${description ? `<div style="margin-top:16px;padding:12px 16px;background:#f8fafc;border-radius:8px;font-size:13px;color:#334155">${description.replace(/\n/g, "<br />")}</div>` : ""}
      </div>
    `,
  });
}

export async function sendHotelWorkOrderSms(
  to: string,
  hotelName: string,
  roomNumber: string,
  categoryName: string,
): Promise<void> {
  await sendSms(to, `Pillar: Work order — Room ${roomNumber} (${categoryName}) at ${hotelName}. Log in to review.`);
}

export async function sendHotelLateCheckoutEmail(
  to: string,
  hotelName: string,
  roomNumber: string,
): Promise<void> {
  const { transporter, user } = createTransporter();
  await transporter.sendMail({
    from: `"Pillar" <${user}>`,
    to,
    subject: `Late Checkout Request — Room ${roomNumber} — ${hotelName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <p style="margin:0 0 4px;font-size:12px;color:#888">Pillar Late Checkout</p>
        <h2 style="margin:0 0 20px;font-size:20px;font-weight:400;color:#1e293b">Room ${roomNumber} requests late checkout</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b;width:120px">Hotel</td><td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:500">${hotelName}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Room</td><td style="padding:6px 0;font-size:13px;color:#1e293b;font-weight:600">${roomNumber}</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#64748b">Submitted</td><td style="padding:6px 0;font-size:13px;color:#1e293b">${new Date().toLocaleString()}</td></tr>
        </table>
        <p style="margin-top:16px;font-size:13px;color:#64748b">Log in to approve or deny this request.</p>
      </div>
    `,
  });
}

export async function sendHotelLateCheckoutSms(
  to: string,
  hotelName: string,
  roomNumber: string,
): Promise<void> {
  await sendSms(to, `Pillar: Room ${roomNumber} requests late checkout at ${hotelName}. Log in to approve or deny.`);
}
