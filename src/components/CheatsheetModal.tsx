import { useState } from 'react';
import { COURSE_MAP, INTRO, PILLARS, SECTIONS } from '../data/cheatsheet';
import { downloadCheatsheetPdf } from '../util/cheatsheetPdf';

function scrollToSection(id: string) {
  document.getElementById(`cs-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function CheatsheetModal({ onClose }: { onClose: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadCheatsheetPdf();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : String(e));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cheatsheet" onClick={(e) => e.stopPropagation()}>
        <div className="cheatsheet-head">
          <div>
            <h2>📘 SQL Cheatsheet</h2>
            <p className="muted small">50 tips, examples &amp; analogies — every example runs on the sample data.</p>
          </div>
          <div className="cheatsheet-actions">
            <button type="button" onClick={handleDownload} disabled={downloading}>
              {downloading ? 'Generating…' : '⬇ Download PDF'}
            </button>
            <button type="button" className="secondary close-x" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="banner-error">Could not generate the PDF: {downloadError}</div>
        )}

        <div className="cheatsheet-body">
          <p className="cs-intro">{INTRO}</p>

          <div className="pillars">
            {PILLARS.map((p) => (
              <div key={p.name} className="pillar">
                <span className="pillar-emoji">{p.emoji}</span>
                <div>
                  <strong>{p.name}</strong>
                  <span className="muted small"> — {p.blurb}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="cs-nav">
            <button type="button" className="cs-chip" onClick={() => scrollToSection('course-map')}>
              Course Map
            </button>
            {SECTIONS.map((s) => (
              <button key={s.id} type="button" className="cs-chip" onClick={() => scrollToSection(s.id)}>
                {s.title}
              </button>
            ))}
          </div>

          {/* Course map */}
          <section id="cs-course-map" className="cs-section">
            <h3 className="cs-section-title">🎓 Course Map — 12 Classes</h3>
            <p className="muted small">
              Each class connects Business (why), Architecture (how), and Build (hands-on) to real roles.
            </p>
            <div className="table-wrap">
              <table className="result-table course-map">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Class</th>
                    <th>Key concepts</th>
                    <th>Build skills</th>
                    <th>Career connections</th>
                  </tr>
                </thead>
                <tbody>
                  {COURSE_MAP.map((c) => (
                    <tr key={c.n}>
                      <td>{c.n}</td>
                      <td>{c.title}</td>
                      <td>{c.keyConcepts}</td>
                      <td>{c.buildSkills}</td>
                      <td>{c.career}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tip sections */}
          {SECTIONS.map((section) => (
            <section key={section.id} id={`cs-${section.id}`} className="cs-section">
              <h3 className="cs-section-title">{section.title}</h3>
              {section.blurb && <p className="muted small">{section.blurb}</p>}
              <div className="cs-tips">
                {section.tips.map((tip) => (
                  <div key={tip.n} className="cs-tip">
                    <div className="cs-tip-head">
                      <span className="cs-tip-num">{tip.n}</span>
                      <h4>{tip.title}</h4>
                      {tip.concept && <span className="cs-concept">{tip.concept}</span>}
                    </div>
                    <p className="cs-explain">{tip.explain}</p>
                    {tip.analogy && (
                      <p className="cs-analogy">
                        💡 <em>{tip.analogy}</em>
                      </p>
                    )}
                    {tip.example && <pre className="cs-example">{tip.example}</pre>}
                    {tip.business && (
                      <p className="cs-business">
                        <strong>Why it matters:</strong> {tip.business}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <p className="muted small cs-footer-note">
            Tip: paste any example into the Practice tab and press Run. SQLite and PostgreSQL share
            nearly all of this syntax.
          </p>
        </div>
      </div>
    </div>
  );
}
