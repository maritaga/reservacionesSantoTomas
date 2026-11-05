import { NextResponse } from "next/server";
import { getReservations, supabase, type Reservation } from "@/lib/supabase";

function overlaps(start: string, end: string, reservation: Reservation) {
  return start < reservation.end && end > reservation.start;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const salon = String(form.get("salon") ?? "");
  const date = String(form.get("date") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const reason = String(form.get("reason") ?? "").trim();
  const start = String(form.get("start") ?? "");
  const end = String(form.get("end") ?? "");
  const destination = new URL(`/salon/${salon}?fecha=${date}`, request.url);

  if (!supabase || !salon || !date || !name || !phone || !reason || !start || !end || start >= end) {
    destination.searchParams.set("error", "datos");
    return NextResponse.redirect(destination);
  }

  const reservations = await getReservations(salon, date);
  if (reservations.some((reservation) => overlaps(start, end, reservation))) {
    destination.searchParams.set("error", "empalme");
    return NextResponse.redirect(destination);
  }

  const reservation: Reservation = { id: crypto.randomUUID(), salon, date, name, phone, reason, start, end, kind: "reservation" };
  const { error } = await supabase.from("reservations").insert({ id: reservation.id, salon, reservation_date: date, name, phone, reason, start_time: start, end_time: end, start_minute: Number(start.slice(0, 2)) * 60 + Number(start.slice(3)), end_minute: Number(end.slice(0, 2)) * 60 + Number(end.slice(3)), kind: "reservation" });
  if (error) {
    destination.searchParams.set("error", error.code === "23P01" ? "empalme" : "datos");
    return NextResponse.redirect(destination);
  }
    destination.searchParams.set("reservado", "1");
    return NextResponse.redirect(destination);
}
