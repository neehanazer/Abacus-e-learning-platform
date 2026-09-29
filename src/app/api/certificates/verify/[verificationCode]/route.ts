import { NextRequest, NextResponse } from "next/server";
import CertificateService from "@/services/certificateService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ verificationCode: string }>;
}

/**
 * GET /api/certificates/verify/[verificationCode]
 * Public certificate authenticity verification endpoint.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { verificationCode } = await params;

    if (!verificationCode) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: "Verification code is required",
        },
        { status: 400 }
      );
    }

    const verificationResult = await CertificateService.verifyCertificate(verificationCode);

    if (!verificationResult.valid) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          error: verificationResult.error || "Invalid or unrecognized certificate verification code",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        data: verificationResult.certificate,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/certificates/verify/[verificationCode] Error]:", error);

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
