import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const user = authResult.user;

    return NextResponse.json(
      {
        success: true,
        user: user.toSafeObject(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Auth Me API Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve current user";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
