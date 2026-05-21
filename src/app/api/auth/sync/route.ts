import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { uid, email, fullName, role } = await req.json();

    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {
        fullName,
        role: role.toUpperCase(),
      },
      create: {
        firebaseUid: uid,
        email,
        fullName,
        role: role.toUpperCase(),
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error syncing user to Postgres:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
