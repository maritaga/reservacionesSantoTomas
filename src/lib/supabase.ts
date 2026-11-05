import { createClient } from "@supabase/supabase-js";

export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  reason: string;
  start: string;
  end: string;
  date: string;
  salon: string;
  kind?: "reservation" | "block";
};

type ReservationRow = Reservation & { reservation_date: string; start_time: string; end_time: string };

function mapReservation(row: ReservationRow): Reservation {
  return { id: row.id, name: row.name, phone: row.phone, reason: row.reason, start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5), date: row.reservation_date, salon: row.salon, kind: row.kind };
}

export async function getReservations(salon: string, date: string): Promise<Reservation[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("reservations").select("id,name,phone,reason,start_time,end_time,reservation_date,salon,kind").eq("salon", salon).eq("reservation_date", date).order("start_time");
  return (data as ReservationRow[] | null)?.map(mapReservation) ?? [];
}

export async function getUpcomingReservations(): Promise<Reservation[]> {
  if (!supabase) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase.from("reservations").select("id,name,phone,reason,start_time,end_time,reservation_date,salon,kind").gte("reservation_date", today).order("reservation_date").order("start_time");
  return (data as ReservationRow[] | null)?.map(mapReservation) ?? [];
}

export async function getReservation(id: string): Promise<Reservation | null> {
  if (!supabase || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await supabase.from("reservations").select("id,name,phone,reason,start_time,end_time,reservation_date,salon,kind").eq("id", id).maybeSingle();
  return data ? mapReservation(data as ReservationRow) : null;
}
