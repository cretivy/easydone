import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const disputes = await prisma.order.findMany({
      where: { status: "UNDER_ARBITRATION" },
      include: { client: true, master: true, escrow: true },
    });

    const payouts = await prisma.payoutRequest.findMany({
      where: { status: "PENDING" },
      include: { master: true },
    });

    return NextResponse.json({ disputes, payouts });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
