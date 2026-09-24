import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";
export const dynamic = "force-dynamic";
export async function GET() {
    try {
        await connectToDatabase();
        const isConnected = mongoose.connection.readyState === 1;
        if (!isConnected) {
            return NextResponse.json({
                success: false,
                message: "Abacus backend is running, but database connection is not ready",
                database: "disconnected",
            }, { status: 503 });
        }
        return NextResponse.json({
            success: true,
            message: "Abacus backend is running",
            database: "connected",
        }, { status: 200 });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to connect to MongoDB";
        console.error("[Health Check Error]:", errorMessage);
        return NextResponse.json({
            success: false,
            message: "Abacus backend is running, but MongoDB is unavailable",
            database: "disconnected",
            error: errorMessage,
        }, { status: 503 });
    }
}
