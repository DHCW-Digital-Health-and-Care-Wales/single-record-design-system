# DHCW UI Standards Guide - v1.3 (extracted reference)

> **Source of record.** Faithful markdown extraction of *"Design principles, core
> concepts, consistency and standardisation for the WCP, DHCW eForms and related
> software"*, **version 1.3**, document date **04 July 2022**, effective **31 May 2023**.
> Original author: Stephen G Shering. Designed by Emma Lynham, Haseeb Fazili.
> Signed off by Griff Williams.
>
> **Status in this design system:** a *legacy clinical/content standards* document
> for the WCP / DHCW eForms, preserved here as a **reference input** for guideline
> authoring and for the UI-standards review project (`docs/ui-standards-review/`).
> Treat **clinical, content and interaction** requirements as authoritative input;
> treat **design-system dictates** (specific hex colours, px/rem font sizes, the
> legacy CSS in the Appendix) as historical - the Single Record design tokens
> supersede them.
>
> Extracted automatically from the PDF (76 pages); light cleanup only (running
> headers, page numbers, layout noise removed). Original page numbers are preserved
> as anchors (`[p.N]`) for traceability. Diagrams/screenshots are not reproduced -
> page text only, so some tabular/figure content reads as loose lines.

---


<a id="page-1"></a>
**[p.1]**

Design principles core concepts,
consistency and standardisation
for the WCP, DHCW eForms and
related software
Version number:
1.3
Document date:
04 July 2022
Effective date:
31 May 2023
Scheduled revision date:
01 April 2024
Original author:
Stephen G Shering
Designed by:
Emma Lynham
Haseeb Fazili
Signed off by:
Griff Williams
Contributors:
Griff Williams, Patricia Pritchard, Caroline Prosser, Laura Wesgate, Suzanne
Pask, Fiona Churchill, Frances Beadle, Heather Wallace, James Cooper, Herbert
Mtetwa, Katherine Whittington.
Use these standards to build consistent user interfaces and present
information clearly. Each standard in this document has been
finalised and is ready for use. More standards will be added over time.


<a id="page-2"></a>
**[p.2]**

Content
56-6304-07 23-54
08-22
PDFs
Addressograph label
Header
Footer
Tables
Layout and presentation of fields within the form
Display of questions/answers on the PDF
Multiples pages
Form sections
Splitting sections
Font
Nested questions
Introduction
Core concepts / principles
Working Practices
Consistency
04-05
46-55
15-16
17-18
25-26
27-28
35-37
38-41
42-44
Functionality
Dropdown lists
Auto learning users’ favourites
Dates
Time format
Date/time picker
Manually entering dates
Horizontal scroll bars
Copy and paste
Editing timeframe
Tab order
Autofill
Use of SNOMED search fields
Free text boxes
Watermarks
Mandatory fields
Fuzzy matching
Links
Access to information or functionality
Editing
Autosave
Document types
Misfiling a document
Icons
Re-use / carry forward information
Signature line
Presentation of information
NHS number
Non NHS Wales
Sentence case
Display of users’ names
Drop down menu
Abbreviations
Apostrophes and contractions
Ampersand
Forward slash
Default values
Standard DHCW date of birth format
Chronologies of events
Tooltips and explanatory text
Medications
Form design, font sizes and spacing
Tables
Status badges
Mutually exclusive options
Highly sensitive
Countersignature required
Signature section
Viewing highly sensitive information
Patient banner
Radio buttons
Checkboxes
65-66
Standard Questions and responses
Urgency
Questions
eForms
Attributions statement
eForm heading, including addressograph label


<a id="page-3"></a>
**[p.3]**

Content
67-69
70-76
Terminology
Use of terminology
Colours
Fonts
Other
Specific elements
Glossary
67-69
72-76


## Introduction


<a id="page-4"></a>
**[p.4]**

Introduction
Use this document to improve consistency across all NHS
Wales procured, supplied and developed software, including
the WCP (Welsh Clinical Portal) and WNCR (Welsh Nursing Care
Record).
This document will be updated frequently to reflect new ideas,
including DHCW and stakeholder input. Do not download the
document as it may become out of date. Instead, visit the UI
Standards Teams channel for the latest version.
The concepts and principles apply firstly to DHCW eForms, then
the WCP, then other DHCW products. This document should be
included or referenced in future procurement specifications.
The final authority for design issues for the WCP, DHCW eForms
and related software is the DHCW clinical and technical design
team.
The standards for eforms in this document are focussed
on desktop applications, we do not yet have a standardised
design for eforms on mobile.
Core concepts / Principles
These are concepts or rules that have been agreed by DHCW
or have emerged during the evolution DHCW owned systems.
All colleagues must be aware of these concepts and rules and
apply them in their work to avoid repeating past errors. Core
concepts and rules usually override individual requirements,
and this should be communicated to stakeholders.
Anything that happens to a patient or is done to a patient in a
health care context must be recorded by a permanent entry
in the medical record. This is visible to those people who have
a legitimate right to view that record. Entries must be dated,
time stamped and attributed, whether this is the complete
document or to individual sections.
An electronic medical record must be able to display a timeline
of events for the patient.
The principles and rules in this document are applicable to all
WCRS documents.
This document should be read by all PMs, BAs, designers
and devs (including third parties), before doing any design
(terminology, language, abbreviations, user interface
conventions and guidelines, regulatory rules).


<a id="page-5"></a>
**[p.5]**

Introduction
Core Concepts / Principles
A WCP/Wales Care Records Service (WCRS) document or form
typically represents a single event, attributable to a single
person, on a patient’s timeline. A single version of a document
has an event date, a document date and a single author.
Where applicable, documents can be edited to create  a new
version of the document, and, where identified, revised or
additional sections can be attributed to a different author.
Mapping of forms and clinical processes to documents can be
difficult.  A common error is combining what should be two or
more documents or processes into a single form.
This aspect of a form’s design should be reviewed by the
clinical and technical design team before detailed design and
technical work starts, to avoid any re-work.
There is consensus that it would not be pragmatic to apply
the above to existing forms or forms that are currently work in
progress, but that these should be applied to new forms and
as forms are updated.
If you have any queries, comments or suggestions please
email WCPAndUIStandards@nhs.wales.uk
Examples of events which should be represented by a
single document include:
A consultation or assessment by a nurse or other health care
profession, for example an Outpatient medical note.
A hospital inpatient episode – for example a Discharge advice
letter.
A test request.
A result sign off.
Recording action taken as a result of looking at a test request.
Transcribing medications.
The principles are based on, in approximate order of
importance:

Consistency.
Clinical and professional rules, standards and conventions.
Industry  and academic rules, standards and conventions.
NHS Wales and DHCW precedents and existing practice.


<a id="page-6"></a>
**[p.6]**

Introduction
Working Practices
All colleagues involved in stakeholder engagement and
WCP design and development are expected to follow these
practices:
Read this document.
When the document is updated, read the updates - the
different versions will reference the changes made.
Feedback any omissions or suggestions for improvement.
Plan to make your outputs consistent with the principles
in this document.
When engaging with stakeholders and creating designs or
associated documentation:
Stick to the principles in this document.
Copy wording and diagrams from this document and
adapt them, this document will be updated to include
stock diagrams.
If necessary, work with the clinical design team to come
up with new concepts, wording and diagrams consistent
with those in this document, which will be included in
future versions.
Explicitly reference, for example:
(a specific version of) this document
“standard DHCW date format”
“standard DHCW form layout”
“standard DHCW author section”
“standard DHCW date control”
When developing software or forms:
Apply the principles in this document
For a given user interface construct (form, patient
banner, section or question), use the same HTML, CSS and
Javascript
If a design element is not covered by this document, work
with the clinical design team to come up with a solution  -
this document will be updated to include the new solution
If a design element seems unachievable, work with the
clinical design team to come up with an alternative which
is consistent with the principles in this document - this
document will be updated to include the alternative.
Accept that compromise, care and attention to details may be
necessary


<a id="page-7"></a>
**[p.7]**

Introduction
Consistency
Consistency should apply to core concepts, business rules,
the underlying data model, user interactions, presentation of
information and the user interface.
Consistency can be achieved in many ways across NHS Wales
procured, supplied and developed software, including the WCP
and WNCR, for example a group of radio buttons or checkboxes.
The benefits of consistency with software include:
Being easier to learn, remember and use
Fewer surprises
Fewer mental hurdles
Better user experience and fewer user errors
Easier, faster stakeholder engagement process
Easier, faster design process and development, resulting
in a shorter “time to market”
Better, more reliable interoperability between software
components and third-party software
Easier to check and test
Fewer bugs, resulting in fewer bug reports and service
calls
Improved performance
Reduced training needs
Better reputation and data
Fewer risks and better outcomes for patients


<a id="page-8"></a>
**[p.8]**

Presentation of information
NHS number
The NHS number must be:
Separated into number groups of 3, 3, 4
There must be a space after the third and sixth numbers
123  456  7890
Give space
3 3 4
Give space
123 456 7890  1234567890
Good Example: Bad Example:
Non NHS Wales
When a form requires a user to search for any location or site
that is outside Wales, or where it might be inside Wales but is
a non NHS site,
please use the field label of   “Non NHS Wales”  rather than
“Non-NHS Wales”.  No hyphen is used.
GPs are technically not employed by the NHS, but for the
purposes of our forms they are included as NHS Wales.
When this field is used, include this hover text on the field
label: “NHS Wales includes both primary and secondary
care”, i.e. you would not use this field if you were searching
for a GP based in Wales.
Note, hover text is only available currently on desktop
applications and not mobile.


<a id="page-9"></a>
**[p.9]**

Presentation of information
Sentence case
All text should be in sentence case. For example, Senior
responsible clinician, not Senior Responsible Clinician.
Senior responsible clinician
Senior Responsible Clinician
Right sentence case:
Wrong sentence case:
Display of users’ names
A clinician’s name should be followed by their job role and
speciality.
An exception can be made when the speciality is already
present, or there is no room for it, for example:
Whilst it is acceptable to display a GMC or PRN number, or a
Whilst it is acceptable to display a GMC or PRN number, or a
NADEX, it is never acceptable to display a PIN number for a
registered nurse.
HURLE, Rhidian A, Mr (GMC:2567890), Consultant, Urology
PRICE, Lucy C, Mrs (PRN: DT11782), Dietitian
DAVIES, Anne, Mrs (NADEX:AD202399), Medical Secretary
HURLE, Rhidian A, Mr (GMC:2567890), Consultant, Urology
For example:
1. Name & GMC
2. Job role
3. Speciality
Outpatient medical note
Event Date: 07 Dec 2021
Specialty: Rheumatology
Senior responsible clinician:  LAWSON, Thomas M, Mr (GMC:3489251)


<a id="page-10"></a>
**[p.10]**

Presentation of information
For example:
Not:
Drop down menu
An arrow           must be  used as the symbol on all dropdown
menus. This should be consistent across all forms.
You must not use a             triangle.
Send results to: *   i
Send results to: *   i
Unknown or not recorded
Unknown or not recorded
Abbreviations
Avoid using abbreviations. They are known to cause clinical
errors.
Do not  p u t  f u l l  s t o p s    .   between letters when you use an
abbreviation or acronym, for example:
If you cannot avoid using an abbreviation, for example due to
limited space, you should use a tooltip that shows the word in
full. Use a dashed underline             on the abbreviation to make
it clear there is a full explanation if you hover over it.
Titles, for example: Dr, Mr, Mrs
Units of measurement, for example:  cm and kg
You can say mg instead of milligrams.
However, you must say micrograms in full to avoid confusion.
There are a small number of acceptable abbreviations:
ECGsay
 E.C.G.not
TCI
Example:
To come in


<a id="page-11"></a>
**[p.11]**

Presentation of information
Apostrophes and contractions
Avoid using apostrophes and contractions where possible,
for example ‘it’s’ and ‘can’t’.
Using the full words is clearer for users and helps to
prevent incorrect apostrophe usage, which can create a poor
impression.

If an apostrophe is essential but you’re unsure if it is being
used correctly, seek advice.
Ampersand
Use the word  ‘and’  rather than an ampersand  (&)  unless it is
part of a brand name.
Forward slash
Use the word  ‘or’  rather than a forward slash   (/) .
Default values
Use default values where possible. This helps to save clinicians’
time and improves usability.
Be clear in user stories when a data item has a default value,
rather than “Unknown or not recorded” or “Not recorded”
Standard DHCW date of birth format
Display the date of birth followed by the age in brackets.
Use the following abbreviations:
Minutes - display  min
Hours - display  h
Days - display  d
Weeks - display  w
Months - display  m
Years - display  y
For example:
12-Oct-2019 (1d)
12-Sep-2019 (4w)
12-Apr-2019 (6m)
12-Oct-2018 (1y)
If the person is :
over 18 years, display years
2 years up to 18 years, display years and months
12 months up to 2 years, display months and days
4 weeks up to 12 months, display weeks and days
2 days up to 4 weeks, display days
2 hours up to 2 days, display hours
less than 2 hours, display minutes


<a id="page-12"></a>
**[p.12]**

Presentation of information
Chronologies of events
The default order for chronologies of events should be
displaying the oldest record first, but there exceptions to
this rule which are currently being reviewed: 2 of which are
currently the list of documents and the list of test results,
both of which show the latest at the top.
Where possible, a user should be able to sort on a list, to
change the order.
If the list presents with a vertical scroll bar, it is advisable that
the latest entry is at the top.
An exception can be made when the chronology of events
needs to match an existing process.
For example,
If you need to change the order but there is no existing
process to match, it should be approved and discussed
with the ‘Design authority’ group (currently in the process
of being set up’.  In the meantime, for any changes email
WCPAndUIStandards@nhs.wales.uk
Example:
Date Received/Scheduled
14-Dec-2021
10-Dec-2021
Time Received
12:58
15:32
Test(s)
CRP,FBC,UUER [Request]
Sialogram parotid Lt [Request]
Tables are presented with items in chronological order
with the most recent first. However, users should be able
to sort any column (when applicable).
An arrow at the top of these columns will indicate which
columns can be sorted. This is a feature currently
available in the WCP and WNCR.


<a id="page-13"></a>
**[p.13]**

Presentation of information
Tooltips and explanatory text
Examples of how to list medications include:
Do not use an information icon.
Medications
The NPSA guidance contains a wealth of information and
recommendations to be followed when recording and viewing
medicine information.
There is too much information to display here in the UI
standards document, so please familiarise yourself with this
guidance when creating any eforms that involve medications.
View the NPSA guidance
Use tooltips if you need to give more information to a
user to help them complete a field.
The user should see the tooltip automatically when they
hover over the field, or when the question has keyboard
focus.
The tooltip should not hide any part of the question that
it relates to.
The toopltip should still be displayed if you click in a
field to enter text.  If the user no longer wants to see the
tooltip, then “Close” can be selected.  However,  if the
focus is moved away from this field, the tooltip will be
removed automatically, but will appear again if the focus
is returned to this field
Erythromycin – gastro-
resistant
DOSE 500 mg – oral – four times
a day
Warfarin
DOSE dependent on INR - oral -
once a day at 18:00
Latanoprost - 50 micrograms
per mL - eye drops
DOSE 1 drop - ocurlar- both
eyes - once a day at night
Digoxin
DOSE 250 micrograms - oral -
once a day in the morning
Diagnosis
Last updated or confirmed 14-Jan-2021 @ 16:30 by EVENS, Ceri,
No diagnosis
Provisional diagnosis
Definitive diagnosis
Confirm section
Often used for disease reporting and statistics. Should
usually have been agreed by an appropriate senior
responsible clinician or MDT before it is recorded here.
Should NOT be based solely on a biopsy report.
Close


<a id="page-14"></a>
**[p.14]**

Presentation of information
Form design, font sizes and spacing
Standard WCP design is based on best practice guidelines for
usability.
The aim is to create standard templates for each form type,
for example electronic test requesting (ETR).
Check Shades of Pale for existing templates and best practice.
Found here  username and password can be requested from
Steve Shering.
Fonts
Specify a relative font size to allow users to zoom in and change
the resolution. A font size of 1, or 1REM would be the standard
12 point font. A font which is slightly bigger is classed 1.2, and
one that is smaller is 0.8.
View all  design, font sizes , spacing and colours in the
appendix.
Line spacing
The blue bars with the white writing has good contrast, so the
text is easy to read. The spacing between the text and the edge
of the blue bar ensures the best possible legibility.
In the Read only view, the content of the field becomes larger
than its heading to add emphasis. It is important that the spacing
between the heading and the content is smaller than the space
between the content and any other heading below it.
Host organisation
University Hospital of Wales
New or follow-up
Follow-up
Meeting date
15-May-2021
Host organisation
University Hospital of Wales
New or follow-up
Follow-up
Meeting date
15-May-2021
This is an example of bad
spacing.
The spaces are all even and it
is more difficult to read:
This is an example of good
spacing:


<a id="page-15"></a>
**[p.15]**

Presentation of information
Table option 1       This standard table is to be used in most cases. This table type:
Date
15-Jun-2018
16-Aug-2018
01-Jan-2021
WHO perfomance status
ASA
classification
Clinical frailty
score
Lansky performance scale
Authored by
JONES,  Connor M, Mr (GMC:236789), Consultant Surgeon, 17-Jul-2018
PETERS,  Clare M, Ms (NADEX:cp123987), MDT Coordinator, 16-Aug-2018
PETERS,  Clare M, Ms (NADEX:cp123987), MDT Coordinator, 16-Aug-2021
Performance status
Burger MenuSelecting ‘Add performance status’ opens up a separate screen to add in the data.Add performance status
Is suitable to be added
to over time, possibly by
more than one user
Allows a user to select a
button that opens a new
screen to enter in the data
Has a burger menu on the
far right to edit or delete
an entry
Has rows that can be
reordered - a decision
should be made during
its design about which
columns need a sort arrow
Should display
struckthrough entries in
the date order they were
added, not the date they
were struckthrough
Date
WHO perfomance status
ASA classification
Clinical frailty score
Lansky performance scale
Add performance status
Add another Ok Cancel
*
dd-Mmm-yyyy
Tables
2 table types can be used:


<a id="page-16"></a>
**[p.16]**

Presentation of information
Table option 2       This table type :
Option Order Modality Intent Intent Completed Data completed
Treatment plan options
Add treatment row
Is suitable for when more than 1
entry needs to be added at the
same time, for example adding
entries for a treatment plan.
Is slightly quicker than option 1,
and does not have the attribution
for each user. The attribution
statement under the section
heading will display the last user
who updated this table.
Is editable ‘in situ’, without having
to click an edit option.
Has no sort order arrows in the
column headings, the rows can be
sorted using the arrows in column.
dd-Mmm-yyyy
dd-Mmm-yyyy
dd-Mmm-yyyy
Try to avoid having an attributed table  and other data in the same section.
If just a attributed table exists in a section, there is no requirement to
have an Attribution statement
Tables
2 table types can be used:


<a id="page-17"></a>
**[p.17]**

Presentation of information
Status badges
There are several Status badges that are used to identify the
status of forms and PDFs.
These are used in place of watermarks.
These status badges will be the size required to fit the text and
will not all be the same size.
When more than one status badge is displayed on a document,
they will be listed in alphabetical order.
Forms
The following status badges will appear, where ap plicable, at
the top left-hand side of the eForms in a red box with white
text, above the Document title.
Countersignature required
Not checked by authorHighly sensitive
Draft
Forms - An example of their placement is as follows:


<a id="page-18"></a>
**[p.18]**

Presentation of information
Status badges
Draft
As well as a “Draft” status badge appearing on the actual
document and the PDF, a “Draft” status badge will appear in
the metadata, when a form requires finalising.
PDFs
The following status badges will appear, when applicable, at
the top left-hand side of the PDFs, in a black box with white
text, directly above the Document title.

Note: Misfiled, Potentially misfiled and Superseded status
badges will not display on the forms as the forms are not
editable when they have these statuses.
Countersignature required
Not checked by author
Highly sensitive Potentially misfiledMisfiled
Draft Superseded
PDF - An example of their placement is as follows:
When a status badge is present, this must be displayed on
every page of the PDF
Document title
Site: Hospital site, healthboard of hospital site
Date: dd-Mmm-yyyy
Specialty:
Senior responsible clinician: SURNAME, Forename Middle Initial, Title (PRN:####), Role of main specialty
Author:
Version:
Highly sensitive


<a id="page-19"></a>
**[p.19]**

Presentation of information
Outpatient medical note
Event Date: 21 Dec 2021
Specialty: Dermatology
Senior responsible clinician: ANTON, Andreea, Dr (GMC:7531865)
Author: PRITCHARD, Patricia, (GMC: ), Business Analyst,
Gastroenterology
Site: Amman Valley Hospital
Edit
(v3)
Mutually exclusive options
Where there is only one possible option for the user to select,
consider the following:
2-5 options:  use a radio button group, this minimises
mouse clicks and mouse movement.
6-15 options: use a simple drop-down list, that displays all
the options.
Greater than 15 options: use a dropdown list with fuzzy
matching.
Read more information about  fuzzy matching
Viewing Highly Sensitive information
When a document is marked as “Highly sensitive” the document
tile will show the following:
The background will be  pale pink ,  and turns   blue    when
hovered over
The highly sensitive icon will appear, which is a        white
flag on a red circle
Hovering over the icon will show a tooltip that reads
“Highly sensitive”
Document overview example:
Hovered over example:
Outpatient medical note
Event Date: 21 Dec 2021
Specialty: Dermatology
Senior responsible clinician: ANTON, Andreea, Dr (GMC:7531865)
Author: PRITCHARD, Patricia, (GMC: ), Business Analyst,
Gastroenterology
Site: Amman Valley Hospital
Edit
(v3)
Highly sensitive


<a id="page-20"></a>
**[p.20]**

Presentation of information
Patient banner
The patient banner will appear when a patient is selected. It is split into three sections.
A close icon, which will close the
current patient.
Left hand section:
This is the red box containing adverse
reactions and patient warnings.
Middle section:
This is contained with a grey border
and has the following details:
If the patient is an inpatient, the
Ward and SRC will be displayed, with
the Ward name and SRC information
in bold text.
Hovering over the SRC will display
the Speciality.
Icon for Welsh language if this has
been recorded as the patient’s
preferred method of spoken
communication.

Orange warning triangle icon if
the patient has other hospitals IDs
within the same health board.
Print icon, to print out a set of
patient labels.
If the patient is deceased, the words
“Patient deceased” with the date of
death will be underneath the icons,
with white text and a burgundy
background.
Link to “Advanced care plan”.
Right hand section:
Patient addressograph label.


<a id="page-21"></a>
**[p.21]**

Presentation of information
Radio buttons
You should use a radio button when users are only required
to select 1 option. If you use 6 or more radio buttons a drop-
down list may be more suitable, but this should be reviewed on
an individual basis.
‘Yes / no’ radio buttons
‘Yes / No’ radio buttons are an exception to the alphabetical
rule. You must always add a third option of ‘Unknown or not
recorded’ as this allows the user to deselect ‘Yes’ or ‘No’ if they
were selected by mistake. This option should always appear at
the end of the list.
The radio buttons should appear in this order:
Yes
No
Unknown or not recorded
If an option for ‘Other’ is also needed, this should be placed
before ‘Unknown or not recorded’, or as the last option if
‘Unknown or not recorded’ is not present.
The ‘Other’ option should open a non-mandatory free text box,
but only when the radio button is selected to avoid cluttering
the screen. The free text box should appear to the right of the
list if possible.
Radio buttons must:
Have a heading label above them
Be aligned to the left
Be displayed in one column
Have individual labels to the right of each radio button
Be in alphabetical order where possible. If another order
is needed this should be documented in the design
specification
All options should be in alphabetical order unless explicitly
stated in the design documentation, or where there is a
standard set of answers which have been designed to follow
a specific order.


<a id="page-22"></a>
**[p.22]**

Presentation of information
Checkboxes
Use a checkbox when users can select more than one item
from a list
Checkboxes should:
Have a heading label above each group
Be aligned to the left
Have labels on the right
Be in a single column, unless there is a large number of
options – you may want to consider a design change in
this instance as checkboxes may not be the right format
to record the data
Be in alphabetical order
If you include an ‘Other’ checkbox option, it should be at the
end of the list. A free text box will appear once ticked, and it
should be decided on a case by case basis as to whether this
free text box is mandatory
Single checkboxes
You can use a single checkbox to confirm that a user
has read or checked information. You can also use
one to show or hide information.
For Yes or No questions,
use a radio button group instead.
All options should be in alphabetical order unless
explicitly stated in the design documentation, or
where there is a standard set of answers which have
been designed to follow a specific order.
Example:
Reason for discussion
Make treatment plan
Post-mortem case review
Review imaging
Review other pathology
Review post-operative pathology
Review treatment plan
Second opinion
Other


## Functionality


<a id="page-23"></a>
**[p.23]**

Functionality
Where the question is based on a pre-existing standard or
specification where one of the options is “Unknown”, then the
dropdown option of “Unknown or not recorded” must be split
into two separate options of “Unknown” and “Not recorded”.
“Not recorded” will then be the default value.
This allows the option of “Unknown” to be selected where it is
important to record that a particular value was not known at
the time of recording.
All options should be in alphabetical order unless explicitly
stated in the design documentation, or where there is a
standard set of answers which have been designed to follow
a specific order.
The default value should never be blank.
Dropdown lists
The default value for a dropdown, before the user selects an
option, should usually be “Unknown or not recorded” .
When counting completion of mandatory fields, “Unknown or
not recorded” or “Not recorded” must count as not completed.
In WCP forms, if a dropdown is mandatory and “Unknown or
not recorded” or “Not recorded” still remain as a value, then
the form cannot be marked as final and the “Final” or “Final/
Send” checkbox will be inactive.
In the case of forms that do not have a “Final” or “Final/Send”
checkbox, the user will not be able to save and close the
documnent until these dropdowns have been changed and
they will receive the standard red label against the relevant
field that still needs completing.
In PDFs where dropdowns have not been completed, for
example still have the “Unknown or not recorded” or “Not
recorded” options, these will not be included in the PDF unless
explicitly requested in the design specification.
The rationale for not having dropdowns blank by default is:
Blank is ambiguous and could mean “Unknown”, “Not
recorded”, “Not applicable”, “Error in the save data..
Should “save” also read “Saved”?, “Error in the form
implementation”
“Unknown or not recorded” is more likely to encourage
users to make a section than a blank value
Unknown or not recorded
Not recorded


<a id="page-24"></a>
**[p.24]**

Functionality
Auto learning users’ favourites
Users may benefit from being presented with items that
they select the most when they click on a field.
When designing the form, consider:
The number of items that a user should be presented
with
Allowing a user to remove items from the list that they
no longer consider to be a favourite, and still type into
the search field to find other tests
For example, in the Radiology request form, when a user
clicks into the “Add test” field, a list of up to 30 of their most
selected tests can be viewed before they have even typed
in any search criteria. The small cross on the left-hand side
allows the user to remove this item from the list.
Add test Search for tests...
XR Ankle Both
CT Head
MRA Neck
Dates
The date should have:
1 or 2 numbers for the day - for example 8 or 22.
However, when the date is displayed in a field like the
date picker, it must have a leading zero: 02-Oct-2021
3 letters for the month, starting with a capital letter
4 numbers for the year
Each component is sep arated by a dash (-)
Time format
Time fields should always be in the 24 hour clock format
02 -Oct-2021
2-Oct-2021     2/OCTO/21
2-Oct- 2021   2-Oct- 21
2-Oct -202 1  2 /Oct /202 1
2- Oct -202 1  2- OCTO -202 1
Good Example: Bad Example:
12:58


<a id="page-25"></a>
**[p.25]**

Functionality
Date/time picker
The date picker should:
Launch when the date field or icon             is clicked.
Allow users to manually type in the date,
not just click the date.
Show dates in the field with a leading 0,
for example   06-Dec-2021.
Contain buttons for the user to be able to nudge the
calendar backwards or forwards by month and year.
Within the date picker:
Today’s date should be highlighted as a red square and
bold white number.
Selected date should be highlighted as a blue square and
bold white number.
Hovering over a date is highlighted as an orange square
and plain black number.
The date picker can be customised. Before displaying it,
make sure that all options are relevant to your users.
For example,
some date pickers will not need the “Six weeks” button.
This screenshot is a comprehensive date picker showing
all possible functionality.


<a id="page-26"></a>
**[p.26]**

Functionality
Date/time picker
There are a variety of potential additional requirements for the
customisation of date pickers, which should be specified in the
design documentation, such as:
Allowing partial dates, for example clicking on “Select
month” should insert the current month and year into
the date field, and “Select year” should insert the current
year – this is useful for recording things like start dates for
adverse reactions
whether the date and time picker will be limited to past
dates and times, or future dates and times, or both; e.g.,
an estimated date of discharge should only allow entry of
a future date/time, appreciating that as time passes this
may become a past date.
Shortcut buttons for the most common dates, e.g.,
yesterday, today and tomorrow.
Shortcut buttons for +1 week, +6 weeks, +three months
and +one year.
Shortcut buttons for -1 week, -6 weeks, -three months
and -one year.
Manually entering dates
As well as using the date picker, the date can also be entered
manually. The date field is to contain greyed out text displaying
dd-Mmmyyyy If the user manually enters a date other than the
format of dd-mmm-yyyy, eg, using forward slashes instead of
dashes as in 01/01/1996, then the calendar will convert this
and the relevant date will be highlighted in the calender, the
user will need to select the date to confirm that this is the
correct one.
When a user is tabbing through the form, the focus should be
at the beginning of the field so that the date can be typed, if
necessary, without having to click into the field. There should
also be a x at the right-hand side to delete an incorrect date.
If a user does type in say 12-04-2022, this is automatically
converted to 12-Apr-2022.
Horizontal scroll bars
Horizontal scroll bars should only be used in clearly defined
exceptional circumstances, where there is no chance that the
user will miss vital information.
Such examples  where it is acceptable is in the Observations
recording where the eform is similar to a paper chart and the
recordings are placed horizontally next to each other.  Another
example is the Bowel Assessment Chart in the WNCR.


<a id="page-27"></a>
**[p.27]**

Functionality
Copy and paste
Copy, cut and paste options are potential sources of clinical
error. Currently, there is nothing in the WCP to stop a user from
copying data from one place to another.
However, the following principles have been agreed by the
DHCW patient safety team. Some of the items are already in
place, others are aspirational and will hopefully form part of
future development.
General rules
Copying from a non-DHCW application and pasting into a
DHCW application is allowed without restriction or logging.
However, copying from one patient record and pasting
into a different patient record is NEVER ALLOWED.
Current functionality
Users can copy and paste patient identifiers from one
application into another.
When editing a document, users can cut, copy and paste
information from one part of a document into another
part of the same document without any restriction.
When editing a document, users can cut or delete
information from that document, but the document
should be saved with a new attributed version.
Where possible, use links to pull data into forms. For
example, when doing a cardiology referral, you can
copy a test result from the test results list into the form.
In Welsh Nursing Care Record (WNCR), when doing a
measurement, you can link this to a form - there is a
link icon to indicate this.


<a id="page-28"></a>
**[p.28]**

Functionality
Copy and paste
Aspirational/future development
All documents, including tests results and requests, should
have a “Copy link”  option which can be copied and pasted
anywhere, even outside of the WCP.
If you are then viewing this document outside of WCP and
a user clicks the link, the user is taken to the WCP log in
screen and then to the specific document - with break glass,
patient banner, header, document status display, document
attribution.

When documents are created from another document, for
example, Repeat test, the document should be labelled “This
document/letter/request was created by copying document
X”. The label is just underneath the document title. This link is
to the other document.

A user can copy and paste from one WCP document into
another WCP document without restriction However, if a user
copies more than 6 words or more than 1 line from a document
at once, they are shown the prompt “Consider using ‘Copy
link’”.  This is easier and safer.
Editing timeframe
The default cooling off period after a user clicks on ‘Final’ or
‘Final/Send’ is 4 hours. No more edits are allowed once that
deadline has been reached.
Exceptions to this timeframe may be acceptable, but the
reasons should be documented and explained in the design
documentation.
Autofill
Autofill of free text boxes should be disabled.
Autofill is still enabled by default in some browsers, but this
can cause server errors.
Tab order
When tabbing through the fields in a form, the tab order should
be:
Left to right
Then top to bottom


<a id="page-29"></a>
**[p.29]**

Functionality
Use of SNOMED search fields
SNOMED fields are usually mandated by a business or data
requirement.
SNOMED CT controls must always allow free text. This is
because there is the possibility that SNOMED does not contain
the data that needs to be added, and if it does, the user may
not be able to find it.
The tooltip for the warning triangle will
display the words “Not coded”
ICONS:
Orange warning triangle: the entry is free text
Green tick: the entry is SNOMED coded
No icon: nothing entered
The tooltip for green tick will display the
SNOMED CT code
When a user types into the field:
Relevant SNOMED terms are displayed
The user can select the appropriate term
The user can click the “Select” button and the
SNOMED term will be entered into the field
Each of the fields will have a cross within the field on
the right-hand side, used to delete any entries
SNOMED CT search screen
Gastropathy
Gastromenia
Agastria
Microgastria
Gastroptosis
Gastritis
Gastroschisis
Gastromalacia
Gastroparesis
Dextrogastria
Gastrorrhagia
Gastrinoma
Stroke
Gastric erosion
Gastroenteritis
Disorder of stomach
(disorder)
Parent concepts
Disorder of upper gastrointestinal tract, Disorder of abdomen, Disorder of digestive organ (disorder).  Stomach finding
Synonyms
Disorder of stomach, Gastropathy
Child concepts
Jejunogastric intussusception (disorder)
Gastroesophageal reflux disease (disorder)
Gastric fistula (disorder)
Gastroparesis (disorder)
Gastric necrosis
Gastric anastomotic leak
Concept
!
Diagnosis
CancelSelect
gastro
Icons on SNOMED search fields
Substance
Medication
Manifestation
Raspberry jelly
Product containing paracetamol (medicinal product)
Type here to start SNOMED ICT search
!
!
!
Coded: 90332006
Not coded


<a id="page-30"></a>
**[p.30]**

Functionality
Free text boxes
A Single line:
Is used when it is certain that data will be no more than 2
or 3 words
Has a maximum field width of no more than 75% of the
form.
The amount of text allowed should match that of the
width, so that the user is not allowed to enter more text
than will be visible
A Multi line:
Should be used for most free text data items
Should be two lines high to differentiate from single line
boxes
Should automatically resize  to accommodate typed or
pasted content (or deleted content)
Has no vertical scroll bar , users should be able to see all
the data they have entered at a glance
Has a maximum field width of 75% of the form,
not the full width of the screen
Has no character limit by default , but if one is needed a
countdown should be included
Watermarks
Watermarks should not be used.
They are easy to miss and difficult to implement reliably. They
can also create inconsistency between on screen views and
paper printouts.
Anything that is currently represented as a watermark should
be replaced by a status badge in the top left hand corner of
the form.
Read ‘Presentation of information - Status badge to identify
status of documents’  for more information.
Clinical note
Site: Hospital site, healthboard of hospital site
Date: dd-Mmm-yyyy
Highly sensitive


<a id="page-31"></a>
**[p.31]**

Functionality
Mandatory fields
Mandatory fields are indicated in 2 ways:
With a red asterisk to the right of the field label.
Section heading labels will indicate the number of
mandatory fields to be completed in that section,
indicated by a number in an orange background.  As the
mandatory fields are completed, the number decreases.
Once all mandatory fields have been conpleted, the
number changes to a tick with a green background - see
example below.
For dropdown lists, these have a greyed-out default value of
“Unknown or not recorded” or “Not recorded”. The count of
mandatory fields will indicate that these need completing.
A user could actually select the value of “Unknown or not
recorded” or “Unknown” and when they do so, the mandatory
count reduces accordingly.
A red asterisk    *    must be used after the label of
a mandatory field.
Example:
Enter review type *
Telephone consultation


<a id="page-32"></a>
**[p.32]**

Functionality
Fuzzy matching
When designing a form, consider whether a ‘standard’
dropdown list is appropriate (where a user just selects from a
list), or whether fuzzy matching should be used instead.
Fuzzy matching allows the user to type a string of letters (1 or
more) into the field and all data items that contain that string
are returned. This is recommended for dropdown lists with
more than 15 options.
Read more information in Mutually exclusive options.
Links
Links should work in a standard way, and must:
Be presented as blue, underlined text - unlinked text can
appear in blue, but it should not be underlined.
Be intended for navigation from document to document.
Work with a Back button.
The following rules should be followed:
Links are acceptable for changing full-page views within
the WCP.
Links are not acceptable for:
Actions which change data.
Toggling hidden items, you must instead use a check
box. Example of incorrect use: Adverse reactions
form.
Reset buttons. Example of incorrect use: WCP
referrals prioritisation.
When a link is used, there needs to be an owner of that
link (usually a specialist for that area) who can check to
ensure that the accuracy of that link is maintained.
Where a link is to a result, then it should always be to the
most recent one in the supersession set.
Consider using a hover over the link “This link is to the
most recent version of the target document, which could
have changed since the link was created”.  This not be
possible if the hover over automatically shows the URL.
pat
CATEGORY II PATIENT (OUT PATIENT)
EYE OUT PATIENT DEPT
ENT OUT PATIENTS
Patient location: *   i
Nothing selected


<a id="page-33"></a>
**[p.33]**

Functionality
Access to information or functionality
Access to information or functionality should not be restricted,
other than by username, password or break glass. Any
exceptions should be reviewed by the clinical and technical
design team and documents.
Instead, information should be displayed clearly and
completely. This includes recording and displaying attribution,
and warning users.
Once saved, data is almost immediately visible to all users
(subject to break glass), as it would be in the paper record and
in line with regulators’ rules.
Access to create and edit documents is controlled by role-
based access control (RBAC). Please consider this when
creating forms.
The need for RBAC should always be reviewed very carefully
by DHCW and should not be delegated to a project or design
team.
Editing
Documents can be edited until the “Final” or “Final/Send”
checkbox has been ticked. After this they are only editable
during the cooling off period, which is 4 hours.
Anyone can edit anyone else’s document, subject to role-
based access control (RBAC). This supports documents that
are written incrementally by several different people, and
documents that have several contributors (the other relevant
mechanism is attribution of a document section).
It supports a document being typed by an administrator and
signed by a consultant, or a form being filled in by a student
nurse and signed off by a registered nurse. It also helps when
staff are unavailable as it reduces the loss of “once only”
information, which is a concern to stakeholders. If the WCP
thinks that someone should not be updating a document, a
strong warning could be displayed, but the action should be
allowed.
All edits are reflected in the document version history.


<a id="page-34"></a>
**[p.34]**

Functionality
Autosave
There must not be an autosave within any form or section of
the WCP, under any circumstances.
Adding an autosave would have design, performance,
information governance and data security implications:
The WCP doesn’t store any information on users’ PCs or
mobile devices. This makes compliance with data security
and information governance rules possible.
The WCP requires users to authenticate when changes
are saved. This helps integrity of and confidence in the
electronic record.
Once something is written about a patient on a scrap
of paper in a hospital, it becomes part of the patient’s
permanent medical record, becomes the property of
the secretary of state and must be shown to patients,
lawyers, and courts on demand.

Autosave would break all these rules.
Each document has a time period where the document will
be closed if there is a period of inactivity, although a warning
messsage is given to the user.
If the screen is locked dur ing this per iod of document inac tivit y,
when the user logs back in, the form content should still be
displayed if still within that document locking timeframe.
When designing a form, it is important to indicate what the
timeout should be for that form.
Document types
There are 3 types of document that can be designed in the
WCP:
1.  Forms with a “Final” or “Final/Send” checkbox.  These
can be edited multiple times until the “Final” or “Final/Send”
checkbox is ticked. Once this is ticked and the document
saved, a cooling off period begins and the document can be
edited in “Draft” status. Once the cooling off period ends,
the document will be “Final”; the “Draft” status is removed
and no more editing is permitted, unless under exceptional
circumstances.
2. Forms which are designed to be completed in one iteration,
such as a pathology request form.  These forms do not have
a “Final” or “Final/Send” checkbox. Once completed, saved
and closed, they are deemed to be “Final” and no edits are
permitted
3. Forms which are designed to be completed over a longer
period, do not have a “Final” or “Final/Send” checkbox and will
permanently be in draft, for example cancer dataset forms.
When designing your form please ensure that it fits one of the
3 options above.
See the  Signature section  for more information about the
various checkboxes and buttons that are available on these 3
types of forms.


<a id="page-35"></a>
**[p.35]**

Functionality
Misfiling a document
Misfiling should only be used when a document has been
created for the wrong patient. There have been occasions
where a document has been misfiled when there is content
error - in this case any incorrect information should be
struckthrough. DHCW will be reviewing the ability to misfile a
complete document for the reason of content error, and this
UI PDF document will be updated when that functionality is
available.
When creating a new eform, it needs to be made clear in the
design specification whether this document can be subject to
a misfile.

A document can be misfiled even if it has been sent to a
recipient, for example a GP or Community Pharmacist.  At
the time of writing, it is technically difficult to send electronic
notification of a misfile to a recipient. Therefore, whoever
is responsible for misfiling a document is responsible for
managing notifications to the recipient to inform them of the
misfile.
At the point of misfile, a message is presented stating: “This
document has already been sent to xxx, you should inform the
recipient that the document has been misfiled”.
At the time of writing, the following WCP documents can
be misfiled:
The following documents cannot  be misfiled:
Discharge Advice Letter
Clinical Note
Advance Care Plan
Notification
Hepatitis C Consultation
Note
Outpatient  Continuation
Sheet
Outpatient  Continuation
Sheet v2
Outpatient  Medical
Note
Ad-Hoc Outpatient
Review
COVID-19 Mortality
Surveillance
Diabetes Consultation
Note
Hospital Referral
Inpatient Clinical Notes
Lung Audit
MDT Report
Medicines Reminder
Pharmacy Care Plan
Referral Letter (WAP)
Referral Supplementary
(WAP)
Patient preferences
– cannot misfile the
complete form, but can
misfile sections


<a id="page-36"></a>
**[p.36]**

Functionality
Misfiling a document
There are two steps for the process of misfiling:
Step 1 - Document is recorded as “Potentially misfiled”. The
document is no longer editable in this state.
Step 2 – The “Potentially misfiled” document is then reviewed
and is updated in one of two ways
1.  Document is moved to a full “Misfile”.  Once this happens
the document becomes permanently uneditable and
cannot be reactivated.
2.    The “Potentially misfiled” status is rejected, the form
is re-activated and becomes editable.
When a Potential misfile has been rejected, and the document
is within its cooling off period, then the cooling off period is
reset.


<a id="page-37"></a>
**[p.37]**

Functionality
There should be no “Misfiled” status badge at the bottom of
the screen underneath the PDF.
Misfiled
Misfiled
Misfiled
Outpatient medical note
Event Date: 10 Dec 2021
Specialty: General Medicine
Senior responsible clinician: ALI, MOHAMMAD F, Dr (GMC:4115638)
Author: PRITCHARD, Patricia, (GMC: ), Business Analyst,
Gastroenterology
Site: 7A2F5
   Misfile Confirmed
(v3)
i
MISFILED
Potentially misfiled
When a document is potentially misfiled, this is indicated in
3 ways
Misfiled
When a document is fully misfiled, this is indicated in 3 ways
There should be no  “Potentially Misfiled” status badge at the
bottom of the screen underneath the PDF.
The document metadata background is coloured pink and
shows “Potentially misfiled” in red across the metadata
The document metadata background is coloured pink and
shows “misfiled” in red across the metadata
A “Potentially misfiled” status badge appears in the top
left-hand corner of the form, with red background and
white writing. A hover over will display “This document
may be in the wrong patient record”
A “Misfiled” status badge appears in the top left-hand
corner of the form, with red background and white writing.
A hover over will display “This document is in the wrong
patient record”
The PDF will show a status badge with black background
and white writing
A “Misfiled” status badge appears in the top left-hand
corner of the PDF
1. 1.
2. 2.
3. 3.
Potentially misfiled
Potentially misfiled
Potentially misfiled
Outpatient medical note
Event Date: 21 Dec 2021
Specialty: Dermatology
Senior responsible clinician: ANTON, Andreea, Dr (GMC:7531865)
Author: PRITCHARD, Patricia, (GMC: ), Business Analyst,
Gastroenterology
Site: Amman Valley Hospital
!Review Misfiled
(v3)
i
POTENTIALLY MISFILED
i


<a id="page-38"></a>
**[p.38]**

Functionality
The following actions, when associated with a sequence of
documents, should be represented by icons.
An orange triangle can be used to indicate a warning. The nature
of the warning must be displayed in words using a hover over.
- No other icons are allowed.
The following actions will continue to be displayed using
icons:
The following actions, when associated with a list or table,
should be represented by icons:
The following actions, when associated with a list or table
item, should be represented by icons. This document will
be updated to include the agreed icons:
The following statuses of a task should be represented
by an icon which appears before the name or description
of the task. This document will be updated to include the
agreed icon:
- Task outstanding or due: Red or orange asterisk
- Task done: Green tick
Note: There is a significant issue with icon use in MTED.
Some icons have been given non-standard meanings,
these will be reviewed.
- Print - Print labels
- Refresh
- Open document or expand for viewing
- Edit
- Delete
- Move up
- Move down
- Open patient’s record
- Add
- Add another
- Save
- Save and close
- Close
- Ok
- Cancel
- Back
- Clear filters
- First
- Previous
- Next
- Last
- Back (exit from the sequence)
Icons
These icons are being reviewed and subject to change, as DHCW
attempt to ensure that icons are consistent across both desktop
and mobile applications.
Where icons are used, a description or explanation should
usually be displayed next to it, or in hover text.
In the WCP and eForms the following actions (button labels)
must currently be displayed in words, not using icons:


<a id="page-39"></a>
**[p.39]**

Functionality
WCP
Close record Open/Expand non displayed section (for example documents list)
Hide displayed section (for example documents list/history of adverse reactions)
Error, Invalid NHS Number, Highly Sensitive, Document sent to GP, Pharmacy checks outstanding
Message Received, Additional Information received on referral, Information request received Logout
Quick reference guides, what’s new and video tutorials
Message Sent, Information request sent
DAL sent to GP
Shrink content of a displayed section
Used on Medications Reminder document
View selected page in a new tab Mark page as default Page selected as default
Calendar Outstanding notifications exist for this patient
Patient demographics not accurately matched
Search for a patient using the NHS number
Comments
Print patient demographic labels on pt homepage And printing pdfs when viewing in document history
Results in the sign-off basket Copy NHS number
Close window Minimise window
Expand, View result Expand, View result View result
Maximise window
Print
Graph Table
Highly Sensitive Document
Notification, Alert, Alternate Hospital Numbers
Patient demographics 100.00% accurately matched Personal notification
Expand content of a displayed section
Paused, On hold Add, Add Item to List
Remove, Remove Item from List
DAL in the process of being sent to GP – 4 hours
Current session locked Unsaved changes – text goes behind
Home
Close
Preferences
Information icon
Overdue to do item
Messages Settings Quick actions
Viewable by all staff (Quick Note)
 Viewable by me only (Quick Note)
Icons


<a id="page-40"></a>
**[p.40]**

Functionality
WCP Mobile icons - Light mode & Dark mode
Confirmed that medication entry has been pharmacy checked
Medication review date is tomorrow or the day after Medication review date is more than 3 days in the future
No medication review date has been entered Medication review date is today or in the past
Medication does not have a valid pharmacy check
Unsaved changes SearchPharmacy checks outstanding
 Note has been added to the medication
Search Icon
Patient ON watchlist icon [Non-Clickable]
Patient ON watchlist icon [Clickable]
User account specific icon [Non-Clickable] User account specific icon [Clickable]
Infection Prevention Control icon
Mismatch demographics percentage icon, If above 92%. Will include Percentage inside icon
Mismatch demographics percentage icon, between 70% & 91%. Will include Percentage inside icon
Mismatch demographics percentage icon, between 69% & 60%. Will include Percentage inside icon
Mismatch demographics percentage icon, less than 59%. Will include Percentage inside icon
Patient has Urgent TODO items Patient has Critical TODO items
Call Support icon
Error Log Icon
New result
Patient NOT on watchlist icon
Highlighted -  Find patient menu icon Unhighlighted - Find patient menu icon
Highlighted -  Patients menu icon Highlighted -  Watchlist menu icon
Unhighlighted -  Watchlist menu icon Highlighted - Patients for Sign Off menu icon
Unhighlighted - Patients menu icon
Icons
MTED status icons / Medication icons
Unhighlighted -  Patients for Sign Off menu icon
Home menu icon


<a id="page-41"></a>
**[p.41]**

Functionality
Mismatch demographics percentage icon, If above 92% Back Navigation
Collapse sectionExpand section
TODO list item
Test Request is sensitive icon
Filter list icon
Expand Selection Item
Mismatch demographics percentage icon, between 70% & 91%
Mismatch demographics percentage icon, between 69% & 60%
Mismatch demographics percentage icon, less than 59%
Hamburger menu icon, opens side menu
Long picker selection confirmation icon Activate barcode reader, located on header
Patient signed off icon Long picker selection removal icon
Icons
WCP Mobile icons - Light mode & Dark mode


<a id="page-42"></a>
**[p.42]**

Functionality
Re-use / carry forward information
When a new document is created, it can be partly pre-filled
with information copied from a previous instance of that
document. Copy forward rules are specific for each document
type and should be written up in the design specification.
The following default generic rules should be followed.
Any deviations from these defaults should be discussed,
agreed, approved and clearly documented in the design
specification.
General rules
Any section that pulls through data from a previous form
should have the attribution data added.
Copied forward information should be whole sections or table
rows.
By default, the information should be copied forward from the
most recent instance of that document, by event date, that
contains that information and always from the last version
of that instance. However, where appropriate, information
can be pulled from earlier documents. eg, for an outpatient
consultation record it would be expected that a problem list
would be copied forward from the previous consultation for
that clinician and/or specialty, rather than the last consultation
record which may have taken place with a different clinician
and/or specialty where the problem list would not be relevant.
It may be relevant for the user to select which form the
information is to be copied from, as in the Palliative care
form.  In this case, when a user selects to create a new
form, they will be presented with a list of recent forms, and
they can make the appropriate selection.  If no relevant
document is listed, then a blank new form should be able
to be created which does not pull any information through
from any other form.
Information should be able to be pulled from documents
created in other Health boards; please specify in any design
document if this is the case.
When deciding what information is to be brought forward,
please check if there are any restrictions.  At the time
of writing, it has been deemed those questions around
pregnancy, for example, cannot be brought forward and
should be asked on each iteration of the form.
Pulling data from Finalised forms
When pulling information through from finalised forms, the
Attribution statement will contain the details of the last
user who added or updated this information. For example,
if a section was filled out in form 1 and not subsequently
changed or confirmed by the time that form 4 is created
then that section should still be attributed to the form 1
author. If this information is updated on a subsequent form
the attribution will be updated. If the “Confirm section”
checkbox is ticked, then the attribution statement is also
updated to the new user. This is standard attribution
functionality.


<a id="page-43"></a>
**[p.43]**

Functionality
Re-use / carry forward information
Pulling data from Draft forms
Copy forward should not happen from Draft forms unless there
are exceptional circumstances.  Example: a domiciliary visit by
a palliative care physiotherapist in the morning followed by a
domiciliary visit by a palliative care doctor in the afternoon,
where there is no time for the HCP to finalise their form before
the doctor visits.
When creating a new instance of a form and information is
being pulled from a Draft form, the following warning message
will be presented.
“This form will be pre-filled with information copied forward
from a draft document.  The copied forward information may
be incomplete and may contain errors.  This information will be
attributed to the author of the new document.”

Any information carried forward which has come from a
draft form must be checked and validated by the user of the
second form as the attribution statement will automatically be
updated to display their details. When saving the document, if
a different author to the logged in user is selected, then the
attribution statement is updated to the new author.
However, if pulling information from a draft form, where
information was pulled into that draft form from a previously
finalised form, and that information was not changed or
confirmed by the author of the draft form, then this latest
form will show the original author from the previously
finalised form in the attribution statement
Pulling data from “Potentially misfiled” or “Misfiled” forms
If a form has a status of “Potentially misfiled” or “Misfiled”
and a subsequent form is created, no information is pulled
through, unless the misfile has been subsequently rejected.
There should be no exceptions to this rule.
If sections from a form have been re-used on subsequent
forms, the original form can be misfiled. At the time of
writing, it is technically difficult to do anything with that re-
used information on a subsequent form in this scenario.
If the information has been updated on the subsequent form,
then the new author is taking responsibility for this, but if it
hasn’t been updated, then this carries a small risk, although
the onus is on the new author to check the information is
still valid and correct. However, it is also highly likely that
the original form will have been misfiled before sections are
re-used and the subsequent document created.


<a id="page-44"></a>
**[p.44]**

Functionality
Re-use / carry forward information
Pulling data from “Highly sensitive” forms
If the original form has been marked as highly sensitive and
information is being pulled through from that form, when
creating a new form, a “break glass” message will be presented,
as follows:
“This form is attempting to pull through information from a
previous form that was marked highly sensitive. Access to this
information item will be logged and may be reported to your
supervisor.
With ‘Proceed’ and ‘Cancel’ buttons
Clicking ‘Proceed’ pulls data into the new form and access is
logged
Clicking ‘Cancel’ presents a new instance of the form with no
data pulled through
The ‘x’ close button can be used to close the form once you
‘Proceed’, if needed at this point.
If ‘Proceed’  was selected, the new document will be highly
sensitive by default because it contains information that has
been copied forward from a highly sensitive document.

If the new document DOES NOT  contain any highly sensitive
information, or if all highly sensitive information is removed,
the highly sensitive check box should be cleared before saving.
If the user selected ‘Cancel’ and a blank form is created,
the ‘Highly sensitive’ checkbox should not be automatically
ticked.
If highly sensitive data remains on the form, the checkbox
needs to remain ticked when the form is saved. On any
subsequent edit the normal standard ‘break glass’ message
applies.
Carrying forward “struckthrough” information
Struckthrough information can be carried forward, although
the strikethrough must also be carried forward. If the ability
exists to un-do a strikeout on the original document, then
the user must be able to un-strike any copied forward
information on the subsequent document.


<a id="page-45"></a>
**[p.45]**

Functionality
Signature line
Available buttons/checkboxes
The following shows the available checkboxes and buttons
that can appear in the signature section at the bottom of WCP
forms.
Not all of these will appear on all forms; their visibility will be
dependent on the type of form, its intended use, and the stage
at which the form is at.
Highly sensitive
This checkbox  will display on all forms which will be
listed in the Documents view when saved. Authors/
transcribers will select this if the form is to be marked as
highly sensitive.
If ticked , the screen will scroll automatically to the
Author section and will present a mandatory free text
field labelled “Reasons for highly sensitive status”. This
checkbox can be unticked if the document no longer
contains any sensitive data.
Please see further details in “Mark as Highly sensitive”
section.
This checkbox will not appear on all forms, only on those
where it is deemed that a countersignature clinician may
be required.
If ticked , the screen will scroll automatically to the
Author section and will present a mandatory free text
field labelled “Countersignature required by”. The
checkbox can be unticked if a countersignature is
no longer required and will need to be unticked when
carrying out a countersignature. Until it is unticked, the
“Final” or “Final/Send” checkbox is inactive.
Please see fur ther details in “Countersignature required”
section.
Field showing NADEX id, will be on all forms, always.
Will only be visible  when at least one change has been
made on the form, ie, there is some data to save.
Highly sensitive
Countersignature required
Username: st000319
Password:
Countersignature required


<a id="page-46"></a>
**[p.46]**

Functionality
Available buttons/checkboxes
To be used instead of the “Final” checkbox if the form is
being sent to a recipient, eg GP, therefore will not appear
on every form.
Will only be active once all mandatory data has been
completed. Once this checkbox is selected and the form
saved, there will be a cooling off period in which the
document can be edited.
By default, this cooling off period is 4 hours but, where
appropriate, can be changed with the necessary
approval.  Documents in the cooling off period will have
the status of Draft. This status will automatically be
removed when the cooling period has elapsed, and the
document will be deemed to be Final.  At this point, the
document will be sent to the recipient, eg GP.
Will display when a form has been opened and no
changes have been made. Allows the user to back out of
the form with no messages displayed.
Once data has been entered into a form, this button will
disappear and will be replaced by the “Cancel” button.
Back
Will save the form but will not close it; the form will be
kept open on the screen.
Will not be available on every form, only those where it
is deemed that an interim save will be of value to the
user, eg on a long form
To only be used on forms that have a “Final” or “Final/
Send” checkbox
All mandatory fields do not need to be completed.
A password will need to be entered to allow the form to
be saved.
This button will only be available on forms where there
is no requirement to Finalise, the form will not be
subject to a cooling off period and as soon as the user
completes this form it is sent to a recipient, eg, LIMS.
This will include forms such as Pathology and Radiology
request forms.
Cancels the form. Any changes made since the
previous “Save” or “Save and close” will be lost.
Final / Send
Save
Send
Cancel
Signature section


<a id="page-47"></a>
**[p.47]**

Functionality
Will save the form and close it. A password will need to be
entered.
If there is a “Final” or “Final/Send” checkbox:
Mandatory data does not need to be completed to save and
close a document if this checkbox is present.
The “Final” or “Final/send” checkbox will be greyed out until
all of the mandatory information is completed.  If the “Save
and close” button is selected whilst there is mandatory
i n f o r m a t i o n  t o  b e   c o m p l e t e d  t h e   f o r m  w i l l  b e  s a v e d   i n
draft.
Once all of the mandatory information has been completed,
the “Final” or “Final/send” checkbox is available for selection.
If ticked, once the “Save and close” button is selected, the
form will remain in draft for the specified cooling off period
and will then be updated to the Final status.
For full descriptions of how the above buttons work are
contained within the user stories.
If there is no “Final” or “Final/Send” checkbox:
If the form is designed to be completed in one go, such as a
request form, then all mandatory data must be completed
before the form can be saved and closed.
There is no cooling period, ie the forms cannot be edited
once saved and closed.
The form will not have a draft status.
There are other forms where there is no “Final” or “Final/
Send” checkbox; these forms are designed so that
information is entered on an ongoing basis.  These forms
can be saved and closed even if mandatory data is still
required, but these forms will never be finalised; such forms
include the Patient Preferences form.
Save and close
Available buttons/checkboxes
Signature section


<a id="page-48"></a>
**[p.48]**

Functionality
Signature section
Examples of signature bar
In all examples below, the “Highly sensitive” and “Countersignature required” checkboxes appear, but these may not be required all
on forms within the WCP; their presence will depend on the form itself. All forms will always show the NADEX ID field.
Using the “Back” button
The signature row will contain the following checkboxes and button when a new form is created or where an existing form is
opened and no data has been entered, and there is still mandatory data to be completed.
Using the “Save” button (interim Save)
Only to be used when a form has a “Final” or “Final/Send” checkbox and will allow an interim save.
Selecting this will save the data but not close the form.
“Final” checkbox  is greyed out as mandatory data is
required (“Final/Send” could appear here instead), plus no
data has been entered to finalise
“Back” button , enabling the user to back out of the
form as no data has yet been entered
There is no “Save”, “Save and close” or “Cancel” buttons
as no data has yet been entered to either save or cancel
out of
There is no Password field,  as there is nothing to save on
the form
“Final/Send” checkbox: greyed out as mandatory data is
still required in this example
“Save”: this form has an interim save – will not close the
form
“Save and close”: the form can be saved and closed.  Note:
Form cannot be finalised until all mandatory data has been
completed
“Cancel” button:  Will cancel the form, any changes made
since the previous save will be lost


<a id="page-49"></a>
**[p.49]**

Functionality
Warning messages
Different warning messages to the user will be presented
under the following scenarios.
When “Save as draft” is selected, the form is closed and
will have the status of Draft.  As the “Final” or “Final/Send”
checkbox cannot been selected, any cooling off period has not
yet commenced.
When “Return to form” is selected, the form is re-displayed,
and the user can continue to complete any relevant details.
Selecting “Save and Close” – Mandatory data still required -
Form has a “Final” or “Final/Save” checkbox
The following message will be presented under the following
circumstances:
Form has a “Final” or “Final/Save” checkbox
Mandatory data on form still to be completed (“Final” or
Final/Send” checkbox greyed out)
User has selected “Save and close” on the form


<a id="page-50"></a>
**[p.50]**

Functionality
Warning messages
Selecting “Save and Close” – All mandatory data entered -
Final or Final/Send checkbox not ticked
The following message will be presented under the following
circumstances. Form has a “Final” or “Final/Save” checkbox
All mandatory data has been completed
User h as not ticked the “Final” or “Final/Send” checkbox
(although it is active)
User has clicked “Save and closed”
When “Save and close” is selected in the message below, the
form is closed and will have the status of Draft. As the “Final”
or “Final/Send” checkbox has not been selected, the cooling
off period has not commenced.
When “Return to form” is selected in the message below, the
form will be re-displayed, allowing the user to complete any
further details, including  ticking the “Final” or “Final/Send”
checkboxes if the form is ready to be finalised.


<a id="page-51"></a>
**[p.51]**

Functionality
Marking a form as highly sensitive
Warning messages
Selecting “Cancel”
When the “Cancel” button is selected on a form, the following
message will be  displayed.
Selecting “Save and Close” – Mandatory data still required –
No “Final” or “Final/Send” checkbox is present on the form
When the form does not have a “Final” or “Final/Save” checkbox
and the “Save and close” button is selected when mandatory
data is still required, the user is presented with warning text in
red against each mandatory field that needs to be completed.
The form cannot be saved and closed until all mandatory data
has been completed.
When “Close form – abandon changes” button is selected,
the form is closed and any amendments made to the form
since the last save are lost.
When “Return to form” is selected, the form is re-displayed.
Any changes made to the form since the last save are still
visible on the form.


<a id="page-52"></a>
**[p.52]**

Functionality
Marking a form as “Highly sensitive”
If the “Highly sensitive” checkbox is ticked, a mandatory free
text field labelled “Reason for highly sensitive status” will
appear in the ‘Author’ section. The form should automatically
scroll to this field so that it is clear that there is a mandatory
field to be completed.
If the form does not  have a “Final” or “Final/Send” checkbox
If  the “Save and Close” button is selected whilst the “Reason
for highly sensitive status” free text field is empty, then
there will be the standard red warning against the field label.
This field, along with all other mandatory data needs to be
completed before the form can be saved and closed.
Any document which is marked as Highly sensitive will also
have the “Highly sensitive” status badge visible in the top left
hand corner of the form in white writing with a red background;
on the PDF this status badge will show with white writing and a
black ground in the top left hand corner.
See the  Status Badge  section for an example how these are
displayed.
If the form has a “Final” or “Final/Send” checkbox
The form can be saved and closed whilst the mandatory data
is required, including the free text field for highly senstive, but
the form cannot be finalised.  Once this free text field has been
completed and all other mandatory data is entered, then the
“Final” or “Final/Send” checkbox is available to select.
Hovering over the Sensitivity section will display the tooltip as
shown below.


<a id="page-53"></a>
**[p.53]**

Functionality
Removing “Highly sensitive” status
If the tick in the highly “Highly sensitive” checkbox is removed,
a mandatory free text field labelled “Reason NOT highly
sensitive” will appear in the ‘Author’ section. The form should
automatically scroll to this new field so that it is obvious that
there is a new mandatory field that needs completing under
the following scenarios.
The same rules apply as for marking highly sensitive with
regards to this free text field being completed before the form
can be made final, saved and closed.
Countersignature required
The “Countersignature required” checkbox would only appear
on forms which have a “Final” or “Final/Send” checkbox.  Any
form that does not have one of these checkboxes would be
completed and saved in one iteration of the form and only
editable during any cooling off period.
A countersignature is required under the following two
circumstances
Forms being filled out by learners who cannot yet sign
them off
Forms being filled out by secretaries or other helpers
who cannot sign them off
If a countersignature is required, then the user should tick the
“Countersignature required” checkbox.
The form scrolls automatically to the Author section, and a
mandatory free text field labelled “Countersignature required
by” will now be displayed. The name of the person who should
countersign this document should be entered. Until this free
text field is completed, the “Final” or “Final/Send” checkbox is
greyed out.  Once this free text field is completed, and all other
mandatory data is entered, then the “Final” or “Final/Send”
checkbox is available to select.

When editing a form that requires a countersignature, the
checkbox remains ticked.  The “Final” or “Final/Send” checkbox
will be greyed out. When a user wishes to countersign the
form, the “Countersignature required” checkbox needs to be
manually unticked, the “Final” or “Final/Send” checkbox ticked
and the form can then be saved and closed and will be in a
“Draft” status during the cooling off period.
1.
2.


<a id="page-54"></a>
**[p.54]**

Functionality
Draft status
When a form has a “Final” or “Final/Send” checkbox, the status
of “Draft” will be applied under the following circumstances.
Form is being created and edited, the “Final” or “Final/
Send” checkbox has not been selected
“Final” or “Final/Send” checkbox has been ticked and
the form saved. The document will have the Draft status
applied during the relevant cooling off period for this
document.
To indicate that a form has the status of “Draft ”, the status
badge of “Draft ” will appear in the top left-hand corner of the
form.

When a user hovers over this “ Draft ” label, the button will turn
yellow, and the following tooltip will be displayed.
The “ Draft ” status badge will also appear on the PDF, in the
top left-hand corner, with white writing in a black background.
There will be no Draft watermark on the page.
Each time a document is saved, a new attributed version is
created; previous versions can be viewed in the WCP.
For forms that do not have a “Final” or “Final/Send” checkbox,
as soon as the document is saved it is finalised.  There is no
draft status applied to these forms.
There is a third type of document such as the Cancer dataset
forms, which are designed to be completed over a period of
time. These do not have a “Final” or “ Final/Send” checkbox,
but can be edited over a period of time, and will always be in
a Draft status. These will be subject to a “Freeze” time, but at
the time of writing, this  functionality is still in the planning
stage.
Draft


<a id="page-55"></a>
**[p.55]**

Functionality
Finalising a document / Cooling off period
When the “Final” or “Final/Send” checkbox is ticked, a
password is entered and the “Save” or “Save and close” button
is selected, the document enters its cooling off period. By
default the cooling off period will be 4 hours, although this
can be changed on a case-by-case basis where appropriate;
the reasons must be clearly documented in the design
specification, and approval received.
During this cooling off period, the document still has the status
of “Draft” and the relevant status badge will be displayed, both
in the form and the PDF.
An “Edit” button will be visible in the document list during
this cooling off period and the document can be edited. If it
is edited during this timeframe, then the cooling off period is
reset to 0.
Once the cooling off period has elapsed, no further edits are
allowed*, the Draft status badge will be removed automatically
and the “Edit” button will be removed from the document list.
If this form had a “Final/Send” checkbox, then the form is sent
to the relevant recipient.
* In exceptional circumstances a document can be edited
after the cooling off period has elapsed. It is important to note
that if the document has been sent to a recipient, then they
will need to be informed of any change.


## PDFs


<a id="page-56"></a>
**[p.56]**

PDFs
Addressograph Label
Each addressograph label  must be:
On every page of th e PDF
In the top right hand corner
DSCN 2018/09, dated 12th November 2018, has been published.
This gives further guidance on how to format and display the
addressograph
123 456 7890
DUCK, Donald
CRN A000001A
13-Feb-1986
10 Heol Creigau
Pontypridd
Cardiff
Rhondda Cynon Taf, XX12 3XX
Sex not specified
c
a
g
d
b
e
f
c
a
g
d
b
e
f
NHS Number Barcode, Code 39 format.
Barcode is for NHS number only, do not display barcode
when no NHS number is present
Each addressograph label must have:
Arial 11 Bold NHS Number in 3 3 4 Format
[Optional] Arial 11 CRN, ensure CRN prefix is used. See
Label 5 of the DSCN.
Arial 11 DOB in dd-Mmm-yyyy.
Arial 9 Values, Male; Female; Sex not specified
Arial 9 Address Line 1
Arial 9 Address Line 2
Arial 9 Address Line Town/City
Arial 9 Address Line County, Postcode
Arial 11 Bold Surname, Arial 11 Forenames, if field is
obscured by DOB, truncate with ellipsis (...). See Label 4 of
the DSCN.


<a id="page-57"></a>
**[p.57]**

PDFs
Header
The information directly under the document title may
differ depending on the document type.
By default, the second line should read ‘Event date’ if the
document is attached to a PAS event, for example the
Outpatient medical note.
Rules for headers:
Fields should be displayed in sentence case, with names in
the standard format
The date label in the header should never say just “Date”.
It needs to be clear which date is being referenced, so if
the “Event date” is not appropriate, then other options can
be used such as “Meeting date” in the case of an MDT form,
or “Discharge date” if the form relates to an inpatient stay
Patient label as per DSCN and to be contained within
a border. The header should not be contained within a
border
A line should be used underneath the header to separate it
from the main body of the form
The header should appear on every page of the document
A version number should appear in the header,
underneath the Author (moved from the footer)
Status badges, where applicable, will appear above the
document title
Otherwise, the label should read ‘Date of meeting’ if it is
an MDT form, or ‘Discharge date’ if it is from an inpatient
stay.
Example:


<a id="page-58"></a>
**[p.58]**

PDFs
Footer
Rules for footers:
Fields should be displayed in sentence case, with names
in the standard format (Note Surnames should be in ALL
CAPS)
The footer should not be contained within a border
A line should be displayed above the footer to separate
this from the main body of the text
No document version number (moved to the header)
The footer should appear on every page of the document
A status label, for example ‘superseded’, is no longer
visible (moved to the header)
Document author:
Printed by:
JONES, Andrew, Mr (GMC:1234567), Registrar, Cardiology on 10-Jul-2020
POTTS, Lucy, Miss (Nadex: lu123456) Medical Secretary on 11-Jul-2020 at 14.30
Page 1 of 1
Tables
Tables should be displayed with a horizontal line
separating each row.

The Headings will be left aligned, in italics, in the same
font as the main font, but with a 0.6 rem.
Date
15-Jun-2018
16-Aug-2018
WHO perfomance status
ASA
classification
Clinical frailty
score
Lansky performance scale Recorded by
JONES,  Connor M, Mr (GMC:236789), Consultant Surgeon, 17-Jul-2018
PETERS,  Clare M, Ms (NADEX:cp123987), MDT Coordinator, 16-Aug-2018
Performance status


<a id="page-59"></a>
**[p.59]**

PDFs
Layout and presentation of fields within
the form
If you are designing a form and have been asked to make the
layout suitable for a window envelope, please be mindful we
are attempting to reduce the number of paper documents
that we send.
If it is necessary to send a paper copy using a window envelope,
when designing the form please ensure that the recipient and
address is displayed accurately and that no other information
is visible in the window
When presenting fields on a PDF, there are several options:
If a field has not been completed on the form, remove it
from the PDF - this is the default option
If a field has not been completed on the form, then show
on the PDF but with the text “No data entered”, for
example for some assessments you would want to know
that a particular check was not carried out
Whether a field has or had not been completed, always
remove from the printout
We are trying to move away from sending paper documents, but
currently it is not possible to send all documents electronically.


<a id="page-60"></a>
**[p.60]**

PDFs
Default options
Acceptable alternatives
Display of questions/answers on the PDF
For each question on a form, a decision should be taken as to
whether these should be displayed on the PDF.

On the PDF never display a question label on its own.

Also consider whether struckthrough information needs to be
displayed. This should be decided on a case-by-case basis and
specified in the design specification.
Only the following options are available:
Completed fields should be displayed on the form
Non-completed fields should not be displayed on the
form, includes “Unknown or not recorded” or “Not
recorded” responses
Non-completed fields can be displayed but must
contain the text “Not recorded” underneath the
question. This is useful if you want to know that a
particular assessment was not carried out. However,
putting a large amount of these blank questions can
lengthen a form, reduce the legibility and, if printed,
can use additional paper and ink
Whether a field has or has not been completed on the
form - always omit from the PDF view


<a id="page-61"></a>
**[p.61]**

PDFs
Form sections
Section and sub section headings should have a shaded
banner with black text.

Do not enclose any sections or sub sections of the document
in gridlines or boxes. There is evidence that rules and lines are
a barrier to understanding, especially vertical lines.

Sub-sections should be indented from both sides by 5% of the
main heading.
Example of how to display sections and sub-sections:
Section 1 - Main heading
Sub-section 1 heading indented by 5% on both sides from main heading
Sub-section 2 heading indented by 5% on both sides from main heading
Last updated on 5-May-2022 at 1140 by SHERING, Steven G Mr (GMC123456). Consultant General Surgery
Main  section Question 1
Response to Main section Question 1
Main  section Question 2
Response to Main section Question 2
Last updated on 5-May-2022 at 1140 by SHERING, Steven G Mr (GMC123456). Consultant General Surgery
Sub-section Question 1
Response to sub-section Question 1
Sub- section Question 2
Response to sub-section Question 2
Last updated on 5-May-2022 at 1140 by SHERING, Steven G Mr (GMC123456). Consultant General Surgery
Sub-section Question 1
Response to sub-section Question 1
Sub- section Question 2
Response to sub-section Question 2
Multiple pages
Patient identifiers need to be displayed on every page, as well
as the name of the document and dates.

The header and footer must appear on all pages to ensure
accurate identification of the pages should they become
separated.


<a id="page-62"></a>
**[p.62]**

PDFs
When designing forms, be mindful that if sections are long,
it might push a later section over two pages where that later
section should not be split.
To prevent this, consider intentionally splitting a document
and have a blank page either side of the section that you need
to keep on one page,
for example safeguarding.
For these blank pages, use the text “This page is intentionally
blank” to avoid confusion.
Other
This is additional text to show that when a
section is split over more than 1 page, then
the section header should be displayed, along
with the word “continued”
Reason for review - continued
Document title
Site: Hospital site, healthboard of hospital site
Date: dd-Mmm-yyyy
Specialty:
Senior responsible clinician: SURNAME, Forename Middle Initial, Title (PRN:####), Role of main specialty
Author:
Highly sensitive Superseded
Address line 1
Address line 2
Address town/city
Address County, Postcode
Sex: Female
CRN: H4565150777 777 7866
MCREADY, Heather Jane (Mrs)
20-May-2000
Splitting sections
If a section is split over more than one page, the section header
should be repeated at the top of the second or subsequent
page with the word “Continued”.


<a id="page-63"></a>
**[p.63]**

PDFs
Font
A comprehensive list of fonts, font sizes, font weights and
spacing are listed in the Appendix.
As an example, fonts for questions and answers:
The main font to be used on the forms should be Roboto,
with a font site of 1rem and a font weight of 300.
Question labels should be decreased compared to the
main font - use a relative size of 0.8 for the questions.
Indent the answers slightly relative to the questions. Use a
left and right padding of 0.5rem.
Ensure that there is no blank line between the question
and the answer. There should be a blank line between any
answer and the next question. This makes is easer to see
which response belongs to which question
Nested questions
Nested questions should be indented on the PDF. Do not place
them in a single line.
Form questions that have been answered using checkboxes
and/or radio buttons should be replaced by bullet points on
the PDF.
Host organisation
University Hospital of Wales
New or follow-up
Follow-up
Meeting date
15-May-2021
Host organisation
University Hospital of
Wales
New or follow-up
Follow-up
Meeting date
15-May-2021
For example:
Incorrect
For example:
Correct
Example:
Past medical history
Does the patient have a pacemaker or implanted device?
• Cardiac resynchronisation therapy (CRT-P)
Has the patient undergone any previous cardiac Surgery?
• Yes
• Valve surgery
• Aortic valve
• Replacement
• Mechanical


## Standard questions and responses


<a id="page-64"></a>
**[p.64]**

Standard questions and responses
Questions
All questions must be  in bold.
Sub questions do not have to be in bold.
The label must always be ‘Urgency’.
Labels like ‘Priority’ or ‘Category’ should not be used.
Some questions will have standard responses; a list of these
will be created over time, the first of which is “Urgency
Urgency
The categories of ‘Urgency’ in order:
- Routine
- Urgent
- USC
- Emergency (Inpatient/ED)
The label hover text should be:
“How urgent is the test or referral? Used for prioritisation and
referral to treatment monitoring”


## eForms


<a id="page-65"></a>
**[p.65]**

eForms
Attribution statement
Consider adding an attribution statement when a section
is going to be used in another form or it is important that
information is checked each time the form is edited. The form
user can decide if the question needs to be asked again.
The attribution statement should be:
“Last updated or confirmed ‘date’ @ ‘time’ by ‘name ’”
In italics
Where a section in a form only contains a table and this
table has individual attributes on each entry, there is no
requirement to have an Attribution statement for the section.
A “Confirm section” checkbox will be at the bottom of the
section.
Example:
Section heading
Last updated or confirmed 9-Aug-2021 @ 16:30 by SHERING, Stephen G, Mr (GMC:3202142), Consultant, General Surgery
Checkbox option
Sub-section heading
Option 1
Option 2
Option 3
Confirm section
Last updated or
confirmed
In Italics
Confirm section
Date Time Name
@


<a id="page-66"></a>
**[p.66]**

eForms
eForm heading, including addressograph
label
Headings
Sometimes it is difficult to pull all the information into the
heading, for example an event date for the anticoagulation
forms would be the discharge date, which would be impractical
to pull through whilst the patient is still on a ward.
This guidelines should be applied on a case by case basis.
Label
Patient Labels should be aligned to the right of the heading, as
in the screenshot.
Consider the following:
If the patient does not have an NHS number, do not put the
name of the patient on the first line. Leave the name on
line 2 to make it clearer that there is no NHS number
The second column of data should be right aligned, as per
the DSCN.
Hovering over any of the data items should display a label,
for example hovering over “Cook” in the example should
show a label containing “Surname”. This helps when some
people have similar surnames and forenames.
The title should be displayed in brackets after the forename.
This is a departure from the DSCN but necessary to enable
the patient to be addressed correctly.
No bar codes are necessary on the eForms. These will only
display on the PDF versions of the eForm.
Headings should:
Display heading details on left hand side of label, left
aligned
Include a heading name in a larger font than the rest of
the text
Include the following data:
Site: include the hospital but if this is not possible,
include the health board
“The date label in the header should never say just
“Date”.  It needs to be clear which date is being
referenced, so if the “Event date” is not appropriate,
then other options can be used such as “Meeting date”
in the case of an MDT form, or “Discharge date” if the
form relates to an inpatient stay
Specialty : include the relevant specialty for the activity
being recorded
Senior responsible clinician: the SRC for the patient in
that specialty
Author: the author of the document
 Form Heading here
Site: Hospital site, healthboard of hospital site
Date: 3-Aug-2021
Specialty: General Surgery
Senior responsible clinician: SHERING, Stephen G, Mr (GMC:3202142) Consultant,
General Surgery
Author: SHERING, Stephen G, Mr (GMC:3202142)
CRN:    H7121345
12-Dec-1990(30y)


## Terminology


<a id="page-67"></a>
**[p.67]**

Terminology
CORRECT INCORRECT NOTES
- Adverse reactions
- Automatic monitoring
- Patient warnings
- Addressograph
- Patient identifiers
- Patient contact information
- Countersign
- Sign off
- GMC number
- Inpatient clinical notes
- Allergies
- Allergies and intolerance
- Patient warnings
- NIIAS
- Alerts
- Demographics
- Authorise
- Validate
- Sign off
- Authorise
- Validate
- GMC code
- Patient journal
Patient warnings are now recorded separately and
are not part of adverse reactions.
‘Countersign’  should only be used when a second
signatory is required.
See ‘sign off’ below.
‘Sign off’ is used in relation to a result, letter, or
document.
A patient journal is a document written by the
patient, like a diary.
Use of terminology
- Lab test - Pathology test For many front-line clinicians, ‘pathology’  includes:
- Autopsy
- Gross pathology on resected specimens
- Histopathology[ Continued on next page ]


<a id="page-68"></a>
**[p.68]**

Terminology
CORRECT INCORRECT NOTES
- Medication(s)
- Med(s)
- Request
- Prioritise
- Professional registration number
- NHS Wales master patient index
- NHS Wales user database and
authentication system
- Drug(s)
- Order
- Grade
- GMC number
- GMC code
- NMC pin and RCN
- eMPI
- MPO
- NADEX
For many people, ‘drug’  means something that is
addictive or misused.
In relation to a test.
In relation to a referral.
This is more inclusive of all users.
- Cytology
- and variants such as immunohistochemistry
and fluorescent insitu hybridisation
But not lab haematology, clinical biochemistry,
microbiology or immunology.
There is an exception for the ‘Pathology test request’
WCP form.
[ Continued from previous page ]
- Repeat test
- Create similar document
- Create follow-on document
- Clone document ‘Clone’ has a very specific meaning in biology and
medicine.
Use of terminology


<a id="page-69"></a>
**[p.69]**

Terminology
CORRECT INCORRECT NOTES
- Result notifications
- Test request
- Warning
- Speciality
- Senior responsible clinician
- Test
- Alerts and notifications
- Order
- Message
- Attention
- Notice
- Danger
- Please be aware
- Specialty
- Consultant
- Investigation
- Examination
‘Alert’ has a specific meaning in user interfaces,
it is the highest level of warning and must be
acknowledged before the user can do anything else.
In the UK, clinicians request tests from colleagues,
rather than ordering them. In DHCW, ‘message’  is
often a technical term when information is passed
between IT systems
Warning is applied to the title and text of pop-up
warning messages
Speciality and specialty have virtually the same
meaning. Speciality is the commoner form in British
English, specialty in American English.
The senior responsible clinician could be a GP or a
nurse.
This includes all endoscopy, endoscopic retrograde
cholangiopancreatography (ERCP), and radiological
angioplasty. Even though these are procedures, from
the perspective of most frontline clinicians, they are
usually requested and dealt with in the same way as
lab tests.
‘Examination’ is used by some radiographers and
radiologists, but this is unacceptable. For most
doctors and nurses, it means looking at the patient
with their own eyes, palpating their abdomen, and
auscultating with a stethoscope.
Use of terminology


## Colours


<a id="page-70"></a>
**[p.70]**

Colours
Blue // background of section title bars, add buttons
#1B6EC2

Light blue // background of record headings
#8CD2E7

Green // background of Save button, section complete tick
#008000

Light yellow // background of tooltips, hovered questions, hovered buttons
#FEE715

Dark yellow // background of hovered radio button or check box
#F4D03F

Orange // background of incomplete field counter, warning icons
#FD8A10

Red // background of badges like Draft and Cancel buttons, delete icons
#D50000

Link blue // text colour for hyperlinks
#337AB7
Pink // background colour to highlight errors - this might change or be removed
#FFC0C7
Black // most text
CSS “black”

White // most backgrounds
CSS “white”

Silver // most lines
CSS “silver”


## Fonts


<a id="page-71"></a>
**[p.71]**

Fonts
<link href=” https://fonts.googleapis.com/
css?family=Roboto:300,300i,500, ” rel=”stylesheet”>
Main font
font-family: ‘Roboto’;
font-size: 1rem;
font-weight: 300;
letter-spacing: 0.01em;
line-height: 1.2;
color: black;
Patient label - different, matches DSCN // Bold
font-family: Arial;
font-size: 11pt;
font-weight: bold;
Patient label - different, matches DSCN // Not bold
font-family: Arial;
font-size: 11pt;
small // (for  address and Sex: Male) (the “small” is not in the
DSCN but it improves appearance and layout)
font-family: Arial;
font-size: 9pt;
Bold font - same as Main font but
font-weight: 500;
Form “metadata” (site, date, etc) - same as Main font  but
font-size: 0.8rem;
Form title - same as Main font  but
font-si ze: 2rem;
font-weight: 500;
Column headings - same as Main font  but
font-size: 0.6rem;
font-style: italic;
Form subtitle - same as Main font but
font-size: 0.8rem;
font-weight: 500;


## Other Specific elements


<a id="page-72"></a>
**[p.72]**

Other Specific elements
Most CSS margins, borders and padding
None
Box borders and corners
(most elements do  NOT have borders )
padding: 0.4rem;
border: 0.1rem solid silver;
border-radiu s: 0.4rem; (0.8rem for left corners of
section tabs)
Most lines
border: 0.1rem solid silver;
Most transitions
transition: background-color 0.5s ease-out ;
Top title bar and patient label area
width: 100%;
margin-bottom: 0.2rem;
border-bottom: 0.2rem solid blue;
border-bottom-color: (cBlue); (see red above)
padding: 0.2rem;
Patient label
padding: 0.4rem;
border: 0.1rem solid silver;
border-radiu s: 0.4rem;
background-color: white;
Navigation panel // there is a table for layout with
border-collapse: 0.4rem;
border-spacing: 0.15rem;
Badges (like Draft)
font-weight: 500;
color: white;
background-color: cRed;  (see red above)
padding:  0.2rem 0.5rem 0.2rem 0.5rem;
border-top: 2px solid white;
border-bottom: 2px solid white;


## Specific elements


<a id="page-73"></a>
**[p.73]**

Specific elements
Section tab in nav panel
dis play: table-cell;
margin: 0.1rem;
padding: 0.1rem;
padding-left: 0.6rem;
padding-right: 0.6rem;
border: 0.2rem solid transparent;
border-top-left-radius: 0.8rem;
border-bottom-left-radius: 0.8rem;
text-align: right;
white-space: nowrap;
background-color: #1b6ec2;  //hcBlue
color: white;
Section title
padding: 0.2rem;
padding-left: 0.4rem;
font-weight: 500;
text-align: left ;
color: white;
background-color: cBlue;
Section attribution statement and filter lines
padding: 0.2rem;
padding-bottom: 0.1rem solid blue;
border-bottom-color: cBlue ;
font-size: 0.8rem;
font-weight: 300;
font-style: italic;
color: black;
background-color: white;
Missing info counter in nav panel
dis play: table-cell;
width: 1rem;
margin-left: 1rem;
padding-left: 0.6rem;
padding-right: 0.6rem;
font-weight: 500;
text-align: center ;
background-color: #1b6ec2;  //hcBlue
color: white;
Section content
margin-top: 0.4rem;
Record list
padding -bottom: 2px solid blue;
border-bottom-color: cLightBlue ;
margin-left: 2%;
margin-right: 2%; TABLE OF CONTENT


## Appendix


<a id="page-74"></a>
**[p.74]**

Record title bar
background -color: cLightBlue;
font-weight: 500;
padding: 0.2rem;
padding-left: 0.4rem;
Main button
display: inline-block ;
height: 2rem;
margin: 0.2rem ;
border: 0.1rem solid (color) ;
border-color: (color) ;
border-radius: 0.4rem;
padding-left: 1rem;
padding-right: 1rem;
text-align: center ;
text-decoration: none;
white-space : nowrap ;
color: white;
background-color: (color) ;
cursor: pointer ;
transition: background-color 0.5s ease-out ;
Record attribution statement
padding: 0.2rem;
padding-bottom: 0.1rem solid blue;
border-bottom-color: cBlue ;
font-size: 0.8rem;
font-weight: 300;
font-style: italic;
color: black;
background-color: white;
Record content area
margin-top: 0.4rem;
Specific elements


<a id="page-75"></a>
**[p.75]**

Add button
display: inline-block ;
height: 1.6rem ;
margin: 0.2rem ;
border: 0.1rem solid purple;
border-color: (color) ;
border-radius: 0.4rem;
padding: 0 0.6rem;
text-align: center ;
font-size: 0.8rem;
text-decoration: none;
white-space : nowrap ;
color: (color) ;
background-color: white;
cursor: pointer ;
transition: background-color 0.5s ease-out ;
Specific elements
Boxed control at bottom of form, like Final checkbox
border : 0.1rem solid silver ;
border-radius : 0.4rem ;
display: inline-block ;
height: 2rem;
line-heigh: 2rem;
margin-left : 0.2rem;
padding: 0 0.5rem ;
Single line text input
max-width: 35rem ;
margin: 0;
border: 0.1rem solid silver;
border-radiu s: 0.4rem;
font-size: 1rem;
font-weight: 300;
Radio button group, most question types (including label)
padding: 0.4rem;
border-radiu s: 0.4rem;
border-width : 0;
margin: 0;
Grid cells, grid rows (for layout of questions)
border: none;
margin: 0;
padding: 0;
Row of buttons at bottom of form
border-top: 0.2rem solid (cBlue) ;
padding-bottom : 2px;


<a id="page-76"></a>
**[p.76]**

Tables (for tabular data)  enclosing div (includes table title)
padding: 0.4rem ;
Specific elements Glossary
Table cells
border-bottom : 1px solid silver ;
padding-left: 0.3rem ;
padding-right: 0.3rem ;
font-weight: 300 ;
vertical-align: top ;
other
border: none;
margin: 0;
padding: 0;
WCP
Welsh Clinical Portal
WNCR
Welsh Nursing Care Records
WCRS
Welsh Care Records Service
