import fs from "fs";
import path from "path";
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        for (const line of envContent.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const [k, ...v] = trimmed.split("=");
                if (k && v.length > 0) {
                    process.env[k.trim()] = v.join("=").trim();
                }
            }
        }
    }
}
catch {
    // ignore
}
import { hashPassword, comparePassword, validatePasswordStrength, isGmailAddress, isValidPhoneNumber, signToken, verifyToken, extractToken, hasRole, } from "../lib/auth";
import Student from "../models/Student";
import { POST as registerHandler } from "../app/api/auth/register/route";
import { POST as loginHandler } from "../app/api/auth/login/route";
import { GET as meHandler } from "../app/api/auth/me/route";
import { GET as getProfileHandler, PUT as putProfileHandler } from "../app/api/users/profile/route";
import { NextRequest } from "next/server";
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
function assert(condition, testName) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✓ PASS: ${testName}`);
    }
    else {
        failedTests++;
        console.error(`  ✗ FAIL: ${testName}`);
    }
}
async function runTests() {
    console.log("==================================================");
    console.log("RUNNING BACKEND AUTH & MODEL TEST SUITE");
    console.log("==================================================\n");
    // 1. Password Utilities
    console.log("--- 1. Password Hashing & Validation ---");
    const weakCheck = validatePasswordStrength("123");
    assert(!weakCheck.valid, "Weak password (<6 chars) is rejected");
    const validCheck = validatePasswordStrength("securePassword123");
    assert(validCheck.valid, "Strong password (>=6 chars) is accepted");
    const plain = "mypassword123";
    const hashed = await hashPassword(plain);
    assert(hashed !== plain, "Password is hashed with bcrypt and not plain-text");
    assert(hashed.startsWith("$2"), "Password hash uses standard bcrypt format");
    const match = await comparePassword(plain, hashed);
    assert(match, "Correct password matches hash");
    const mismatch = await comparePassword("wrongpass", hashed);
    assert(!mismatch, "Incorrect password does not match hash");
    // 2. Email & Phone Utilities
    console.log("\n--- 2. Gmail & Phone Validation Utilities ---");
    assert(isGmailAddress("student@gmail.com"), "isGmailAddress accepts valid @gmail.com");
    assert(isGmailAddress("alex.parker123@gmail.com"), "isGmailAddress accepts complex @gmail.com");
    assert(!isGmailAddress("student@yahoo.com"), "isGmailAddress rejects @yahoo.com");
    assert(!isGmailAddress("student@outlook.com"), "isGmailAddress rejects @outlook.com");
    assert(!isGmailAddress("student@gmail.co"), "isGmailAddress rejects invalid domain @gmail.co");
    assert(isValidPhoneNumber("9876543210"), "isValidPhoneNumber accepts 10-digit number");
    assert(isValidPhoneNumber("+1 (555) 234-5678"), "isValidPhoneNumber accepts formatted international number");
    assert(!isValidPhoneNumber("12345"), "isValidPhoneNumber rejects too-short number (<10 digits)");
    assert(!isValidPhoneNumber("abc1234567890"), "isValidPhoneNumber rejects non-phone characters");
    // 3. JWT Utilities
    console.log("\n--- 3. JWT Sign & Verification ---");
    const token = signToken({
        userId: "64f1a2b3c4d5e6f7a8b9c0d1",
        email: "student@gmail.com",
        role: "student",
    });
    assert(typeof token === "string" && token.length > 20, "JWT token is generated");
    const verified = verifyToken(token);
    assert(verified !== null && verified.userId === "64f1a2b3c4d5e6f7a8b9c0d1", "JWT token verifies and extracts payload");
    assert(verified?.role === "student", "JWT payload preserves user role");
    const invalidToken = verifyToken("invalid.token.payload");
    assert(invalidToken === null, "Invalid JWT token verification returns null");
    // 4. Role Checking Utilities
    console.log("\n--- 4. Role Utilities ---");
    assert(hasRole({ role: "student" }, "student"), "hasRole matches single role");
    assert(hasRole({ role: "admin" }, ["student", "admin"]), "hasRole matches array of roles");
    assert(!hasRole({ role: "student" }, "admin"), "hasRole rejects unassigned role");
    // 5. Token Extraction
    console.log("\n--- 5. Token Extraction from Request ---");
    const reqWithHeader = new NextRequest("http://localhost:3000/api/auth/me", {
        headers: { authorization: `Bearer ${token}` },
    });
    assert(extractToken(reqWithHeader) === token, "extractToken extracts Bearer token from header");
    const reqWithCookie = new NextRequest("http://localhost:3000/api/auth/me", {
        headers: { cookie: `abacus_token=${token}` },
    });
    assert(extractToken(reqWithCookie) === token, "extractToken extracts token from cookie");
    const reqNoAuth = new NextRequest("http://localhost:3000/api/auth/me");
    assert(extractToken(reqNoAuth) === null, "extractToken returns null when no auth token provided");
    // 6. Registration Route Validation Tests
    console.log("\n--- 6. Registration API Validation Tests ---");
    // Missing fields
    const missingFieldsReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@gmail.com" }),
    });
    const missingRes = await registerHandler(missingFieldsReq);
    const missingJson = await missingRes.json();
    assert(missingRes.status === 400, "Registration returns 400 for missing fields");
    assert(missingJson.error.includes("Missing required fields"), "Registration error specifies missing fields");
    // Non-gmail email
    const nonGmailReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test User",
            email: "student@hotmail.com",
            password: "password123",
            age: 10,
            guardianName: "Parent",
            guardianPhone: "9876543210",
        }),
    });
    const nonGmailRes = await registerHandler(nonGmailReq);
    const nonGmailJson = await nonGmailRes.json();
    assert(nonGmailRes.status === 400, "Registration returns 400 for non-@gmail.com email");
    assert(nonGmailJson.error.includes("@gmail.com"), "Registration error specifies @gmail.com is required");
    // Invalid phone number
    const invalidPhoneReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test User",
            email: "student@gmail.com",
            password: "password123",
            age: 10,
            guardianName: "Parent",
            guardianPhone: "123", // invalid
        }),
    });
    const invalidPhoneRes = await registerHandler(invalidPhoneReq);
    const invalidPhoneJson = await invalidPhoneRes.json();
    assert(invalidPhoneRes.status === 400, "Registration returns 400 for invalid phone number");
    assert(invalidPhoneJson.error.includes("phone number is invalid"), "Registration error specifies phone number requirement");
    // Weak password
    const weakPasswordReq = new NextRequest("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test User",
            email: "test@gmail.com",
            password: "123",
            age: 10,
            guardianName: "Parent",
            guardianPhone: "9876543210",
        }),
    });
    const weakPasswordRes = await registerHandler(weakPasswordReq);
    const weakPasswordJson = await weakPasswordRes.json();
    assert(weakPasswordRes.status === 400, "Registration returns 400 for weak password");
    assert(weakPasswordJson.error.includes("6 characters"), "Registration error specifies password length requirement");
    // 7. Login Route Validation Tests
    console.log("\n--- 7. Login API Validation Tests ---");
    const emptyLoginReq = new NextRequest("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "", password: "" }),
    });
    const emptyLoginRes = await loginHandler(emptyLoginReq);
    assert(emptyLoginRes.status === 400, "Login returns 400 for empty credentials");
    // 8. Protected Route Tests (Unauthenticated)
    console.log("\n--- 8. Protected Route Unauthorized Access Tests ---");
    const unauthMeReq = new NextRequest("http://localhost:3000/api/auth/me");
    const unauthMeRes = await meHandler(unauthMeReq);
    assert(unauthMeRes.status === 401, "GET /api/auth/me returns 401 when unauthenticated");
    const unauthProfileReq = new NextRequest("http://localhost:3000/api/users/profile");
    const unauthProfileRes = await getProfileHandler(unauthProfileReq);
    assert(unauthProfileRes.status === 401, "GET /api/users/profile returns 401 when unauthenticated");
    const unauthPutProfileReq = new NextRequest("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Hacker" }),
    });
    const unauthPutProfileRes = await putProfileHandler(unauthPutProfileReq);
    assert(unauthPutProfileRes.status === 401, "PUT /api/users/profile returns 401 when unauthenticated");
    // 9. Student Model Schema Validation
    console.log("\n--- 9. Student Model Schema & Default Values ---");
    const studentDoc = new Student({
        name: "Mia Sharma",
        email: "mia.sharma@gmail.com",
        passwordHash: hashed,
        age: 9,
        selectedLevel: "Level 1 - Direct Addition & Subtraction",
        guardianName: "Rohit Sharma",
        guardianPhone: "+1987654321",
    });
    assert(studentDoc.role === "student", "Default role is 'student'");
    assert(studentDoc.accountStatus === "active", "Default accountStatus is 'active'");
    assert(studentDoc.avatar === "🧙‍♂️", "Default avatar is provided");
    const safeObj = studentDoc.toSafeObject();
    assert(safeObj.passwordHash === undefined, "toSafeObject does not expose passwordHash");
    assert(safeObj.name === "Mia Sharma", "toSafeObject preserves student name");
    assert(safeObj.fullName === "Mia Sharma", "toSafeObject provides fullName alias for Phase 1 compatibility");
    assert(safeObj.email === "mia.sharma@gmail.com", "toSafeObject preserves email");
    assert(safeObj.guardianName === "Rohit Sharma", "toSafeObject preserves guardianName");
    assert(safeObj.selectedLevel === "Level 1 - Direct Addition & Subtraction", "Starting level is Level 1");
    console.log("\n==================================================");
    console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
    console.log("==================================================");
    if (failedTests > 0) {
        process.exit(1);
    }
}
runTests().catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
});
