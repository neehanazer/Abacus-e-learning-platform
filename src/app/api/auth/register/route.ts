import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
import {
  hashPassword,
  validatePasswordStrength,
  isGmailAddress,
  isValidPhoneNumber,
  signToken,
  setAuthCookie,
} from "@/lib/auth";

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

    // Support both direct parameter names and frontend aliases
    const name = (body.name || body.fullName || "").trim();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    const rawAge = body.age;
    const guardianName = (body.guardianName || body.parentName || "").trim();
    const guardianPhone = (body.guardianPhone || body.parentPhone || "").trim();
    const phone = (body.phone || "").trim();
    const dateOfBirth = body.dateOfBirth || "";
    const avatar = body.avatar || "🧙‍♂️";

    // Every user automatically starts from Level 1
    const selectedLevel = "Level 1 - Direct Addition & Subtraction";

    // 1. Missing required fields check (selectedLevel is now automatically defaulted)
    const missingFields: string[] = [];
    if (!name) missingFields.push("name");
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    if (rawAge === undefined || rawAge === null || rawAge === "") missingFields.push("age");
    if (!guardianName) missingFields.push("guardianName");
    if (!guardianPhone) missingFields.push("guardianPhone");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 2. Email validation - MUST be @gmail.com
    if (!isGmailAddress(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Email must be a valid @gmail.com address (e.g. yourname@gmail.com).",
        },
        { status: 400 }
      );
    }

    // 3. Phone number validation
    if (!isValidPhoneNumber(guardianPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Guardian phone number is invalid. Please enter a valid 10-15 digit phone number (e.g., 9876543210 or +1 555 234 5678).",
        },
        { status: 400 }
      );
    }

    if (phone && !isValidPhoneNumber(phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Student phone number is invalid. Please enter a valid 10-15 digit phone number.",
        },
        { status: 400 }
      );
    }

    // 4. Age validation
    const age = Number(rawAge);
    if (isNaN(age) || !Number.isInteger(age) || age < 3 || age > 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid age. Age must be a whole number between 3 and 100.",
        },
        { status: 400 }
      );
    }

    // 5. Weak password validation
    const pwdStrength = validatePasswordStrength(password);
    if (!pwdStrength.valid) {
      return NextResponse.json(
        {
          success: false,
          error: pwdStrength.message || "Password is too weak.",
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();

    // 6. Duplicate email check
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists.",
        },
        { status: 409 }
      );
    }

    // 7. Hash the password before saving
    const passwordHash = await hashPassword(password);

    // 8. Create the student record
    const newStudent = await Student.create({
      name,
      email,
      phone,
      passwordHash,
      dateOfBirth,
      age,
      selectedLevel,
      guardianName,
      guardianPhone,
      role: "student",
      accountStatus: "active",
      avatar,
      progress: 0,
      streakDays: 0,
      totalPracticeMinutes: 0,
      completedWorksheets: 0,
      earnedBadges: ["Welcome Explorer"],
    });

    // 9. Generate JWT authentication token
    const token = signToken({
      userId: newStudent._id.toString(),
      email: newStudent.email,
      role: newStudent.role,
    });

    const safeUser = newStudent.toSafeObject();

    // 10. Build response and attach HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: safeUser,
        token,
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: unknown) {
    console.error("[Registration API Error]:", error);

    // Handle MongoDB duplicate key error code 11000
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists.",
        },
        { status: 409 }
      );
    }

    const rawMessage =
      error instanceof Error ? error.message : "Failed to register user";

    let userFriendlyError = rawMessage;
    if (
      rawMessage.toLowerCase().includes("bad auth") ||
      rawMessage.toLowerCase().includes("authentication failed")
    ) {
      userFriendlyError =
        "Database authentication failed. Please verify your MongoDB Atlas username and password in .env.local (Database: 'abacus').";
    }

    return NextResponse.json(
      {
        success: false,
        error: userFriendlyError,
      },
      { status: 500 }
    );
  }
}
