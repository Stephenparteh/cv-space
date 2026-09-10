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
  <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">{children}</h2>
);

const Bullets = ({ lines }: { lines: string[] }) =>
  lines.length > 0 ? (
    <ul className="mt-1 list-disc space-y-0.5 pl-4 marker:text-primary/50">
      {lines.map((line, i) => (
        <li key={i} className="whitespace-pre-line">
          {line}
        </li>
      ))}
    </ul>
  ) : null;

const Chips = ({ items }: { items: string[] }) => (
  <ul className="flex flex-wrap gap-1.5">
    {items.map((item, i) => (
      <li
        key={i}
        className="rounded-full border border-primary/30 px-2.5 py-0.5 text-[11px] text-slate-700"
      >
        {item}
      </li>
    ))}
  </ul>
);

/** Creative — navy accents, timeline experience, chip skills. Sans-serif. */
export function CreativeTemplate({ data }: TemplateProps) {
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
      <header className="mb-6 flex items-center gap-4">
        {photo && (
          <img
            src={photo}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary/40"
          />
        )}
        <div className="min-w-0">
          <h1 className="text-[26px] font-extrabold leading-none tracking-tight text-slate-900">
            {displayName(data)}
          </h1>
          <span className="mt-2 block h-0.5 w-16 bg-primary" />
          {contacts.length > 0 && (
            <p className="mt-2 text-[12px] text-slate-500">{contacts.join("  ·  ")}</p>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {summary && (
          <section>
            <Heading>Profile</Heading>
            <p className="whitespace-pre-line">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <Heading>Experience</Heading>
            <div className="space-y-4 border-l-2 border-primary/25 pl-4">
              {experience.map((item, i) => (
                <div key={i} className="resume-item relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
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
            <Heading>Education</Heading>
            <div className="space-y-3 border-l-2 border-primary/25 pl-4">
              {education.map((item, i) => (
                <div key={i} className="resume-item relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="font-semibold text-slate-900">{item.institution || "Institution"}</p>
                  {anyText(item.degree, item.fieldOfStudy) && (
                    <p className="text-[12px] text-slate-600">
                      {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {dateRange(item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-500">
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
              {certifications.map((c, i) => (
                <div key={i} className="resume-item">
                  <p className="font-medium text-slate-900">
                    {c.name || "Certification"}
                    {c.institution && <span className="text-slate-500"> · {c.institution}</span>}
                  </p>
                  {dateRange(c.startDate, c.endDate) && (
                    <p className="text-[12px] text-slate-500">{dateRange(c.startDate, c.endDate)}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {skills.length > 0 && (
            <section>
              <Heading>Skills</Heading>
              <Chips items={skills} />
            </section>
          )}
          {languages.length > 0 && (
            <section>
              <Heading>Languages</Heading>
              <Chips
                items={languages
                  .map((l) => [l.language, l.proficiency].filter(Boolean).join(" · "))
                  .filter(Boolean)}
              />
            </section>
          )}
        </div>

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
