import Link from "next/link";
import { salons } from "@/lib/data";

const tones = ["bg-[#f4eee8]", "bg-[#eef1ed]", "bg-[#f0eeee]", "bg-[#f3eee6]", "bg-[#eceff1]"];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-[var(--line)] px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-cruz.svg" alt="Logo de la Parroquia Santo Tomás Moro" className="h-11 w-11 object-contain" />
          <span><strong className="block text-lg">Parroquia Santo Tomás Moro</strong><small className="sans text-xs uppercase tracking-[.18em] text-[var(--muted)]">Reservas</small></span>
        </Link>
      </header>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-10 lg:pt-24">
        <p className="sans mb-5 text-xs font-bold uppercase tracking-[.22em] text-[var(--accent)]">Agenda parroquial</p>
        <h1 className="max-w-3xl text-4xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Reserva un espacio para tu comunidad.</h1>
        <p className="sans mt-6 max-w-xl text-base leading-7 text-[var(--muted)]">Consulta la disponibilidad y solicita un salón para reuniones, grupos y actividades de la parroquia.</p>
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5">
          {salons.map((salon, index) => <Link key={salon.slug} href={`/salon/${salon.slug}`} className={`${tones[index]} group min-h-48 border border-transparent p-5 transition hover:border-[var(--accent)]`}>
            <div className="flex h-full flex-col justify-between"><span className="sans text-xs uppercase tracking-[.16em] text-[var(--muted)]">Salón</span><div><h2 className="text-2xl leading-tight">{salon.name}</h2><p className="sans mt-2 text-sm text-[var(--muted)]">{salon.detail}</p><span className="sans mt-5 inline-block text-sm font-bold text-[var(--accent)]">Ver disponibilidad <span className="transition group-hover:ml-2">→</span></span></div></div>
          </Link>)}
        </div>
      </section>
    </main>
  );
}
