import type { Request, Response } from "express";
import { AnalyticsEvent } from "../models/AnalyticsEvent.js";
import { Resume } from "../models/Resume.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_SERIES_DAYS = 14;
const RECENT_LIMIT = 10;
const RECENT_EVENTS_LIMIT = 20;

/** Zero-filled last N days (oldest first), as "YYYY-MM-DD" in UTC. */
const dayBuckets = (days: number): string[] => {
  const out: string[] = [];
  const now = Date.now();
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(new Date(now - i * DAY_MS).toISOString().slice(0, 10));
  }
  return out;
};

interface DayCountRow {
  _id: string;
  count: number;
}

/** Zero-fills already-grouped { _id: "YYYY-MM-DD", count } rows across the trailing window. */
const fillDays = (rows: DayCountRow[]): Array<{ date: string; count: number }> => {
  const byDay = new Map(rows.map((r) => [r._id, r.count]));
  return dayBuckets(TIME_SERIES_DAYS).map((date) => ({ date, count: byDay.get(date) ?? 0 }));
};

const dayGroupStage = (dateField: string) => ({
  $group: {
    _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
    count: { $sum: 1 },
  },
});

/**
 * GET /api/admin/stats — admin only. Platform-level counts, template usage,
 * and a 14-day activity trend. No résumé content, no credentials, no tokens.
 */
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const since = new Date(Date.now() - TIME_SERIES_DAYS * DAY_MS);

  const [
    userCount,
    resumeCount,
    publicResumeCount,
    guestStarted,
    guestCompleted,
    downloads,
    accountRegistrations,
    templateUsageRows,
    usersOverTimeRows,
    resumesOverTimeRows,
    guestActivityRows,
    downloadsRows,
  ] = await Promise.all([
    User.countDocuments(),
    Resume.countDocuments(),
    Resume.countDocuments({ isPublic: true }),
    AnalyticsEvent.countDocuments({ type: "resume_started" }),
    AnalyticsEvent.countDocuments({ type: "resume_completed" }),
    AnalyticsEvent.countDocuments({ type: "resume_downloaded" }),
    AnalyticsEvent.countDocuments({ type: "account_registered" }),
    AnalyticsEvent.aggregate<DayCountRow>([
      { $match: { type: "template_selected", template: { $ne: null } } },
      { $group: { _id: "$template", count: { $sum: 1 } } },
    ]),
    User.aggregate<DayCountRow>([{ $match: { createdAt: { $gte: since } } }, dayGroupStage("createdAt")]),
    Resume.aggregate<DayCountRow>([{ $match: { createdAt: { $gte: since } } }, dayGroupStage("createdAt")]),
    AnalyticsEvent.aggregate<DayCountRow>([
      { $match: { type: "resume_started", createdAt: { $gte: since } } },
      dayGroupStage("createdAt"),
    ]),
    AnalyticsEvent.aggregate<DayCountRow>([
      { $match: { type: "resume_downloaded", createdAt: { $gte: since } } },
      dayGroupStage("createdAt"),
    ]),
  ]);

  const templateUsage: Record<string, number> = {};
  for (const row of templateUsageRows) {
    templateUsage[row._id] = row.count;
  }

  res.status(200).json({
    success: true,
    data: {
      totals: {
        users: userCount,
        savedResumes: resumeCount,
        publicResumes: publicResumeCount,
        guestResumesStarted: guestStarted,
        guestResumesCompleted: guestCompleted,
        pdfDownloads: downloads,
        accountRegistrations,
      },
      templateUsage,
      timeSeries: {
        days: TIME_SERIES_DAYS,
        users: fillDays(usersOverTimeRows),
        resumes: fillDays(resumesOverTimeRows),
        guestActivity: fillDays(guestActivityRows),
        downloads: fillDays(downloadsRows),
      },
    },
  });
});

/**
 * GET /api/admin/activity — admin only. Recent signups, recent saved
 * resumes, and recent anonymous events. Deliberately excludes resume
 * content, passwords, and tokens — only what a platform owner needs to see
 * what's happening.
 */
export const getActivity = asyncHandler(async (_req: Request, res: Response) => {
  const [recentUsers, recentResumes, recentEvents] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(RECENT_LIMIT).select("name email createdAt"),
    Resume.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title template isPublic createdAt updatedAt"),
    AnalyticsEvent.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_EVENTS_LIMIT)
      .select("type template createdAt"),
  ]);

  res.status(200).json({
    success: true,
    data: {
      recentUsers: recentUsers.map((u) => ({
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      })),
      recentResumes: recentResumes.map((r) => ({
        title: r.title,
        template: r.template,
        isPublic: r.isPublic,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      recentEvents: recentEvents.map((e) => ({
        type: e.type,
        template: e.template,
        createdAt: e.createdAt,
      })),
    },
  });
});
