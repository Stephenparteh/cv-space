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

const Label = ({ children }: { children: string }) => (
  <h2 className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-400">
    {children}
  </h2>
);

const Bullets = ({ lines }: { lines: string[] }) =>
  lines.length > 0 ? (
    <ul className="mt-1.5 space-y-1 text-slate-700">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 whitespace-pre-line">
          <span className="text-slate-300">–</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  ) : null;

/** Minimal — airy single column, small tracked labels, hairline rules only. */
export function MinimalTemplate({ data }: TemplateProps) {
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
    <article className="font-sans text-[13px] leading-relaxed text-slate-600">
      <header className="mb-8 flex items-start gap-4">
        {photo && (
          <img src={photo} alt="" className="h-12 w-12 rounded object-cover grayscale" />
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">{displayName(data)}</h1>
          {contacts.length > 0 && (
            <p className="mt-1 text-[12px] text-slate-400">{contacts.join("   ")}</p>
          )}
        </div>
      </header>

      <div className="space-y-8">
        {summary && (
          <section>
            <Label>About</Label>
            <p className="whitespace-pre-line text-slate-700">{summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <Label>Experience</Label>
            <div className="space-y-5">
              {experience.map((item, i) => (
                <div key={i} className="resume-item">
                  <p className="text-slate-900">
                    <span className="font-medium">{item.jobTitle || "Role"}</span>
                    {item.company && <span className="text-slate-500"> · {item.company}</span>}
                  </p>
                  {anyText(item.location, item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-400">
                      {[item.location, dateRange(item.startDate, item.endDate, item.current)]
                        .filter(Boolean)
                        .join("   ·   ")}
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
            <Label>Education</Label>
            <div className="space-y-5">
              {education.map((item, i) => (
                <div key={i} className="resume-item">
                  <p className="text-slate-900">
                    <span className="font-medium">{item.institution || "Institution"}</span>
                    {anyText(item.degree, item.fieldOfStudy) && (
                      <span className="text-slate-500">
                        {" "}
                        · {[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </p>
                  {anyText(item.location, item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-400">
                      {[item.location, dateRange(item.startDate, item.endDate)]
                        .filter(Boolean)
                        .join("   ·   ")}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-1.5 whitespace-pre-line text-slate-700">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <Label>Certifications &amp; Training</Label>
            <div className="space-y-4">
              {certifications.map((item, i) => (
                <div key={i} className="resume-item">
                  <p className="text-slate-900">
                    <span className="font-medium">{item.name || "Certification"}</span>
                    {item.institution && (
                      <span className="text-slate-500"> · {item.institution}</span>
                    )}
                  </p>
                  {anyText(item.location, item.startDate, item.endDate) && (
                    <p className="text-[12px] text-slate-400">
                      {[item.location, dateRange(item.startDate, item.endDate)]
                        .filter(Boolean)
                        .join("   ·   ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <Label>Skills</Label>
            <p className="text-slate-700">{skills.join("   ·   ")}</p>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <Label>Languages</Label>
            <p className="text-slate-700">
              {languages
                .map((l) => [l.language, l.proficiency].filter(Boolean).join(" — "))
                .filter(Boolean)
                .join("   ·   ")}
            </p>
          </section>
        )}

        {references.length > 0 && (
          <section>
            <Label>References</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              {references.map((r, i) => (
                <div key={i} className="resume-item text-[12px] text-slate-500">
                  <p className="font-medium text-slate-900">{r.name || "Reference"}</p>
                  {anyText(r.position, r.institution) && (
                    <p>{[r.position, r.institution].filter(Boolean).join(", ")}</p>
                  )}
                  {anyText(r.contact, r.email) && (
                    <p>{[r.contact, r.email].filter(Boolean).join("   ·   ")}</p>
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
