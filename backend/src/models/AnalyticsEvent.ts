import { Schema, model, Types, type Document, type Model } from "mongoose";
import { RESUME_TEMPLATES } from "./Resume.js";

/**
 * Minimal, anonymous-by-default usage events for platform metrics.
 *
 * Deliberately NOT stored here: résumé content, names, emails, phone numbers,
 * or any other personal information — see backend/src/utils/validators.ts
 * (`parseAnalyticsEventInput`), which is the only way a document is built.
 * `userId` is attached server-side from a verified JWT (optionalAuth), never
 * from the request body, and is only set when genuinely useful for a metric.
 */
export const ANALYTICS_EVENT_TYPES = [
  "resume_started",
  "resume_completed",
  "resume_downloaded",
  "account_registered",
  "resume_saved",
  "template_selected",
] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export interface IAnalyticsEvent extends Document {
  type: AnalyticsEventType;
  userId: Types.ObjectId | null;
  template: string | null;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    type: {
      type: String,
      enum: ANALYTICS_EVENT_TYPES,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    template: {
      type: String,
      enum: [...RESUME_TEMPLATES, null],
      default: null,
    },
  },
  {
    // Events are immutable and only ever need a creation time.
    timestamps: { createdAt: true, updatedAt: false },
  },
);

analyticsEventSchema.index({ type: 1, createdAt: -1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> = model<IAnalyticsEvent>(
  "AnalyticsEvent",
  analyticsEventSchema,
);
