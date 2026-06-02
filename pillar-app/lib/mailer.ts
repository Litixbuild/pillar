import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;
  if (!user || !pass) throw new Error("Email service not configured");
  return { transporter: nodemailer.createTransport({ host: "smtp.zoho.com", port: 465, secure: true, auth: { user, pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 10000 }), user };
}

export async function sendOtpEmail(to: string, name: string | undefined, code: string) {
  const { transporter, user } = createTransporter();
  await transporter.sendMail({
    from: `"Pillar" <${user}>`,
    to,
    subject: `Your Pillar verification code: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px">
        <p style="margin:0 0 8px;font-size:13px;color:#888">Pillar Security</p>
        <h2 style="margin:0 0 24px;font-size:22px;font-weight:400;color:#1e293b">
          Your verification code
        </h2>
        <div style="font-size:36px;font-weight:700;letter-spacing:12px;color:#1e293b;margin:0 0 24px">
          ${code}
        </div>
        <p style="margin:0 0 8px;font-size:14px;color:#64748b">
          ${name ? `Hi ${name}, enter` : "Enter"} this code on the Pillar login screen.
          It expires in <strong>15 minutes</strong>.
        </p>
        <p style="margin:0;font-size:13px;color:#94a3b8">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendWorkOrderEmail(
  to: string,
  slug: string,
  categoryName: string,
  description: string | null,
  otherMessage: string | null,
) {
  const { transporter, user } = createTransporter();
  await transporter.sendMail({
    from: `"Pillar Work Orders" <${user}>`,
    to,
    subject: `New Work Order: ${categoryName} — ${slug}`,
    html: `
      <p><strong>Property:</strong> ${slug}</p>
      <p><strong>Category:</strong> ${categoryName}</p>
      ${description ? `<p><strong>Description:</strong> ${description.replace(/\n/g, "<br />")}</p>` : ""}
      ${otherMessage ? `<p><strong>Note:</strong> ${otherMessage}</p>` : ""}
      <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
    `,
  });
}

export async function sendLateCheckoutEmail(to: string, propertyName: string, submittedAt: string) {
  const { transporter, user } = createTransporter();
  await transporter.sendMail({
    from: `"Pillar Work Orders" <${user}>`,
    to,
    subject: `Late Checkout Request — ${propertyName}`,
    html: `
      <p><strong>Property:</strong> ${propertyName}</p>
      <p>A tenant has requested a late checkout.</p>
      <p><strong>Submitted:</strong> ${submittedAt}</p>
    `,
  });
}

export async function sendSupportEmail(opts: {
  replyTo: string;
  fromName: string;
  slug: string | undefined;
  propertyName: string | undefined;
  topic: string;
  description: string;
}) {
  const { transporter, user } = createTransporter();
  await transporter.sendMail({
    from: `"Pillar Support" <${user}>`,
    to: "support@pmpillar.com",
    replyTo: opts.replyTo,
    subject: `[Support] ${opts.topic} — ${opts.propertyName ?? opts.slug ?? "Unknown"} (${opts.slug ?? "no-id"})`,
    html: `
      <p><strong>From:</strong> ${opts.fromName} &lt;${opts.replyTo}&gt;</p>
      <p><strong>Property:</strong> ${opts.propertyName ?? "—"}</p>
      <p><strong>Property ID:</strong> ${opts.slug ?? "—"}</p>
      <p><strong>Topic:</strong> ${opts.topic}</p>
      <hr />
      <p>${opts.description.replace(/\n/g, "<br />")}</p>
    `,
  });
}
