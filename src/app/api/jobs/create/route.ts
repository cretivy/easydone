import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { clientId, title, description, category, budget, deadline } = await req.json();

    const user = await prisma.user.findUnique({ where: { firebaseUid: clientId } });
    if (!user) throw new Error("Client not found");

    const job = await prisma.jobPost.create({
      data: {
        title,
        description,
        category,
        budget: parseFloat(budget),
        deadline: parseInt(deadline),
        clientId: user.id,
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
