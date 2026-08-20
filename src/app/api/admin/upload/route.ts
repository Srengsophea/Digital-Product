import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    await requireAdmin();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded" },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PNG, JPG, WEBP, GIF, or SVG image." },
        { status: 400 }
      );
    }

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}_${sanitizeName}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to upload file" },
      { status: 500 }
    );
  }
}
