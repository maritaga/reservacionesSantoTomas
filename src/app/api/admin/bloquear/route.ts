import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getReservations, supabase, type Reservation } from "@/lib/supabase";

export async function POST(request: Request) {
  const destination = new URL("/admin", request.url);
  if (!(await isAdmin()) || !supabase) return NextResponse.redirect(destination, 303);
  const form = await request.formData();
  const salon = String(form.get("salon") ?? "");
  const date = String(form.get("date") ?? "");
  const reason = String(form.get("reason") ?? "Bloqueo administrativo").trim();
  const start = String(form.get("start") ?? "");
  const end = String(form.get("end") ?? "");
  if (!salon || !date || !start || !end || start >= end) return NextResponse.redirect(destination, 303);
  const reservations = await getReservations(salon, date);
  if (reservations.some((reservation) => start < reservation.end && end > reservation.start)) return NextResponse.redirect(destination, 303);
  const block: Reservation = { id: crypto.randomUUID(), salon, date, name: "Administración", phone: "", reason, start, end, kind: "block" };
  await supabase.from("reservations").insert({ id: block.id, salon, reservation_date: date, name: block.name, phone: block.phone, reason: block.reason, start_time: start, end_time: end, start_minute: Number(start.slice(0, 2)) * 60 + Number(start.slice(3)), end_minute: Number(end.slice(0, 2)) * 60 + Number(end.slice(3)), kind: "block" });
  return NextResponse.redirect(destination, 303);
}
