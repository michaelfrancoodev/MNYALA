"use client";

import { useState } from "react";
import { formatTzs } from "@/lib/format";
import { whatsappLink } from "@/lib/contact-links";
import type { Locale } from "@/messages/i18n";

type ProductOption = {
  id: string;
  nameSw: string;
  nameEn: string;
  unitSw: string;
  unitEn: string;
  defaultQty: number;
  calculate: (qty: number) => { unitPrice: number; total: number; savings: number };
};

const PRODUCTS: ProductOption[] = [
  {
    id: "charcoal-25kg",
    nameSw: "Mkaa wa Mbono (Mfuko 25kg)",
    nameEn: "Bio-Charcoal (25kg Bag)",
    unitSw: "mifuko",
    unitEn: "bags",
    defaultQty: 20,
    calculate: (qty: number) => {
      const unitPrice = qty >= 100 ? 22000 : qty >= 20 ? 25000 : 28000;
      const normalPrice = qty * 28000;
      const total = qty * unitPrice;
      return { unitPrice, total, savings: normalPrice - total };
    },
  },
  {
    id: "cookstove",
    nameSw: "Jiko Sanifu la Kisasa",
    nameEn: "Clean Biomass Cookstove",
    unitSw: "majiko",
    unitEn: "stoves",
    defaultQty: 5,
    calculate: (qty: number) => {
      const unitPrice = qty >= 5 ? 38000 : 45000;
      const normalPrice = qty * 45000;
      const total = qty * unitPrice;
      return { unitPrice, total, savings: normalPrice - total };
    },
  },
  {
    id: "seeds",
    nameSw: "Mbegu Bora za Mbono",
    nameEn: "Jatropha Curcas Seeds",
    unitSw: "kilo",
    unitEn: "kg",
    defaultQty: 10,
    calculate: (qty: number) => {
      const unitPrice = qty >= 10 ? 4000 : 5000;
      const normalPrice = qty * 5000;
      const total = qty * unitPrice;
      return { unitPrice, total, savings: normalPrice - total };
    },
  },
  {
    id: "manure",
    nameSw: "Mbolea Asilia ya Mboji (50kg)",
    nameEn: "Organic Bio-Fertilizer (50kg)",
    unitSw: "mifuko",
    unitEn: "bags",
    defaultQty: 10,
    calculate: (qty: number) => {
      const unitPrice = qty >= 10 ? 16000 : 20000;
      const normalPrice = qty * 20000;
      const total = qty * unitPrice;
      return { unitPrice, total, savings: normalPrice - total };
    },
  },
];

const DESTINATIONS = [
  "Mbeya Mjini",
  "Dar es Salaam",
  "Dodoma",
  "Arusha",
  "Mwanza",
  "Morogoro",
  "Iringa",
  "Mkoa Mwingine",
];

export function FastQuoteWidget({
  whatsapp,
  locale = "sw",
}: {
  whatsapp?: string;
  locale?: Locale;
}) {
  const isSw = locale === "sw";
  const [selectedProductId, setSelectedProductId] = useState("charcoal-25kg");
  const [qty, setQty] = useState(20);
  const [destination, setDestination] = useState("Mbeya Mjini");

  const selectedProduct = PRODUCTS.find((p) => p.id === selectedProductId) ?? PRODUCTS[0]!;
  const calc = selectedProduct.calculate(Math.max(1, qty));

  const waMessage = isSw
    ? `Habari Kiwanda cha Mnyala, nahitaji nukuu ya bei ya jumla:\n- Bidhaa: ${selectedProduct.nameSw}\n- Kiasi: ${qty} ${selectedProduct.unitSw}\n- Eneo la kupelekewa: ${destination}\n- Makadirio ya thamani: ${formatTzs(calc.total)}\nNaomba maelekezo ya malipo na usafirishaji.`
    : `Hello Mnyala Factory, I need a bulk wholesale quote:\n- Product: ${selectedProduct.nameEn}\n- Quantity: ${qty} ${selectedProduct.unitEn}\n- Destination: ${destination}\n- Estimated Value: ${formatTzs(calc.total)}\nPlease provide formal quotation and freight details.`;

  const waHref = whatsapp ? whatsappLink(whatsapp, waMessage) : "#";

  return (
    <div className="rounded-lg border-2 border-slate-900 bg-surface p-4 sm:p-5 shadow-md">
      <div className="border-b border-line pb-3">
        <div className="flex items-center justify-between">
          <span className="rounded bg-emerald-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
            {isSw ? "Kiwanda Kilichothibitishwa" : "Verified Manufacturer"}
          </span>
          <span className="text-xs font-semibold text-slate-500">Mbeya Plant</span>
        </div>
        <h3 className="mt-2 text-base font-black text-ink">
          {isSw ? "Kikokotoo cha Bei ya Kiwandani" : "Factory Direct Quote Calculator"}
        </h3>
        <p className="mt-0.5 text-xs text-ink-soft">
          {isSw ? "Chagua mzigo na uone punguzo la jumla papo hapo:" : "Select volume for instant wholesale discount:"}
        </p>
      </div>

      <div className="mt-3.5 space-y-3">
        {/* Product selector */}
        <div>
          <label htmlFor="fast-quote-product" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {isSw ? "Bidhaa:" : "Product:"}
          </label>
          <select
            id="fast-quote-product"
            value={selectedProductId}
            onChange={(e) => {
              const nextId = e.target.value;
              setSelectedProductId(nextId);
              const found = PRODUCTS.find((p) => p.id === nextId);
              if (found) setQty(found.defaultQty);
            }}
            className="mt-1 w-full rounded border border-line bg-paper px-2.5 py-1.5 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
          >
            {PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {isSw ? p.nameSw : p.nameEn}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity selector */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="fast-quote-qty" className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              {isSw ? `Kiasi (${selectedProduct.unitSw}):` : `Quantity (${selectedProduct.unitEn}):`}
            </label>
            <div className="flex items-center gap-1.5">
              {[10, 20, 50, 100].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setQty(quick)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                    qty === quick
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
          <input
            id="fast-quote-qty"
            type="number"
            min="1"
            max="10000"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="mt-1 w-full rounded border border-line bg-paper px-2.5 py-1.5 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
          />
        </div>

        {/* Destination selector */}
        <div>
          <label htmlFor="fast-quote-dest" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
            {isSw ? "Mji wa Kupelekewa:" : "Delivery Destination:"}
          </label>
          <select
            id="fast-quote-dest"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="mt-1 w-full rounded border border-line bg-paper px-2.5 py-1.5 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
          >
            {DESTINATIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Price Output Breakdown */}
        <div className="rounded border border-emerald-300 bg-emerald-50/80 p-2.5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="font-semibold text-slate-700">{isSw ? "Bei kwa Kizio:" : "Unit Price:"}</span>
            <span className="font-bold text-slate-900">{formatTzs(calc.unitPrice)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
              {isSw ? "Jumla ya Makadirio:" : "Estimated Subtotal:"}
            </span>
            <span className="text-base font-black text-emerald-900">{formatTzs(calc.total)}</span>
          </div>
          {calc.savings > 0 ? (
            <p className="mt-1 text-[11px] font-bold text-emerald-800">
              {isSw ? `Umeokoa ${formatTzs(calc.savings)} kwa bei ya jumla!` : `You saved ${formatTzs(calc.savings)} with wholesale pricing!`}
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-slate-500">
              {isSw ? "Agiza mifuko 20+ upate punguzo la jumla." : "Order 20+ units for bulk wholesale discount."}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 pt-1">
          {whatsapp ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded bg-emerald-700 hover:bg-emerald-800 px-3 py-2 text-xs font-bold text-white transition-colors no-underline shadow-xs"
            >
              <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{isSw ? "Tuma Oda WhatsApp (Pata Bei)" : "Send Quote to WhatsApp"}</span>
            </a>
          ) : null}

          <a
            href="#rfq"
            className="flex w-full items-center justify-center rounded border border-slate-300 bg-paper hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 transition-colors no-underline"
          >
            {isSw ? "Omba Ankara Rasmi ya Kodi (RFQ)" : "Request Formal TRA Invoice"}
          </a>
        </div>
      </div>
    </div>
  );
}
