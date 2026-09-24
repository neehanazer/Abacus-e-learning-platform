import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";
export const AUTH_COOKIE_NAME = "abacus_token";
const JWT_SECRET = process.env.JWT_SECRET || "abacus_default_jwt_secret_key_2026";
const TOKEN_EXPIRY = "7d";
const BCRYPT_SALT_ROUNDS = 12;
/**
 * -------------------------------------------------------------
 * PASSWORD UTILITIES
 * -------------------------------------------------------------
 */
/**
 * Hashes a plain-text password using bcrypt
 */
export async function hashPassword(password) {
    return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}
/**
 * Compares a plain-text password with a bcrypt hash
 */
export async function comparePassword(plainText, hash) {
    return await bcrypt.compare(plainText, hash);
}
/**
 * Validates password strength (minimum 6 chars, non-empty)
 */
export function validatePasswordStrength(password) {
    if (!password || typeof password !== "string") {
        return { valid: false, message: "Password is required" };
    }
    if (password.length < 6) {
        return {
            valid: false,
            message: "Password must be at least 6 characters long",
        };
    }
    return { valid: true };
}
/**
 * Validates that an email is a valid @gmail.com address
 */
export function isGmailAddress(email) {
    if (!email || typeof email !== "string")
        return false;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    return gmailRegex.test(email.trim());
}
/**
 * Validates phone numbers (must contain between 10 and 15 digits)
 */
export function isValidPhoneNumber(phone) {
    if (!phone || typeof phone !== "string")
        return false;
    const trimmed = phone.trim();
    const phoneCharRegex = /^\+?[0-9\s\-()]{10,20}$/;
    if (!phoneCharRegex.test(trimmed))
        return false;
    const digits = trimmed.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
}
/**
 * -------------------------------------------------------------
 * JWT TOKEN UTILITIES
 * -------------------------------------------------------------
 */
/**
 * Signs a JWT token containing user details
 */
export function signToken(payload, expiresIn = TOKEN_EXPIRY) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn });
}
/**
 * Verifies and decodes a JWT token. Returns null if invalid or expired.
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    }
    catch {
        return null;
    }
}
/**
 * Extracts authentication token from either HTTP-only cookie or Authorization header
 */
export function extractToken(req) {
    // 1. Try reading from NextRequest cookies
    if ("cookies" in req && typeof req.cookies?.get === "function") {
        const cookie = req.cookies.get(AUTH_COOKIE_NAME);
        if (cookie?.value) {
            return cookie.value;
        }
    }
    // 2. Try parsing Cookie header manually (works with standard Request)
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
        const cookies = cookieHeader.split(";").map((c) => c.trim());
        for (const c of cookies) {
            if (c.startsWith(`${AUTH_COOKIE_NAME}=`)) {
                return decodeURIComponent(c.substring(AUTH_COOKIE_NAME.length + 1));
            }
        }
    }
    // 3. Try reading from Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
        return authHeader.substring(7).trim();
    }
    return null;
}
/**
 * Sets secure HTTP-only cookie on response
 */
export function setAuthCookie(response, token) {
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });
}
/**
 * Clears the auth cookie on logout
 */
export function clearAuthCookie(response) {
    response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
    });
}
/**
 * -------------------------------------------------------------
 * USER & ROLE UTILITIES
 * -------------------------------------------------------------
 */
/**
 * Checks if a user has the required role(s)
 */
export function hasRole(user, roles) {
    if (!user || !user.role)
        return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
}
/**
 * Gets the current authenticated user from request token and DB
 */
export async function getCurrentUser(req) {
    const token = extractToken(req);
    if (!token)
        return null;
    const payload = verifyToken(token);
    if (!payload || !payload.userId)
        return null;
    await connectToDatabase();
    const student = await Student.findById(payload.userId);
    if (!student || student.accountStatus !== "active") {
        return null;
    }
    return student;
}
export async function authenticateRoute(req, options) {
    const token = extractToken(req);
    if (!token) {
        return {
            errorResponse: NextResponse.json({
                success: false,
                error: "Authentication required. Please log in.",
            }, { status: 401 }),
        };
    }
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
        return {
            errorResponse: NextResponse.json({
                success: false,
                error: "Invalid or expired session. Please log in again.",
            }, { status: 401 }),
        };
    }
    try {
        await connectToDatabase();
        const student = await Student.findById(payload.userId);
        if (!student) {
            return {
                errorResponse: NextResponse.json({
                    success: false,
                    error: "User account not found.",
                }, { status: 401 }),
            };
        }
        if (student.accountStatus !== "active") {
            return {
                errorResponse: NextResponse.json({
                    success: false,
                    error: `Your account is currently ${student.accountStatus}. Please contact support.`,
                }, { status: 403 }),
            };
        }
        // Role check if allowedRoles provided
        if (options?.allowedRoles && !hasRole(student, options.allowedRoles)) {
            return {
                errorResponse: NextResponse.json({
                    success: false,
                    error: "Forbidden. You do not have permission to access this resource.",
                }, { status: 403 }),
            };
        }
        return { user: student };
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Database error";
        return {
            errorResponse: NextResponse.json({
                success: false,
                error: "Authentication service error: " + errorMsg,
            }, { status: 500 }),
        };
    }
}
