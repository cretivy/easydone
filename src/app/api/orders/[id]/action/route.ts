import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * KWORK MODEL: Order Lifecycle Actions
 * - ACCEPT: Master starts working (PENDING -> IN_PROGRESS)
 * - SUBMIT: Master completes and asks for review (IN_PROGRESS -> ON_REVIEW)
 * - CONFIRM: Client accepts work (ON_REVIEW -> COMPLETED, Funds 90/10)
 * - DISPUTE: Client opens arbitrage (ON_REVIEW -> UNDER_ARBITRATION)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { action, userId } = await req.json(); // userId = firebaseUid
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        escrow: true, 
        client: true, 
        master: true 
      },
    });

    if (!order) return NextResponse.json({ error: "Buyurtma topilmadi" }, { status: 404 });
    const isClient = order.client.firebaseUid === userId;
    const isMaster = order.master.firebaseUid === userId;

    if (!isClient && !isMaster) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

    switch (action) {
      case "ACCEPT":
        if (order.status !== "PENDING") throw new Error("Buyurtma kutilayotgan holatda emas");
        if (!isMaster) throw new Error("Faqat usta buyurtmani qabul qilishi mumkin");
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "IN_PROGRESS" }
        });
        return NextResponse.json({ success: true, message: "Buyurtma qabul qilindi" });

      case "SUBMIT":
        if (order.status !== "IN_PROGRESS") throw new Error("Buyurtma jarayonda emas");
        if (!isMaster) throw new Error("Faqat usta ishni topshirishi mumkin");
        
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "ON_REVIEW" }
        });
        
        // TODO: Trigger chat system message here
        return NextResponse.json({ success: true, message: "Ish tekshiruvga yuborildi" });

      case "CONFIRM":
        if (order.status !== "ON_REVIEW") throw new Error("Buyurtma tekshiruvda emas");
        if (!isClient) throw new Error("Faqat mijoz ishni tasdiqlashi mumkin");

        const txResult = await prisma.$transaction(async (tx) => {
          if (!order.escrow) throw new Error("Escrow topilmadi");

          const total = order.escrow.amountFrozen;
          const commission = total * order.escrow.commissionRate; // Platform 10%
          const masterNet = total - commission; // Master 90%

          // 1. Update statuses
          await tx.order.update({
            where: { id: orderId },
            data: { status: "COMPLETED" }
          });
          await tx.escrow.update({
            where: { id: order.escrow.id },
            data: { status: "RELEASED" }
          });

          // 2. Transfer money to Master
          await tx.user.update({
            where: { id: order.masterId },
            data: { balance: { increment: masterNet } }
          });

          // 3. Record Transactions
          await tx.transaction.create({
            data: {
              userId: order.masterId,
              orderId: order.id,
              amount: masterNet,
              type: "RELEASED",
              description: `Bajarilgan ish uchun to'lov (10% komissiya yechildi): ${order.title}`
            }
          });

          return { success: true };
        });
        return NextResponse.json(txResult);

      case "DISPUTE":
        if (order.status !== "ON_REVIEW") throw new Error("Faqat tekshiruv vaqtida shikoyat qilish mumkin");
        if (!isClient) throw new Error("Faqat mijoz shikoyat qila oladi");

        await prisma.order.update({
          where: { id: orderId },
          data: { status: "UNDER_ARBITRATION" }
        });
        return NextResponse.json({ success: true, message: "Arbitraj boshlandi" });

      default:
        return NextResponse.json({ error: "Noto'g'ri amal" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Action Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
