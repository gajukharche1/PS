"use server";

import { z } from "zod";
import { EnquiryService } from "@/lib/services/enquiry.service";
import { rateLimits } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

const enquirySchema = z.object({
  listingId: z.string().min(1, "Listing ID is required."),
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Valid email is required."),
  phone: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters.").max(1000),
  honeypot: z.string().optional(),
  timestamp: z.coerce.number().optional(),
});

export type EnquiryActionState = {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitEnquiryAction(
  _prevState: EnquiryActionState | null,
  formData: FormData
): Promise<EnquiryActionState> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "127.0.0.1";

  const rateCheck = await rateLimits.submission(ip);
  if (!rateCheck.success) {
    return {
      error: `Too many submissions. Please wait ${rateCheck.reset} seconds.`,
    };
  }

  const rawData = {
    listingId: formData.get("listingId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    honeypot: formData.get("website_url"), // Honeypot field disguised as website_url
    timestamp: formData.get("form_loaded_at"),
  };

  const validation = enquirySchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please correct the form errors.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    await EnquiryService.submitEnquiry(validation.data);
    return {
      success: true,
      message: "Your enquiry has been delivered directly to the business owner!",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to deliver enquiry.",
    };
  }
}
