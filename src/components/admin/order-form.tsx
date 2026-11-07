"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { SelectField, TextAreaField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { formatTzs } from "@/lib/format";
import type { OrderItemInput } from "@/lib/validators/order";
import { createOrderAction, updateOrderItemsAction } from "@/server/actions/orders";

export function OrderForm({
  customers,
  products,
  preselectedCustomerId,
  preselectedMessageId,
  existingOrder,
}: {
  customers: Array<{ id: string; name: string; phone: string | null }>;
  products: Array<{ id: string; name: string; priceTzs: number | null }>;
  preselectedCustomerId?: string;
  preselectedMessageId?: string;
  existingOrder?: {
    id: string;
    code: string;
    customerId: string;
    source: string;
    deliveryAddress: string | null;
    notes: string | null;
    items: Array<{
      productId: string | null;
      nameSnapshot: string;
      quantity: number;
      unitPriceTzs: number;
    }>;
  };
}) {
  const isEditing = Boolean(existingOrder);
  const actionFn = isEditing ? updateOrderItemsAction : createOrderAction;
  const [state, action] = useActionState(actionFn, null);

  const initialItems: OrderItemInput[] = existingOrder?.items?.map((it) => ({
    productId: it.productId,
    name: it.nameSnapshot,
    quantity: it.quantity,
    unitPriceTzs: it.unitPriceTzs,
  })) ?? [
    {
      productId: products[0]?.id ?? null,
      name: products[0]?.name ?? "",
      quantity: 1,
      unitPriceTzs: products[0]?.priceTzs ?? 0,
    },
  ];

  const [items, setItems] = useState<OrderItemInput[]>(initialItems);
  const [customerId, setCustomerId] = useState(
    preselectedCustomerId || existingOrder?.customerId || customers[0]?.id || "",
  );

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        productId: null,
        name: "",
        quantity: 1,
        unitPriceTzs: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, patch: Partial<OrderItemInput>) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it;
        const updated = { ...it, ...patch };
        return updated;
      }),
    );
  }

  function onProductSelect(index: number, productId: string) {
    if (!productId) {
      updateItem(index, { productId: null });
      return;
    }
    const found = products.find((p) => p.id === productId);
    if (found) {
      updateItem(index, {
        productId: found.id,
        name: found.name,
        unitPriceTzs: found.priceTzs ?? 0,
      });
    }
  }

  const grandTotal = items.reduce((sum, it) => sum + (it.quantity || 0) * (it.unitPriceTzs || 0), 0);

  return (
    <form action={action} className="max-w-4xl space-y-6" noValidate>
      {state && !state.ok && state.message ? <Alert tone="error">{state.message}</Alert> : null}
      {existingOrder?.id ? <input type="hidden" name="id" value={existingOrder.id} /> : null}
      <input type="hidden" name="itemsJson" value={JSON.stringify(items)} />
      {preselectedMessageId ? <input type="hidden" name="messageId" value={preselectedMessageId} /> : null}

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Customer"
            name="customerId"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            hint={
              <span>
                Need a new customer?{" "}
                <Link href="/admin/customers/new" target="_blank" className="font-semibold text-brand">
                  Create customer first &rarr;
                </Link>
              </span>
            }
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </SelectField>

          <SelectField label="Order Source" name="source" required defaultValue="phone">
            <option value="phone">Simu (Phone Call)</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="walk_in">Ofisini (Walk-in)</option>
            <option value="website_message">Ujumbe wa Tovuti (Website)</option>
          </SelectField>
        </div>
      ) : null}

      <div className="rounded-lg border border-line bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-lg font-semibold text-ink">Order Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md border border-brand bg-brand-tint px-3 py-1 text-sm font-semibold text-brand-dark hover:bg-brand hover:text-white"
          >
            + Add Line
          </button>
        </div>

        <div className="space-y-4">
          {items.map((it, idx) => {
            const lineTotal = (it.quantity || 0) * (it.unitPriceTzs || 0);
            return (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-md border border-line-strong bg-paper p-3 sm:grid-cols-12 sm:items-end"
              >
                <div className="sm:col-span-4">
                  <label className="block text-xs font-semibold text-muted mb-1">Product from Catalog</label>
                  <select
                    value={it.productId || ""}
                    onChange={(e) => onProductSelect(idx, e.target.value)}
                    className="block w-full rounded border border-line-strong bg-surface px-2 py-1.5 text-sm"
                  >
                    <option value="">-- Custom item --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-muted mb-1">Item Description</label>
                  <input
                    type="text"
                    required
                    value={it.name}
                    onChange={(e) => updateItem(idx, { name: e.target.value })}
                    placeholder="Item name"
                    className="block w-full rounded border border-line-strong bg-surface px-2 py-1.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) || 1 })}
                    className="block w-full rounded border border-line-strong bg-surface px-2 py-1.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted mb-1">Price (TZS)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={it.unitPriceTzs}
                    onChange={(e) => updateItem(idx, { unitPriceTzs: Number(e.target.value) || 0 })}
                    className="block w-full rounded border border-line-strong bg-surface px-2 py-1.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                  <span className="sm:hidden text-xs font-semibold text-ink">{formatTzs(lineTotal)}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    disabled={items.length <= 1}
                    aria-label="Remove item"
                    className="rounded p-1 text-danger hover:bg-danger-tint disabled:opacity-30"
                  >
                    &times;
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-line">
          <div className="text-right">
            <span className="text-sm text-muted">Grand Total: </span>
            <span className="text-2xl font-bold text-brand-dark">{formatTzs(grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextAreaField
          label="Delivery Address (Optional)"
          name="deliveryAddress"
          defaultValue={existingOrder?.deliveryAddress ?? ""}
          placeholder="Specific delivery instructions, neighborhood, or landmark."
          rows={2}
        />

        <TextAreaField
          label="Order Notes (Optional)"
          name="notes"
          defaultValue={existingOrder?.notes ?? ""}
          placeholder="Special requests or payment notes."
          rows={2}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton pendingLabel={isEditing ? "Updating..." : "Creating order..."}>
          {isEditing ? "Update Order Items" : "Create Order"}
        </SubmitButton>
        <Link
          href={existingOrder ? `/admin/orders/${existingOrder.id}` : "/admin/orders"}
          className="rounded-md border border-line-strong bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
