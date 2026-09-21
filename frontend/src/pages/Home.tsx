import { Link } from "react-router-dom";
import { ArrowRight, Briefcase, RefreshCw, Share2, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateThumbnail } from "@/components/resume-preview/TemplateThumbnail";
import { hasToken } from "@/services/authStorage";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { sampleResume } from "@/lib/sampleResume";
import type { ResumeTemplate } from "@/types/resume";

const BENEFITS = [
  { icon: SquareCheck, label: "Free to create" },
  { icon: RefreshCw, label: "Update anytime" },
  { icon: Share2, label: "Share when you're ready" },
  { icon: Briefcase, label: "Built for real opportunities" },
];

const STEPS = [
  {
    n: "01",
    title: "Build",
    body: "Work through short steps — personal details, experience, education and more.",
  },
  {
    n: "02",
    title: "Customize",
    body: "Choose from six templates. Switch anytime without losing your content.",
  },
  {
    n: "03",
    title: "Download or share",
    body: "Export a clean PDF, or publish a read-only link when you're ready.",
  },
];

const TEMPLATES: Array<{ id: ResumeTemplate; name: string; note: string }> = [
  { id: "classic", name: "Classic", note: "Centred serif header, ruled sections." },
  { id: "modern", name: "Modern", note: "Tinted sidebar for contact and skills." },
  { id: "minimal", name: "Minimal", note: "Airy and understated." },
  { id: "professional", name: "Professional", note: "Wide main column, compact side column." },
  { id: "executive", name: "Executive", note: "Large serif name, senior tone." },
  { id: "creative", name: "Creative", note: "Accent colour and a role timeline." },
];

const Home = () => {
  useDocumentTitle(
    "",
    "Create a professional CV for free. Guided step-by-step builder, six templates, live preview, PDF download and shareable links.",
  );
  const authed = hasToken();
  // No account required to start — visitors go straight into the guest
  // builder; an account only becomes useful once they want to save it.
  const primaryHref = authed ? "/dashboard" : "/build";
  const primaryLabel = authed ? "Go to my dashboard" : "Create my CV";

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-content-app px-4 py-14 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.125rem] lg:text-[2.625rem]">
              Create a professional CV. Keep it yours.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground lg:mx-0">
              Build it free, from your phone or computer. Update it whenever your experience
              changes, and download a clean PDF whenever you need one — no payment required to get
              your own work.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link to={primaryHref}>
                <Button size="lg">
                  {primaryLabel} <ArrowRight />
                </Button>
              </Link>
              <a href="#templates">
                <Button size="lg" variant="outline">
                  Explore templates
                </Button>
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[320px] lg:max-w-none">
            <div className="rounded-2xl bg-secondary/60 p-6 sm:p-8 lg:p-10">
              <TemplateThumbnail
                data={sampleResume("modern")}
                className="mx-auto max-w-[260px] lg:max-w-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits — one restrained row, not stacked icon cards */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-content-app px-4 py-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm sm:justify-between">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-foreground">
                <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="font-medium">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Template showcase — real, live-rendered templates */}
      <section id="templates" className="mx-auto max-w-content-app scroll-mt-20 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-content-standard text-center">
          <h2 className="text-[1.375rem] font-semibold tracking-tight sm:text-2xl">Templates</h2>
          <p className="mt-2 text-muted-foreground">
            Six distinct layouts, each shown here exactly as it renders. Switch any time without
            losing your content.
          </p>
        </div>

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <TemplateThumbnail
              key={template.id}
              data={sampleResume(template.id)}
              label={template.name}
              meta={template.note}
              className="w-[68vw] shrink-0 snap-start sm:w-auto sm:shrink"
            />
          ))}
        </div>
      </section>

      {/* How it works — editorial, number-led */}
      <section className="border-y bg-card">
        <div className="mx-auto max-w-content-app px-4 py-16 sm:py-20">
          <h2 className="text-center text-[1.375rem] font-semibold tracking-tight sm:text-2xl">
            How it works
          </h2>
          <div className="mx-auto mt-10 grid max-w-content-wide gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <p className="font-display text-3xl font-semibold text-accent/30">{step.n}</p>
                <p className="mt-2 font-display text-lg font-semibold">{step.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it exists — plain statement, no unsupported claims */}
      <section className="mx-auto max-w-content-standard px-4 py-16 text-center sm:py-20">
        <p className="text-lg font-medium leading-relaxed text-foreground sm:text-xl">
          Professional CV creation shouldn't require owning a computer, or paying just to download
          your own work.
        </p>
        <p className="mt-3 text-muted-foreground">
          CV Space works from a phone, saves your progress, and never charges you to access what
          you created.
        </p>
      </section>

      {/* Directory / sharing — explicitly optional */}
      <section className="border-t bg-card">
        <div className="mx-auto max-w-content-standard px-4 py-16 text-center sm:py-20">
          <h2 className="text-[1.375rem] font-semibold tracking-tight sm:text-2xl">
            Your CV can be more than a file.
          </h2>
          <p className="mt-3 text-muted-foreground">
            If you choose to, you can publish a read-only link to a resume, and add a public
            profile to the directory so people looking to hire can find you. Nothing is shared
            unless you turn it on — every resume stays private by default.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/directory">
              <Button variant="outline">Browse the directory</Button>
            </Link>
            <Link to={primaryHref}>
              <Button>{primaryLabel}</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
