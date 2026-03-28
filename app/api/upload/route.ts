import { NextRequest, NextResponse } from "next/server";
import imagekit from "@/lib/imagekit";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "blog-images";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await imagekit.upload({
      file: buffer,
      fileName: `${Date.now()}-${file.name}`,
      folder: `/${folder}`,
    });

    return NextResponse.json({
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
