import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    let user = authResult.user;

    if (!user) {
      const { searchParams } = new URL(req.url);
      const queryEmail = searchParams.get("email");
      const queryId = searchParams.get("studentId");
      if (queryEmail || queryId) {
        const { connectToDatabase } = await import("@/lib/mongodb");
        const Student = (await import("@/models/Student")).default;
        await connectToDatabase();
        const found = await Student.findOne({
          $or: [
            ...(queryEmail ? [{ email: queryEmail.toLowerCase() }] : []),
            ...(queryId && queryId.length === 24 ? [{ _id: queryId }] : []),
          ],
        });
        if (found) {
          user = found as any;
        }
      }
    }

    if (!user) {
      return (
        authResult.errorResponse ||
        NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        )
      );
    }

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
