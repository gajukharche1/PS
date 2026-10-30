import crypto from "node:crypto";
import db from "@/lib/db/client";

export interface CheckoutRequest {
  listingId: string;
  planId: string;
  userId: string;
  customerEmail: string;
}

export class PaymentService {
  /**
   * Verifies Razorpay webhook signature (HMAC SHA-256)
   */
  static verifyRazorpaySignature(
    rawBody: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf8"),
        Buffer.from(signature, "utf8")
      );
    } catch {
      return false;
    }
  }

  /**
   * Activates a purchased plan for a business listing
   */
  static async activateListingPlan(
    listingId: string,
    planId: string,
    paymentReference: string
  ) {
    const plan = await db.pricingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error(`Pricing plan ${planId} not found.`);
    }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + plan.billingPeriodDays * 24 * 60 * 60 * 1000);

    return await db.$transaction(async (tx) => {
      const updatedListing = await tx.listing.update({
        where: { id: listingId },
        data: {
          planId: plan.id,
          planStartedAt: now,
          planExpiresAt: expiryDate,
          priority: plan.searchPriority,
          featured: plan.featuredAllowed ? true : undefined,
        },
      });

      // Record immutable audit entry
      await tx.auditLog.create({
        data: {
          action: "PLAN_ACTIVATION",
          entity: "listing",
          entityId: listingId,
          diff: {
            planName: plan.name,
            paymentReference,
            planStartedAt: now.toISOString(),
            planExpiresAt: expiryDate.toISOString(),
          },
        },
      });

      return updatedListing;
    });
  }

  /**
   * Creates checkout session parameters for client-side modal or redirect
   */
  static async createCheckoutSession(req: CheckoutRequest) {
    const plan = await db.pricingPlan.findUnique({
      where: { id: req.planId },
    });

    if (!plan) {
      throw new Error("Invalid plan selected.");
    }

    // For Free plans, activate immediately without payment gateway
    if (plan.priceMinor === 0) {
      await this.activateListingPlan(req.listingId, plan.id, "FREE_ACTIVATION");
      return {
        type: "free",
        redirectUrl: `/dashboard?activated=true`,
      };
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return {
      type: "gateway",
      orderId,
      amount: plan.priceMinor,
      currency: plan.currency,
      key: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key",
      name: `Pimple Saudagar Directory - ${plan.name}`,
      description: plan.description,
      prefill: {
        email: req.customerEmail,
      },
    };
  }
}
