import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import CertificateService from "@/services/certificateService";

export const dynamic = "force-dynamic";

/**
 * GET /api/certificates
 * Retrieves all certificates for the requesting student (or query-specified student).
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const queryLevelId = searchParams.get("levelId") || undefined;

    const targetStudentId = student?._id
      ? student._id.toString()
      : queryStudentId || undefined;

    const certificates = await CertificateService.getCertificates(
      targetStudentId,
      queryLevelId
    );

    return NextResponse.json(
      {
        success: true,
        count: certificates.length,
        data: certificates,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/certificates Error]:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
