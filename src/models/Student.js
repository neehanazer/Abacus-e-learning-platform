import mongoose, { Schema } from "mongoose";
const StudentSchema = new Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters long"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        trim: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            "Please provide a valid email address",
        ],
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    passwordHash: {
        type: String,
        required: [true, "Password hash is required"],
        select: false, // Never return password hash in regular queries
    },
    dateOfBirth: {
        type: String,
        default: "",
    },
    age: {
        type: Number,
        required: [true, "Age is required"],
        min: [3, "Age must be at least 3 years"],
        max: [100, "Age cannot exceed 100 years"],
    },
    selectedLevel: {
        type: String,
        required: [true, "Selected level is required"],
        default: "Level 1 - Direct Addition & Subtraction",
        trim: true,
    },
    guardianName: {
        type: String,
        default: "",
        trim: true,
    },
    guardianPhone: {
        type: String,
        default: "",
        trim: true,
    },
    role: {
        type: String,
        enum: ["student", "admin", "parent", "teacher"],
        default: "student",
    },
    accountStatus: {
        type: String,
        enum: ["active", "suspended", "pending"],
        default: "active",
    },
    avatar: {
        type: String,
        default: "🧙‍♂️",
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    streakDays: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalPracticeMinutes: {
        type: Number,
        default: 0,
        min: 0,
    },
    completedWorksheets: {
        type: Number,
        default: 0,
        min: 0,
    },
    earnedBadges: {
        type: [String],
        default: ["Welcome Explorer"],
    },
}, {
    timestamps: true,
});
// Unique index on email
StudentSchema.index({ email: 1 }, { unique: true });
// Helper to convert mongoose document to a safe user profile (without passwordHash)
StudentSchema.methods.toSafeObject = function () {
    const doc = this.toObject ? this.toObject() : this;
    delete doc.passwordHash;
    delete doc.__v;
    return {
        id: (doc._id || this._id).toString(),
        name: doc.name,
        fullName: doc.name,
        email: doc.email,
        phone: doc.phone || "",
        dateOfBirth: doc.dateOfBirth || "",
        age: doc.age,
        selectedLevel: doc.selectedLevel,
        abacusLevel: doc.selectedLevel,
        guardianName: doc.guardianName || "",
        guardianPhone: doc.guardianPhone || "",
        parentName: doc.guardianName || "",
        parentPhone: doc.guardianPhone || "",
        role: doc.role,
        accountStatus: doc.accountStatus,
        avatar: doc.avatar || "🧙‍♂️",
        progress: doc.progress ?? 0,
        streakDays: doc.streakDays ?? 0,
        totalPracticeMinutes: doc.totalPracticeMinutes ?? 0,
        completedWorksheets: doc.completedWorksheets ?? 0,
        earnedBadges: doc.earnedBadges || ["Welcome Explorer"],
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt || ""),
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt || ""),
    };
};
const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export default Student;
export { Student };
