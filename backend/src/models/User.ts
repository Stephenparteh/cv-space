import bcrypt from "bcryptjs";
import { Schema, model, type Document, type Model } from "mongoose";

const BCRYPT_ROUNDS = 10;

export const USER_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

/**
 * Shape returned to API clients — never includes the password hash.
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: 8,
      // Excluded from query results by default; login opts back in with .select("+password").
      select: false,
    },
    // Never settable by the client (see validators.ts) — always defaults to
    // "user". Promote an account with scripts/promote-admin.ts.
    role: {
      type: String,
      enum: USER_ROLES,
      default: "user",
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        // Defence in depth — never expose the hash even if it was loaded.
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }
  this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = function comparePassword(
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User: Model<IUser> = model<IUser>("User", userSchema);
