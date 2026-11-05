import { NextResponse } from "next/server";
import { getSalon } from "@/lib/data";
import { getReservations, supabase } from "@/lib/supabase";

const OPEN = 7 * 60;
const CLOSE = 22 * 60;

function toMinutes(time: string) {
  const match = /^(\d{2}):(\d{2})/.exec(time);
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}

// 303 hace que el navegador cargue la siguiente página con GET (no reenvía el formulario)
function go(url: URL) {
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const salon = String(form.get("salon") ?? "");
  const date = String(form.get("date") ?? "");
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const reason = String(form.get("reason") ?? "").trim();
  const startMinute = toMinutes(String(form.get("start") ?? ""));
  const endMinute = toMinutes(String(form.get("end") ?? ""));
  const back = new URL(`/salon/${encodeURIComponent(salon)}?fecha=${encodeURIComponent(date)}`, request.url);

  const valid = getSalon(salon) && /^\d{4}-\d{2}-\d{2}$/.test(date) && name && phone && reason
    && startMinute >= OPEN && endMinute <= CLOSE && startMinute < endMinute;
  if (!supabase) {
    console.error("Reservas: faltan las variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel");
    back.searchParams.set("error", "config");
    return go(back);
  }
  if (!valid) {
    back.searchParams.set("error", "datos");
    return go(back);
  }

  const start = `${String(Math.floor(startMinute / 60)).padStart(2, "0")}:${String(startMinute % 60).padStart(2, "0")}`;
  const end = `${String(Math.floor(endMinute / 60)).padStart(2, "0")}:${String(endMinute % 60).padStart(2, "0")}`;

  // Revisión rápida; la base de datos también rechaza empalmes (restricción reservations_no_overlap)
  const existing = await getReservations(salon, date);
  if (existing.some((reservation) => startMinute < toMinutes(reservation.end) && endMinute > toMinutes(reservation.start))) {
    back.searchParams.set("error", "empalme");
    return go(back);
  }

  const id = crypto.randomUUID();
  const { error } = await supabase.from("reservations").insert({
    id, salon, reservation_date: date, name, phone, reason,
    start_time: start, end_time: end, start_minute: startMinute, end_minute: endMinute, kind: "reservation",
  });
  if (error) {
    console.error("Reservas: Supabase rechazó la reserva", error);
    back.searchParams.set("error", error.code === "23P01" ? "empalme" : "guardar");
    return go(back);
  }

  return go(new URL(`/reserva/${id}`, request.url));
}
