import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId"); // firebaseUid

  if (!userId) {
    return NextResponse.json({ error: "UserId required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findFirst({
        where: { firebaseUid: userId }
    });

    if (!user) return NextResponse.json({ orders: [] });

    const orders = await prisma.order.findMany({
      where: {
        OR: [{ clientId: user.id }, { masterId: user.id }],
      },
      include: {
        client: true,
        master: true,
        escrow: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
