# Design system feedback form — Microsoft Forms

The source for the form at **[paste the live URL here once built]**.

One form, two paths. A routing question sends people either to *Report an issue*
or to *Request a component or change*; everything else is shared. Change the
wording here first, then the form, so the two do not drift.

**Why a form at all,** when `docs/engineering/adopting-components.md` says all
feedback goes through GitHub issues on the org repo: because that route only
works for people who have a GitHub account and a reason to have one. A clinician
in a usability session, a ward manager who spots a wrong label, a tester on
secondment — none of them will file a GitHub issue, and their feedback is the
feedback that matters most. The form is the front door for everyone else. Triage
still turns each response into a GitHub issue, so GitHub stays the record.

---

## Build notes — Microsoft Forms

| Setting | Value | Why |
|---|---|---|
| Who can fill this out | **Only people in my organisation can respond** | Keeps it inside the NHS Wales tenant and lets you record who sent it. |
| Record name | **On** | Removes the need to ask for name and email as questions. |
| One response per person | **Off** | People will report more than one thing. |
| Accept responses | On | Turn off, with a message, if the form is ever retired. |

**Branching.** Microsoft Forms sets branching per question: open the question's
**…** menu → **Add branching** → choose the destination section for each answer.
Put the routing question **alone in its own section**. Branching applies when the
respondent leaves the section, so a routing question sitting above other
questions makes the order confusing to edit later.

**Sections that must jump to the end.** Both path sections need branching set to
go to the final section, or Microsoft Forms will run the respondent straight
from the issue path into the request path.

**File upload** puts files in your OneDrive and requires org sign-in, which you
already have. Keep the size limit low — you want a screenshot, not a video.

**Because responses land in your OneDrive**, they are not in an approved
clinical record store. That is the whole reason for the patient-data warning
below: an internal form *feels* safe, so people paste real screens into it.

---

## Structure

| Section | Title | Goes to |
|---|---|---|
| 1 | Before you start | 2 |
| 2 | What would you like to do? *(routing)* | 3 or 4 |
| 3 | Report an issue | **5** |
| 4 | Request a component or a change | **5** |
| 5 | Anything else | end |

---

# Copy for the form

Everything below is the exact text to paste in.

## Form title

> Single Record Design System — report an issue or request a change

## Form description

> Tell the design team about something that is wrong with the Single Record
> Design System, or ask for something it does not yet do.
>
> It takes about three minutes. You do not need to know any design or technical
> words — describe what you saw and what you expected to see.
>
> **This form is not for urgent problems.** If a patient is at risk, or a live
> system is down, stop and use the routes below instead. Nobody monitors this
> form out of hours.
>
> - **A risk to a patient, or a patient safety incident** — report it through
>   your organisation's incident reporting system, now, not here.
> - **A live service is down or unusable** — contact the IT service desk.
> - **You cannot log in, or your device is broken** — IT service desk.
> - **Something looks wrong, is hard to use, or is missing** — you are in the
>   right place. Carry on.
>
> **Do not include anything that identifies a patient.** No names, NHS numbers,
> dates of birth, addresses, or screenshots of real records. Describe the
> problem with made-up example data instead. Responses are stored in a standard
> Microsoft account, not in a clinical system, so real patient data must not go
> in them.

---

## Section 1 — Before you start

**Section title**

> Before you start

**Section subtitle**

> Two quick questions so we know where this is coming from. We already have your
> name and email from your sign-in, so you do not need to type them.

| # | Question | Type | Required | Help text / options |
|---|---|---|---|---|
| 1 | What is your role? | Choice | Yes | Designer · Engineer or developer · Clinical or care staff · Product or delivery · Test or quality assurance · Other |
| 2 | Which product or team are you working on? | Choice | Yes | EPR · Patient administration · Case Note Tracking · The Single Record app · A prototype or research session · Other, or not product-specific |

---

## Section 2 — Routing

**Section title**

> What would you like to do?

**Section subtitle**

> Pick one. The next questions change depending on your answer.

| # | Question | Type | Required | Options |
|---|---|---|---|---|
| 3 | What would you like to do? | Choice | Yes | **Report something that is broken or wrong** → go to *Report an issue* · **Ask for something new, or for a change** → go to *Request a component or a change* |

---

## Section 3 — Report an issue

**Section title**

> Report an issue

**Section subtitle**

> Reminder: no patient names, NHS numbers, dates of birth, or screenshots of
> real records. Use made-up example data. If a patient is at risk, stop and use
> your incident reporting system instead.

| # | Question | Type | Required | Help text / options |
|---|---|---|---|---|
| 4 | What is it about? | Choice (dropdown) | Yes | The component list below, plus: A colour, spacing or text style · An icon · A pattern · The design system website · Storybook · The Figma library · I'm not sure |
| 5 | What happened? | Text (long) | Yes | *Help text:* what did you see? Describe it in your own words. |
| 6 | What did you expect to happen instead? | Text (long) | Yes | *Help text:* this is the most useful question on the form. It tells us whether something is broken or whether it is confusing, which are different problems. |
| 7 | How can we make it happen again? | Text (long) | No | *Help text:* the screen you were on and what you clicked. Rough notes are fine. |
| 8 | Is this an accessibility problem? | Choice | Yes | Yes · No · I'm not sure. *Help text:* anything to do with using a keyboard instead of a mouse, a screen reader, text being too small, or colours being hard to tell apart. If you are not sure, choose "I'm not sure" — we would rather check. |
| 9 | How much is it affecting you? | Choice | Yes | I cannot do my work · It is slowing me down, or I have a workaround · It looks wrong, but I can carry on |
| 10 | Where did you see it? | Choice (multiple answers) | No | A live product · A prototype · The design system website · Storybook · The Figma library |
| 11 | What were you using? | Choice (multiple answers) | No | Windows · Mac · iPhone or iPad · Android · Chrome · Edge · Firefox · Safari · I'm not sure |
| 12 | Was the screen in dark mode? | Choice | No | Light · Dark · I'm not sure |
| 13 | Screenshot | File upload | No | *Help text:* only if it contains no patient information. Crop or blur anything identifying before you upload. |

**Set branching on this section to go to *Anything else*.**

---

## Section 4 — Request a component or a change

**Section title**

> Request a component or a change

**Section subtitle**

> Reminder: no patient names, NHS numbers, dates of birth, or screenshots of
> real records. Use made-up example data.

| # | Question | Type | Required | Help text / options |
|---|---|---|---|---|
| 14 | What kind of request is this? | Choice | Yes | A brand new component · A new option or variation on something that exists · A change to how something works or looks · A new pattern (several things working together) · A new icon · A change to a colour, spacing or text style |
| 15 | If it relates to something that already exists, which one? | Choice (dropdown) | No | The component list below, plus "Not applicable" |
| 16 | What are you trying to help someone do? | Text (long) | Yes | *Help text:* describe the job, not the control. "A nurse needs to see which results are new since the last ward round" tells us far more than "we need a badge" — and sometimes there is already something in the system that does it. |
| 17 | Who is it for, and when in their day does this happen? | Text (long) | No | *Help text:* something used once a month at a desk and something used forty times a shift on a ward need different designs. |
| 18 | How are you handling it today? | Text (long) | No | *Help text:* a workaround, something you built yourself, a paper process, or nothing yet. |
| 19 | How widely would this be used? | Choice | Yes | Just one screen · A few screens in my product · Across my whole product · Across more than one product · I don't know |
| 20 | Do you have a design, a sketch, or an example? | Text (short) | No | *Help text:* a Figma link, or a link to something elsewhere that does this well. |
| 21 | When do you need it? | Choice | Yes | It is blocking us now · In the next few weeks · In the next few months · No fixed date |

**Set branching on this section to go to *Anything else*.**

---

## Section 5 — Anything else

**Section title**

> Anything else

| # | Question | Type | Required | Help text / options |
|---|---|---|---|---|
| 22 | Anything else we should know? | Text (long) | No | |
| 23 | Can we contact you if we need to ask a follow-up question? | Choice | No | Yes · No. *Help text:* most reports need one clarifying question, and it is much quicker if you have already said yes. |

## Confirmation message

> Thanks — that is with the design team.
>
> We read every response. If you reported a problem we will tell you what we
> found. If you asked for something new we will come back to you about where it
> sits and when. Anything blocking someone's work is looked at first.
>
> If this turns out to be a patient safety issue, please also report it through
> your incident reporting system — this form is not a substitute for that.

---

## Why some of these questions are worded the way they are

**"What did you expect to happen instead?" is required.** It is the question that
separates a bug from a misunderstanding, and it is the one people skip. A report
without it usually costs a round trip.

**The accessibility question is required, and "I'm not sure" is a real answer.**
Accessibility is a hard requirement for this system, and an accessibility bug
reported as a cosmetic one gets triaged as cosmetic. Asking directly — with
permission not to know — surfaces things nobody thought to flag.

**"How much is it affecting you?" rather than "how severe is this?"** Ask people
to rate severity and everything is critical. Ask what it is doing to their day
and you get an honest answer.

**"What are you trying to help someone do?" rather than "what should we build?"**
People arrive with a solution. The useful information is the need underneath it.

**"How widely would this be used?" maps onto how this system decides.** Something
needed in one place stays in that product; something a second team needs is a
candidate for the shared system. Asking up front means triage is not guesswork.

**No name or email questions.** The org tenant records those automatically.
Asking again is friction, and friction is what stops people reporting.

---

## The component list

Used by questions 4 and 15. Keep it in step with the table in `DESIGN-SYSTEM.md`.

Autocomplete · Bottom navigation · Breadcrumbs · Button · Checkbox · Date input ·
Date picker · Footer · Header · Input · Link · Modal dialog · Navigation (sidebar) ·
Patient banner · Progress indicator · Radio · Search · Segmented control · Select ·
Status indicator · Switch · Table · Tabs · Tags · Time select

---

## After the form is live

- Put the link on the design system website, and in `docs/for-designers.md` and
  `docs/for-engineers.md`.
- Turn each response into a GitHub issue on the org repo using the labels the
  adoption guide already uses — `bug`, `component-request`, `question`. The form
  is the front door; GitHub is the record.
- **Reply to the person.** A feedback route that never answers stops being used,
  and the people it was built for are the least likely to chase you.
