import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, createAdminToken, maxAge } from "@/lib/admin";

export async function POST(request: Request) {
  const form = await request.formData();
  // Se ignoran espacios o saltos de línea al inicio y al final (comunes al copiar y pegar)
  const password = String(form.get("password") ?? "").trim();
  const expected = (process.env.ADMIN_PASSWORD ?? "").trim();
  const destination = new URL("/admin", request.url);
  if (!expected) {
    destination.searchParams.set("error", "config");
    return NextResponse.redirect(destination, 303);
  }
  if (password !== expected) {
    destination.searchParams.set("error", "1");
    return NextResponse.redirect(destination, 303);
  }
  (await cookies()).set(cookieName, createAdminToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge, path: "/" });
  return NextResponse.redirect(destination, 303);
}
