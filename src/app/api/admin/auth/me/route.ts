import { NextRequest, NextResponse } from "next/server";
import { authenticateAdminRoute } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const safeAdmin =
    typeof auth.admin.toSafeObject === "function"
      ? auth.admin.toSafeObject()
      : {
          id: String(auth.admin._id || auth.admin.id),
          name: auth.admin.name,
          email: auth.admin.email,
          role: auth.admin.role,
          status: auth.admin.status,
          createdAt: String(auth.admin.createdAt || ""),
          updatedAt: String(auth.admin.updatedAt || ""),
        };

  return NextResponse.json({
    success: true,
    admin: safeAdmin,
  });
}
