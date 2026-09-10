import { Link } from "react-router-dom";
import { ArrowRight, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasToken } from "@/services/authStorage";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

const BENEFITS = [
  "Completely free — create and download without paying",
  "Guided step-by-step builder",
  "Six professional templates",
  "Live preview as you type",
  "Download as a PDF",
  "Share a public link or an optional profile",
];

const STEPS = [
  { n: 1, title: "Enter your information", body: "Work through short steps — personal details, experience, education and more." },
  { n: 2, title: "Choose a template", body: "Switch between six layouts. Your content stays exactly where it is." },
  { n: 3, title: "Preview your resume", body: "See every change instantly in the live preview beside the editor." },
  { n: 4, title: "Download or share", body: "Export a clean PDF, or publish a read-only link and a public profile." },
];

const TEMPLATES = [
  { name: "Classic", note: "Centred serif header, ruled sections." },
  { name: "Modern", note: "Tinted sidebar for contact and skills." },
  { name: "Minimal", note: "Airy and understated." },
  { name: "Professional", note: "Wide main column, compact side column." },
  { name: "Executive", note: "Large serif name, senior tone." },
  { name: "Creative", note: "Accent colour and a role timeline." },
];

const Home = () => {
  useDocumentTitle(
    "",
    "Build a professional resume for free. Step-by-step builder, six templates, live preview, PDF download and shareable links.",
  );
  const authed = hasToken();
  const primaryHref = authed ? "/dashboard" : "/login?next=%2Fdashboard";
  const primaryLabel = authed ? "Go to my dashboard" : "Create my resume";

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-secondary/40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:py-24">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Free resume builder
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Build a professional resume. For free.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Create, customize, and download a professional resume without paying for a resume
            builder. Preview it live, pick a template, and share it with one link.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-xl font-semibold">Why use it</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section className="border-y bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-2">
            {STEPS.map((step) => (
              <li key={step.n} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {step.n}
                </span>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-14">
        <h2 className="text-xl font-semibold">Templates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Six distinct layouts. Switch any time without losing your content.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <div key={template.name} className="rounded-md border p-4">
              <p className="text-sm font-medium">{template.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{template.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sharing / directory */}
      <section className="border-t bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="text-xl font-semibold">Share your work</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Every resume is private by default. Make one public to get a read-only link you can send
            to anyone. Add an optional public profile and choose to appear in the searchable
            directory.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
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
