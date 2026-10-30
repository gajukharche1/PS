"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction, ActionState } from "@/actions/auth";
import { Loader2, Lock, Mail, User, Phone, Store, UserCheck, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"visitor" | "owner">("visitor");
  const [state, formAction, isPending] = useActionState<ActionState | null, FormData>(
    registerAction,
    null
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Create your account</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Join the Pimple Saudagar local business community
        </p>
      </div>

      {state?.error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {/* Account Type Toggle */}
      <div className="mb-5 grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setRole("visitor")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
            role === "visitor"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>Resident / Visitor</span>
        </button>
        <button
          type="button"
          onClick={() => setRole("owner")}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
            role === "owner"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>Business Owner</span>
        </button>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              name="name"
              required
              placeholder={role === "owner" ? "e.g. Rajesh Kulkarni" : "e.g. Pooja Sharma"}
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.name[0]}</p>
          )}
        </div>

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
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            Mobile Number {role === "owner" ? "(Required for lead notifications)" : "(Optional)"}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="tel"
              name="phone"
              required={role === "owner"}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          {state?.fieldErrors?.phone && (
            <p className="mt-1 text-xs text-destructive">{state.fieldErrors.phone[0]}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              name="password"
              required
              placeholder="Min 8 chars, 1 uppercase, 1 number"
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>{role === "owner" ? "Register Business Account" : "Create Resident Account"}</span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t text-center text-xs text-muted-foreground">
        <span>Already have an account? </span>
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
