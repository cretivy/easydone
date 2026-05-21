import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.jobPost.findUnique({
      where: { id },
      include: {
        client: { select: { fullName: true } },
        offers: {
            include: { master: { select: { fullName: true, firebaseUid: true } } },
            orderBy: { createdAt: "desc" }
        }
      }
    });

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
