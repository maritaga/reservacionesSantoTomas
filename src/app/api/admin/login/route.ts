import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, createAdminToken, maxAge } from "@/lib/admin";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const destination = new URL("/admin", request.url);
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    destination.searchParams.set("error", "1");
    return NextResponse.redirect(destination);
  }
  (await cookies()).set(cookieName, createAdminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge, path: "/" });
  return NextResponse.redirect(destination);
}
