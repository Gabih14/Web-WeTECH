import React, { useEffect } from "react";
import { useDeliverySchedule } from "../../hooks/useDeliverySchedule";
import {
  calculateDeliveryEstimate,
  getZoneLabel,
  type ShippingZone,
} from "../../utils/deliveryEstimate";

interface ShippingInfoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  knownZone?: ShippingZone;
}

const WEEK = [
  { short: "L", day: 1 }, { short: "M", day: 2 },
  { short: "M", day: 3 }, { short: "J", day: 4 },
  { short: "V", day: 5 }, { short: "S", day: 6 },
  { short: "D", day: 0 },
];

const getWeekday = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
};

export const ShippingInfoModal: React.FC<ShippingInfoModalProps> = ({ open, onClose, onConfirm, knownZone }) => {
  const { schedule, error } = useDeliverySchedule();
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);
  if (!open) return null;

  const zones: ShippingZone[] = knownZone ? [knownZone] : ["gran-mendoza", "resto-mendoza"];
  const estimates = schedule
    ? zones.map((zone) => calculateDeliveryEstimate(schedule.now, zone, schedule.config))
    : [];
  const currentWeekday = schedule ? getWeekday(schedule.today) : -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        className="w-full max-w-[390px] rounded-2xl bg-white px-4 py-3.5 text-gray-950 shadow-2xl sm:px-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shipping-info-title"
      >
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-2.5 py-1 text-[12.5px] font-semibold leading-4 text-gray-950">
          <span className="h-2 w-2 rounded-full bg-green-700" aria-hidden="true" />
          Tienda abierta 24/7, todos los días del año
        </div>

        <h2 id="shipping-info-title" className="text-[18px] font-bold leading-6">¿Cuándo llega tu pedido?</h2>
        <p className="mb-2 text-[13px] leading-4 text-gray-700">Si pagás ahora:</p>

        {error && (
          <p className="mb-2 rounded-lg bg-gray-100 px-3 py-2 text-[13px] text-gray-800">
            No pudimos consultar el horario del servidor. Intentá nuevamente.
          </p>
        )}
        {!schedule && !error && (
          <p className="mb-2 rounded-lg bg-gray-100 px-3 py-2 text-[13px] text-gray-700" aria-live="polite">
            Calculando la entrega…
          </p>
        )}

        <div className="space-y-1.5" aria-live="polite">
          {estimates.map((estimate) => (
            <article
              key={estimate.zone}
              className={`rounded-xl border px-3 py-2 ${estimate.highlighted ? "border-yellow-500 bg-primary" : "border-gray-300 bg-gray-100"}`}
            >
              <p className="text-[11px] font-bold uppercase leading-3 tracking-[0.08em] text-gray-800">
                {getZoneLabel(estimate.zone)}
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[20px] font-extrabold leading-6">{estimate.answer}</p>
                <p className="text-right text-[13px] leading-4 text-gray-800">{estimate.explanation}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="mb-1 mt-2.5 text-[11px] font-bold uppercase leading-4 tracking-[0.08em] text-gray-700">
          Los envíos salen estos días
        </p>
        <div className="grid grid-cols-7 gap-1.5" aria-label="Días con despacho">
          {WEEK.map(({ short, day }) => {
            const isSaturday = day === 6;
            const isSunday = day === 0;
            const isToday = day === currentWeekday;
            return (
              <div key={`${short}-${day}`} className="text-center">
                <div
                  className={`flex h-8 items-center justify-center rounded-md border text-[13px] font-bold ${
                    isSunday
                      ? "border-gray-300 bg-gray-200 text-gray-500 line-through"
                      : isSaturday
                        ? "border-2 border-yellow-500 bg-white text-gray-950"
                        : "border-yellow-500 bg-primary text-gray-950"
                  } ${isToday ? "ring-2 ring-gray-950 ring-offset-1" : ""}`}
                  aria-current={isToday ? "date" : undefined}
                >
                  {short}
                </div>
                <span className="mt-0.5 block h-3 text-[10px] font-semibold leading-3 text-gray-700">
                  {isSaturday ? "13 h" : ""}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-1 text-[12.5px] leading-[17px] text-gray-800">
          <p><strong>Sábados:</strong> solo Gran Mendoza, hasta las 13 h.</p>
          <p><strong>Domingos y feriados:</strong> no enviamos.</p>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-gray-200 pt-2.5">
          <a
            href="https://wa.me/5492615987988?text=Hola%2C%20tengo%20una%20duda%20con%20mi%20env%C3%ADo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] font-semibold leading-4 text-gray-800"
          >
            ¿Dudas con tu envío? <span className="underline decoration-yellow-500 decoration-2 underline-offset-2">Consultanos</span>
          </a>
          <button
            type="button"
            onClick={onConfirm ?? onClose}
            className="min-h-9 shrink-0 rounded-lg bg-gray-950 px-4 text-[13px] font-bold text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-2"
          >
            Entendido
          </button>
        </div>
      </section>
    </div>
  );
};
