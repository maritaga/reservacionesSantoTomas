import Link from "next/link";
import { notFound } from "next/navigation";
import { getSalon } from "@/lib/data";
import { getReservations } from "@/lib/supabase";
import BookingPanel from "@/components/BookingPanel";

export const dynamic = "force-dynamic";

function shiftDate(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export default async function SalonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ fecha?: string; error?: string }> }) {
  const { slug } = await params;
  const { fecha, error } = await searchParams;
  const salon = getSalon(slug);
  if (!salon) notFound();
  const date = fecha ?? new Date().toISOString().slice(0, 10);
  const currentDay = new Date(`${date}T12:00:00`);
  const weekStart = shiftDate(date, -currentDay.getDay());
  const weekDays = Array.from({ length: 7 }, (_, index) => shiftDate(weekStart, index));
  const monthTitle = currentDay.toLocaleDateString("es-MX", { month: "long", year: "numeric" }).replace(" de ", " ");
  const reservations = await getReservations(slug, date);
  const previous = shiftDate(date, -7);
  const next = shiftDate(date, 7);

  return <main className="min-h-screen">
    <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[var(--line)] px-6 py-6 lg:px-10">
      <Link href="/" className="flex items-center gap-3"><img src="/logo-cruz.svg" alt="Logo de la parroquia Santo Tomás" className="h-11 w-11 object-contain" /><strong>Santo Tomás</strong></Link>
    </header>
    <section className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
      <Link href="/" className="sans text-sm text-[var(--muted)]">← Todos los salones</Link>
      <p className="sans mt-14 text-xs font-bold uppercase tracking-[.2em] text-[var(--accent)]">Reservaciones</p>
      <h1 className="mt-3 text-5xl">{salon.name}</h1>
      <p className="sans mt-3 text-sm text-[var(--muted)]">{salon.detail}</p>
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <Link aria-label="Semana anterior" className="px-2 text-2xl text-[var(--accent)]" href={`/salon/${slug}?fecha=${previous}`}>‹</Link>
          <h2 className="text-xl font-semibold capitalize">{monthTitle}</h2>
          <Link aria-label="Semana siguiente" className="px-2 text-2xl text-[var(--accent)]" href={`/salon/${slug}?fecha=${next}`}>›</Link>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const selected = day === date;
            const label = new Date(`${day}T12:00:00`);
            return <Link key={day} href={`/salon/${slug}?fecha=${day}`} aria-current={selected ? "date" : undefined} className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">{label.toLocaleDateString("es-MX", { weekday: "short" }).replace(".", "")}</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition sm:h-12 sm:w-12 sm:text-base ${selected ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`}>{label.getDate()}</span>
            </Link>;
          })}
        </div>
      </div>
      {error && <p role="alert" className="mt-8 rounded-md border border-[var(--accent)] bg-[#fdf2f3] px-4 py-3 text-sm text-[var(--accent-dark)]">{error === "empalme" ? "Ese horario ya está ocupado. Elige otro que no se empalme con las reservas del calendario." : "No se pudo guardar la reserva. Revisa que todos los datos estén completos e inténtalo de nuevo."}</p>}
      <BookingPanel salon={slug} date={date} reservations={reservations} />
    </section>
  </main>;
}
