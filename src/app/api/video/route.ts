import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_VIDEO_PATH = "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\abacus-demo.mp4";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const requestedPath = url.searchParams.get("path") || DEFAULT_VIDEO_PATH;

    let targetPath = requestedPath;

    // Check if target exists on filesystem
    if (!fs.existsSync(targetPath)) {
      const baseName = path.basename(requestedPath);
      const publicFallback = path.join(process.cwd(), "public", "videos", baseName);
      if (fs.existsSync(publicFallback)) {
        targetPath = publicFallback;
      } else {
        const defaultFallback = path.join(process.cwd(), "public", "videos", "abacus-demo.mp4");
        if (fs.existsSync(defaultFallback)) {
          targetPath = defaultFallback;
        } else {
          return NextResponse.json(
            { error: "Video file not found", requestedPath },
            { status: 404 }
          );
        }
      }
    }

    const stat = fs.statSync(targetPath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(targetPath, { start, end });
      const webStream = Readable.toWeb(fileStream);

      return new Response(webStream as unknown as BodyInit, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const fileStream = fs.createReadStream(targetPath);
    const webStream = Readable.toWeb(fileStream);

    return new Response(webStream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": fileSize.toString(),
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    console.error("Video stream error:", err);
    return NextResponse.json(
      { error: "Failed to stream video" },
      { status: 500 }
    );
  }
}
