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

const Heading = ({ children }: { children: string }) => (
  <h2 className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-slate-800">
    {children}
    <span className="mt-1 block h-0.5 w-8 bg-slate-800" />
  </h2>
);

const SideHeading = ({ children }: { children: string }) => (
  <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">{children}</h2>
);

const Bullets = ({ lines }: { lines: string[] }) =>
  lines.length > 0 ? (
    <ul className="mt-1 list-disc space-y-0.5 pl-4">
      {lines.map((line, i) => (
        <li key={i} className="whitespace-pre-line">
          {line}
        </li>
      ))}
    </ul>
  ) : null;

/** Professional — wide main column + narrow right column, accent-bar headings. */
export function ProfessionalTemplate({ data }: TemplateProps) {
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
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-slate-300 pb-4">
        <div>
          <h1 className="text-[26px] font-bold leading-tight tracking-tight text-slate-900">
            {displayName(data)}
          </h1>
          {contacts.length > 0 && (
            <p className="mt-1 text-[12px] text-slate-600">{contacts.join("   |   ")}</p>
          )}
        </div>
        {photo && (
          <img
            src={photo}
            alt=""
            className="h-24 w-20 shrink-0 rounded-sm object-cover ring-1 ring-slate-300"
          />
        )}
      </header>

      <div className="grid gap-7 sm:grid-cols-[1fr_31%]">
        <div className="min-w-0 space-y-6">
          {summary && (
            <section>
              <Heading>Profile</Heading>
              <p className="whitespace-pre-line">{summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <Heading>Experience</Heading>
              <div className="space-y-4">
                {experience.map((item, i) => (
                  <div key={i} className="resume-item">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="font-semibold text-slate-900">{item.jobTitle || "Role"}</p>
                      {dateRange(item.startDate, item.endDate, item.current) && (
                        <p className="text-[12px] font-medium text-slate-500">
                          {dateRange(item.startDate, item.endDate, item.current)}
                        </p>
                      )}
                    </div>
                    {anyText(item.company, item.location) && (
                      <p className="text-[12px] text-slate-600">
                        {[item.company, item.location].filter(Boolean).join(" — ")}
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
              <Heading>References</Heading>
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

        <div className="space-y-6 border-t border-slate-200 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          {skills.length > 0 && (
            <section>
              <SideHeading>Skills</SideHeading>
              <ul className="space-y-1 text-[12px]">
                {skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <SideHeading>Languages</SideHeading>
              <ul className="space-y-1 text-[12px]">
                {languages.map((l, i) => (
                  <li key={i}>
                    {l.language}
                    {l.proficiency && <span className="text-slate-500"> — {l.proficiency}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <SideHeading>Certifications</SideHeading>
              <ul className="space-y-2 text-[12px]">
                {certifications.map((c, i) => (
                  <li key={i} className="resume-item">
                    <span className="font-medium text-slate-900">{c.name || "Certification"}</span>
                    {c.institution && <span className="block text-slate-500">{c.institution}</span>}
                    {dateRange(c.startDate, c.endDate) && (
                      <span className="block text-slate-400">{dateRange(c.startDate, c.endDate)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
