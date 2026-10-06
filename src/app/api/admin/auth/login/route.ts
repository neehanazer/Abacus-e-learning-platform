import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import {
  signAdminToken,
  setAdminAuthCookie,
  compareAdminPassword,
  ensureDefaultAdmin,
} from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin email and password are required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    try {
      await connectToDatabase();
      await ensureDefaultAdmin();
    } catch (dbErr) {
      console.warn("[Admin Login]: DB connection issue during login:", dbErr);
    }

    let admin = null;
    try {
      admin = await Admin.findOne({ email: normalizedEmail }).select("+passwordHash");
    } catch (queryErr) {
      console.warn("[Admin Login]: Query failed:", queryErr);
    }

    // If admin found in DB
    if (admin) {
      if (admin.status !== "active") {
        return NextResponse.json(
          {
            success: false,
            error: `Admin account is currently ${admin.status}. Please contact system support.`,
          },
          { status: 403 }
        );
      }

      const isPasswordValid = await compareAdminPassword(
        String(password),
        admin.passwordHash
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid admin email or password.",
          },
          { status: 401 }
        );
      }

      const safeAdmin = admin.toSafeObject();
      const token = signAdminToken({
        adminId: safeAdmin.id,
        email: safeAdmin.email,
        role: "admin",
      });

      const response = NextResponse.json({
        success: true,
        message: "Admin authentication successful.",
        admin: safeAdmin,
        token,
      });

      setAdminAuthCookie(response, token);
      return response;
    }

    // Fallback for default superadmin if DB is empty or Atlas network is offline
    const defaultEmail = (process.env.DEFAULT_ADMIN_EMAIL || "admin@abacus.com").toLowerCase();
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

    if (normalizedEmail === defaultEmail && password === defaultPassword) {
      let resolvedAdminId = "admin_super_001";
      try {
        const existingAdmin = await Admin.findOne({ email: defaultEmail });
        if (existingAdmin) {
          resolvedAdminId = String(existingAdmin._id);
        }
      } catch {
        // Fall back to mockAdminId if DB is inaccessible
      }

      const token = signAdminToken({
        adminId: resolvedAdminId,
        email: defaultEmail,
        role: "admin",
      });

      const safeAdmin = {
        id: resolvedAdminId,
        name: "Abacus Super Admin",
        email: defaultEmail,
        role: "admin" as const,
        status: "active" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = NextResponse.json({
        success: true,
        message: "Admin authentication successful (Root Administrator).",
        admin: safeAdmin,
        token,
      });

      setAdminAuthCookie(response, token);
      return response;
    }

    return NextResponse.json(
      {
        success: false,
        error: "Invalid admin credentials.",
      },
      { status: 401 }
    );
  } catch (error: unknown) {
    console.error("[Admin Login Error]:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
