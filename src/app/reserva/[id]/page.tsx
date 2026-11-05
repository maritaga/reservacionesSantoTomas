import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/data";
import { getReservation } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function longDate(date: string) {
  const text = new Date(`${date}T12:00:00Z`).toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function shortTime(time: string) {
  return time.replace(/^0/, "");
}

export default async function ReservaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservation = await getReservation(id);
  if (!reservation || reservation.kind === "block") notFound();
  const salon = getSalon(reservation.salon);

  const rows = [
    ["Salón", salon?.name ?? reservation.salon],
    ["Fecha", longDate(reservation.date)],
    ["Horario", `${shortTime(reservation.start)} – ${shortTime(reservation.end)}`],
    ["Motivo o grupo", reservation.reason],
    ["Nombre", reservation.name],
    ["Teléfono", reservation.phone],
  ];

  return <main className="min-h-screen">
    <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[var(--line)] px-6 py-6 lg:px-10">
      <Link href="/" className="flex items-center gap-3"><img src="/logo-santo-tomas-moro.svg" alt="Logo de la Parroquia Santo Tomás Moro" className="h-11 w-11 object-contain" /><strong>Parroquia Santo Tomás Moro</strong></Link>
    </header>
    <section className="mx-auto max-w-xl px-6 py-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-white">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </div>
      <p className="mt-8 text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">Reserva confirmada</p>
      <h1 className="mt-3 text-4xl">¡Listo, {reservation.name.split(" ")[0]}!</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Tu espacio quedó apartado. Toma captura de esta pantalla por si la necesitas.</p>

      <dl className="mt-10 border-t-2 border-[var(--foreground)]">
        {rows.map(([label, value]) => <div key={label} className="grid grid-cols-[130px_1fr] gap-4 border-b border-[var(--line)] py-4 text-sm">
          <dt className="text-[var(--muted)]">{label}</dt>
          <dd className="font-medium">{value}</dd>
        </div>)}
      </dl>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href={`/salon/${reservation.salon}?fecha=${reservation.date}`} className="rounded-full bg-[var(--accent)] px-6 py-3.5 text-center text-sm font-semibold text-white hover:bg-[var(--accent-dark)]">Ver en el calendario</Link>
        <Link href="/" className="rounded-full border border-[var(--line)] px-6 py-3.5 text-center text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)]">Reservar otro salón</Link>
      </div>
    </section>
  </main>;
}
