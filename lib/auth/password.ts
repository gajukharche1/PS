import { hash, verify } from "@node-rs/argon2";

/**
 * OWASP ASVS Level 2 recommended Argon2id parameters
 * Memory: 64 MB (65536 KB)
 * Iterations (Time cost): 3
 * Parallelism (Threads): 1
 */
const ARGON2_OPTIONS = {
  memoryCost: 65536,
  timeCost: 3,
  outputLen: 32,
  parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hashString: string, candidate: string): Promise<boolean> {
  try {
    return await verify(hashString, candidate);
  } catch {
    return false;
  }
}
