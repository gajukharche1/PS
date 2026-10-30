import { env } from "@/lib/config/env";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  /**
   * Universal sender. Uses Resend API if configured, otherwise logs to development console.
   */
  static async send(options: EmailOptions): Promise<{ success: boolean; id?: string }> {
    const from = process.env.EMAIL_FROM || "Pimple Saudagar Directory <no-reply@pimplesaudagar.org>";

    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text || options.html.replace(/<[^>]*>/g, ""),
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("Resend API delivery error:", errorData);
          return { success: false };
        }

        const data = await response.json();
        return { success: true, id: data.id };
      } catch (err) {
        console.error("Email delivery exception:", err);
        return { success: false };
      }
    }

    // Development fallback: mock email logger
    console.info(`[MOCK EMAIL TO ${options.to}] Subject: ${options.subject}`);
    return { success: true, id: `mock-${Date.now()}` };
  }

  /**
   * Welcome Email for new registrants.
   */
  static async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: 800;">Pimple Saudagar Directory</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">PCMC Pune's Premier Local Business Guide</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #f8fafc;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome, ${name}!</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Thank you for joining the Pimple Saudagar Directory. Whether you are discovering local services or managing a verified business profile, our platform gives you trusted access to PCMC's thriving neighborhood.
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            Need help? Simply reply to this email or reach our support team anytime.
          </p>
        </div>
      </div>
    `;

    return this.send({
      to,
      subject: "Welcome to Pimple Saudagar Directory!",
      html,
    });
  }

  /**
   * New Lead Enquiry alert for Business Owners.
   */
  static async sendLeadEnquiryEmail(to: string, data: {
    listingTitle: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    message: string;
  }) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <div style="border-left: 4px solid #2563eb; padding-left: 16px; margin-bottom: 20px;">
          <h1 style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0;">New Customer Lead Received!</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">For ${data.listingTitle}</p>
        </div>
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background-color: #f8fafc;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Customer Name:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${data.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Phone Number:</td>
              <td style="padding: 8px 0; color: #2563eb; font-weight: 700;">
                <a href="tel:${data.customerPhone}" style="color: #2563eb; text-decoration: none;">${data.customerPhone}</a>
              </td>
            </tr>
            ${data.customerEmail ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; color: #0f172a;">${data.customerEmail}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Customer Inquiry Message:</p>
            <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.5; color: #1e293b;">
              "${data.message}"
            </div>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard/enquiries" style="background-color: #0f172a; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
              View Leads in Dashboard
            </a>
          </div>
        </div>
      </div>
    `;

    return this.send({
      to,
      subject: `[Lead Alert] New enquiry for ${data.listingTitle}`,
      html,
    });
  }

  /**
   * Plan Expiry Warning alert.
   */
  static async sendPlanExpiringEmail(to: string, data: {
    listingTitle: string;
    planName: string;
    daysRemaining: number;
    renewalUrl: string;
  }) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;">
        <div style="border: 1px solid #fed7aa; border-radius: 12px; padding: 24px; background-color: #fffbeb;">
          <h2 style="color: #b45309; font-size: 18px; font-weight: 700; margin-top: 0;">
            Your ${data.planName} Plan Expires in ${data.daysRemaining} Days
          </h2>
          <p style="font-size: 14px; line-height: 1.6; color: #78350f;">
            Your featured visibility, WhatsApp click-to-chat button, and verified badge for <strong>${data.listingTitle}</strong> are set to expire soon.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${data.renewalUrl}" style="background-color: #d97706; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 700; display: inline-block;">
              Renew Now to Keep Benefits
            </a>
          </div>
        </div>
      </div>
    `;

    return this.send({
      to,
      subject: `[Renewal Reminder] ${data.listingTitle} plan expires in ${data.daysRemaining} days`,
      html,
    });
  }
}
