import { connectToDatabase } from "@/lib/mongodb";
import Student, { IStudent } from "@/models/Student";
import { RegisterDTO, ProfileUpdateDTO } from "@/types";
import { hashPassword } from "@/lib/auth";

export async function findStudentByEmail(
  email: string,
  includePassword = false
): Promise<IStudent | null> {
  await connectToDatabase();
  const query = Student.findOne({ email: email.toLowerCase().trim() });
  if (includePassword) {
    query.select("+passwordHash");
  }
  return await query.exec();
}

export async function findStudentById(id: string): Promise<IStudent | null> {
  await connectToDatabase();
  return await Student.findById(id).exec();
}

export async function createStudent(data: RegisterDTO & { passwordHash: string }): Promise<IStudent> {
  await connectToDatabase();
  return await Student.create({
    name: (data.name || data.fullName || "").trim(),
    email: data.email.toLowerCase().trim(),
    phone: data.phone?.trim() || "",
    passwordHash: data.passwordHash,
    dateOfBirth: data.dateOfBirth || "",
    age: Number(data.age),
    selectedLevel: data.selectedLevel || data.abacusLevel || "Level 1 - Direct Addition & Subtraction",
    guardianName: data.guardianName || data.parentName || "",
    guardianPhone: data.guardianPhone || data.parentPhone || "",
    role: "student",
    accountStatus: "active",
    avatar: data.avatar || "🧙‍♂️",
  });
}

export async function updateStudentProfile(
  id: string,
  updates: ProfileUpdateDTO
): Promise<IStudent | null> {
  await connectToDatabase();
  const student = await Student.findById(id);
  if (!student) return null;

  if (updates.name || updates.fullName) {
    student.name = (updates.name || updates.fullName)!.trim();
  }
  if (updates.phone !== undefined) {
    student.phone = updates.phone.trim();
  }
  if (updates.dateOfBirth !== undefined) {
    student.dateOfBirth = updates.dateOfBirth.trim();
  }
  if (updates.age !== undefined) {
    student.age = Number(updates.age);
  }
  if (updates.selectedLevel || updates.abacusLevel) {
    student.selectedLevel = (updates.selectedLevel || updates.abacusLevel)!.trim();
  }
  if (updates.guardianName || updates.parentName) {
    student.guardianName = (updates.guardianName || updates.parentName)!.trim();
  }
  if (updates.guardianPhone || updates.parentPhone) {
    student.guardianPhone = (updates.guardianPhone || updates.parentPhone)!.trim();
  }
  if (updates.avatar !== undefined) {
    student.avatar = updates.avatar.trim();
  }

  await student.save();
  return student;
}
