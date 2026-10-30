import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  Store,
  Inbox,
  Star,
  CreditCard,
  LogOut,
  ArrowLeft,
  Building2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Listings", href: "/dashboard/listings", icon: Store },
    { label: "Leads & Enquiries", href: "/dashboard/enquiries", icon: Inbox },
    { label: "Customer Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Plan & Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col justify-between shrink-0">
        <div>
          {/* Top Brand */}
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                PS
              </div>
              <div>
                <span className="font-bold tracking-tight text-sm text-foreground block leading-none">
                  Pimple Saudagar
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Owner Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 border-b bg-muted/30">
            <p className="font-bold text-xs text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1.5 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
              {user.role} Account
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition rounded-lg hover:bg-muted"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Public Directory</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition rounded-lg"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span>Pimple Saudagar Merchant Console</span>
          </div>

          <Link
            href="/submit"
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-600 transition shadow-xs"
          >
            + Add New Listing
          </Link>
        </header>

        <main className="flex-1 p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
