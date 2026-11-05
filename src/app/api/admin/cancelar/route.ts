import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const destination = new URL("/admin", request.url);
  if (!(await isAdmin()) || !supabase) return NextResponse.redirect(destination, 303);
  const form = await request.formData();
  const salon = String(form.get("salon") ?? "");
  const date = String(form.get("date") ?? "");
  const id = String(form.get("id") ?? "");
  await supabase.from("reservations").delete().eq("id", id).eq("salon", salon).eq("reservation_date", date);
  return NextResponse.redirect(destination, 303);
}
