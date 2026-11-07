"use client";

import { useState } from "react";
import { whatsappLink } from "@/lib/contact-links";
import { formatTzs } from "@/lib/format";
import type { Locale } from "@/messages/i18n";

type UsageTier = {
  id: string;
  labelSw: string;
  labelEn: string;
  descSw: string;
  descEn: string;
  traditionalCost: number;
  mnyalaCost: number;
  bagsRecommended: number;
};

const TIERS: UsageTier[] = [
  {
    id: "home",
    labelSw: "Matumizi ya Nyumbani",
    labelEn: "Household / Home Cooking",
    descSw: "Familia ya watu 3 hadi 6, mapishi ya kila siku",
    descEn: "Family of 3 to 6, daily domestic meals",
    traditionalCost: 80000,
    mnyalaCost: 50000,
    bagsRecommended: 2,
  },
  {
    id: "restaurant",
    labelSw: "Mgahawa / Nyama Choma",
    labelEn: "Restaurant / BBQ & Grills",
    descSw: "Kupika chakula cha wateja, kukaanga chipsi na kuchoma",
    descEn: "Commercial kitchen, grilling and high heat cooking",
    traditionalCost: 350000,
    mnyalaCost: 200000,
    bagsRecommended: 8,
  },
  {
    id: "institution",
    labelSw: "Hoteli, Shule & Taasisi",
    labelEn: "Hotels, Schools & Institutions",
    descSw: "Maelfu ya milo kwa siku, kuchemsha na kupika kwa wingi",
    descEn: "Large scale bulk cooking and boarding facilities",
    traditionalCost: 1200000,
    mnyalaCost: 700000,
    bagsRecommended: 28,
  },
  {
    id: "poultry",
    labelSw: "Ufugaji wa Kuku (Brooding)",
    labelEn: "Poultry Farming & Brooding",
    descSw: "Kupasha vifaranga joto la usiku masaa 8 bila moshi",
    descEn: "Clean overnight chick brooding warmth with zero smoke",
    traditionalCost: 400000,
    mnyalaCost: 250000,
    bagsRecommended: 10,
  },
];

export function SavingsCalculator({ whatsapp, locale = "sw" }: { whatsapp?: string; locale?: Locale }) {
  const [selectedId, setSelectedId] = useState("home");
  const isSw = locale === "sw";

  const tier: UsageTier = TIERS.find((t) => t.id === selectedId) ?? TIERS[0]!;
  const monthlySavings = tier.traditionalCost - tier.mnyalaCost;

  const waText = isSw
    ? `Habari Mnyala, nimepiga hesabu ya ${tier.labelSw}. Nahitaji takriban mifuko ${tier.bagsRecommended} ya 25kg kwa mwezi. Naomba bei na maelekezo ya kuletewa mzigo.`
    : `Hello Mnyala, I used your calculator for ${tier.labelEn}. I need approximately ${tier.bagsRecommended} 25kg bags monthly. Please send me pricing and delivery details.`;

  const waHref = whatsapp ? whatsappLink(whatsapp, waText) : "#";

  return (
    <div className="rounded-3xl border border-line bg-surface p-6 sm:p-10 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/80 pb-5">
        <div>
          <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            {isSw ? "Kikokotoo cha Gharama za Nishati" : "Energy Savings Estimator"}
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {isSw ? "Hesabu Kiasi Utakachookoa Kila Mwezi" : "Calculate Your Monthly Fuel Savings"}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {isSw
              ? "Chagua aina ya matumizi yako uone jinsi mkaa wa mbono unavyookoa hadi 40% ya fedha zako."
              : "Select your usage profile to see how much money you save compared to traditional wood charcoal."}
          </p>
        </div>
      </div>

      {/* Tier Selector Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TIERS.map((t) => {
          const active = t.id === selectedId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className={`rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                active
                  ? "border-emerald-600 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-600/20"
                  : "border-line bg-paper hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <p className={`text-sm font-bold ${active ? "text-emerald-950" : "text-ink"}`}>
                {isSw ? t.labelSw : t.labelEn}
              </p>
              <p className="mt-1 text-xs text-muted line-clamp-2">
                {isSw ? t.descSw : t.descEn}
              </p>
            </button>
          );
        })}
      </div>

      {/* Output Comparison Panel */}
      <div className="mt-8 rounded-2xl bg-slate-900 p-6 sm:p-8 text-white shadow-md">
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-slate-400">
              {isSw ? "Gharama ya Mkaa wa Kawaida wa Kuni" : "Traditional Charcoal Cost"}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-300 line-through">
              {formatTzs(tier.traditionalCost)} / {isSw ? "mwezi" : "mo"}
            </p>
            <span className="mt-1 text-xs text-slate-500 block">
              {isSw ? "Moshi mwingi, unawaka saa 2 tu" : "Heavy smoke, burns only 2 hours"}
            </span>
          </div>

          <div>
            <p className="text-xs font-semibold text-emerald-300">
              {isSw ? "Gharama kwa Mkaa Safi wa Mnyala" : "Mnyala Bio-Charcoal Cost"}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {formatTzs(tier.mnyalaCost)} / {isSw ? "mwezi" : "mo"}
            </p>
            <span className="mt-1 text-xs text-emerald-300/80 block">
              {isSw ? `Mifuko ~${tier.bagsRecommended} ya 25kg (Saa 6+ za moto)` : `~${tier.bagsRecommended} bags of 25kg (6+ hrs burn)`}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-800/50 p-4 border border-emerald-600/40">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              {isSw ? "Fedha Unazookoa Kila Mwezi" : "Your Monthly Savings"}
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              {formatTzs(monthlySavings)}
            </p>
            <p className="mt-1 text-xs text-emerald-200 font-semibold">
              {isSw ? "Okoa hadi 40% ya gharama zako!" : "Save up to 40% on energy costs!"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-5">
          <p className="text-xs text-slate-300 max-w-md">
            {isSw
              ? "Uwasilishaji unafanyika kwa wakati Mbeya mjini na mikoani kote Tanzania."
              : "Prompt commercial deliveries across Mbeya, Dar es Salaam, Dodoma and upcountry."}
          </p>
          {whatsapp ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-emerald-600 active:scale-98 transition-all no-underline"
            >
              <span>{isSw ? "Agiza Kiasi Hiki WhatsApp" : "Order This Volume on WhatsApp"}</span>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
