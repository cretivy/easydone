import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action, userId } = await req.json(); // userId is the firebaseUid of person taking action
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { escrow: true, client: true, master: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // AUTH CHECK: Make sure the user is either client and master
    if (order.client.firebaseUid !== userId && order.master.firebaseUid !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    switch (action) {
      case "SUBMIT": // Master submits work
        if (order.status !== "IN_PROGRESS") throw new Error("Invalid order status for submission");
        if (order.master.firebaseUid !== userId) throw new Error("Only master can submit work");

        const submittedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: "ON_REVIEW" },
        });
        return NextResponse.json({ success: true, order: submittedOrder });

      case "CONFIRM": // Client confirms work
        if (order.status !== "ON_REVIEW") throw new Error("Order must be under review to confirm");
        if (order.client.firebaseUid !== userId) throw new Error("Only client can confirm work");

        const result = await prisma.$transaction(async (tx) => {
          if (!order.escrow) throw new Error("Escrow data missing");

          const totalAmount = order.escrow.amountFrozen;
          const commission = totalAmount * order.escrow.commissionRate;
          const masterShare = totalAmount - commission;

          // 1. Update Order Status
          await tx.order.update({
            where: { id: orderId },
            data: { status: "COMPLETED" },
          });

          // 2. Update Master Balance (+90%)
          await tx.user.update({
            where: { id: order.masterId },
            data: { balance: { increment: masterShare } },
          });

          // 3. Update Escrow Status
          await tx.escrow.update({
            where: { id: order.escrow.id },
            data: { status: "RELEASED" },
          });

          // 4. Record Transitions
          await tx.transaction.createMany({
            data: [
              {
                userId: order.masterId,
                orderId: order.id,
                amount: masterShare,
                type: "RELEASED",
                description: `Оплата за заказ: ${order.title}`,
              },
              {
                userId: order.clientId, // Logic can vary, usually platform takes it, but we log it under the order
                orderId: order.id,
                amount: commission,
                type: "SERVICE_FEE",
                description: `Комиссия системы (10%) за заказ: ${order.title}`,
              }
            ],
          });

          return { success: true };
        });
        return NextResponse.json(result);

      case "DISPUTE":
         if (order.client.firebaseUid !== userId) throw new Error("Only client can open dispute");
         await prisma.order.update({
             where: { id: orderId },
             data: { status: "UNDER_ARBITRATION" }
         });
         return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
