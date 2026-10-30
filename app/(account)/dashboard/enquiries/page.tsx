import { getCurrentUser } from "@/lib/auth/session";
import { EnquiryService } from "@/lib/services/enquiry.service";
import { Inbox, Phone, Mail, Calendar, Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardEnquiriesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const enquiries = await EnquiryService.getEnquiriesForOwner(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Customer Leads & Inquiries</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Direct messages and contact requests submitted by residents in Pimple Saudagar
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-12 text-center shadow-card">
          <Inbox className="h-10 w-10 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-bold text-sm text-foreground">Inbox is empty</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            You have not received any customer enquiries yet. Make sure your business profile has updated phone and address details.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <div
              key={enquiry.id}
              className={`rounded-xl border bg-card p-5 shadow-card transition-all ${
                !enquiry.isRead ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{enquiry.name}</span>
                  {!enquiry.isRead && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                      New Lead
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Message Body */}
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap mb-4">
                {enquiry.message}
              </p>

              {/* Contact & Listing Reference */}
              <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-4">
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="flex items-center gap-1.5 hover:text-primary transition font-medium"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{enquiry.email}</span>
                  </a>

                  {enquiry.phone && (
                    <a
                      href={`tel:${enquiry.phone.replace(/\D/g, "")}`}
                      className="flex items-center gap-1.5 hover:text-primary transition font-medium"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{enquiry.phone}</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-foreground bg-muted px-2.5 py-1 rounded-md">
                  <Building2 className="h-3 w-3 text-primary" />
                  <span>{enquiry.listing.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
