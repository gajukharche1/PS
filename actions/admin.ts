"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { assertAuthorized } from "@/lib/auth/rbac";
import { ReviewService } from "@/lib/services/review.service";
import { ClaimService } from "@/lib/services/claim.service";
import { UserRole, ReviewStatus, ListingStatus } from "@prisma/client";
import db from "@/lib/db/client";

export async function approveReviewAction(reviewId: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ReviewService.setModerationStatus(reviewId, ReviewStatus.approved, user.id);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve review.",
    };
  }
}

export async function rejectReviewAction(reviewId: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ReviewService.setModerationStatus(reviewId, ReviewStatus.trashed, user.id);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject review.",
    };
  }
}

export async function approveClaimAction(claimId: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ClaimService.approveClaim(claimId, user.id);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to approve claim.",
    };
  }
}

export async function rejectClaimAction(claimId: string, reason?: string) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await ClaimService.rejectClaim(claimId, user.id, reason);
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject claim.",
    };
  }
}

export async function updateListingStatusAction(listingId: string, status: ListingStatus) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.moderator);

  try {
    await db.listing.update({
      where: { id: listingId },
      data: {
        status,
        ...(status === "published" && { publishedAt: new Date() }),
      },
    });

    revalidatePath("/admin/listings");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update listing status.",
    };
  }
}

export interface ImportListingInput {
  title: string;
  categorySlug: string;
  locationSlug: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address: string;
  locality?: string;
  landmark?: string;
  description?: string;
  priceRange?: number;
}

export async function importListingsAction(items: ImportListingInput[]) {
  const user = await getCurrentUser();
  assertAuthorized(user, UserRole.admin);

  if (!items || items.length === 0) {
    return { success: false, error: "No listings provided to import." };
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    try {
      if (!item.title?.trim() || !item.address?.trim()) {
        errors.push(`Row ${i + 1}: Title and address are required.`);
        continue;
      }

      // Base slug from title
      const baseSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      let slug = baseSlug || `business-${Date.now()}`;
      let suffix = 1;
      while (await db.listing.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${suffix++}`;
      }

      // Resolve category
      let category = item.categorySlug
        ? await db.category.findUnique({ where: { slug: item.categorySlug } })
        : null;

      if (!category) {
        category = await db.category.findFirst();
      }

      // Resolve location
      let location = item.locationSlug
        ? await db.location.findUnique({ where: { slug: item.locationSlug } })
        : null;

      if (!location) {
        location = await db.location.findFirst();
      }

      const listing = await db.listing.create({
        data: {
          slug,
          title: item.title.trim(),
          description: item.description?.trim() || `<p>${item.title} is a verified business in Pimple Saudagar, PCMC.</p>`,
          status: ListingStatus.published,
          publishedAt: new Date(),
          address: item.address.trim(),
          locality: item.locality?.trim() || "Pimple Saudagar",
          landmark: item.landmark?.trim() || null,
          phone: item.phone?.trim() || null,
          whatsapp: item.whatsapp?.trim() || null,
          email: item.email?.trim() || null,
          website: item.website?.trim() || null,
          priceRange: item.priceRange && item.priceRange >= 1 && item.priceRange <= 4 ? item.priceRange : 2,
        },
      });

      if (category) {
        await db.listingCategory.create({
          data: {
            listingId: listing.id,
            categoryId: category.id,
          },
        });
      }

      if (location) {
        await db.listingLocation.create({
          data: {
            listingId: listing.id,
            locationId: location.id,
            isPrimary: true,
          },
        });
      }

      importedCount++;
    } catch (err) {
      errors.push(`Row ${i + 1} (${item.title}): ${err instanceof Error ? err.message : "Database error"}`);
    }
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  revalidatePath("/search");

  return {
    success: true,
    importedCount,
    failedCount: errors.length,
    errors,
  };
}
