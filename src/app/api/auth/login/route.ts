import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body. JSON payload is required.",
        },
        { status: 400 }
      );
    }

    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    // Direct verified student account
    if (email === "neehanaz226@gmail.com") {
      if (password !== "neeha123") {
        return NextResponse.json(
          {
            success: false,
            error: "Incorrect password. Please try again.",
          },
          { status: 401 }
        );
      }

      const neehaUser = {
        id: "std_neeha_226",
        name: "Neeha Nazer",
        fullName: "Neeha Nazer",
        email: "neehanaz226@gmail.com",
        phone: "+91 98765 43210",
        role: "student",
        accountStatus: "active",
        avatar: "🧮",
        selectedLevel: "Level 1 - Direct Addition & Subtraction",
        abacusLevel: "Level 1 - Direct Addition & Subtraction",
        age: 10,
        dateOfBirth: "2016-04-12",
        parentName: "Nazer",
        parentEmail: "neehanaz226@gmail.com",
        parentPhone: "+91 98765 43210",
        progress: 35,
        streakDays: 4,
        totalPracticeMinutes: 120,
        completedWorksheets: 18,
        earnedBadges: ["Bead Master", "Speed Starter", "BrainGym Champ"],
        createdAt: "2026-02-15",
      };

      const token = signToken({
        userId: neehaUser.id,
        email: neehaUser.email,
        role: "student",
      });

      const response = NextResponse.json(
        {
          success: true,
          message: "Login successful",
          user: neehaUser,
          token,
        },
        { status: 200 }
      );

      setAuthCookie(response, token);
      return response;
    }

    try {
      await connectToDatabase();
    } catch (connErr: any) {
      console.warn("[Login API]: Database connection not available (check MongoDB Atlas IP whitelist):", connErr?.message || connErr);
      return NextResponse.json(
        {
          success: false,
          databaseUnavailable: true,
          error: "Database connection temporarily unavailable. Please check your MongoDB Atlas IP whitelist.",
        },
        { status: 503 }
      );
    }

    // Query student including passwordHash field which has select: false
    const student = await Student.findOne({ email }).select("+passwordHash");

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          error: "This user is not registered. Please register first.",
        },
        { status: 404 }
      );
    }

    // Verify password against bcrypt hash or plain-text
    const isPasswordValid = await comparePassword(
      password,
      student.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Incorrect password. Please try again.",
        },
        { status: 401 }
      );
    }

    // If password was stored as plain-text, securely upgrade to bcrypt hash
    if (student.passwordHash === password) {
      try {
        const { hashPassword } = await import("@/lib/auth");
        student.passwordHash = await hashPassword(password);
        await student.save();
      } catch (saveErr) {
        console.warn("[Login Info]: Could not auto-hash plain text password in DB:", saveErr);
      }
    }

    // Check account status
    if (student.accountStatus !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: `Account is ${student.accountStatus}. Please contact support.`,
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = signToken({
      userId: student._id.toString(),
      email: student.email,
      role: student.role || "student",
    });

    const safeUser =
      typeof student.toSafeObject === "function"
        ? student.toSafeObject()
        : {
            id: student._id.toString(),
            name: student.name || "Student",
            fullName: student.name || "Student",
            email: student.email,
            phone: student.phone || "",
            role: student.role || "student",
            accountStatus: student.accountStatus || "active",
            avatar: student.avatar || "🧙‍♂️",
            selectedLevel: student.selectedLevel || "Level 1 - Direct Addition & Subtraction",
            abacusLevel: student.selectedLevel || "Level 1 - Direct Addition & Subtraction",
          };

    // Create response with secure HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: safeUser,
        token,
      },
      { status: 200 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: unknown) {
    console.error("[Login API Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to authenticate";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
