"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ReviewService } from "@/lib/services/review.service";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimits } from "@/lib/security/rate-limit";
import { headers } from "next/headers";

const reviewSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required."),
  rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5."),
  title: z.string().min(3, "Title must be at least 3 characters.").max(120),
  body: z.string().min(10, "Review must be at least 10 characters.").max(2000),
  reviewerName: z.string().min(2, "Name must be at least 2 characters."),
  reviewerEmail: z.string().email("Valid email is required."),
  slug: z.string().optional(),
});

export type ReviewActionState = {
  success?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitReviewAction(
  _prevState: ReviewActionState | null,
  formData: FormData
): Promise<ReviewActionState> {
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") || "127.0.0.1";

  // Rate limiting check
  const rateLimitResult = await rateLimits.submission(ip);
  if (!rateLimitResult.success) {
    return {
      error: `Too many submissions. Please wait ${rateLimitResult.reset} seconds before trying again.`,
    };
  }

  const rawData = {
    listingId: formData.get("listingId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
    reviewerName: formData.get("reviewerName"),
    reviewerEmail: formData.get("reviewerEmail"),
    slug: formData.get("slug"),
  };

  const validation = reviewSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please correct the form errors.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const currentUser = await getCurrentUser();

  try {
    const review = await ReviewService.submitReview({
      ...validation.data,
      authorId: currentUser?.id,
    });

    if (validation.data.slug) {
      revalidatePath(`/listing/${validation.data.slug}`);
    }

    return {
      success: true,
      message:
        review.status === "approved"
          ? "Thank you! Your review has been published."
          : "Thank you! Your review has been submitted and will appear after moderation approval.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to submit review.",
    };
  }
}

export async function voteHelpfulAction(reviewId: string) {
  try {
    const count = await ReviewService.voteHelpful(reviewId);
    return { success: true, count };
  } catch {
    return { success: false };
  }
}

export async function replyToReviewAction(reviewId: string, replyText: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await ReviewService.addOwnerReply(reviewId, user.id, replyText);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add reply.",
    };
  }
}
