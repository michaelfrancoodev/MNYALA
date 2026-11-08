"use server";

import { eq } from "drizzle-orm";
import { type Db, getDb } from "@/server/db/client";
import { customers, products } from "@/server/db/schema";
import { createOrder } from "@/server/services/orders-admin";
import { formatTzs } from "@/lib/format";
import { whatsappLink } from "@/lib/contact-links";
import { getSiteSettings } from "@/server/services/site";

export interface DirectOrderInput {
  productId?: string;
  productName: string;
  packageSize?: string;
  quantity: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryLocation: string;
  notes?: string;
}

export interface DirectOrderResult {
  ok: boolean;
  orderId?: string;
  orderCode?: string;
  totalTzs?: number;
  whatsappUrl?: string;
  message?: string;
}

export async function createPublicWhatsAppOrder(input: DirectOrderInput, dbInstance?: Db): Promise<DirectOrderResult> {
  try {
    const db = dbInstance ?? getDb();
    const site = await getSiteSettings();

    const name = input.customerName.trim();
    const phone = input.customerPhone.trim();
    const location = input.deliveryLocation.trim();
    const quantity = Math.max(1, Math.min(1000, Number(input.quantity) || 1));

    if (!name) return { ok: false, message: "Tafadhali weka jina lako kamili." };
    if (!phone) return { ok: false, message: "Tafadhali weka namba yako ya simu." };
    if (!location) return { ok: false, message: "Tafadhali weka eneo au mji wa kuletewa mzigo." };

    // Find or create customer
    let customerId: string;
    const [existingCustomer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.phone, phone))
      .limit(1);

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const [newCustomer] = await db
        .insert(customers)
        .values({
          name,
          phone,
          email: input.customerEmail?.trim() || null,
          address: location,
          notes: "Mteja aliyeweka oda ya haraka kupitia WhatsApp kwenye tovuti.",
        })
        .returning({ id: customers.id });
      customerId = newCustomer!.id;
    }

    // Determine product price
    let unitPrice = 0;
    let productName = input.productName;
    if (input.productId && /^[0-9a-f-]{36}$/i.test(input.productId)) {
      const [dbProduct] = await db
        .select({ id: products.id, name: products.name, priceTzs: products.priceTzs })
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (dbProduct) {
        productName = dbProduct.name;
        if (dbProduct.priceTzs && dbProduct.priceTzs > 0) {
          unitPrice = dbProduct.priceTzs;
        }
      }
    }

    const packageLabel = input.packageSize ? ` (${input.packageSize})` : "";
    const nameSnapshot = `${productName}${packageLabel}`;
    const totalTzs = unitPrice * quantity;

    // Create order using core order service
    const order = await createOrder(db, {
      input: {
        customerId,
        source: "whatsapp",
        deliveryAddress: location,
        notes: input.notes?.trim() || `Oda ya moja kwa moja mtandaoni kwa WhatsApp. Kifurushi: ${input.packageSize || "Standard"}`,
        items: [
          {
            productId: input.productId || null,
            name: nameSnapshot,
            quantity,
            unitPriceTzs: unitPrice,
          },
        ],
      },
    });

    // Format professional WhatsApp order message
    const orderCode = order.code;
    const totalText = totalTzs > 0 ? formatTzs(totalTzs) : "Wasiliana kwa bei ya kiwandani";

    const waText = [
      `*ODA MPYA YA MNYALA CO. LTD (#${orderCode})*`,
      `--------------------------------`,
      `*Bidhaa:* ${nameSnapshot}`,
      `*Idadi:* ${quantity}`,
      `*Jumla:* ${totalText}`,
      `*Mteja:* ${name}`,
      `*Simu:* ${phone}`,
      `*Eneo la Kuletewa:* ${location}`,
      ...(input.notes?.trim() ? [`*Maelezo ya Ziada:* ${input.notes.trim()}`] : []),
      `--------------------------------`,
      `Habari Mnyala! Nimekamilisha oda hii kwenye tovuti. Naomba uthibitisho na maelekezo ya usafirishaji/malipo.`,
    ].join("\n");

    const targetWhatsapp = site.whatsapp || "+255758730108";
    const waUrl = whatsappLink(targetWhatsapp, waText);

    return {
      ok: true,
      orderId: order.id,
      orderCode,
      totalTzs,
      whatsappUrl: waUrl,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Hitilafu imetokea wakati wa kurekodi oda. Tafadhali jaribu tena.",
    };
  }
}
