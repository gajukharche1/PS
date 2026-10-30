import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { logoutAction } from "@/actions/auth";
import { UserRole } from "@prisma/client";
import {
  ShieldAlert,
  Sliders,
  Store,
  Upload,
  ArrowLeft,
  LogOut,
  CheckCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !hasRole(user.role, UserRole.moderator)) {
    redirect("/login?redirectTo=/admin");
  }

  const navItems = [
    { label: "Dashboard & Health", href: "/admin", icon: Sliders },
    { label: "Moderation Queue", href: "/admin/moderation", icon: ShieldAlert },
    { label: "Listings Directory", href: "/admin/listings", icon: Store },
    { label: "CSV Import / Export", href: "/admin/imports", icon: Upload },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card flex flex-col justify-between shrink-0">
        <div>
          {/* Header */}
          <div className="p-4 border-b">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-bold text-sm shadow-sm">
                PS
              </div>
              <div>
                <span className="font-bold tracking-tight text-sm text-foreground block leading-none">
                  Pimple Saudagar
                </span>
                <span className="text-[10px] text-red-600 uppercase font-bold tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Admin User Info */}
          <div className="p-4 border-b bg-muted/30">
            <p className="font-bold text-xs text-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            <span className="inline-block mt-1.5 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded-full uppercase">
              {user.role} Privilege
            </span>
          </div>

          {/* Nav Items */}
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

        {/* Footer */}
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

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Operational · OWASP ASVS Level 2 Guard Active</span>
          </div>
          <Link
            href="/admin/moderation"
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition shadow-xs"
          >
            Pending Moderation
          </Link>
        </header>

        <main className="flex-1 p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
