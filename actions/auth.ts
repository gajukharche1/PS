"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import db from "@/lib/db/client";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { EmailService } from "@/lib/services/email.service";
import { UserRole } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
  redirectTo: z.string().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number (e.g. +919876543210)").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  role: z.enum(["visitor", "owner"]).default("visitor"),
});

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function loginAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo"),
  };

  const validation = loginSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Validation failed",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password, redirectTo } = validation.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Find user
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Protection against user enumeration / timing attacks: compute a dummy verify if user not found
  const dummyHash = "$argon2id$v=19$m=65536,t=3,p=1$5YlY3wBw4yR9z$U9xYxL9j+wM8X8zW1sO8A==";

  if (!user) {
    await verifyPassword(dummyHash, password);
    return { error: "Invalid email or password." };
  }

  // Check account lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
    return {
      error: `Account is temporarily locked due to repeated failed login attempts. Try again in ${minutesLeft} minutes.`,
    };
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);

  if (!isPasswordValid) {
    const updatedCount = user.failedLoginCount + 1;
    let lockUntil: Date | null = null;

    if (updatedCount >= 5) {
      lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: updatedCount,
        lockedUntil: lockUntil,
      },
    });

    return { error: "Invalid email or password." };
  }

  // Reset failed login counter and clear lockout
  await db.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });

  // Create authenticated session
  await createSession(user.id);

  // Determine redirect route based on role if no redirectTo provided
  let destination = redirectTo || "/";
  if (!redirectTo) {
    if (user.role === UserRole.admin || user.role === UserRole.moderator) {
      destination = "/admin";
    } else if (user.role === UserRole.owner) {
      destination = "/dashboard";
    }
  }

  redirect(destination);
}

export async function registerAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const validation = registerSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      error: "Please correct the form errors.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, password, role } = validation.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check if email is already taken
  const existingUser = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return {
      error: "An account with this email address already exists. Please sign in instead.",
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser = await db.user.create({
    data: {
      name,
      email: normalizedEmail,
      phone: phone || null,
      passwordHash,
      role: role === "owner" ? UserRole.owner : UserRole.visitor,
    },
  });

  // Create session immediately
  await createSession(newUser.id);

  // Send asynchronous welcome email (non-blocking)
  EmailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) =>
    console.error("Failed to send welcome email:", err)
  );

  redirect(role === "owner" ? "/dashboard" : "/");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
