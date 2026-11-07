import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/admin/print-button";
import { formatDate, formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { getOrderAdmin } from "@/server/services/orders-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const order = await getOrderAdmin(db, id);
  return { title: order ? `Print ${order.code} - Mnyala Co. Ltd` : "Print Order" };
}

export default async function PrintOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole("staff", "/admin/orders");
  const { id } = await params;
  const db = getDb();
  const order = await getOrderAdmin(db, id);
  if (!order) notFound();

  return (
    <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto font-sans print:p-0 print:max-w-none">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print action toolbar for browser */}
      <div className="no-print mb-8 flex items-center justify-between border-b pb-4">
        <div>
          <p className="font-semibold text-lg">Mnyala Co. Ltd &bull; Order Document</p>
          <p className="text-sm text-gray-500">A4 printable format for delivery note or invoice.</p>
        </div>
        <PrintButton />
      </div>

      {/* Invoice Header */}
      <div className="flex items-start justify-between border-b-2 border-emerald-900 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-950 font-serif">MNYALA CO. LTD</h1>
          <p className="text-sm text-gray-600 mt-1">Mkaa Endelevu &bull; Majiko Banifu &bull; Miche ya Miti &bull; Mboji Asilia</p>
          <p className="text-xs text-gray-500 mt-1">Mbeya Mjini, Mbeya, Tanzania</p>
          <p className="text-xs text-gray-500">Simu: +255 758 730 108 &bull; Email: info@mnyala.co.tz</p>
        </div>
        <div className="text-right">
          <span className="inline-block rounded border border-emerald-800 bg-emerald-50 px-3 py-1 font-mono text-sm font-bold text-emerald-900">
            {order.code}
          </span>
          <p className="text-xs text-gray-500 mt-2">Tarehe / Date:</p>
          <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
          <p className="text-xs text-gray-500 mt-1">Hali / Status: <span className="font-semibold capitalize">{order.status.replace("_", " ")}</span></p>
        </div>
      </div>

      {/* Customer & Delivery Information */}
      <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
        <div className="rounded border border-gray-200 p-4">
          <p className="font-bold text-xs uppercase text-gray-500 mb-1">Mteja / Customer</p>
          <p className="font-bold text-base text-gray-900">{order.customerName}</p>
          {order.customerPhone ? <p className="font-mono text-gray-700 mt-1">Simu: {order.customerPhone}</p> : null}
          {order.customerEmail ? <p className="text-gray-700">{order.customerEmail}</p> : null}
          {order.customerAddress ? <p className="text-gray-600 mt-1">Anwani: {order.customerAddress}</p> : null}
        </div>

        <div className="rounded border border-gray-200 p-4">
          <p className="font-bold text-xs uppercase text-gray-500 mb-1">Eneo la Kufikisha / Delivery Location</p>
          <p className="text-gray-900 font-medium">{order.deliveryAddress || "Ofisini / Kukabidhiwa moja kwa moja"}</p>
          <p className="font-bold text-xs uppercase text-gray-500 mt-3 mb-1">Chanzo / Order Source</p>
          <p className="text-gray-700 capitalize">{order.source.replace("_", " ")}</p>
        </div>
      </div>

      {/* Order Items Table */}
      <table className="w-full border-collapse mb-6 text-sm">
        <thead>
          <tr className="border-b-2 border-gray-800 bg-gray-50 text-left">
            <th className="py-2.5 px-3 font-bold text-gray-700 w-12">#</th>
            <th className="py-2.5 px-3 font-bold text-gray-700">Bidhaa / Item Description</th>
            <th className="py-2.5 px-3 font-bold text-gray-700 text-center w-24">Idadi / Qty</th>
            <th className="py-2.5 px-3 font-bold text-gray-700 text-right w-36">Bei / Unit Price</th>
            <th className="py-2.5 px-3 font-bold text-gray-700 text-right w-40">Jumla / Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {order.items.map((it, idx) => (
            <tr key={it.id}>
              <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
              <td className="py-3 px-3 font-medium text-gray-900">{it.nameSnapshot}</td>
              <td className="py-3 px-3 text-center">{it.quantity}</td>
              <td className="py-3 px-3 text-right font-mono">{formatTzs(it.unitPriceTzs)}</td>
              <td className="py-3 px-3 text-right font-bold font-mono">{formatTzs(it.lineTotalTzs)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-800">
            <td colSpan={4} className="py-4 px-3 text-right font-bold text-base">
              JUMLA KUU / GRAND TOTAL:
            </td>
            <td className="py-4 px-3 text-right font-bold text-xl text-emerald-900 font-mono">
              {formatTzs(order.totalTzs)}
            </td>
          </tr>
        </tfoot>
      </table>

      {order.notes ? (
        <div className="rounded border border-gray-200 p-3 mb-8 text-xs text-gray-600">
          <p className="font-bold text-gray-700 mb-1">Maelezo ya Ziada / Notes:</p>
          <p className="whitespace-pre-wrap">{order.notes}</p>
        </div>
      ) : null}

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-gray-300 text-xs text-gray-600">
        <div>
          <p className="font-bold text-gray-700 mb-8">Aliyeandaa / Prepared By:</p>
          <div className="border-b border-gray-400 w-48 mb-1"></div>
          <p>Mnyala Co. Ltd &bull; Saini na Tarehe</p>
        </div>
        <div>
          <p className="font-bold text-gray-700 mb-8">Mpokeaji / Received By:</p>
          <div className="border-b border-gray-400 w-48 mb-1"></div>
          <p>Mteja / Saini na Tarehe</p>
        </div>
      </div>
    </div>
  );
}
