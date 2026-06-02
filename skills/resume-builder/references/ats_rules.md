# ATS Compatibility Rules & Common Failure Modes

## What ATS Systems Actually Do

Modern Applicant Tracking Systems (Workday, Greenhouse, Lever, iCIMS, Taleo, SmartRecruiters) parse your resume into structured fields: name, contact, work history, skills, education. They then rank candidates by keyword match against the job description.

Two failure modes:
1. **Parse failure** — ATS can't extract your text correctly (formatting issue)
2. **Rank failure** — ATS extracts correctly but your keywords don't match the JD

This guide covers how to avoid both.

---

## Formatting Rules (Parse Failures)

### Always Do

- **Single-column layout** — Multi-column layouts parse as garbled text in most ATS systems
- **Standard section headers** — Use exactly these: "Work Experience" or "Professional Experience", "Education", "Skills" or "Technical Skills", "Projects", "Certifications"
- **Simple bullet points** — Use standard `•` or `-`, not custom Unicode symbols
- **Readable fonts** — Arial, Calibri, Times New Roman, Georgia (10–12pt body)
- **Text is actual text** — Not embedded in images or graphics
- **Submit as .docx** — Unless the portal specifically says PDF. Docx parses most reliably in 2026
- **Dates in consistent format** — "Month Year" (Jan 2022) or "MM/YYYY" — pick one and stick to it

### Never Do

- **Tables** — Even for skills sections. ATS often reads table cells out of order
- **Text boxes** — Content in text boxes is frequently skipped entirely
- **Headers/footers** — Some ATS systems skip content in Word headers/footers. Put name/contact in the main body
- **Icons and graphics** — Invisible to ATS parsers
- **Skill bars or ratings** (★★★★☆) — ATS can't interpret these; they just show as garbage
- **Columns created via tab stops or fake columns** — Often parsed as a single scrambled line
- **Fancy section separators** (logos, dividers, lines as images) — Use paragraph borders instead if needed
- **Photos** — Never in US resumes (also a legal liability for employers)
- **Background colors** — Ignored or garble text extraction
- **Scanned PDFs** — ATS cannot read images of text; must be text-based

---

## Keyword Rules (Rank Failures)

### Keyword Matching Strategy

ATS systems do exact or near-exact string matching. "ML" and "Machine Learning" are different strings — include both forms at least once.

**Where to place keywords (priority order):**
1. Skills section (highest weight in most ATS)
2. Work experience bullets (medium weight, plus context)
3. Summary/objective (lower weight, but good for density)
4. Education and certifications (for required credentials)

**How to find the right keywords:**
1. Read the JD 2–3 times and highlight every technical term
2. Note terms that appear multiple times — those are must-haves
3. Note the exact phrasing used ("cross-functional collaboration" not "cross-team work")
4. Check "Required" vs "Preferred" sections — required keywords are highest priority

**Keyword density targets:**
- Skills section: List every relevant technology, not just the ones you're expert in (if you've used it professionally, list it)
- Bullets: At least 1–2 keywords per bullet when natural
- Overall match rate: Aim for 60–80% overlap with JD keywords; 40%+ is minimum

### Common keyword mistakes

- Using synonyms the JD doesn't use ("ML" when JD says "machine learning")
- Omitting well-known abbreviations ("GCP" when JD says "Google Cloud Platform" — list both)
- Listing skills in paragraph format ("Proficient in Python, Java, and Go") instead of clean list (harder for ATS to parse)
- Not listing skills you use daily because they feel too basic (always list Python, SQL, Git even if obvious)
- Job title mismatch — if the JD says "Software Engineer" and your title was "SWE", add the standard title in parentheses

---

## Section-Specific Rules

### Contact Header
- Name at top, large (14–16pt)
- Email, phone, LinkedIn URL, GitHub URL on one or two lines
- Location: City, State (not full address; remote is fine to note)
- **Do not put contact info in the Word header** — put it in the main body text

### Work Experience
- Reverse-chronological (most recent first)
- Company, title, dates, location on one line each (or two lines)
- 3–5 bullets per role
- Dates: right-aligned preferred, but left-aligned works too
- For internal transfers at same company: list company once, then indent each role under it

### Skills
- Use category labels: "Languages:", "Frameworks:", "Tools:", "Cloud:", etc.
- Plain comma-separated list per category (no columns, no skill bars)
- Order categories by relevance to the target role
- Keep to 4–6 categories max; don't make it overwhelming

### Education
- For 3+ years of experience: education goes at the bottom
- For new grads or <2 years: education can go near the top
- Include GPA only if ≥3.5; omit if older than 5 years
- List relevant coursework only if it directly maps to the JD (e.g., "Distributed Systems" course for a backend role)

### Projects (optional but valuable)
- Include 2–3 projects if they demonstrate skills not visible in work history
- Tech stack listed inline: "Built with Python, FastAPI, Redis, PostgreSQL"
- Link to GitHub or live demo if exists
- Especially important for: new grads, career switchers, candidates applying to a new domain

---

## File Submission Tips

- **Save as .docx**, not .doc (older format, worse compatibility)
- **File name**: FirstName_LastName_Resume.docx (no spaces)
- **Test it**: Copy-paste the text out of your .docx into Notepad. If it looks garbled, the ATS will read it that way too
- **PDF**: Only submit PDF if the portal specifically requests it, or if you're emailing directly to a person. Use a text-based PDF (export from Word/Google Docs), never a scan
- **One page vs two**: 1 page for <5 years experience, 2 pages for 5+ years. Never 1.5 pages (pad or trim to clean breaks)
