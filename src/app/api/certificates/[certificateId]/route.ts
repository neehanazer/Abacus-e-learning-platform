import { NextRequest, NextResponse } from "next/server";
import CertificateService from "@/services/certificateService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ certificateId: string }>;
}

/**
 * GET /api/certificates/[certificateId]
 * Retrieves full certificate details by certificateId or MongoDB _id.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { certificateId } = await params;

    if (!certificateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Certificate ID is required",
        },
        { status: 400 }
      );
    }

    const certificate = await CertificateService.getCertificateById(certificateId);

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          error: `Certificate with ID '${certificateId}' was not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: certificate,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/certificates/[certificateId] Error]:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
