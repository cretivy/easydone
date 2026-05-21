import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  try {
    const jobs = await prisma.jobPost.findMany({
      where: {
        status: "OPEN",
        ...(category && { category }),
      },
      include: {
        client: {
          select: { fullName: true }
        },
        _count: {
          select: { offers: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
