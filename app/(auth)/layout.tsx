import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-muted/20">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Pimple Saudagar Directory</span>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base shadow-sm">
            PS
          </div>
          <div>
            <span className="font-bold tracking-tight text-lg text-foreground block leading-none">
              Pimple Saudagar
            </span>
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase font-semibold">
              Hyperlocal Business Directory
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-card py-8 px-6 shadow-card rounded-xl border border-border sm:px-10">
          {children}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>End-to-End Secure Auth & Argon2id Password Encryption</span>
        </div>
      </div>
    </div>
  );
}
