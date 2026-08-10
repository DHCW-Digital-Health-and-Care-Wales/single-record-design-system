# Document Viewer

> A full-screen PDF viewer for displaying clinical documents and records on mobile devices.

| | |
|---|---|
| **Type** | Component |
| **Status** | Approved |
| **Reference** | [spec.md](spec.md) |
| **Figma** | [SR Design System — Mobile / MAUI / Document Viewer] |
| **Related standards** | GDS guidance on external links; NHS England file handling patterns |
| **Last updated** | 2026-08 |

---

## When to use

- Viewing PDFs that are already loaded in the app (case notes, discharge summaries, investigation results, lab reports, appointment letters).
- Documents that must be viewed in their original format (scanned records, external PDFs, documents with complex formatting or signatures).

## When not to use

- Text that you control and can present as HTML — use a scrolling text component instead (faster, more accessible, searchable).
- Documents that are very large (>10MB) — consider chunking into chapters or offering a summary instead.
- Files other than PDFs — this viewer is PDF-specific; other file types need different components.

---

## How it works

**Mobile-only.** The Document Viewer is a MAUI component and runs on phones and tablets only. Blazor or web versions of Single Record use their own PDF solutions (typically a JavaScript viewer like PDF.js or an embedded browser control).

### Display

- The PDF fills the available space in its container — typically the full viewport minus the header, navigation, and action bar.
- Pages can be scrolled, tapped to zoom, or pinched to zoom using standard mobile gestures.
- No built-in toolbar with page navigation — the hosting page is responsible for any "go to page" or "jump to chapter" actions.

### Loading and errors

- PDFs are held in memory. Expect a brief loading delay for large documents.
- If the PDF is malformed or the stream is invalid, the viewer throws an exception — the hosting page must catch this and show an error message to the user.
- Always show a loading spinner while the PDF is being prepared.

### Theming

The viewer automatically adopts the app's light and dark themes via `AppThemeBinding`. Toolbar and page backgrounds use SR semantic tokens and will update if the user changes the app's theme without restarting.

---

## Options

| Option | Use when |
|---|---|
| Text selection enabled | The user should be able to copy text from the document (e.g., appointment details, lab values) |
| Text selection disabled | The document contains sensitive identifiers (NHS numbers, dates of birth, patient names) that should not be copypasteable |

---

## Do & don't

| Do | Don't |
|---|---|
| Show a loading indicator while the PDF loads | Assume the PDF is instant; large files take time |
| Disable text selection for sensitive documents | Copy sensitive patient data into plain text unless absolutely necessary |
| Use the Document Viewer for original-format documents (scanned records, external reports) | Try to convert PDFs to HTML for layout reasons — preserve the original format |
| Call `Dispose()` when the page closes | Rely on garbage collection to clean up PDF resources |
| Handle load errors at the page level (`DocumentLoadFailed` event) | Leave errors silent or assume the PDF is always valid |

---

## Accessibility

- **Screen readers:** PDF content is not accessible to screen-reader users through a viewer control. If a document must be accessible to users with vision impairment, provide a text transcript or an HTML version of the content alongside the PDF.
- **Keyboard:** Mobile apps do not typically require keyboard support — gestures (tap, pinch, swipe) are the primary interaction model.
- **Touch targets:** Zoom and navigation controls meet WCAG 2.2 SC 2.5.8 (44×44px minimum).
- **Zoom:** Users can pinch to zoom; ensure the document does not become unreadable at 200% zoom (typically not an issue for PDFs, which scale).

**Clinical accessibility note:** Many clinical documents are scanned images with no embedded text (OCR has not been applied). These are inaccessible to screen readers by nature. Work with the source system to ensure critical documents are either OCR'd or offered in an accessible text format.

---

## Content

- **Document source:** Always validate PDFs before passing them to the viewer. Check file size, MIME type, and integrity at the application boundary.
- **Text selection:** Use `EnableTextSelection = false` for documents containing patient names, NHS numbers, or other identifiers.
- **Error messages:** If a PDF fails to load, tell the user why in plain language (e.g., "This document could not be opened. Please try again." or "Document is too large to display.").

---

## Frameworks

| Framework | Status | Where |
|---|---|---|
| Web (HTML/CSS) | Not applicable | — |
| React | Not applicable | — |
| Blazor / .NET | Not applicable | Use platform-specific PDF viewer (e.g., third-party Blazor component) |
| .NET MAUI | Current | `packages/maui` / `SrDocumentViewer.xaml.cs` |
| Legacy (.NET 4.8 / Delphi) | Not applicable | — |

**MAUI implementation details** live in [spec.md](spec.md) — properties, methods, events, disposal model, and security considerations.

---

## DHCW / Clinical notes

No existing DHCW UI-standards requirement applies to PDF viewing — this is a new interaction model introduced for Single Record.

---

## Related

- **Patient Banner** — the document viewer often appears after a patient is selected; the banner can provide context.
- **Case Note Tracking pattern** — the prototype demonstrates document viewing in the context of reviewing case notes.
- **Syncfusion licensing** — confirm with the product team that your seat covers the MAUI PDF Viewer.
- **NHS England guidance** — [Providing accessible PDFs](https://www.england.nhs.uk/digitaltechnology/digital-accessibility/) and the GDS guidance on [file types](https://www.gov.uk/guidance/file-type-guidance-for-publishing#pdf).
