import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list: { username: string; email: string; avatar?: string }[] = [
      {
        username: "Neeha Nazer",
        email: "neehanaz226@gmail.com",
        avatar: "🧮",
      },
      {
        username: "Alex Parker",
        email: "student@abacus.com",
        avatar: "🧙‍♂️",
      },
    ];

    try {
      await connectToDatabase();
      const dbStudents = await Student.find(
        {},
        "name fullName email avatar"
      ).lean();

      for (const s of dbStudents) {
        const username = (s as any).fullName || s.name || s.email;
        if (
          username &&
          !list.some(
            (item) => item.username.toLowerCase() === username.toLowerCase()
          )
        ) {
          list.push({
            username,
            email: s.email,
            avatar: s.avatar || "👤",
          });
        }
      }
    } catch {
      // If DB is offline, continue with default list
    }

    return NextResponse.json({ success: true, students: list });
  } catch (error) {
    return NextResponse.json({
      success: true,
      students: [
        { username: "Neeha Nazer", email: "neehanaz226@gmail.com", avatar: "🧮" },
        { username: "Alex Parker", email: "student@abacus.com", avatar: "🧙‍♂️" },
      ],
    });
  }
}
