import { cookies } from "next/headers";
import crypto from "node:crypto";
import db from "@/lib/db/client";
import { User, UserRole } from "@prisma/client";

const SESSION_COOKIE_NAME = "ps_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
}

export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.session.create({
    data: {
      userId,
      sessionToken,
      expires,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });

  return sessionToken;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await db.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          status: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date() || session.user.status !== "active") {
    if (session) {
      await db.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  // Rolling expiration: refresh if session is halfway through its validity
  const halfAgeMs = (SESSION_MAX_AGE_SECONDS * 1000) / 2;
  if (session.expires.getTime() - Date.now() < halfAgeMs) {
    const newExpires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    await db.session.update({
      where: { id: session.id },
      data: { expires: newExpires },
    });
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: newExpires,
    });
  }

  return session.user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.session.deleteMany({ where: { sessionToken: token } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}
