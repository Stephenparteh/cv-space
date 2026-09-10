import { Schema, model, type Document, type Model, type Types } from "mongoose";

/**
 * One optional public professional profile per user (M5).
 *
 * Kept separate from `User` (which holds auth) and `Resume` (per-document). A
 * user is never forced to have a profile — it is created on the first save.
 */
export interface IProfile extends Document {
  userId: Types.ObjectId;
  displayName: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  /** Unguessable public identifier; minted on first publish. */
  slug?: string;
  /** `/profile/:slug` works only when true. */
  isPublic: boolean;
  /** Appears in `/directory` only when `isPublic && inDirectory`. */
  inDirectory: boolean;
  /** The single public resume associated with this profile (MVP). */
  featuredResumeId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
    displayName: { type: String, trim: true, default: "", maxlength: 120 },
    headline: { type: String, trim: true, default: "", maxlength: 160 },
    bio: { type: String, trim: true, default: "", maxlength: 800 },
    location: { type: String, trim: true, default: "", maxlength: 160 },
    skills: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    slug: { type: String, unique: true, sparse: true },
    isPublic: { type: Boolean, default: false, index: true },
    inDirectory: { type: Boolean, default: false },
    featuredResumeId: { type: Schema.Types.ObjectId, ref: "Resume", default: null },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        // The internal user id is never exposed, even to the owner (it's them).
        delete ret.userId;
        if (ret.featuredResumeId != null) ret.featuredResumeId = String(ret.featuredResumeId);
        return ret;
      },
    },
  },
);

export const Profile: Model<IProfile> = model<IProfile>("Profile", profileSchema);
