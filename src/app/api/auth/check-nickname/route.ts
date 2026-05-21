import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");

  if (!nickname) return NextResponse.json({ available: false });

  try {
    const user = await prisma.user.findUnique({
      where: { 
        nickname: nickname.toLowerCase(),
      }
    });

    return NextResponse.json({ available: !user });
  } catch (error) {
    return NextResponse.json({ available: false });
  }
}
