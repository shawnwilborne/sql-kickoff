// Builds a multi-page PDF of the cheatsheet using jsPDF.
// jsPDF is dynamically imported so it only loads when the user clicks Download.

import { COURSE_MAP, INTRO, PDF_FILENAME, PILLARS, SECTIONS } from '../data/cheatsheet';

type RGB = [number, number, number];

const GREEN: RGB = [22, 119, 65];
const INK: RGB = [30, 36, 29];
const MUTED: RGB = [90, 107, 99];
const ORANGE: RGB = [180, 75, 0];
const CODEBG: RGB = [15, 31, 23];

export async function downloadCheatsheetPdf(): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;
  let pageNum = 1;

  const footer = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(160, 168, 163);
    doc.text('SQL Kickoff — SQL Cheatsheet', margin, pageH - 24);
    doc.text(`Page ${pageNum}`, pageW - margin, pageH - 24, { align: 'right' });
  };

  const newPage = () => {
    footer();
    doc.addPage();
    pageNum += 1;
    y = margin;
  };

  const ensure = (needed: number) => {
    if (y + needed > pageH - margin - 14) newPage();
  };

  interface WriteOpts {
    size?: number;
    style?: 'normal' | 'bold' | 'italic';
    color?: RGB;
    font?: 'helvetica' | 'courier';
    gapAfter?: number;
    indent?: number;
    lineFactor?: number;
  }

  const write = (text: string, opts: WriteOpts = {}) => {
    const {
      size = 10.5,
      style = 'normal',
      color = INK,
      font = 'helvetica',
      gapAfter = 5,
      indent = 0,
      lineFactor = 1.35,
    } = opts;
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lineH = size * lineFactor;
    // Preserve intentional line breaks in examples, wrap each segment to width.
    for (const segment of text.split('\n')) {
      const lines = doc.splitTextToSize(segment, contentW - indent) as string[];
      for (const line of lines) {
        ensure(lineH);
        doc.text(line, margin + indent, y);
        y += lineH;
      }
    }
    y += gapAfter;
  };

  const codeBlock = (text: string) => {
    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    const lineH = 9 * 1.4;
    const padded = text.split('\n').flatMap((seg) => doc.splitTextToSize(seg, contentW - 20) as string[]);
    const blockH = padded.length * lineH + 12;
    ensure(blockH);
    doc.setFillColor(...CODEBG);
    doc.roundedRect(margin, y - 2, contentW, blockH, 4, 4, 'F');
    doc.setTextColor(214, 245, 227);
    let cy = y + 12;
    for (const line of padded) {
      doc.text(line, margin + 10, cy);
      cy += lineH;
    }
    y += blockH + 6;
  };

  const rule = () => {
    ensure(10);
    doc.setDrawColor(220, 227, 221);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
  };

  // ---- Title ----
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 110, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('SQL Kickoff', margin, 56);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('The Plain-English SQL Cheatsheet', margin, 80);
  doc.setFontSize(9);
  doc.text('50 tips, examples & analogies for modern data teams', margin, 96);
  y = 132;

  write(INTRO, { color: MUTED, size: 10.5, gapAfter: 10 });

  // ---- Three pillars ----
  write('How every concept is framed', { size: 13, style: 'bold', color: GREEN, gapAfter: 4 });
  for (const p of PILLARS) {
    write(`${p.emoji}  ${p.name} — ${p.blurb}`, { size: 10.5, gapAfter: 3 });
  }
  write(
    'Plus career connections to real roles: Data Analyst, Technical Program Manager, Product Manager, Business Analyst, and AI Operations.',
    { color: MUTED, size: 9.5, gapAfter: 8 },
  );
  rule();

  // ---- Course map ----
  write('Course Map — 12 Classes', { size: 14, style: 'bold', color: GREEN, gapAfter: 6 });
  for (const c of COURSE_MAP) {
    ensure(48);
    write(`${c.n}. ${c.title}`, { size: 11, style: 'bold', gapAfter: 2 });
    write(`Key concepts: ${c.keyConcepts}`, { size: 9.5, color: MUTED, indent: 12, gapAfter: 1 });
    write(`Build skills: ${c.buildSkills}`, { size: 9.5, color: MUTED, indent: 12, gapAfter: 1 });
    write(`Careers: ${c.career}`, { size: 9.5, color: ORANGE, indent: 12, gapAfter: 6 });
  }

  // ---- Sections of tips ----
  for (const section of SECTIONS) {
    newPage();
    write(section.title, { size: 16, style: 'bold', color: GREEN, gapAfter: 3 });
    if (section.blurb) write(section.blurb, { size: 10, color: MUTED, gapAfter: 8 });

    for (const tip of section.tips) {
      ensure(60);
      const heading = tip.concept ? `${tip.n}. ${tip.title}   [${tip.concept}]` : `${tip.n}. ${tip.title}`;
      write(heading, { size: 12, style: 'bold', color: INK, gapAfter: 3 });
      write(tip.explain, { size: 10.5, gapAfter: tip.analogy ? 3 : 5 });
      if (tip.analogy) write(`Analogy: ${tip.analogy}`, { size: 10, style: 'italic', color: MUTED, gapAfter: 5 });
      if (tip.example) codeBlock(tip.example);
      if (tip.business) write(`Why it matters: ${tip.business}`, { size: 9.5, color: ORANGE, gapAfter: 6 });
      rule();
    }
  }

  footer();
  doc.save(PDF_FILENAME);
}
