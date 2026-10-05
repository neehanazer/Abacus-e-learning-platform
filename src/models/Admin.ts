import mongoose, { Schema, Document, Model } from "mongoose";

export type AdminRole = "admin";
export type AdminStatus = "active" | "inactive" | "suspended";

export interface ISafeAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IAdmin extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): ISafeAdmin;
}

const AdminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Never return password hash in regular queries
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "admins",
  }
);

// Method to safely return admin details without sensitive fields
AdminSchema.methods.toSafeObject = function (): ISafeAdmin {
  const doc = this.toObject ? this.toObject() : this;
  delete doc.passwordHash;
  delete doc.__v;

  return {
    id: (doc._id || this._id).toString(),
    name: doc.name || "Administrator",
    email: doc.email || "",
    role: "admin",
    status: doc.status || "active",
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt || ""),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt || ""),
  };
};

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema, "admins");

export default Admin;
export { Admin };
