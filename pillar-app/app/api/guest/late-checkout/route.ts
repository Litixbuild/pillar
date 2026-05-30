import nodemailer from 'nodemailer';
import { createServiceClient } from '@/lib/supabase';
import { sendSms } from '@/lib/twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { slug?: unknown } | null;
    const slug = typeof body?.slug === 'string' ? body.slug.trim() : '';
    if (!slug) return Response.json({ error: 'slug is required' }, { status: 400 });

    const service = createServiceClient();
    const { data: property } = await service
      .from('properties')
      .select('name, manager_phone, manager_id')
      .eq('slug', slug)
      .single();

    if (!property) return Response.json({ error: 'Property not found' }, { status: 404 });

    const propertyName = (property.name as string) || slug;
    const managerPhone = typeof property.manager_phone === 'string' ? property.manager_phone.trim() : null;
    const now = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    const notifyJobs: Promise<void>[] = [];

    // SMS to manager's property phone
    if (managerPhone) {
      const smsBody = `Pillar: Late checkout requested at ${propertyName}. Submitted ${now}. Manage at pmpillar.com. Reply STOP to opt out.`;
      notifyJobs.push(
        sendSms(managerPhone, smsBody).catch((e) =>
          console.error('[late-checkout] SMS error:', e)
        )
      );
    }

    // Email to manager if configured
    if (property.manager_id) {
      const { data: profile } = await service
        .from('profiles')
        .select('email')
        .eq('id', property.manager_id)
        .single();

      const managerEmail = typeof profile?.email === 'string' ? profile.email.trim() : null;
      const smtpUser = process.env.ZOHO_SMTP_USER;
      const smtpPass = process.env.ZOHO_SMTP_PASS;

      if (managerEmail && smtpUser && smtpPass) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.zoho.com',
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
        });

        notifyJobs.push(
          transporter.sendMail({
            from: `"Pillar Work Orders" <${smtpUser}>`,
            to: managerEmail,
            subject: `Late Checkout Request — ${propertyName}`,
            html: `
              <p><strong>Property:</strong> ${propertyName}</p>
              <p>A tenant has requested a late checkout.</p>
              <p><strong>Submitted:</strong> ${now}</p>
            `,
          }).then(() => undefined).catch((e) =>
            console.error('[late-checkout] Email error:', e)
          )
        );
      }
    }

    await Promise.allSettled(notifyJobs);
    return Response.json({ ok: true }, { status: 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
}
