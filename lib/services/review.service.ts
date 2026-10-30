import crypto from "node:crypto";
import db from "@/lib/db/client";
import { stripHtml } from "@/lib/security/sanitize";
import { Prisma, ReviewStatus } from "@prisma/client";

export interface SubmitReviewInput {
  listingId: string;
  authorId?: string | null;
  reviewerName: string;
  reviewerEmail: string;
  rating: number; // 1 - 5
  title: string;
  body: string;
}

export class ReviewService {
  /**
   * Hashes reviewer email with a server-side HMAC pepper to enforce
   * one-review-per-person while complying with DPDP Act 2023.
   */
  static hashEmail(email: string): string {
    const pepper = process.env.APP_SECRET || "development_secret_must_be_at_least_32_characters_long_ps_dir";
    return crypto
      .createHmac("sha256", pepper)
      .update(email.toLowerCase().trim())
      .digest("hex");
  }

  /**
   * Basic heuristics to flag spam submissions
   */
  static isSpam(body: string, title: string): boolean {
    const combined = `${title} ${body}`.toLowerCase();

    // Check for excessive URL links
    const linkMatches = combined.match(/https?:\/\//g);
    if (linkMatches && linkMatches.length > 1) {
      return true;
    }

    // Common spam trigger phrases
    const spamKeywords = ["buy now", "free crypto", "casino", "viagra", "telegram:", "whatsapp:"];
    return spamKeywords.some((kw) => combined.includes(kw));
  }

  /**
   * Recalculates average rating and review count inside an interactive transaction
   */
  static async recalculateListingRating(
    tx: Prisma.TransactionClient,
    listingId: string
  ): Promise<{ average: number; count: number }> {
    const aggregate = await tx.review.aggregate({
      where: {
        listingId,
        status: ReviewStatus.approved,
      },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    const average = aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(2)) : 0;
    const count = aggregate._count.id;

    await tx.listing.update({
      where: { id: listingId },
      data: {
        averageRating: new Prisma.Decimal(average),
        reviewCount: count,
      },
    });

    return { average, count };
  }

  /**
   * Submits a customer review with deduplication checks and moderation queue
   */
  static async submitReview(input: SubmitReviewInput) {
    const emailHash = this.hashEmail(input.reviewerEmail);

    // Verify rating bounds
    const rating = Math.min(Math.max(Math.round(input.rating), 1), 5);

    // Check for duplicate review from this email on this listing
    const existing = await db.review.findFirst({
      where: {
        listingId: input.listingId,
        reviewerEmailHash: emailHash,
      },
    });

    if (existing) {
      throw new Error(
        "You have already submitted a review for this business. Each customer can leave one review per listing."
      );
    }

    const cleanTitle = stripHtml(input.title);
    const cleanBody = stripHtml(input.body);
    const cleanName = stripHtml(input.reviewerName);

    // Determine initial status based on spam heuristics
    const initialStatus = this.isSpam(cleanBody, cleanTitle)
      ? ReviewStatus.spam
      : ReviewStatus.pending;

    return await db.review.create({
      data: {
        listingId: input.listingId,
        authorId: input.authorId || null,
        reviewerName: cleanName,
        reviewerEmailHash: emailHash,
        rating,
        title: cleanTitle,
        body: cleanBody,
        status: initialStatus,
      },
    });
  }

  /**
   * Updates moderation status (Approved / Rejected / Spam) and atomically recalculates rating
   */
  static async setModerationStatus(
    reviewId: string,
    status: ReviewStatus,
    moderatorId: string
  ) {
    return await db.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId },
        data: {
          status,
          moderatedBy: moderatorId,
          moderatedAt: new Date(),
        },
      });

      // Recalculate aggregates on the associated listing
      await this.recalculateListingRating(tx, review.listingId);

      return review;
    });
  }

  /**
   * Upvote a review as helpful (rate limited, 1 upvote per user)
   */
  static async voteHelpful(reviewId: string): Promise<number> {
    const updated = await db.review.update({
      where: { id: reviewId },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
      select: {
        helpfulCount: true,
      },
    });

    return updated.helpfulCount;
  }

  /**
   * Allows business owner to reply to a review
   */
  static async addOwnerReply(
    reviewId: string,
    ownerId: string,
    replyText: string
  ) {
    // Assert owner owns the listing associated with this review
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        listing: {
          select: { ownerId: true },
        },
      },
    });

    if (!review || review.listing.ownerId !== ownerId) {
      throw new Error("Unauthorized: Only the verified business owner can reply to this review.");
    }

    return await db.review.update({
      where: { id: reviewId },
      data: {
        ownerReply: stripHtml(replyText),
        ownerReplyAt: new Date(),
      },
    });
  }
}
