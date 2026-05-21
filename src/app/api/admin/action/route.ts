export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { type, id, action } = await req.json();

    if (type === "DISPUTE") {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { escrow: true, client: true, master: true },
      });

      if (!order || !order.escrow) throw new Error("Order or Escrow not found");

      if (action === "REFUND_CLIENT") {
        await prisma.$transaction(async (tx) => {
          // 1. Refund client
          await tx.user.update({
            where: { id: order.clientId },
            data: { balance: { increment: order.escrow?.amountTotal || 0 } },
          });

          // 2. Update order and escrow
          await tx.order.update({
            where: { id },
            data: { status: "CANCELLED" },
          });
          await tx.escrow.update({
             where: { id: order.escrow?.id },
             data: { status: "REFUNDED" }
          });

          // 3. Log
          await tx.transaction.create({
            data: {
              userId: order.clientId,
              amount: order.escrow?.amountTotal || 0,
              type: "REFUNDED",
              description: `Арбитраж: Возврат средств по заказу #${id}`,
            },
          });
        });
      } else if (action === "PAY_MASTER") {
        await prisma.$transaction(async (tx) => {
          const total = order.escrow?.amountTotal || 0;
          const commission = total * 0.10;
          const masterShare = total - commission;

          await tx.user.update({
            where: { id: order.masterId },
            data: { balance: { increment: masterShare } },
          });

          await tx.order.update({
            where: { id },
            data: { status: "COMPLETED" },
          });
          await tx.escrow.update({
             where: { id: order.escrow?.id },
             data: { status: "RELEASED" }
          });

          await tx.transaction.create({
            data: {
              userId: order.masterId,
              amount: masterShare,
              type: "RELEASED",
              description: `Арбитраж: Выплата мастеру по заказу #${id}`,
            },
          });
        });
      }
    } else if (type === "PAYOUT") {
      await prisma.payoutRequest.update({
        where: { id },
        data: { status: "PAID", processedAt: new Date() },
      });

      const p = await prisma.payoutRequest.findUnique({ where: { id } });
      if (p) {
          await prisma.transaction.updateMany({
              where: { type: "WITHDRAWAL", amount: p.amount, userId: p.masterId, status: "PENDING" },
              data: { status: "COMPLETED" }
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
