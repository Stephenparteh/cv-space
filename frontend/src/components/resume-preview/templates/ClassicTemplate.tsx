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
  <h2 className="mb-2 border-b border-slate-300 pb-1 font-serif text-sm font-bold uppercase tracking-[0.12em] text-slate-800">
    {children}
  </h2>
);

const Bullets = ({ lines }: { lines: string[] }) =>
  lines.length > 0 ? (
    <ul className="mt-1 list-disc space-y-0.5 pl-5">
      {lines.map((line, i) => (
        <li key={i} className="whitespace-pre-line">
          {line}
        </li>
      ))}
    </ul>
  ) : null;

/** Classic — traditional serif, centred ruled header, single column. */
export function ClassicTemplate({ data }: TemplateProps) {
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
    <article className="font-serif text-[13px] leading-relaxed text-slate-800">
      <header className="mb-5 border-b-2 border-slate-800 pb-3 text-center">
        {photo && (
          <img
            src={photo}
            alt=""
            className="mx-auto mb-2 h-20 w-20 rounded-full object-cover ring-1 ring-slate-300"
          />
        )}
        <h1 className="text-2xl font-bold tracking-wide text-slate-900">{displayName(data)}</h1>
        {contacts.length > 0 && (
          <p className="mt-1.5 text-[12px] text-slate-600">{contacts.join("  ·  ")}</p>
        )}
      </header>

      {summary && (
        <section className="mb-5">
          <Heading>Summary</Heading>
          <p className="whitespace-pre-line">{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mb-5">
          <Heading>Experience</Heading>
          <div className="space-y-4">
            {experience.map((item, i) => (
              <div key={i} className="resume-item">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-bold text-slate-900">
                    {item.jobTitle || "Role"}
                    {item.company && <span className="font-normal">, {item.company}</span>}
                  </p>
                  {dateRange(item.startDate, item.endDate, item.current) && (
                    <p className="text-[12px] text-slate-600">
                      {dateRange(item.startDate, item.endDate, item.current)}
                    </p>
                  )}
                </div>
                {item.location && <p className="text-[12px] italic text-slate-600">{item.location}</p>}
                <Bullets lines={experienceLines(item)} />
              </div>
            ))}
          </div>
        </section>
      )}

      {education.length > 0 && (
        <section className="mb-5">
          <Heading>Education</Heading>
          <div className="space-y-4">
            {education.map((item, i) => (
              <div key={i} className="resume-item">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-bold text-slate-900">{item.institution || "Institution"}</p>
                  {dateRange(item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-600">
                      {dateRange(item.startDate, item.endDate)}
                    </p>
                  )}
                </div>
                {anyText(item.degree, item.fieldOfStudy) && (
                  <p className="text-[12px] text-slate-700">
                    {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                  </p>
                )}
                {item.location && <p className="text-[12px] italic text-slate-600">{item.location}</p>}
                {item.description && (
                  <p className="mt-1 whitespace-pre-line">{item.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="mb-5">
          <Heading>Certifications &amp; Training</Heading>
          <div className="space-y-3">
            {certifications.map((item, i) => (
              <div key={i} className="resume-item">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-bold text-slate-900">{item.name || "Certification"}</p>
                  {dateRange(item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-600">
                      {dateRange(item.startDate, item.endDate)}
                    </p>
                  )}
                </div>
                {anyText(item.institution, item.location) && (
                  <p className="text-[12px] text-slate-700">
                    {[item.institution, item.location].filter(Boolean).join(" — ")}
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

      {skills.length > 0 && (
        <section className="mb-5">
          <Heading>Skills</Heading>
          <p>{skills.join("  ·  ")}</p>
        </section>
      )}

      {languages.length > 0 && (
        <section className="mb-5">
          <Heading>Languages</Heading>
          <p>
            {languages
              .map((l) => [l.language, l.proficiency].filter(Boolean).join(" — "))
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </section>
      )}

      {references.length > 0 && (
        <section>
          <Heading>References</Heading>
          <div className="grid gap-3 sm:grid-cols-2">
            {references.map((r, i) => (
              <div key={i} className="resume-item text-[12px]">
                <p className="font-bold text-slate-900">{r.name || "Reference"}</p>
                {anyText(r.position, r.institution) && (
                  <p className="text-slate-700">
                    {[r.position, r.institution].filter(Boolean).join(", ")}
                  </p>
                )}
                {r.location && <p className="text-slate-600">{r.location}</p>}
                {anyText(r.contact, r.email) && (
                  <p className="text-slate-600">{[r.contact, r.email].filter(Boolean).join(" · ")}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
