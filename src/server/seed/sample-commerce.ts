/* eslint-disable no-console */
import { getDb } from "../db/client";
import { customers, orders, orderItems, products, counters } from "../db/schema";
import { sql } from "drizzle-orm";

export async function seedSampleCommerce() {
  const db = getDb();

  // Check if customers or orders already exist
  const [existingCustomers] = await db.select({ count: sql<number>`count(*)::int` }).from(customers);
  if (existingCustomers && existingCustomers.count > 0) {
    console.log("Sample commerce already seeded, skipping.");
    return;
  }

  console.log("Seeding realistic business customers and orders...");

  // 1. Get existing products
  const liveProducts = await db.select().from(products);
  const charcoal = liveProducts.find((p) => p.category === "charcoal") || liveProducts[0];
  const stove = liveProducts.find((p) => p.category === "stove") || liveProducts[0];
  const seeds = liveProducts.find((p) => p.category === "seeds") || liveProducts[0];
  const manure = liveProducts.find((p) => p.category === "manure") || liveProducts[0];

  // 2. Insert realistic business customers
  const customerData = [
    { name: "Mbeya Peak Hotel & Restaurant", phone: "+255758100201", email: "info@mbeyapeakhotel.co.tz", address: "Uhuru Street, Mbeya Mjini", notes: "Wanatumia mkaa kwa kuchoma nyama na majiko makubwa" },
    { name: "Mama Neema Catering Services", phone: "+255754900102", email: "neema.catering@gmail.com", address: "Soweto, Mbeya", notes: "Mteja wa kila wiki mifuko ya 25kg" },
    { name: "Shule ya Sekondari Iyunga", phone: "+255713400501", email: "bursar@iyungasecondary.ac.tz", address: "Iyunga, Mbeya", notes: "Jiko kubwa la kuchemshia chakula cha wanafunzi" },
    { name: "Kijiji cha Kilimo Utengule", phone: "+255762300401", email: "utengule.farmers@gmail.com", address: "Utengule Usangu, Mbeya", notes: "Ununuzi wa mbegu za mbono na mbolea ya mboji" },
    { name: "Rashid Juma Mwashiuya", phone: "+255788500601", email: "rashid.mwashiuya@gmail.com", address: "Forest Mpya, Mbeya", notes: "Matumizi ya nyumbani, mkaa kilo 5 na jiko sanifu" },
    { name: "Southern Highlands Poultry Farm", phone: "+255755600701", email: "highlands.poultry@gmail.com", address: "Mbalizi, Mbeya", notes: "Mkaa wa kupashia joto vifaranga vya kuku bila moshi" },
  ];

  const insertedCustomers = await db.insert(customers).values(customerData).returning();

  // 3. Prepare order templates
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const sampleOrders = [
    {
      custIdx: 0,
      daysAgo: 2,
      status: "completed" as const,
      source: "whatsapp" as const,
      address: "Mbeya Peak Hotel, Uhuru Street",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 10, price: 25000 },
        { product: stove, name: "Jiko Sanifu la Kisasa (Ukubwa wa Kati)", qty: 2, price: 45000 },
      ],
    },
    {
      custIdx: 1,
      daysAgo: 4,
      status: "completed" as const,
      source: "phone" as const,
      address: "Soweto, Mbeya",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 4, price: 25000 },
      ],
    },
    {
      custIdx: 2,
      daysAgo: 7,
      status: "completed" as const,
      source: "walk_in" as const,
      address: "Iyunga Secondary, Mbeya",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 20, price: 25000 },
        { product: stove, name: "Jiko Sanifu la Kisasa (Taasisi Kubwa)", qty: 1, price: 120000 },
      ],
    },
    {
      custIdx: 3,
      daysAgo: 10,
      status: "completed" as const,
      source: "website_message" as const,
      address: "Utengule Usangu Farm",
      items: [
        { product: seeds, name: "Mbegu Bora za Mbono (Jatropha Seeds - Kilo 1)", qty: 25, price: 5000 },
        { product: manure, name: "Mboji Asilia (Organic Compost - Mfuko 50kg)", qty: 10, price: 15000 },
      ],
    },
    {
      custIdx: 4,
      daysAgo: 12,
      status: "completed" as const,
      source: "website_message" as const,
      address: "Forest Mpya, Mbeya",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Kifungashio Kilo 5)", qty: 3, price: 6000 },
        { product: stove, name: "Jiko Sanifu la Nyumbani (Jiko Bora)", qty: 1, price: 35000 },
      ],
    },
    {
      custIdx: 5,
      daysAgo: 15,
      status: "completed" as const,
      source: "whatsapp" as const,
      address: "Mbalizi Poultry Project",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 12, price: 25000 },
      ],
    },
    {
      custIdx: 0,
      daysAgo: 18,
      status: "completed" as const,
      source: "whatsapp" as const,
      address: "Mbeya Peak Hotel, Uhuru Street",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 8, price: 25000 },
      ],
    },
    {
      custIdx: 1,
      daysAgo: 22,
      status: "completed" as const,
      source: "phone" as const,
      address: "Soweto Mbeya",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 5, price: 25000 },
      ],
    },
    {
      custIdx: 3,
      daysAgo: 25,
      status: "completed" as const,
      source: "walk_in" as const,
      address: "Utengule Usangu",
      items: [
        { product: manure, name: "Mboji Asilia (Organic Compost - Mfuko 50kg)", qty: 20, price: 15000 },
      ],
    },
    {
      custIdx: 4,
      daysAgo: 1,
      status: "in_delivery" as const,
      source: "whatsapp" as const,
      address: "Forest Mpya Mbeya",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 2, price: 25000 },
      ],
    },
    {
      custIdx: 5,
      daysAgo: 0,
      status: "confirmed" as const,
      source: "phone" as const,
      address: "Mbalizi Farm",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 15, price: 25000 },
      ],
    },
    {
      custIdx: 2,
      daysAgo: 0,
      status: "new" as const,
      source: "website_message" as const,
      address: "Iyunga Secondary",
      items: [
        { product: charcoal, name: "Mkaa Safi wa Mbono (Mfuko wa Kilo 25)", qty: 10, price: 25000 },
        { product: stove, name: "Jiko Sanifu la Kisasa (Ukubwa wa Kati)", qty: 1, price: 45000 },
      ],
    },
  ];

  let orderSeq = 1;
  const year = new Date().getFullYear();

  for (const item of sampleOrders) {
    const cust = insertedCustomers[item.custIdx]!;
    const orderCreatedAt = new Date(now - item.daysAgo * dayMs);
    const code = `MN-${year}-${String(orderSeq).padStart(4, "0")}`;
    orderSeq++;

    const totalTzs = item.items.reduce((sum, line) => sum + line.qty * line.price, 0);

    const [orderRecord] = await db
      .insert(orders)
      .values({
        code,
        customerId: cust.id,
        status: item.status,
        source: item.source,
        deliveryAddress: item.address,
        notes: `Sample order from ${item.source}`,
        totalTzs,
        createdAt: orderCreatedAt,
        updatedAt: orderCreatedAt,
        completedAt: item.status === "completed" ? new Date(orderCreatedAt.getTime() + 4 * 3600 * 1000) : null,
      })
      .returning();

    if (!orderRecord) continue;

    for (let pos = 0; pos < item.items.length; pos++) {
      const line = item.items[pos]!;
      await db.insert(orderItems).values({
        orderId: orderRecord.id,
        productId: line.product ? line.product.id : null,
        nameSnapshot: line.name,
        position: pos,
        quantity: line.qty,
        unitPriceTzs: line.price,
        lineTotalTzs: line.qty * line.price,
      });
    }
  }

  // Update counters table
  await db
    .insert(counters)
    .values({ key: `order-${year}`, value: orderSeq - 1 })
    .onConflictDoUpdate({ target: counters.key, set: { value: orderSeq - 1 } });

  console.log(`Seeded ${insertedCustomers.length} customers and ${sampleOrders.length} realistic orders successfully!`);
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSampleCommerce()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
