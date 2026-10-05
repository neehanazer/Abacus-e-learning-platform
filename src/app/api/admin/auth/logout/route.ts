import { NextResponse } from "next/server";
import { clearAdminAuthCookie } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Admin logged out successfully.",
  });

  clearAdminAuthCookie(response);
  return response;
}
