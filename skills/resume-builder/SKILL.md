---
name: resume-builder
description: "Use this skill to create or tailor a professional, ATS-optimized resume. Trigger whenever the user mentions: resume, CV, job application, updating their resume, tailoring for a job, applying for a position, career document, or needs help getting past ATS systems. This skill handles the full flow: collecting the user's background, analyzing target job postings for keywords, generating a polished ATS-compatible .docx resume in a widely-praised single-column format, and then running an AI hiring manager evaluator to score and iteratively improve the resume. Even if the user just says 'help me apply for this job' or 'fix my resume' or 'I need a resume for X role', use this skill — it covers all resume-related tasks end to end."
---

# Resume Builder

Creates professional, ATS-optimized resumes tailored to specific job postings. Handles everything from intake to final polished `.docx` output, with an AI hiring manager evaluation loop that iteratively improves the resume until it's strong.

## Overview

This skill follows a structured flow:

1. **Intake** — Collect the user's background (paste or file upload)
2. **Target** — Identify the target role and analyze job posting(s) for keywords
3. **Clarify** — Ask targeted questions to fill in missing metrics and sharpen weak bullets (with reasoning for each ask)
4. **Generate** — Build an ATS-optimized resume using the proven Jake's Resume format
5. **Evaluate** — Run an AI hiring manager sub-agent to judge and score the resume
6. **Improve** — Revise based on evaluator feedback until the score is high (≥8/10)
7. **User Critique Loop** — Human review: user states what to change, Claude agrees/disagrees with reasoning, apply + re-evaluate
8. **Deliver** — Output a polished `.docx` file ready to submit

---

## Step 1: Intake

Ask the user for their background information. They can:
- **Paste it directly** into the chat (raw text, old resume, LinkedIn About, etc.)
- **Upload a file** (any format — .docx, .pdf, .txt, .md)

Collect at minimum:
- Full name, email, phone, location (city/state), LinkedIn URL, GitHub URL (if relevant)
- Work experience: company, title, dates, responsibilities and achievements
- Education: degree, institution, graduation year, GPA (if notable ≥3.5)
- Skills: languages, frameworks, tools, platforms
- Projects (especially for less experienced candidates)
- Certifications, awards, publications (if any)

If the user uploads a file, read it from `/sessions/exciting-epic-volta/mnt/uploads/`. Extract all the above fields.

---

## Step 2: Target Role & Keyword Extraction

Ask for the target job title and 1–3 job posting URLs (or pasted job descriptions).

For each job posting:
1. Fetch the URL using WebFetch (or ask the user to paste the JD if the URL is inaccessible)
2. Extract the **top 15–20 keywords** the posting emphasizes — look for:
   - Specific technologies (e.g., "Kubernetes", "Python", "BigQuery")
   - Frameworks and platforms (e.g., "React", "GCP", "Terraform")
   - Soft skills that appear repeatedly (e.g., "cross-functional", "stakeholder")
   - Required qualifications phrased exactly (copy the phrasing)
   - Action verbs used in the posting
3. Identify the **top 8–10 must-have keywords** that appear most across all postings

These keywords should be naturally woven into the resume bullets and skills section. The goal is keyword density without stuffing — every keyword should reflect something the user actually did.

---

## Step 3: Interactive Clarification (Critical — Do Not Skip)

Before writing a single bullet, analyze the user's experience for gaps and ask targeted questions to get real data. **Never fabricate or assume metrics.** A number you invented will either be obviously wrong or worse — a lie on a resume that can surface in an interview. Every quantified claim must come from the user.

### How to identify gaps

For each role and project, scan for:
- **Missing scale**: No mention of team size, user count, request volume, data size, or dollar impact
- **Missing outcome**: The user describes *what* they did but not *what changed* as a result
- **Vague contribution**: "Helped with", "worked on", "participated in" — unclear what they personally owned
- **Missing context for the target role**: An experience that's clearly relevant to the JD but the current description doesn't surface the connection

### How to ask clarification questions

When you find a gap, surface it as a question — but always lead with *why* it matters to a hiring manager before asking for the detail. This helps the user understand what kind of answer is useful, and reassures them you're not just fishing for impressive-sounding numbers.

**Format each question like this:**

> **[Role/Project]** — [Why this detail matters to a hiring manager for this specific role]
>
> [Specific question asking for the real data]

**Example questions (use these as inspiration, not scripts):**

> **Google – Search Ads Backend** — Hiring managers for the Gemini role care deeply about scale because ML infrastructure decisions are driven by traffic volume. Knowing you handled billions of requests tells them you've worked at the scale Gemini operates at.
>
> Roughly how many requests per day or second did the ad ranking system handle? Even an order-of-magnitude estimate works (e.g., "hundreds of millions/day", "~50K QPS").

> **Google – Latency reduction** — "Helped reduce latency" is one of the most common resume phrases and often gets discounted. A specific number transforms it from noise into signal.
>
> Do you know approximately how much you reduced latency — even a rough range like "30–50%"? And which part of the system: end-to-end, p50, p99?

> **Stripe Intern – Fraud monitoring dashboard** — The JD mentions "cross-functional collaboration with ML researchers." If your fraud dashboard was used by a data science or risk modeling team, that's a direct parallel worth making explicit.
>
> Who were the primary users of the dashboard — engineers, data scientists, ops/trust & safety analysts? And do you know roughly how many people or teams used it?

### Batching questions

Group your questions by role so the conversation feels organized, not like an interrogation. A good batch is 3–5 questions total across all roles. If there are more gaps than that, prioritize the ones tied to the most important keywords from the JD.

Present all questions at once so the user can answer in one pass. Make it clear they can say "I don't know" or "skip that one" — partial information is always better than invented information.

### After receiving answers

Incorporate the user's answers literally — use their numbers, their framing, their language as the foundation. Only reshape the *sentence structure* to fit a strong bullet format; don't add claims they didn't make.

If the user can't quantify something, reframe the bullet to show ownership and scope instead:
- No metric → emphasize team size, system criticality, or business context ("owned the primary fraud signal pipeline for the risk team")
- Vague contribution → make the specific technical contribution explicit ("designed the schema and wrote the ingestion pipeline for the dashboard's data layer")

---

## Step 4: Generate the Resume

Use the script at `scripts/generate_resume.js` to produce the `.docx` file.

Install dependency first:
```bash
cd /sessions/exciting-epic-volta && npm install docx
```

Then call the script with a JSON config (see below). The script produces an ATS-optimized resume in **Jake's Resume format** — a single-column, clean layout that is:
- Consistently praised by tech recruiters and CS hiring managers
- Parses cleanly through all major ATS platforms (Workday, Greenhouse, Lever, Taleo)
- Fits content-heavy technical backgrounds without feeling cluttered

### Resume JSON config structure

Build this config from the user's intake data:

```json
{
  "contact": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "555-555-5555",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  },
  "summary": "2–3 sentence optional summary tailored to the target role. Skip this if the user has 5+ years of experience and strong section content — the work speaks for itself.",
  "experience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State (or Remote)",
      "start": "Month Year",
      "end": "Month Year (or Present)",
      "bullets": [
        "Action verb + what you did + quantified impact (e.g., 'Reduced API latency by 40% by migrating from REST to gRPC, serving 50M+ requests/day')",
        "3–5 bullets per role, each starting with a strong past-tense action verb"
      ]
    }
  ],
  "education": [
    {
      "school": "University Name",
      "degree": "B.S. Computer Science",
      "location": "City, State",
      "graduation": "May 2022",
      "gpa": "3.8/4.0",
      "relevant_coursework": []
    }
  ],
  "skills": {
    "Languages": ["Python", "Go", "Java", "TypeScript"],
    "Frameworks": ["React", "FastAPI", "Spring Boot"],
    "Tools & Platforms": ["Kubernetes", "GCP", "Terraform", "Docker"],
    "Concepts": ["Distributed systems", "ML pipelines", "REST APIs"]
  },
  "projects": [
    {
      "name": "Project Name",
      "tech": "Python, FastAPI, PostgreSQL",
      "bullets": ["What it does and the impact"]
    }
  ],
  "certifications": []
}
```

### Bullet point quality standards

Each bullet should ideally follow: **[Action verb] + [what you built/did] + [quantified result]**

Good examples:
- "Architected a distributed caching layer using Redis that reduced p99 latency by 65% for 10M daily active users"
- "Led migration of 3 monolithic services to microservices, cutting deployment time from 2 hours to 8 minutes"
- "Collaborated with PM and design to ship a real-time notification system used by 2M+ users"

**Only use numbers the user confirmed in Step 3.** If a metric wasn't provided, use qualitative framing that conveys ownership and scope:
- "Owned the primary ad ranking microservice serving the Search Ads pipeline" (scale implied, not fabricated)
- "Designed and shipped end-to-end fraud monitoring dashboard adopted by the risk ops team"

Aim for at least 60% of bullets to have a number or quantifiable outcome — but every number must be real.

---

## Step 5: Run the Hiring Manager Evaluator

After generating the resume, spawn a sub-agent using the instructions in `agents/hiring_manager.md`.

The evaluator follows this process:

**Step 0: Adopt the persona.** Before scoring anything, the evaluator writes a 2–3 sentence internal brief on who it is as this specific hiring manager: what team it's hiring for, what the #1 hardest-to-find signal is, and what an instant "yes" vs. instant red flag looks like for this role. This persona shapes every score and piece of feedback that follows. A Gemini infra HM, an Anthropic ML Eng HM, and a Meta new grad HM have fundamentally different priorities — the evaluator must internalize that difference before touching the resume.

**Then it scores across 5 dimensions** (ATS compatibility, impact/quantification, keyword relevance, clarity, role fit) and returns role-specific gap analysis and concrete bullet rewrites.

Pass the evaluator:
- The path to the generated resume `.docx`
- The target role: job title, team name, and company (be specific — "L4 SWE, Gemini team, Google" is better than just "Google SWE")
- The full job description (or a close summary of it) — the evaluator uses this to understand what the team actually builds and what gaps matter
- The top 10 keywords extracted from the job postings

The evaluator returns a `persona` field (the Step 0 brief), an overall score (1–10), `role_specific_gaps`, and concrete `bullet_rewrites`.

---

## Step 6: Improve Based on Evaluator Feedback

Read the evaluator's feedback and apply improvements. When the evaluator flags weak bullets:

- If the issue is **missing information** (e.g., "this bullet would be stronger with the latency reduction number") — ask the user for it using the same clarification format from Step 3. Don't silently invent a fix.
- If the issue is **phrasing or structure** (e.g., "passive voice", "buried the impact") — fix it yourself using the user's existing information.
- If the issue is **a missing keyword** — add it to the skills section if the user listed that skill, or weave it into an existing bullet if it naturally fits something they did.

Improvements to apply:
1. **Keyword gaps** — Add missing JD keywords to skills or bullets (only where the user has that experience)
2. **Weak bullets** — Rewrite bullets flagged for phrasing, structure, or passive voice
3. **Missing metrics** — Ask the user for the specific number before rewriting (don't assume)
4. **Tailoring gaps** — Adjust summary and top bullets to better match the role
5. **Skills ordering** — Reorganize to lead with the most JD-relevant skills

Regenerate the `.docx` and re-run the evaluator. Repeat until the evaluator gives ≥8/10 overall, or after 3 iterations (whichever comes first). Show the user the score after each pass.

---

## Step 7: User Critique Loop

After the evaluator pass, invite the user to review the resume and give their own critique. This step runs **after** the AI evaluator has already made its improvements — it's the human gut-check that catches accuracy errors, misrepresented contributions, and tone issues that an AI evaluator can't know about.

### Present your own critique first

Before asking the user, briefly share your own read on the resume. Flag anything that looks potentially weak, overclaimed, vague, or misaligned with the target role. Be specific: quote the bullet or line, and explain what concerns you. This gives the user a starting point and models the kind of analysis that's useful. Keep it to 3–5 items.

Example format:
> **My read before your feedback:**
> - "Implemented India compliance" — this phrasing implies you owned the full implementation. If you were coordinating between teams rather than writing the code yourself, we should soften this to avoid a gotcha in the interview.
> - The Metered Billing bullet leads with the technical architecture but buries the business impact at the end. Consider flipping it.
> - "Distributed Systems" appears in Skills but I don't see it clearly demonstrated in any bullet — worth verifying this is accurate.

Then ask the user: "What do you want to change? List anything that's inaccurate, overstated, missing, or just doesn't feel right. No change is too small."

### Analyze each requested change before applying it

For every change the user requests, **explicitly state whether you agree and why** before applying it. This builds trust, catches misunderstandings, and surfaces cases where the user may be underselling themselves unnecessarily.

Use this format for each item:

> **Change requested:** Remove "led" from the Payments infra bullet — I didn't lead it, I was one of several engineers.
>
> **My take:** Agreed. "Led" implies singular ownership and could be challenged in an interview. I'll change it to "contributed to" or "co-engineered" — which still conveys meaningful participation without overclaiming. If you want to signal a specific contribution you owned, let me know and I can make it more precise.

> **Change requested:** Add that I was also the on-call owner for this service.
>
> **My take:** Agreed — this is worth including. On-call ownership signals production responsibility, which is a strong signal for infrastructure-adjacent roles. I'll add it to the relevant bullet.

> **Change requested:** Remove the GPA — I don't think it matters at this level.
>
> **My take:** Partially disagree. At 3.5+ years of experience, GPA is generally low-signal and you're right most hiring managers skip it. However, if your GPA was notably high (≥3.7), it's a free credibility signal that costs no space. If it's average or you'd prefer not to include it, I'll remove it — your call.

The goal is not to push back for its own sake — it's to make sure every change is deliberate and the tradeoff is understood.

### After applying all agreed changes

1. Regenerate the `.docx` (and PDF if the user wants one)
2. Re-run the hiring manager evaluator sub-agent on the updated resume
3. Report the new score and any remaining gaps the evaluator flags
4. Ask: "Anything else to change, or are we good to finalize?"

Repeat this loop as many times as the user wants — there is no cap on iterations. Keep going until the user says they're satisfied.

---

## Step 8: Deliver

Save the final `.docx` to the user's workspace folder with the filename:
`[FirstName]_[LastName]_Resume.docx`

Also provide the user with:
- A brief summary of the keyword matches (which top keywords from the JD are now in the resume)
- The final evaluator score and any remaining suggestions
- Tips for submitting (e.g., "Submit as .docx unless the portal specifically asks for PDF")

---

## ATS Formatting Rules (enforced by the script)

The generate script handles all of this, but it's useful context:

- **Single-column layout** — no tables, no text boxes, no multi-column sections
- **Standard section headers** — "Work Experience", "Education", "Skills", "Projects", "Certifications"
- **Font**: Calibri or Arial, 10–11pt body, 11–14pt name
- **Margins**: 0.5 inch on all sides (maximizes space while staying parseable)
- **File format**: `.docx` (most reliable for ATS parsing in 2026)
- **No graphics, icons, skill bars, or colored backgrounds**
- **Date format**: "Month Year – Month Year" (e.g., "Jan 2022 – Mar 2024")
- **Acronyms**: Include both acronym and full form at least once (e.g., "GCP (Google Cloud Platform)")

---

## Important: Keyword Tailoring Per Application

A resume should never be fully generic. For each new job application, the top bullets, summary, and skills section ordering should be tuned to that posting. If the user is applying to multiple jobs, save a base version and create tailored copies per application cluster.

---

## Reading reference files

- `references/ats_rules.md` — Detailed ATS compatibility rules and common failure modes
- `agents/hiring_manager.md` — Full instructions for the hiring manager evaluator sub-agent
- `scripts/generate_resume.js` — The docx generation script (run with Node.js)
