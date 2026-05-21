import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clientId, masterId, price, title, description } = await req.json();

    if (!clientId || !masterId || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Transaction to handle Order creation and fund freezing
    const result = await prisma.$transaction(async (tx) => {
      // Find client
      const client = await tx.user.findFirst({
         where: { firebaseUid: clientId }
      });

      if (!client) throw new Error("Client not found in system");

      // Check balance (Internal Balance Logic)
      if (client.balance < price) {
        throw new Error("Insufficient balance");
      }

      // Find master
      const master = await tx.user.findFirst({
        where: { firebaseUid: masterId }
      });

      if (!master) throw new Error("Master not found in system");

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          title,
          description,
          price: price,
          clientId: client.id,
          masterId: master.id,
          status: "PENDING", // Master needs to accept
        },
      });


      // 3. Subtract from client balance
      await tx.user.update({
        where: { id: client.id },
        data: { balance: { decrement: price } },
      });

      // 4. Create Escrow entry
      await tx.escrow.create({
        data: {
          orderId: order.id,
          amountTotal: price,
          amountFrozen: price,
          status: "FROZEN",
        },
      });

      // 5. Create Transaction record (FROZEN)
      await tx.transaction.create({
        data: {
          userId: client.id,
          orderId: order.id,
          amount: price,
          type: "FROZEN",
          description: `Заморозка средств для заказа: ${title}`,
        },
      });

      return order;
    });

    return NextResponse.json({ success: true, order: result });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
