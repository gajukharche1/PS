import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/lib/services/payment.service";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // In production, mandate valid webhook secret and signature
    if (process.env.NODE_ENV === "production" && secret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
      }

      const isValid = PaymentService.verifyRazorpaySignature(rawBody, signature, secret);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payment authorized / captured event
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const notes = paymentEntity?.notes || {};

      const listingId = notes.listingId;
      const planId = notes.planId;
      const paymentId = paymentEntity?.id || "mock_payment_id";

      if (listingId && planId) {
        await PaymentService.activateListingPlan(listingId, planId, paymentId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
