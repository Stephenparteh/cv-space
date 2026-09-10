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
  photoUrl,
  type TemplateProps,
} from "./shared";

const MainHeading = ({ children }: { children: string }) => (
  <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-900">
    <span className="mr-2 inline-block h-2 w-2 -translate-y-px bg-slate-900 align-middle" />
    {children}
  </h2>
);

const SideHeading = ({ children }: { children: string }) => (
  <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
    {children}
  </h2>
);

const Bullets = ({ lines }: { lines: string[] }) =>
  lines.length > 0 ? (
    <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-slate-400">
      {lines.map((line, i) => (
        <li key={i} className="whitespace-pre-line">
          {line}
        </li>
      ))}
    </ul>
  ) : null;

/** Modern — tinted contact/skills sidebar + main column. Sans-serif. */
export function ModernTemplate({ data }: TemplateProps) {
  const experience = filledExperience(data.experience);
  const education = filledEducation(data.education);
  const certifications = filledCertifications(data.certifications);
  const languages = filledLanguages(data.languages);
  const references = filledReferences(data.references);
  const skills = filledSkills(data.skills);
  const contacts = contactItems(data);
  const summary = data.summary.trim();
  const photo = photoUrl(data);

  return (
    <article className="font-sans text-[13px] leading-relaxed text-slate-700">
      <header className="mb-5 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{displayName(data)}</h1>
      </header>

      <div className="grid gap-6 sm:grid-cols-[34%_1fr]">
        <aside className="space-y-5 rounded-md bg-slate-50 p-4">
          {photo && (
            <img
              src={photo}
              alt=""
              className="h-24 w-24 rounded-md object-cover ring-1 ring-slate-200"
            />
          )}
          {contacts.length > 0 && (
            <section>
              <SideHeading>Contact</SideHeading>
              <ul className="space-y-1">
                {contacts.map((c, i) => (
                  <li key={i} className="break-words text-[12px] text-slate-700">
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <SideHeading>Skills</SideHeading>
              <ul className="flex flex-wrap gap-1.5">
                {skills.map((s, i) => (
                  <li
                    key={i}
                    className="rounded bg-white px-2 py-0.5 text-[11px] text-slate-700 ring-1 ring-slate-200"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <SideHeading>Languages</SideHeading>
              <ul className="space-y-0.5 text-[12px] text-slate-700">
                {languages.map((l, i) => (
                  <li key={i}>
                    {l.language}
                    {l.proficiency && <span className="text-slate-500"> — {l.proficiency}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

        <div className="min-w-0 space-y-5">
          {summary && (
            <section>
              <MainHeading>Profile</MainHeading>
              <p className="whitespace-pre-line">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <MainHeading>Experience</MainHeading>
              <div className="space-y-4">
                {experience.map((item, i) => (
                  <div key={i} className="resume-item">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold text-slate-900">{item.jobTitle || "Role"}</p>
                      {dateRange(item.startDate, item.endDate, item.current) && (
                        <p className="text-[12px] text-slate-500">
                          {dateRange(item.startDate, item.endDate, item.current)}
                        </p>
                      )}
                    </div>
                    {anyText(item.company, item.location) && (
                      <p className="text-[12px] text-slate-600">
                        {[item.company, item.location].filter(Boolean).join(" · ")}
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
              <MainHeading>Education</MainHeading>
              <div className="space-y-4">
                {education.map((item, i) => (
                  <div key={i} className="resume-item">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold text-slate-900">
                        {item.institution || "Institution"}
                      </p>
                      {dateRange(item.startDate, item.endDate) && (
                        <p className="text-[12px] text-slate-500">
                          {dateRange(item.startDate, item.endDate)}
                        </p>
                      )}
                    </div>
                    {anyText(item.degree, item.fieldOfStudy) && (
                      <p className="text-[12px] text-slate-600">
                        {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {item.location && <p className="text-[12px] text-slate-600">{item.location}</p>}
                    {item.description && (
                      <p className="mt-1 whitespace-pre-line">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <MainHeading>Certifications &amp; Training</MainHeading>
              <div className="space-y-3">
                {certifications.map((item, i) => (
                  <div key={i} className="resume-item">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold text-slate-900">{item.name || "Certification"}</p>
                      {dateRange(item.startDate, item.endDate) && (
                        <p className="text-[12px] text-slate-500">
                          {dateRange(item.startDate, item.endDate)}
                        </p>
                      )}
                    </div>
                    {anyText(item.institution, item.location) && (
                      <p className="text-[12px] text-slate-600">
                        {[item.institution, item.location].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-1 whitespace-pre-line">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {references.length > 0 && (
            <section>
              <MainHeading>References</MainHeading>
              <div className="grid gap-3 sm:grid-cols-2">
                {references.map((r, i) => (
                  <div key={i} className="resume-item text-[12px]">
                    <p className="font-semibold text-slate-900">{r.name || "Reference"}</p>
                    {anyText(r.position, r.institution) && (
                      <p className="text-slate-600">
                        {[r.position, r.institution].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {anyText(r.contact, r.email) && (
                      <p className="text-slate-600">
                        {[r.contact, r.email].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
