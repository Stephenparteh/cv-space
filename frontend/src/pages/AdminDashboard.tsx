import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/services/api";
import { hasToken } from "@/services/authStorage";
import { getAdminActivity, getAdminStats, type AdminActivity, type AdminStats } from "@/services/adminApi";

type Status = "loading" | "unauthorized" | "forbidden" | "error" | "ready";

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const formatDay = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border bg-card p-4">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="mt-1 text-2xl font-bold">{value.toLocaleString()}</p>
  </div>
);

/** A dependency-free horizontal bar row — no charting library needed for this. */
const BarRow = ({ label, value, max }: { label: string; value: number; max: number }) => (
  <div className="flex items-center gap-3 text-sm">
    <span className="w-32 shrink-0 truncate capitalize text-muted-foreground">{label}</span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary"
        style={{ width: max > 0 ? `${Math.max(2, (value / max) * 100)}%` : "0%" }}
      />
    </div>
    <span className="w-10 shrink-0 text-right font-medium">{value}</span>
  </div>
);

const Sparkline = ({ series }: { series: Array<{ date: string; count: number }> }) => {
  const max = Math.max(1, ...series.map((s) => s.count));
  return (
    <div className="flex h-16 items-end gap-1">
      {series.map((s) => (
        <div key={s.date} className="group relative flex-1">
          <div
            className="w-full rounded-sm bg-primary/70"
            style={{ height: `${Math.max(4, (s.count / max) * 100)}%` }}
          />
          <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background group-hover:block">
            {formatDay(s.date)}: {s.count}
          </span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const [status, setStatus] = useState<Status>(() => (hasToken() ? "loading" : "unauthorized"));
  const [errorMessage, setErrorMessage] = useState("");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity | null>(null);

  useEffect(() => {
    if (!hasToken()) return;
    const controller = new AbortController();

    Promise.all([getAdminStats(controller.signal), getAdminActivity(controller.signal)])
      .then(([s, a]) => {
        setStats(s);
        setActivity(a);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError) {
          if (err.status === 401) return setStatus("unauthorized");
          if (err.status === 403) return setStatus("forbidden");
          setErrorMessage(err.message);
          return setStatus("error");
        }
        setErrorMessage("Something went wrong while loading the admin dashboard.");
        setStatus("error");
      });

    return () => controller.abort();
  }, []);

  if (status === "unauthorized") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="text-muted-foreground">Sign in with an admin account to view this page.</p>
        <Link to="/login?next=%2Fadmin">
          <Button>Go to sign in</Button>
        </Link>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <ShieldAlert className="h-6 w-6 text-destructive" />
        <h1 className="text-xl font-semibold">Admin access required</h1>
        <p className="max-w-md text-muted-foreground">
          Your account doesn't have permission to view the admin dashboard.
        </p>
        <Link to="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading admin dashboard…
      </div>
    );
  }

  if (status === "error" || !stats || !activity) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="max-w-md text-muted-foreground">{errorMessage || "Something went wrong."}</p>
      </div>
    );
  }

  const { totals, templateUsage, timeSeries } = stats;
  const maxTemplateUsage = Math.max(1, ...Object.values(templateUsage));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">CV Space Admin</h1>
        <p className="text-sm text-muted-foreground">Platform growth and usage at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Total users" value={totals.users} />
        <MetricCard label="Saved resumes" value={totals.savedResumes} />
        <MetricCard label="Public resumes" value={totals.publicResumes} />
        <MetricCard label="Guest resumes started" value={totals.guestResumesStarted} />
        <MetricCard label="Guest resumes completed" value={totals.guestResumesCompleted} />
        <MetricCard label="PDF downloads" value={totals.pdfDownloads} />
        <MetricCard label="Account registrations" value={totals.accountRegistrations} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Template usage</h2>
          {Object.keys(templateUsage).length === 0 ? (
            <p className="text-sm text-muted-foreground">No template selections recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(templateUsage)
                .sort((a, b) => b[1] - a[1])
                .map(([template, count]) => (
                  <BarRow key={template} label={template} value={count} max={maxTemplateUsage} />
                ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Growth &amp; usage — last {timeSeries.days} days</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">New users</p>
              <Sparkline series={timeSeries.users} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">New saved resumes</p>
              <Sparkline series={timeSeries.resumes} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Guest resumes started</p>
              <Sparkline series={timeSeries.guestActivity} />
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">PDF downloads</p>
              <Sparkline series={timeSeries.downloads} />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent registrations</h2>
          {activity.recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {activity.recentUsers.map((u, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                  <span className="min-w-0 truncate" title={u.email}>
                    {u.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent saved resumes</h2>
          {activity.recentResumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved resumes yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {activity.recentResumes.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                  <span className="min-w-0 truncate" title={r.title}>
                    {r.title || "Untitled resume"}
                  </span>
                  <span className="shrink-0 text-xs capitalize text-muted-foreground">{r.template}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Recent activity</h2>
          {activity.recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {activity.recentEvents.map((e, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-b pb-2 last:border-0 last:pb-0">
                  <span className="min-w-0 truncate">
                    {e.type.replace(/_/g, " ")}
                    {e.template ? ` · ${e.template}` : ""}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
