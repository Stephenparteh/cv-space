import {
  anyText,
  contactItems,
  dateRange,
  displayName,
  experienceLines,
  filledCertifications,
  filledEducation,
  filledExperience,
  filledLanguages,
  filledReferences,
  filledSkills,
  type TemplateProps,
} from "./shared";

const Heading = ({ children }: { children: string }) => (
  <h2 className="mb-3 flex items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-700">
    <span className="shrink-0">{children}</span>
    <span className="ml-3 h-px flex-1 bg-slate-300" />
  </h2>
);

const Bullets = ({ lines }: { lines: string[] }) =>
  lines.length > 0 ? (
    <ul className="mt-1.5 space-y-1">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 whitespace-pre-line">
          <span className="text-slate-400">–</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  ) : null;

/** Executive — serif, large left-aligned name, ruled section headings, single column. */
export function ExecutiveTemplate({ data }: TemplateProps) {
  const experience = filledExperience(data.experience);
  const education = filledEducation(data.education);
  const certifications = filledCertifications(data.certifications);
  const languages = filledLanguages(data.languages);
  const references = filledReferences(data.references);
  const skills = filledSkills(data.skills);
  const contacts = contactItems(data);
  const summary = data.summary.trim();

  return (
    <article className="font-serif text-[13px] leading-relaxed text-slate-800">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-slate-800 pb-4">
        <h1 className="text-[30px] font-bold leading-none tracking-tight text-slate-900">
          {displayName(data)}
        </h1>
        {contacts.length > 0 && (
          <ul className="text-right text-[12px] text-slate-600">
            {contacts.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        )}
      </header>

      <div className="space-y-7">
        {summary && (
          <section>
            <Heading>Executive Summary</Heading>
            <p className="whitespace-pre-line">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <Heading>Experience</Heading>
            <div className="space-y-5">
              {experience.map((item, i) => (
                <div key={i} className="resume-item">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="text-[15px] font-bold text-slate-900">{item.jobTitle || "Role"}</p>
                    {dateRange(item.startDate, item.endDate, item.current) && (
                      <p className="text-[12px] text-slate-600">
                        {dateRange(item.startDate, item.endDate, item.current)}
                      </p>
                    )}
                  </div>
                  {anyText(item.company, item.location) && (
                    <p className="text-[13px] text-slate-600">
                      {[item.company, item.location].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <Bullets lines={experienceLines(item)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <Heading>Education</Heading>
            <div className="space-y-3">
              {education.map((item, i) => (
                <div key={i} className="resume-item flex flex-wrap items-baseline justify-between gap-x-4">
                  <p>
                    <span className="font-bold text-slate-900">
                      {item.institution || "Institution"}
                    </span>
                    {anyText(item.degree, item.fieldOfStudy) && (
                      <span className="text-slate-600">
                        {" "}
                        — {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </p>
                  {dateRange(item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-600">
                      {dateRange(item.startDate, item.endDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <Heading>Certifications &amp; Training</Heading>
            <div className="space-y-2">
              {certifications.map((item, i) => (
                <div key={i} className="resume-item flex flex-wrap items-baseline justify-between gap-x-4">
                  <p>
                    <span className="font-bold text-slate-900">{item.name || "Certification"}</span>
                    {item.institution && <span className="text-slate-600"> — {item.institution}</span>}
                  </p>
                  {dateRange(item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-600">
                      {dateRange(item.startDate, item.endDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {(skills.length > 0 || languages.length > 0) && (
          <section className="grid gap-6 sm:grid-cols-2">
            {skills.length > 0 && (
              <div>
                <Heading>Core Competencies</Heading>
                <p>{skills.join("  ·  ")}</p>
              </div>
            )}
            {languages.length > 0 && (
              <div>
                <Heading>Languages</Heading>
                <p>
                  {languages
                    .map((l) => [l.language, l.proficiency].filter(Boolean).join(" — "))
                    .filter(Boolean)
                    .join("  ·  ")}
                </p>
              </div>
            )}
          </section>
        )}

        {references.length > 0 && (
          <section>
            <Heading>References</Heading>
            <div className="grid gap-4 sm:grid-cols-2">
              {references.map((r, i) => (
                <div key={i} className="resume-item text-[12px]">
                  <p className="font-bold text-slate-900">{r.name || "Reference"}</p>
                  {anyText(r.position, r.institution) && (
                    <p className="text-slate-600">
                      {[r.position, r.institution].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {anyText(r.contact, r.email) && (
                    <p className="text-slate-600">{[r.contact, r.email].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
