import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { uid, email, fullName, role, nickname } = await req.json();


    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        fullName,
        role: role.toUpperCase(),
        nickname: nickname?.toLowerCase() || null,
      },
      create: {
        firebaseUid: uid,
        email,
        fullName,
        role: role.toUpperCase(),
        nickname: nickname?.toLowerCase() || null,
        balance: 1000000, 
      },
    });


    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error syncing user to Postgres:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  if (!uid) return NextResponse.json({ error: "UID missing" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: uid }
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
