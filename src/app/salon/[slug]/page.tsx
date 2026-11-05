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

export default async function SalonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ fecha?: string }> }) {
  const { slug } = await params;
  const { fecha } = await searchParams;
  const salon = getSalon(slug);
  if (!salon) notFound();
  const date = fecha ?? new Date().toISOString().slice(0, 10);
  const currentDay = new Date(`${date}T12:00:00`);
  const weekStart = shiftDate(date, -currentDay.getDay());
  const weekDays = Array.from({ length: 7 }, (_, index) => shiftDate(weekStart, index));
  const weekEnd = weekDays[6];
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
      <div className="mt-12"><div className="flex items-center justify-between border-y border-[var(--line)] py-4"><Link aria-label="Semana anterior" className="text-2xl text-[var(--accent)]" href={`/salon/${slug}?fecha=${previous}`}>‹</Link><span className="sans text-sm font-bold">{weekStart} – {weekEnd}</span><Link aria-label="Semana siguiente" className="text-2xl text-[var(--accent)]" href={`/salon/${slug}?fecha=${next}`}>›</Link></div><div className="calendar-days mt-5 grid grid-cols-7 border border-[var(--line)]">{weekDays.map((day) => <Link key={day} href={`/salon/${slug}?fecha=${day}`} className={`relative border-l border-[var(--line)] px-1 py-3 text-center first:border-l-0 ${day === date ? "font-bold text-[var(--accent)]" : "text-[var(--muted)]"}`}><span className="sans block text-[10px] uppercase">{new Date(`${day}T12:00:00`).toLocaleDateString("es-MX", { weekday: "short" })}</span><span className="sans mt-1 block text-sm">{new Date(`${day}T12:00:00`).getDate()}</span>{day === date && <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--accent)]" />}</Link>)}</div></div>
      <BookingPanel salon={slug} date={date} reservations={reservations} />
    </section>
  </main>;
}
