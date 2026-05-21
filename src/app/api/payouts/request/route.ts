import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, amount, cardDetails } = await req.json();

    const master = await prisma.user.findFirst({
      where: { firebaseUid: userId, role: "MASTER" },
    });

    if (!master) {
      return NextResponse.json({ error: "Master not found" }, { status: 404 });
    }

    if (master.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create payout request
      const payout = await tx.payoutRequest.create({
        data: {
          masterId: master.id,
          amount,
          cardDetails,
          status: "PENDING",
        },
      });

      // 2. Subtract from balance (Locking funds for withdrawal)
      await tx.user.update({
        where: { id: master.id },
        data: { balance: { decrement: amount } },
      });

      // 3. Log transaction
      await tx.transaction.create({
        data: {
          userId: master.id,
          amount,
          type: "WITHDRAWAL",
          description: `Запрос на вывод средств на карту: ${cardDetails}`,
        },
      });


      return payout;
    });

    return NextResponse.json({ success: true, payout: result });
  } catch (error: any) {
    console.error("Payout request error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
