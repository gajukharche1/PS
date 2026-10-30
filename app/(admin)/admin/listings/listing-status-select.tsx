"use client";

import { useState, useTransition } from "react";
import { updateListingStatusAction } from "@/actions/admin";
import { ListingStatus } from "@prisma/client";

interface Props {
  listingId: string;
  initialStatus: ListingStatus;
}

export function ListingStatusSelect({ listingId, initialStatus }: Props) {
  const [status, setStatus] = useState<ListingStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleChange = (newStatus: ListingStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      const res = await updateListingStatusAction(listingId, newStatus);
      if (!res.success) {
        alert(res.error || "Failed to update listing status");
        setStatus(initialStatus);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value as ListingStatus)}
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
      >
        <option value={ListingStatus.published}>Published</option>
        <option value={ListingStatus.pending_review}>Pending Review</option>
        <option value={ListingStatus.draft}>Draft</option>
        <option value={ListingStatus.rejected}>Rejected</option>
        <option value={ListingStatus.archived}>Archived</option>
      </select>
      {isPending && <span className="text-[10px] text-slate-400">Saving...</span>}
    </div>
  );
}
