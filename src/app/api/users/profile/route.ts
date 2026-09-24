import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute, isValidPhoneNumber } from "@/lib/auth";
import Student from "@/models/Student";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/profile
 * Returns the authenticated user's safe profile
 */
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
        profile: user.toSafeObject(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Get Profile Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve profile";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/profile
 * Updates the authenticated user's profile information
 */
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
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

    // Explicitly reject prohibited fields
    if ("role" in body) {
      delete body.role; // Prevent privilege escalation
    }
    if ("accountStatus" in body) {
      delete body.accountStatus;
    }
    if ("password" in body || "passwordHash" in body) {
      delete body.password;
      delete body.passwordHash;
    }

    // Update name / fullName
    const updatedName = body.name !== undefined ? body.name : body.fullName;
    if (updatedName !== undefined) {
      const trimmed = String(updatedName).trim();
      if (trimmed.length < 2) {
        return NextResponse.json(
          {
            success: false,
            error: "Name must be at least 2 characters long.",
          },
          { status: 400 }
        );
      }
      student.name = trimmed;
    }

    // Update email if provided
    if (body.email !== undefined) {
      const newEmail = String(body.email).toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: "Please provide a valid email address.",
          },
          { status: 400 }
        );
      }

      if (newEmail !== student.email) {
        await connectToDatabase();
        const emailTaken = await Student.findOne({ email: newEmail });
        if (emailTaken && emailTaken._id.toString() !== student._id.toString()) {
          return NextResponse.json(
            {
              success: false,
              error: "An account with this email address already exists.",
            },
            { status: 409 }
          );
        }
        student.email = newEmail;
      }
    }

    // Update age if provided
    if (body.age !== undefined) {
      const ageNum = Number(body.age);
      if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 3 || ageNum > 100) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid age. Age must be an integer between 3 and 100.",
          },
          { status: 400 }
        );
      }
      student.age = ageNum;
    }

    // Update phone if provided
    if (body.phone !== undefined) {
      const trimmedPhone = String(body.phone).trim();
      if (trimmedPhone && !isValidPhoneNumber(trimmedPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: "Phone number is invalid. Must be between 10 and 15 digits.",
          },
          { status: 400 }
        );
      }
      student.phone = trimmedPhone;
    }

    // Update dateOfBirth if provided
    if (body.dateOfBirth !== undefined) {
      student.dateOfBirth = String(body.dateOfBirth).trim();
    }

    // Update selectedLevel / abacusLevel if provided
    const updatedLevel =
      body.selectedLevel !== undefined ? body.selectedLevel : body.abacusLevel;
    if (updatedLevel !== undefined && String(updatedLevel).trim() !== "") {
      student.selectedLevel = String(updatedLevel).trim();
    }

    // Update guardianName / parentName if provided
    const updatedGuardianName =
      body.guardianName !== undefined ? body.guardianName : body.parentName;
    if (updatedGuardianName !== undefined) {
      student.guardianName = String(updatedGuardianName).trim();
    }

    // Update guardianPhone / parentPhone if provided
    const updatedGuardianPhone =
      body.guardianPhone !== undefined ? body.guardianPhone : body.parentPhone;
    if (updatedGuardianPhone !== undefined) {
      const trimmedGuardianPhone = String(updatedGuardianPhone).trim();
      if (trimmedGuardianPhone && !isValidPhoneNumber(trimmedGuardianPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: "Guardian phone number is invalid. Must be between 10 and 15 digits.",
          },
          { status: 400 }
        );
      }
      student.guardianPhone = trimmedGuardianPhone;
    }

    // Update avatar if provided
    if (body.avatar !== undefined && String(body.avatar).trim() !== "") {
      student.avatar = String(body.avatar).trim();
    }

    await student.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        profile: student.toSafeObject(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Update Profile Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update profile";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
