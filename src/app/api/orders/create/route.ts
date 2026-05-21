import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * KWORK MODEL: Order Creation & Fund Freezing
 * 1. Checks Client Balance
 * 2. Creates Order (Status: PENDING)
 * 3. Deducts money from Client and Freezes it in Escrow
 * 4. Records Transaction
 */
export async function POST(req: Request) {
  try {
    const { clientId, masterId, price, title, description } = await req.json();

    if (!clientId || !masterId || !price || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Client and Master (using firebaseUid)
      const client = await tx.user.findUnique({ where: { firebaseUid: clientId } });
      const master = await tx.user.findUnique({ where: { firebaseUid: masterId } });

      if (!client) throw new Error("Mijoz topilmadi");
      if (!master) throw new Error("Usta topilmadi");

      // 2. Validate Balance
      if (client.balance < price) {
        throw new Error("Balansda mablag' yetarli emas. Iltimos, hisobingizni to'ldiring.");
      }

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          title,
          description,
          price,
          clientId: client.id,
          masterId: master.id,
          status: "PENDING", // Master must accept
        },
      });

      // 4. Freeze Funds (Deduct from client)
      await tx.user.update({
        where: { id: client.id },
        data: { balance: { decrement: price } },
      });

      // 5. Create Escrow Record
      await tx.escrow.create({
        data: {
          orderId: order.id,
          amountTotal: price,
          amountFrozen: price,
          status: "FROZEN",
        },
      });

      // 6. Record Transaction for Client
      await tx.transaction.create({
        data: {
          userId: client.id,
          orderId: order.id,
          amount: -price,
          type: "FROZEN",
          description: `Buyurtma uchun mablag' muzlatildi: ${title}`,
        },
      });

      return order;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error: any) {
    console.error("Order Create Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
