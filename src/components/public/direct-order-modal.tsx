"use client";

import { useState, useTransition } from "react";
import { createPublicWhatsAppOrder } from "@/server/actions/public-orders";
import { formatTzs } from "@/lib/format";
import type { PublicProduct } from "@/server/services/site";

export type OrderProductSummary = Pick<PublicProduct, "id" | "name" | "category" | "priceTzs" | "priceUnit">;

interface DirectOrderModalProps {
  product: OrderProductSummary;
  buttonLabel?: string;
  buttonClassName?: string;
  defaultPackage?: string;
  initialPackageSize?: string;
}

const CHARCOAL_SIZES = ["100gm", "1 KG", "5 KG", "7 KG", "15 KG", "30 KG"];

export function DirectOrderModal({
  product,
  buttonLabel = "Agiza Sasa",
  buttonClassName = "btn-product",
  defaultPackage,
  initialPackageSize,
}: DirectOrderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isCharcoal = product.category === "charcoal";
  const [packageSize, setPackageSize] = useState<string>(
    initialPackageSize || defaultPackage || (isCharcoal ? "5 KG" : "Kawaida")
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successOrder, setSuccessOrder] = useState<{
    code: string;
    waUrl: string;
  } | null>(null);

  const unitPrice = product.priceTzs ?? 0;
  const totalPrice = unitPrice > 0 ? unitPrice * quantity : 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Tafadhali weka jina lako kamili.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Tafadhali weka namba yako ya simu ya WhatsApp.");
      return;
    }
    if (!location.trim()) {
      setErrorMsg("Tafadhali weka mahali/mji wa kuletewa mzigo.");
      return;
    }

    startTransition(async () => {
      const res = await createPublicWhatsAppOrder({
        productId: product.id,
        productName: product.name,
        packageSize,
        quantity,
        customerName: name,
        customerPhone: phone,
        deliveryLocation: location,
        notes,
      });

      if (res.ok && res.orderCode && res.whatsappUrl) {
        setSuccessOrder({
          code: res.orderCode,
          waUrl: res.whatsappUrl,
        });
        // Open WhatsApp in new tab automatically
        window.open(res.whatsappUrl, "_blank");
      } else {
        setErrorMsg(res.message || "Hitilafu imetokea. Tafadhali jaribu tena.");
      }
    });
  }

  function handleClose() {
    setIsOpen(false);
    setSuccessOrder(null);
    setErrorMsg("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={buttonClassName}
        style={{ cursor: "pointer" }}
      >
        <span className="inline-flex items-center gap-2">
          <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span>{buttonLabel}</span>
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl text-left border border-slate-200 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Funga"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {successOrder ? (
              <div className="text-center py-4">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-[#0f3d2e] mb-4">
                  <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Oda Yako Imerekodiwa!</h3>
                <p className="mt-1 text-sm font-semibold text-emerald-800">
                  Nambari ya Oda: <span className="font-mono font-black">{successOrder.code}</span>
                </p>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  Oda yako imeingia moja kwa moja kwenye mfumo wetu wa kiwanda. Ukurasa wa WhatsApp unapaswa kuwa umefunguka ili kuthibitisha usafirishaji na malipo na timu yetu.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href={successOrder.waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25d366] hover:bg-[#20ba5a] text-white px-6 py-2.5 text-xs font-bold shadow-md transition-colors"
                  >
                    <span>Fungua WhatsApp Tena</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Nimemaliza
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="border-b border-slate-200 pb-4 mb-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0f3d2e]">
                    <span className="size-2 rounded-full bg-[#22c55e]" />
                    <span>Agiza Moja kwa Moja Kiwandani (WhatsApp)</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {unitPrice > 0 ? (
                      <span className="font-bold text-slate-800">{formatTzs(unitPrice)} / {product.priceUnit || "kifurushi"}</span>
                    ) : (
                      <span className="font-semibold text-slate-600">Bei inathibitishwa kulingana na uzito na usafirishaji</span>
                    )}
                  </p>
                </div>

                {errorMsg ? (
                  <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                    {errorMsg}
                  </div>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Package size selection if charcoal */}
                  {isCharcoal ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Ukubwa wa Kifurushi (Package Size):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CHARCOAL_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setPackageSize(size)}
                            className={`rounded-lg py-2 px-1 text-xs font-bold border transition-colors cursor-pointer text-center ${
                              packageSize === size
                                ? "border-[#0f3d2e] bg-emerald-50 text-[#0f3d2e]"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Quantity selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Idadi (Quantity):
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold text-base text-slate-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="flex size-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
                      {totalPrice > 0 ? (
                        <span className="ml-auto text-sm font-extrabold text-[#0f3d2e]">
                          Jumla: {formatTzs(totalPrice)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Jina Lako Kamili *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="mf. Juma Ally"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0f3d2e] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Namba ya Simu (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="mf. 0758 123 456"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0f3d2e] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Eneo / Mji wa Kuletewa Mzigo *
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="mf. Mbeya mjini, Mwanjelwa au Dar es Salaam"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0f3d2e] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Maelezo ya Ziada (Hiari)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="mf. Nahitaji usafirishaji wa haraka leo jioni..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-[#0f3d2e] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-full bg-[#0e5c33] hover:bg-[#093e22] text-white py-3 text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isPending ? (
                        <span>Inatuma Oda Kiwandani...</span>
                      ) : (
                        <>
                          <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                          </svg>
                          <span>Kamilisha Oda WhatsApp</span>
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-center text-[11px] text-slate-500">
                      Oda inahifadhiwa kwenye kumbukumbu za kiwanda na kufungua WhatsApp papo hapo.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
