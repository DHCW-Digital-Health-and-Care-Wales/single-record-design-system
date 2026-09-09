# Design system feedback form — question set

The source for the Google Form at **[paste the live URL here once built]**.

One form, two paths. A routing question sends people either to *Report an issue*
or to *Request a component or change*; everything else is shared. Change the
questions here first, then the form, so the two do not drift.

**Why a form at all,** when `docs/engineering/adopting-components.md` says all
feedback goes through GitHub issues on the org repo: because that route only
works for people with a GitHub account and a reason to have one. Clinical staff
testing a prototype, a service manager who spots a wrong label, a nurse in a
usability session — none of them are going to file a GitHub issue, and their
feedback is the feedback that matters most. The form is the front door for
everyone else; triage still turns it into a GitHub issue.

---

## Before you build it

- **The form must say, prominently, that nothing patient-identifiable goes in
  it.** Free-text boxes and screenshots of a live EPR screen are exactly where
  patient data leaks. The notice is repeated immediately above every free-text
  question and the upload, not just at the top.
- **Check Google Forms is sanctioned before you publish it.** DHCW runs on
  Microsoft; a Google Form is a third-party processor holding NHS staff names
  and email addresses, which is an information-governance question, not a
  design one. Microsoft Forms is the like-for-like alternative and the questions
  below transfer unchanged. Ask IG first.
- **File upload requires a Google Workspace account** and forces respondents to
  sign in, which will exclude some of the people you most want to hear from.
  If sign-in is a barrier, drop the upload and ask people to email a screenshot.

---

## Structure

| Section | Contains | Goes to |
|---|---|---|
| 1 | Intro notice, about you | 2 |
| 2 | **Routing question** (on its own) | 3 or 4 |
| 3 | Report an issue | 5 |
| 4 | Request a component or change | 5 |
| 5 | Anything else, submit | — |

Section 2 holds nothing but the routing question. Google Forms applies branching
when a respondent leaves the section, so a routing question sitting above other
questions makes the ordering confusing to edit later.

---

## Section 1 — About you

**Form description (shown at the top):**

> Tell us what is wrong with the Single Record Design System, or what you need
> from it. It takes about three minutes.
>
> **Do not include any patient-identifiable information** — no names, NHS
> numbers, dates of birth, or un-redacted screenshots of real records. Describe
> the problem using made-up example data.

| # | Question | Type | Required | Notes |
|---|---|---|---|---|
| 1 | Your name | Short answer | Yes | |
| 2 | Your email address | Short answer | Yes | So we can come back to you. Turn on *Collect email addresses* instead if you prefer. |
| 3 | What is your role? | Multiple choice | Yes | Designer · Engineer · Clinical or care staff · Product or delivery · Test or QA · Other |
| 4 | Which product or team are you working on? | Multiple choice | Yes | EPR · Patient administration · Case Note Tracking · The Single Record app · Other / not product-specific |

---

## Section 2 — Routing

| # | Question | Type | Required | Notes |
|---|---|---|---|---|
| 5 | What would you like to do? | Multiple choice | Yes | **Turn on "Go to section based on answer".** |

Options and routing:

- **Report something that is broken or wrong** → Section 3
- **Request a new component, or a change to an existing one** → Section 4

---

## Section 3 — Report an issue

**Section description:** Reminder: no patient-identifiable information. Use made-up example data.

| # | Question | Type | Required | Notes |
|---|---|---|---|---|
| 6 | What is it about? | Dropdown | Yes | The component list below, plus: A design token (colour, spacing, type) · An icon · A pattern · The design system website · Storybook · The Figma library · Not sure |
| 7 | What happened? | Paragraph | Yes | |
| 8 | What did you expect to happen instead? | Paragraph | Yes | This is the question that separates a bug from a misunderstanding, and it is the one people skip. Keep it required. |
| 9 | How do we make it happen again? | Paragraph | No | Steps, or the screen and what you clicked. |
| 10 | Is this an accessibility problem? | Multiple choice | Yes | Yes · No · I'm not sure. *Help text:* anything to do with keyboard use, screen readers, contrast, text size or colour. If you are not sure, say so — we would rather check. |
| 11 | How much is it affecting you? | Multiple choice | Yes | I cannot do my work · It is slowing me down or I have a workaround · It looks wrong but I can work around it |
| 12 | Where did you see it? | Checkboxes | No | A live product · A prototype · The design system website · Storybook · The Figma library |
| 13 | What were you using? | Checkboxes | No | Windows · Mac · iPhone or iPad · Android · Chrome · Edge · Firefox · Safari · Not sure |
| 14 | Was the screen in dark mode? | Multiple choice | No | Light · Dark · Not sure |
| 15 | Screenshot | File upload | No | **Only if it contains no patient data.** Crop or redact first. Remove this question if file upload forces a sign-in that would exclude respondents. |

**Question 10 is required on purpose.** Accessibility is a hard requirement for
this system, and an accessibility bug reported as a cosmetic one gets triaged as
cosmetic. Asking directly, with permission to say "not sure", surfaces things
nobody thought to flag.

**Question 11 asks about impact, not severity.** "How much is it affecting you"
gets an honest answer; "is this critical, major or minor" gets everyone
choosing critical.

---

## Section 4 — Request a component or change

**Section description:** Reminder: no patient-identifiable information. Use made-up example data.

| # | Question | Type | Required | Notes |
|---|---|---|---|---|
| 16 | What kind of request is this? | Multiple choice | Yes | A brand new component · A new variant or option on an existing component · A change to how an existing component works or looks · A new pattern (several components working together) · A new icon · A design token change (colour, spacing, type) |
| 17 | If it relates to an existing component, which one? | Dropdown | No | The component list below, plus "Not applicable" |
| 18 | What are you trying to help someone do? | Paragraph | Yes | *Help text:* describe the job, not the control. "A nurse needs to see which of a patient's results are new since the last ward round" tells us more than "we need a badge". |
| 19 | Who is the user, and when does this happen in their day? | Paragraph | No | Clinical context changes the answer. A thing used once a month at a desk and a thing used forty times a shift on a ward need different designs. |
| 20 | How are you handling it today? | Paragraph | No | *Help text:* a workaround, a component you have built yourself, a paper process, or nothing yet. |
| 21 | How widely would this be used? | Multiple choice | Yes | Just one screen · A few screens in my product · Across my whole product · Across more than one product · I don't know |
| 22 | Do you have a design, sketch or example? | Short answer | No | A Figma link, or a link to something in another product that does it well. |
| 23 | When do you need it? | Multiple choice | Yes | It is blocking us now · Within the next few weeks · Within the next few months · No fixed date |

**Question 18 is deliberately not "what do you want us to build".** People arrive
with a solution; the useful information is the need underneath it, and often the
need is already met by something in the system.

**Question 21 exists because the system has a promotion rule.** Something used
in one place stays in that product; something a second consumer needs is a
candidate for the shared system. Asking up front means triage is not guesswork.

**Question 23 uses plain time, not "priority".** Everyone's request is high
priority. Not everyone's is blocking today.

---

## Section 5 — Anything else

| # | Question | Type | Required | Notes |
|---|---|---|---|---|
| 24 | Anything else we should know? | Paragraph | No | |
| 25 | Can we contact you to ask follow-up questions? | Multiple choice | No | Yes · No. Default is yes; the honest reason to ask is that most reports need one clarifying question and people are more willing when they have agreed in advance. |

**Confirmation message:**

> Thanks. We read every one of these. If it is a bug we will tell you what we
> found; if it is a request we will come back to you about where it sits.
> Urgent and blocking issues are looked at first.

---

## The component list

Used by questions 6 and 17. Keep it in step with the table in `DESIGN-SYSTEM.md`.

Autocomplete · Bottom navigation · Breadcrumbs · Button · Checkbox · Date input ·
Date picker · Footer · Header · Input · Link · Modal dialog · Navigation (sidebar) ·
Patient banner · Progress indicator · Radio · Search · Segmented control · Select ·
Status indicator · Switch · Table · Tabs · Tags · Time select

---

## After the form is live

- Link it from the design system website and from `docs/for-designers.md` and
  `docs/for-engineers.md`.
- Point responses at a Sheet, and have triage turn each one into a GitHub issue
  on the org repo with the labels the adoption guide already uses — `bug`,
  `component-request`, `question`. The form is the front door; GitHub stays the
  record.
- Reply to the person. A feedback route that never answers stops being used, and
  the people it was built for are the least likely to chase.
