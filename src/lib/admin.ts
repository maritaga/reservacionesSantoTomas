import crypto from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "santo-tomas-admin";
const maxAge = 60 * 60 * 24 * 7;

function signature(value: string) {
  return crypto.createHmac("sha256", process.env.ADMIN_PASSWORD ?? "").update(value).digest("hex");
}

export function createAdminToken() {
  const value = `${Date.now()}`;
  return `${value}.${signature(value)}`;
}

export async function isAdmin() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  const [value, providedSignature] = token.split(".");
  if (!value || !providedSignature || Date.now() - Number(value) > maxAge * 1000) return false;
  const expected = signature(value);
  return providedSignature.length === expected.length && crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expected));
}

export { cookieName, maxAge };
