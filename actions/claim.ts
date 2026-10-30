"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ClaimService } from "@/lib/services/claim.service";
import { getCurrentUser } from "@/lib/auth/session";

const claimSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required."),
  slug: z.string().min(1),
  proofFileUrl: z.string().min(1, "Proof document or link is required."),
  note: z.string().optional(),
});

export type ClaimActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export async function submitClaimAction(
  _prevState: ClaimActionState | null,
  formData: FormData
): Promise<ClaimActionState> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      error: "You must be signed in to claim a business profile.",
    };
  }

  const rawData = {
    listingId: formData.get("listingId"),
    slug: formData.get("slug"),
    proofFileUrl: formData.get("proofFileUrl"),
    note: formData.get("note"),
  };

  const validation = claimSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please provide a valid proof document URL and listing details.",
    };
  }

  try {
    await ClaimService.submitClaim({
      listingId: validation.data.listingId,
      userId: user.id,
      proofFileUrl: validation.data.proofFileUrl,
      note: validation.data.note,
    });

    revalidatePath(`/listing/${validation.data.slug}`);
    revalidatePath(`/claim/${validation.data.slug}`);

    return {
      success: true,
      message:
        "Your verification request has been submitted! Our local moderation team will verify your ownership documents within 24 hours.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to submit claim request.",
    };
  }
}
