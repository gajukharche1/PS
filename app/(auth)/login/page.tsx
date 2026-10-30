"use client";

import { useActionState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, ActionState } from "@/actions/auth";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    loginAction,
    null
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sign in to your account</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Access your listings, reviews, and community dashboard
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-foreground">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center rounded-lg bg-primary py-2.5 px-4 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary-600 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Verifying credentials...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
        <span>Don&apos;t have an account yet? </span>
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

