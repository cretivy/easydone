import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * KWORK MODEL: Arbitrage Resolution
 * Admin decides:
 * - REFUND_CLIENT: 100% back to Client, Platform takes 0, Master takes 0.
 * - PAY_MASTER: 90% to Master, 10% to Platform.
 */
export async function POST(req: Request) {
  try {
    const { type, id: orderId, action } = await req.json();

    if (type !== "DISPUTE") {
        return NextResponse.json({ error: "Only DISPUTE resolution supported here" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true, client: true, master: true }
    });

    if (!order || !order.escrow) {
        return NextResponse.json({ error: "Order or Escrow not found" }, { status: 404 });
    }

    if (order.status !== "UNDER_ARBITRATION") {
        return NextResponse.json({ error: "Order is not under arbitration" }, { status: 400 });
    }

    const total = order.escrow.amountFrozen;

    const result = await prisma.$transaction(async (tx) => {
      if (action === "REFUND_CLIENT") {
        // 1. Give 100% back to client
        await tx.user.update({
          where: { id: order.clientId },
          data: { balance: { increment: total } }
        });

        // 2. Update statuses
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" }
        });
        await tx.escrow.update({
          where: { id: order.escrow!.id },
          data: { status: "REFUNDED" }
        });

        // 3. Record transaction
        await tx.transaction.create({
          data: {
            userId: order.clientId,
            orderId: order.id,
            amount: total,
            type: "REFUND",
            description: `Arbitraj bo'yicha to'liq qaytarib berildi: ${order.title}`
          }
        });

      } else if (action === "PAY_MASTER") {
        const commission = total * 0.10;
        const masterNet = total - commission;

        // 1. Give 90% to master
        await tx.user.update({
          where: { id: order.masterId },
          data: { balance: { increment: masterNet } }
        });

        // 2. Update statuses
        await tx.order.update({
          where: { id: orderId },
          data: { status: "COMPLETED" }
        });
        await tx.escrow.update({
          where: { id: order.escrow!.id },
          data: { status: "RELEASED" }
        });

        // 3. Record Transactions
        await tx.transaction.create({
          data: {
            userId: order.masterId,
            orderId: order.id,
            amount: masterNet,
            type: "RELEASED",
            description: `Arbitraj bo'yicha masterga to'lab berildi: ${order.title}`
          }
        });
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Admin Resolution Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
