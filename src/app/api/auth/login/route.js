import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function POST(req) {
    try {
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
            return NextResponse.json({
                success: false,
                error: "Invalid request body. JSON payload is required.",
            }, { status: 400 });
        }
        const email = (body.email || "").toLowerCase().trim();
        const password = body.password || "";
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                error: "Email and password are required.",
            }, { status: 400 });
        }
        await connectToDatabase();
        // Query student including passwordHash field which has select: false
        const student = await Student.findOne({ email }).select("+passwordHash");
        if (!student) {
            return NextResponse.json({
                success: false,
                error: "Invalid email or password.",
            }, { status: 401 });
        }
        // Verify password against bcrypt hash
        const isPasswordValid = await comparePassword(password, student.passwordHash);
        if (!isPasswordValid) {
            return NextResponse.json({
                success: false,
                error: "Invalid email or password.",
            }, { status: 401 });
        }
        // Check account status
        if (student.accountStatus !== "active") {
            return NextResponse.json({
                success: false,
                error: `Account is ${student.accountStatus}. Please contact support.`,
            }, { status: 403 });
        }
        // Generate JWT token
        const token = signToken({
            userId: student._id.toString(),
            email: student.email,
            role: student.role,
        });
        const safeUser = student.toSafeObject();
        // Create response with secure HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            user: safeUser,
            token,
        }, { status: 200 });
        setAuthCookie(response, token);
        return response;
    }
    catch (error) {
        console.error("[Login API Error]:", error);
        const message = error instanceof Error ? error.message : "Failed to authenticate";
        return NextResponse.json({
            success: false,
            error: message,
        }, { status: 500 });
    }
}
