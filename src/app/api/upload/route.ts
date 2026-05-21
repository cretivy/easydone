import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * LOCAL STORAGE API
 * Fayllarni serverning 'public/uploads' papkasiga saqlaydi.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File missing" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Papka mavjudligini tekshirish
    const uploadDir = join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    // Unique nom berish
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const path = join(uploadDir, fileName);

    await writeFile(path, buffer);

    // Public URL-ni qaytarish
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error("Local Upload Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
