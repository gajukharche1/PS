import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Reset your password</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your registered email address to receive a secure password reset link
        </p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary-600"
        >
          Send Reset Link
        </button>
      </form>

      <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </div>
  );
}
