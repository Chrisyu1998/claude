#!/usr/bin/env node
/**
 * Resume Generator — Jake's Resume Format (ATS-Optimized)
 *
 * Usage:
 *   node generate_resume.js <config.json> <output.docx>
 *
 * The config JSON schema is documented in SKILL.md.
 *
 * Install dependency: npm install docx
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  TabStopType,
  convertInchesToTwip,
} = require("docx");

const fs = require("fs");
const path = require("path");

// ─── Load config ────────────────────────────────────────────────────────────

const configPath = process.argv[2];
const outputPath = process.argv[3];

if (!configPath || !outputPath) {
  console.error("Usage: node generate_resume.js <config.json> <output.docx>");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

// ─── Style constants ─────────────────────────────────────────────────────────

const FONT = "Calibri";
const FONT_SIZE = 20; // half-points: 20 = 10pt
const FONT_SIZE_SMALL = 18; // 9pt
const FONT_SIZE_SECTION = 22; // 11pt
const FONT_SIZE_NAME = 28; // 14pt
const MARGIN = convertInchesToTwip(0.5);

// ─── Helper builders ─────────────────────────────────────────────────────────

function sectionHeader(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        font: FONT,
        size: FONT_SIZE_SECTION,
      }),
    ],
    spacing: { before: 120, after: 0 },
    border: {
      bottom: {
        color: "000000",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

function entryHeader(leftText, rightText) {
  // Company/School name + date on same line, right-aligned date via tab
  return new Paragraph({
    children: [
      new TextRun({ text: leftText, bold: true, font: FONT, size: FONT_SIZE }),
      new TextRun({ text: "\t" }),
      new TextRun({ text: rightText, font: FONT, size: FONT_SIZE }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: convertInchesToTwip(7.5),
      },
    ],
    spacing: { before: 80, after: 0 },
  });
}

function entrySubHeader(leftText, rightText) {
  // Title/Degree + location
  return new Paragraph({
    children: [
      new TextRun({ text: leftText, italics: true, font: FONT, size: FONT_SIZE }),
      new TextRun({ text: "\t" }),
      new TextRun({ text: rightText, italics: true, font: FONT, size: FONT_SIZE }),
    ],
    tabStops: [
      {
        type: TabStopType.RIGHT,
        position: convertInchesToTwip(7.5),
      },
    ],
    spacing: { before: 0, after: 0 },
  });
}

function bullet(text, level = 0) {
  const indent = convertInchesToTwip(0.25 + level * 0.2);
  return new Paragraph({
    children: [new TextRun({ text, font: FONT, size: FONT_SIZE })],
    bullet: { level },
    indent: { left: indent, hanging: convertInchesToTwip(0.15) },
    spacing: { before: 0, after: 0 },
  });
}

function spacer(pts = 40) {
  return new Paragraph({
    children: [],
    spacing: { before: 0, after: pts },
  });
}

function plainLine(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONT,
        size: options.size || FONT_SIZE,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.spaceBefore || 0, after: options.spaceAfter || 0 },
  });
}

// ─── Build sections ──────────────────────────────────────────────────────────

function buildHeader(contact) {
  const parts = [];

  // Name
  parts.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contact.name,
          bold: true,
          font: FONT,
          size: FONT_SIZE_NAME,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
    })
  );

  // Contact line — pipe-separated
  const contactParts = [];
  if (contact.phone) contactParts.push(contact.phone);
  if (contact.email) contactParts.push(contact.email);
  if (contact.linkedin) contactParts.push(contact.linkedin);
  if (contact.github) contactParts.push(contact.github);
  if (contact.location) contactParts.push(contact.location);

  parts.push(
    new Paragraph({
      children: [
        new TextRun({
          text: contactParts.join(" | "),
          font: FONT,
          size: FONT_SIZE_SMALL,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
    })
  );

  return parts;
}

function buildSummary(summary) {
  if (!summary) return [];
  return [
    sectionHeader("Summary"),
    plainLine(summary, { spaceBefore: 40, spaceAfter: 40 }),
  ];
}

function buildExperience(experience) {
  if (!experience || experience.length === 0) return [];
  const parts = [sectionHeader("Work Experience")];

  for (const job of experience) {
    const dateRange = job.end
      ? `${job.start} – ${job.end}`
      : `${job.start} – Present`;

    parts.push(entryHeader(job.company, dateRange));
    parts.push(entrySubHeader(job.title, job.location || ""));

    for (const b of job.bullets || []) {
      parts.push(bullet(b));
    }
  }

  return parts;
}

function buildEducation(education) {
  if (!education || education.length === 0) return [];
  const parts = [sectionHeader("Education")];

  for (const edu of education) {
    parts.push(entryHeader(edu.school, edu.graduation || ""));
    const subLeft = edu.gpa
      ? `${edu.degree} — GPA: ${edu.gpa}`
      : edu.degree;
    parts.push(entrySubHeader(subLeft, edu.location || ""));

    if (edu.relevant_coursework && edu.relevant_coursework.length > 0) {
      parts.push(
        plainLine(`Relevant Coursework: ${edu.relevant_coursework.join(", ")}`, {
          spaceBefore: 0,
          italics: true,
        })
      );
    }
  }

  return parts;
}

function buildSkills(skills) {
  if (!skills || Object.keys(skills).length === 0) return [];
  const parts = [sectionHeader("Technical Skills")];

  for (const [category, items] of Object.entries(skills)) {
    const line = `${category}: ${items.join(", ")}`;
    parts.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${category}: `, bold: true, font: FONT, size: FONT_SIZE }),
          new TextRun({ text: items.join(", "), font: FONT, size: FONT_SIZE }),
        ],
        spacing: { before: 30, after: 0 },
      })
    );
  }

  return parts;
}

function buildProjects(projects) {
  if (!projects || projects.length === 0) return [];
  const parts = [sectionHeader("Projects")];

  for (const proj of projects) {
    parts.push(
      new Paragraph({
        children: [
          new TextRun({ text: proj.name, bold: true, font: FONT, size: FONT_SIZE }),
          proj.tech
            ? new TextRun({ text: ` | ${proj.tech}`, italics: true, font: FONT, size: FONT_SIZE })
            : new TextRun({ text: "" }),
        ],
        spacing: { before: 80, after: 0 },
      })
    );
    for (const b of proj.bullets || []) {
      parts.push(bullet(b));
    }
  }

  return parts;
}

function buildCertifications(certs) {
  if (!certs || certs.length === 0) return [];
  const parts = [sectionHeader("Certifications")];
  for (const cert of certs) {
    parts.push(plainLine(`• ${cert}`, { spaceBefore: 20 }));
  }
  return parts;
}

// ─── Assemble document ───────────────────────────────────────────────────────

const allSections = [
  ...buildHeader(cfg.contact || {}),
  ...buildSummary(cfg.summary),
  ...buildExperience(cfg.experience || []),
  ...buildEducation(cfg.education || []),
  ...buildSkills(cfg.skills || {}),
  ...buildProjects(cfg.projects || []),
  ...buildCertifications(cfg.certifications || []),
];

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: MARGIN,
            right: MARGIN,
            bottom: MARGIN,
            left: MARGIN,
          },
        },
      },
      children: allSections,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outputPath, buffer);
  console.log(`Resume written to: ${outputPath}`);
});
