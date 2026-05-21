import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { jobId, masterId, price, days, message } = await req.json();

    const master = await prisma.user.findUnique({ where: { firebaseUid: masterId } });
    if (!master || master.role !== "MASTER") throw new Error("Faqat ustalar taklif yubora oladi");

    const offer = await prisma.jobOffer.create({
      data: {
        jobId,
        masterId: master.id,
        price: parseFloat(price),
        days: parseInt(days),
        message,
      },
    });

    return NextResponse.json({ success: true, offer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
