"use client";

import type { Reservation } from "@/lib/supabase";
import { useState } from "react";

const calendarStart = 7 * 60;
const calendarEnd = 22 * 60;
const hours = Array.from({ length: 16 }, (_, index) => index + 7);

function minutes(time: string) {
  const [hoursPart, minutesPart] = time.split(":").map(Number);
  return hoursPart * 60 + minutesPart;
}

function timeValue(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export default function BookingPanel({ salon, date, reservations }: { salon: string; date: string; reservations: Reservation[] }) {
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const selectionTop = Math.max(0, minutes(start) - calendarStart);
  const selectionHeight = Math.max(30, minutes(end) - minutes(start));

  function selectHour(hour: number) {
    setStart(timeValue(hour * 60));
    setEnd(timeValue(Math.min(hour * 60 + 60, calendarEnd)));
  }

  return <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.2fr]">
    <div>
      <h2 className="text-2xl">Elige un horario</h2>
      <div className="calendar-scroll mt-6 overflow-x-auto border border-[var(--line)]">
        <div className="calendar-board min-w-[300px]">
          <div className="relative grid grid-cols-[52px_1fr]">
            <div>{hours.map((hour) => <div key={hour} className="calendar-hour sans pr-2 text-right text-[10px] text-[var(--muted)]">{String(hour).padStart(2, "0")}:00</div>)}</div>
            <div className="calendar-column relative border-l border-[var(--line)]">
              {hours.map((hour) => <button type="button" aria-label={`Elegir las ${hour}:00`} key={hour} onClick={() => selectHour(hour)} className="calendar-slot block w-full border-b border-[var(--line)] text-left hover:bg-[#f8e6e8]" />)}
              <div className="pointer-events-none absolute left-1 right-1 z-10 border-l-2 border-[var(--accent)] bg-[rgba(200,16,46,.22)]" style={{ top: selectionTop, height: selectionHeight }} />
              {reservations.map((reservation) => { const top = Math.max(0, minutes(reservation.start) - calendarStart); const height = Math.max(30, minutes(reservation.end) - minutes(reservation.start)); return <div key={reservation.id} className="pointer-events-none absolute left-1 right-1 z-20 overflow-hidden border-l-2 border-[var(--accent)] bg-[#f3d9dd] px-2 py-1.5 text-xs leading-tight text-[#7e1828]" style={{ top, height }}><strong className="block">{reservation.reason}</strong><span>{reservation.kind === "block" ? "Administración" : reservation.name}</span><span className="block">{reservation.start}–{reservation.end}</span></div>; })}
            </div>
          </div>
        </div>
      </div>
      <p className="sans mt-4 text-xs text-[var(--muted)]">Toca una hora o escríbela abajo. Rojo transparente = tu selección.</p>
    </div>
    <form action="/api/reservas" method="post" className="border-t-2 border-[var(--foreground)] pt-6">
      <h2 className="text-2xl">Reservar este espacio</h2><input type="hidden" name="salon" value={salon}/><input type="hidden" name="date" value={date}/>
      <div className="sans mt-7 grid gap-5"><label>Nombre<input required name="name" className="field" placeholder="Tu nombre"/></label><label>Teléfono<input required name="phone" className="field" placeholder="55 0000 0000"/></label><label>Motivo o grupo<input required name="reason" className="field" placeholder="Grupo de jóvenes, reunión..."/></label><div className="grid grid-cols-2 gap-4"><label>Inicio<input required name="start" type="time" className="field" value={start} onChange={(event) => setStart(event.target.value)}/></label><label>Fin<input required name="end" type="time" className="field" value={end} onChange={(event) => setEnd(event.target.value)}/></label></div><button className="mt-3 bg-[var(--accent)] px-5 py-4 text-sm font-bold text-white hover:bg-[#a80d26]">Reservar</button></div>
    </form>
  </div>;
}
