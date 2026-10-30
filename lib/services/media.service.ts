import db from "@/lib/db/client";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface MediaUploadRequest {
  listingId: string;
  fileName: string;
  mimeType: string;
  bytes: number;
}

export class MediaService {
  /**
   * Checks whether the listing can accept more photos according to its pricing plan
   */
  static async assertCanUploadMedia(ownerId: string, listingId: string): Promise<boolean> {
    const listing = await db.listing.findFirst({
      where: {
        id: listingId,
        ownerId,
      },
      include: {
        plan: true,
        _count: {
          select: {
            media: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error("Listing not found or access denied.");
    }

    const maxAllowed = listing.plan?.maxPhotos ?? 4;
    const currentCount = listing._count.media;

    if (currentCount >= maxAllowed) {
      throw new Error(
        `Plan limit reached. Your ${listing.plan?.name || "current"} plan allows up to ${maxAllowed} photos. Please upgrade to add more.`
      );
    }

    return true;
  }

  /**
   * Generates a pre-signed S3 / R2 upload payload contract
   */
  static async createUploadTicket(ownerId: string, req: MediaUploadRequest) {
    if (!ALLOWED_MIME_TYPES.includes(req.mimeType)) {
      throw new Error("Invalid file type. Allowed formats: JPEG, PNG, WebP, AVIF.");
    }

    if (req.bytes > MAX_FILE_SIZE_BYTES) {
      throw new Error("File exceeds the 5 MB maximum size limit.");
    }

    await this.assertCanUploadMedia(ownerId, req.listingId);

    const fileExtension = req.fileName.split(".").pop() || "webp";
    const objectKey = `listings/${req.listingId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

    const publicBase = process.env.NEXT_PUBLIC_STORAGE_PUBLIC_URL || "http://localhost:9000/pimple-saudagar-media";
    const publicUrl = `${publicBase}/${objectKey}`;

    // Create pending media record
    const media = await db.media.create({
      data: {
        listingId: req.listingId,
        ownerId,
        key: objectKey,
        url: publicUrl,
        mimeType: req.mimeType,
        bytes: req.bytes,
        scanStatus: "pending",
      },
    });

    return {
      mediaId: media.id,
      objectKey,
      publicUrl,
      // In production with R2/S3 credentials, this returns an S3 PutObject pre-signed URL
      uploadUrl: `/api/upload/direct?key=${encodeURIComponent(objectKey)}`,
    };
  }
}
