"use client";

import type { Reservation } from "@/lib/supabase";
import { useState, type MouseEvent } from "react";

const FIRST_HOUR = 7;
const LAST_HOUR = 22;
const HOUR_HEIGHT = 64; // px por hora
const calendarStart = FIRST_HOUR * 60;
const calendarEnd = LAST_HOUR * 60;
const hours = Array.from({ length: LAST_HOUR - FIRST_HOUR + 1 }, (_, index) => index + FIRST_HOUR);
const boardHeight = (LAST_HOUR - FIRST_HOUR) * HOUR_HEIGHT;

function minutes(time: string) {
  const [hoursPart, minutesPart] = time.split(":").map(Number);
  return hoursPart * 60 + minutesPart;
}

function timeValue(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

// Posición y alto en px de un rango de horas dentro del calendario
function place(start: string, end: string) {
  const from = Math.max(calendarStart, Math.min(calendarEnd, minutes(start)));
  const to = Math.max(from, Math.min(calendarEnd, minutes(end)));
  return { top: ((from - calendarStart) / 60) * HOUR_HEIGHT, height: ((to - from) / 60) * HOUR_HEIGHT };
}

function shortTime(time: string) {
  return time.replace(/^0/, "");
}

function Block({ title, subtitle, start, end, height }: { title: string; subtitle: string; start: string; end: string; height: number }) {
  const range = `${shortTime(start)}–${shortTime(end)}`;
  // Media hora: todo en una línea, con el horario primero para que nunca se corte
  if (height < 44) {
    return <p className="truncate text-xs leading-none"><span className="tabular-nums">{range}</span> · <strong className="font-semibold">{title}</strong> · {subtitle}</p>;
  }
  if (height < 80) {
    return <>
      <p className="truncate text-sm font-semibold leading-tight">{title}</p>
      <p className="mt-0.5 truncate text-xs leading-tight">• {subtitle} · <span className="tabular-nums">{range}</span></p>
    </>;
  }
  return <>
    <p className="truncate text-sm font-semibold leading-tight">{title}</p>
    <p className="mt-1 truncate text-xs leading-tight">• {subtitle}</p>
    <p className="mt-1 text-xs leading-tight tabular-nums opacity-80">{range}</p>
  </>;
}

export default function BookingPanel({ salon, date, reservations }: { salon: string; date: string; reservations: Reservation[] }) {
  // La selección empieza en la primera hora libre (de preferencia desde las 9:00)
  const [initialStart] = useState(() => {
    const free = (from: number) => !reservations.some((r) => from < minutes(r.end) && from + 60 > minutes(r.start));
    const candidates = [...hours.filter((h) => h >= 9), ...hours.filter((h) => h < 9)].map((h) => h * 60).filter((m) => m + 60 <= calendarEnd);
    return candidates.find(free) ?? 9 * 60;
  });
  const [start, setStart] = useState(timeValue(initialStart));
  const [end, setEnd] = useState(timeValue(initialStart + 60));
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");

  const validRange = minutes(end) > minutes(start) && minutes(start) >= calendarStart && minutes(end) <= calendarEnd;
  const clash = validRange && reservations.some((reservation) => minutes(start) < minutes(reservation.end) && minutes(end) > minutes(reservation.start));
  const selection = place(start, end);

  // Al tocar el calendario se elige una hora a partir de la media hora más cercana hacia abajo
  function pickTime(event: MouseEvent<HTMLDivElement>) {
    const offset = event.clientY - event.currentTarget.getBoundingClientRect().top;
    const raw = calendarStart + (offset / HOUR_HEIGHT) * 60;
    const from = Math.min(calendarEnd - 60, Math.floor(raw / 30) * 30);
    setStart(timeValue(from));
    setEnd(timeValue(from + 60));
  }

  return <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
    <div>
      <div className="grid grid-cols-[48px_1fr]">
        <div className="relative" style={{ height: boardHeight }}>
          {hours.map((hour) => <span key={hour} className="absolute right-3 -translate-y-1/2 text-xs font-medium text-[var(--foreground)]" style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }}>{hour}:00</span>)}
        </div>
        <div role="button" tabIndex={-1} aria-label="Elegir horario" onClick={pickTime} className="relative cursor-pointer border-x-2 border-[var(--foreground)]" style={{ height: boardHeight }}>
          {hours.map((hour) => <div key={hour} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-[#c9c9c9]" style={{ top: (hour - FIRST_HOUR) * HOUR_HEIGHT }} />)}

          {reservations.map((reservation) => {
            const box = place(reservation.start, reservation.end);
            return <div key={reservation.id} onClick={(event) => event.stopPropagation()} className="absolute inset-x-2 z-10 cursor-default overflow-hidden rounded-md bg-[#f2c4ca] px-3 py-2 text-[var(--accent-dark)]" style={{ top: box.top + 1, height: Math.max(box.height - 2, 20) }}>
              <Block title={reservation.reason} subtitle={reservation.kind === "block" ? "Administración" : reservation.name} start={reservation.start} end={reservation.end} height={box.height} />
            </div>;
          })}

          {validRange && <div className={`pointer-events-none absolute inset-x-2 z-20 overflow-hidden rounded-md border-2 bg-[rgba(200,16,46,.06)] px-3 py-2 ${clash ? "border-dashed border-[var(--accent)] bg-transparent" : "border-[var(--accent)] text-[var(--accent-dark)]"}`} style={{ top: selection.top + 1, height: Math.max(selection.height - 2, 20) }}>
            {!clash && <Block title={reason || "Motivo"} subtitle={name || "Nombre"} start={start} end={end} height={selection.height} />}
          </div>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">Toca el calendario para elegir la hora. El recuadro rojo es tu reserva; lo relleno ya está ocupado.</p>
    </div>

    <form action="/api/reservas" method="post" className="lg:sticky lg:top-6 lg:self-start">
      <h2 className="text-2xl font-semibold">Reservar</h2>
      <input type="hidden" name="salon" value={salon} />
      <input type="hidden" name="date" value={date} />
      <div className="mt-6 grid gap-5 text-sm">
        <label>Motivo o grupo<input required name="reason" className="field" placeholder="Grupo de jóvenes, reunión..." value={reason} onChange={(event) => setReason(event.target.value)} /></label>
        <label>Nombre<input required name="name" className="field" placeholder="Tu nombre" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label>Teléfono<input required name="phone" type="tel" className="field" placeholder="81 0000 0000" /></label>
        <div className="grid grid-cols-2 gap-4">
          <label>Inicio<input required name="start" type="time" step={1800} className="field" value={start} onChange={(event) => setStart(event.target.value)} /></label>
          <label>Fin<input required name="end" type="time" step={1800} className="field" value={end} onChange={(event) => setEnd(event.target.value)} /></label>
        </div>
        {clash && <p className="text-xs text-[var(--accent)]">Ese horario se empalma con otra reserva.</p>}
        {!validRange && <p className="text-xs text-[var(--accent)]">Elige un horario entre {FIRST_HOUR}:00 y {LAST_HOUR}:00, con la hora de fin después del inicio.</p>}
        <button disabled={clash || !validRange} className="mt-2 rounded-full bg-[var(--accent)] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-40">Reservar</button>
      </div>
    </form>
  </div>;
}
